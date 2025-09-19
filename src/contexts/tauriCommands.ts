import { invoke } from '@tauri-apps/api/core';
import { open, OpenDialogOptions } from '@tauri-apps/plugin-dialog';

export interface SoundInfo {
  slot: number;
  label: string;
  file_path: string;
}

export interface AudioError {
  message: string;
}

export const SUPPORTED_AUDIO_FORMATS = ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'] as const;

export async function validateAudioFile(filePath: string): Promise<boolean> {
  return await invoke<boolean>('validate_audio_file', { filePath });
}

export async function loadSoundFile(
  slot: number,
  label: string,
  filePath: string
): Promise<SoundInfo> {
  return await invoke<SoundInfo>('load_sound_file', {
    slot,
    label,
    filePath,
  });
}

export async function playSoundSlot(slot: number): Promise<void> {
  return await invoke('play_sound_slot', { slot });
}

export async function playSoundFile(filePath: string): Promise<void> {
  return await invoke('play_sound_file', { filePath });
}

export async function getLoadedSounds(): Promise<SoundInfo[]> {
  return await invoke<SoundInfo[]>('get_loaded_sounds');
}

export async function removeSoundSlot(slot: number): Promise<void> {
  return await invoke('remove_sound_slot', { slot });
}

export async function pickAudioFile(): Promise<string | null> {
  const options: OpenDialogOptions = {
    multiple: false,
    filters: [
      {
        name: 'Beeeep',
        extensions: [...SUPPORTED_AUDIO_FORMATS],
      },
    ],
  };

  const selected = await open(options);

  if (typeof selected === 'string') {
    return selected;
  }

  return null;
}

export async function pickAndValidateAudioFile(): Promise<string | null> {
  const filePath = await pickAudioFile();

  if (!filePath) return null;

  const isValid = await validateAudioFile(filePath);
  if (!isValid) {
    throw new Error('Selected file is not a valid audio format');
  }

  return filePath;
}

export async function loadSoundWithPicker(slot: number, label?: string): Promise<SoundInfo> {
  const filePath = await pickAndValidateAudioFile();

  if (!filePath) {
    throw new Error('No file selected');
  }

  const soundLabel = label || `Sound ${slot}`;
  return await loadSoundFile(slot, soundLabel, filePath);
}

export async function isSlotLoaded(slot: number): Promise<boolean> {
  const sounds = await getLoadedSounds();
  return sounds.some(sound => sound.slot === slot);
}

export async function getSoundInSlot(slot: number): Promise<SoundInfo | null> {
  const sounds = await getLoadedSounds();
  return sounds.find(sound => sound.slot === slot) || null;
}

export const MAX_SLOTS = 9;
export const DEFAULT_SLOT_RANGE = Array.from({ length: MAX_SLOTS }, (_, i) => i + 1);
export type SupportedAudioFormat = (typeof SUPPORTED_AUDIO_FORMATS)[number];
