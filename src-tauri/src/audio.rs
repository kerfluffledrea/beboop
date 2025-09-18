use std::collections::HashMap;
use std::fs::File;
use std::path::Path;
use std::sync::{Arc, Mutex};

use rodio::{Decoder, OutputStream, OutputStreamBuilder, Sink};
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SoundInfo {
    pub slot: i32,
    pub label: String,
    pub file_path: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AudioError {
    pub message: String,
}

pub struct AudioState {
    _stream: OutputStream,
    mixer: Arc<rodio::mixer::Mixer>,
    sounds: Arc<Mutex<HashMap<i32, SoundInfo>>>,
}

impl AudioState {
    pub fn new() -> Result<Self, String> {
        let stream_handle = OutputStreamBuilder::open_default_stream()
            .map_err(|e| format!("Failed to create audio stream: {}", e))?;

        let mixer = Arc::new(stream_handle.mixer().clone());

        Ok(AudioState {
            _stream: stream_handle,
            mixer,
            sounds: Arc::new(Mutex::new(HashMap::new())),
        })
    }
}

#[tauri::command]
pub async fn load_sound_file(
    audio_state: State<'_, AudioState>,
    slot: i32,
    label: String,
    file_path: String,
) -> Result<SoundInfo, String> {
    if !Path::new(&file_path).exists() {
        return Err(format!("File does not exist: {}", file_path));
    }

    tokio::task::spawn_blocking({
        let file_path = file_path.clone();
        move || {
            let file = File::open(&file_path).map_err(|e| format!("Cannot open file: {}", e))?;

            Decoder::try_from(file).map_err(|e| format!("Unsupported audio format: {}", e))?;

            Ok::<(), String>(())
        }
    })
    .await
    .map_err(|e| format!("Task failed: {}", e))??;

    let sound_info = SoundInfo {
        slot,
        label,
        file_path,
    };

    {
        let mut sounds = audio_state.sounds.lock().unwrap();
        sounds.insert(slot, sound_info.clone());
    }

    Ok(sound_info)
}

#[tauri::command]
pub async fn play_sound_slot(audio_state: State<'_, AudioState>, slot: i32) -> Result<(), String> {
    let sound_info = {
        let sounds = audio_state.sounds.lock().unwrap();
        sounds.get(&slot).cloned()
    };

    let sound_info = sound_info.ok_or_else(|| format!("No sound loaded in slot {}", slot))?;

    play_sound_file_internal(audio_state.mixer.clone(), &sound_info.file_path).await
}

#[tauri::command]
pub async fn play_sound_file(file_path: String) -> Result<(), String> {
    tokio::task::spawn_blocking(move || {
        let stream_handle = OutputStreamBuilder::open_default_stream()
            .map_err(|e| format!("Failed to create audio stream: {}", e))?;

        let file = File::open(&file_path).map_err(|e| format!("Failed to open file: {}", e))?;

        let source =
            Decoder::try_from(file).map_err(|e| format!("Failed to decode audio: {}", e))?;

        let sink = Sink::connect_new(stream_handle.mixer());
        sink.append(source);
        sink.sleep_until_end();

        Ok(())
    })
    .await
    .map_err(|e| format!("Task failed: {}", e))?
}

async fn play_sound_file_internal(
    mixer: Arc<rodio::mixer::Mixer>,
    file_path: &str,
) -> Result<(), String> {
    let file_path = file_path.to_string();

    tokio::task::spawn_blocking(move || {
        let file = File::open(&file_path).map_err(|e| format!("Failed to open file: {}", e))?;

        let source =
            Decoder::try_from(file).map_err(|e| format!("Failed to decode audio: {}", e))?;

        mixer.add(source);

        Ok(())
    })
    .await
    .map_err(|e| format!("Task failed: {}", e))?
}

#[tauri::command]
pub async fn get_loaded_sounds(
    audio_state: State<'_, AudioState>,
) -> Result<Vec<SoundInfo>, String> {
    let sounds = audio_state.sounds.lock().unwrap();
    let mut sound_list: Vec<SoundInfo> = sounds.values().cloned().collect();
    sound_list.sort_by_key(|s| s.slot);
    Ok(sound_list)
}

#[tauri::command]
pub async fn remove_sound_slot(
    audio_state: State<'_, AudioState>,
    slot: i32,
) -> Result<(), String> {
    let mut sounds = audio_state.sounds.lock().unwrap();
    sounds.remove(&slot);
    Ok(())
}

#[tauri::command]
pub async fn validate_audio_file(file_path: String) -> Result<bool, String> {
    tokio::task::spawn_blocking(move || match File::open(&file_path) {
        Ok(file) => match Decoder::try_from(file) {
            Ok(_) => Ok(true),
            Err(_) => Ok(false),
        },
        Err(_) => Ok(false),
    })
    .await
    .map_err(|e| format!("Task failed: {}", e))?
}

#[tauri::command]
pub async fn test_file_access(file_path: String) -> Result<String, String> {
    use std::path::Path;
    
    let path = Path::new(&file_path);
    if path.exists() {
        Ok(format!("✅ Can access: {}", file_path))
    } else {
        Err(format!("❌ Cannot access: {}", file_path))
    }
}