import { For, Show } from 'solid-js';
import { useAudio } from '../contexts/AudioContext';
import { SoundSlot } from './SoundSlot';

export function Soundboard() {
  const audio = useAudio();

  return (
    <div class="p-2">
      <Show when={audio.error()}>
        <div>
          {audio.error()};<button onClick={audio.clearError}>Dismiss</button>
        </div>
      </Show>
      <Show when={audio.isLoading()}>
        <div>Loading...</div>
      </Show>

      <div class="mb-6 grid grid-cols-3 gap-4">
        <For each={[1, 2, 3, 4, 5, 6, 7, 8, 9]}>{slot => <SoundSlot slot={slot} />}</For>
      </div>

      <div>
        Loaded sounds: {audio.sounds().length} / Empty slots: {audio.emptySlots().length}
      </div>
    </div>
  );
}
