import { Show } from 'solid-js';
import { useAudio } from '../contexts/AudioContext';

export function SoundSlot({ slot }: { slot: number }) {
  const audio = useAudio();
  const sound = () => audio.getSoundInSlot(slot);
  const isEmpty = () => !sound();

  const handleLoad = () => async () => {
    await audio.loadSound(slot, `Sound ${slot}`);
  };

  const handlePlay = async () => {
    await audio.playSound(slot);
  };

  return (
    <div class="rounded border-2 bg-gray-300 p-2">
      <div>Slot {slot}</div>
      <Show when={isEmpty()}>
        <div>
          <button onClick={handleLoad()} disabled={audio.isLoading()}>
            Load Sound
          </button>
        </div>
      </Show>
      <Show when={!isEmpty()}>
        <button onClick={handlePlay}>Play</button>
      </Show>
    </div>
  );
}
