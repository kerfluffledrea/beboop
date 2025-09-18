// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

mod audio;
use audio::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let audio_state = AudioState::new().expect("Failed to initialize audio system");

    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(audio_state)
        .invoke_handler(tauri::generate_handler![
            load_sound_file,
            play_sound_slot,
            play_sound_file,
            get_loaded_sounds,
            remove_sound_slot,
            validate_audio_file,
            test_file_access
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
