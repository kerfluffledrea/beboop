import {
  Accessor,
  createContext,
  createMemo,
  createResource,
  createSignal,
  JSX,
  useContext,
} from 'solid-js';
import {
  getLoadedSounds,
  loadSoundFile,
  pickAndValidateAudioFile,
  playSoundSlot,
  removeSoundSlot,
  SoundInfo,
} from '../lib/tauriCommands';

interface AudioContextType {
  sounds: Accessor<SoundInfo[]>;
  isLoading: Accessor<boolean>;
  error: Accessor<string | null>;
  soundsBySlot: Accessor<Map<number, SoundInfo>>;
  emptySlots: Accessor<number[]>;
  nextAvailableSlot: Accessor<number | null>;
  loadSound: (slot: number, label: string) => Promise<boolean>;
  playSound: (slot: number) => Promise<boolean>;
  removeSound: (slot: number) => Promise<boolean>;
  clearError: () => void;
  getSoundInSlot: (slot: number) => SoundInfo | undefined;
}

const AudioContext = createContext<AudioContextType>();

interface AudioProviderProps {
  children: JSX.Element;
  maxSlots?: number;
}

export function AudioProvider(props: AudioProviderProps) {
  const maxSlots = props.maxSlots ?? 9;

  const [soundsResource, { refetch: refreshSounds }] = createResource(async () => {
    try {
      return await getLoadedSounds();
    } catch (e) {
      console.error('Failed to load sounds:', e);
      throw e;
    }
  });

  const [error, setError] = createSignal<string | null>(null);
  const [operationLoading, setOperationLoading] = createSignal(false);
  const sounds = createMemo(() => soundsResource() ?? []);
  const isLoading = createMemo(() => soundsResource.loading || operationLoading());

  const soundsBySlot = createMemo(() => {
    const map = new Map<number, SoundInfo>();
    sounds().forEach(sound => {
      map.set(sound.slot, sound);
    });
    return map;
  });

  const emptySlots = createMemo(() => {
    const occupied = new Set(sounds().map(s => s.slot));
    const empty: number[] = [];
    for (let i = 1; i <= maxSlots; i++) {
      if (!occupied.has(i)) {
        empty.push(i);
      }
    }
    return empty;
  });

  const nextAvailableSlot = createMemo(() => {
    const empty = emptySlots();
    return empty.length > 0 ? empty[0] : null;
  });

  const clearError = () => setError(null);

  const withErrorHandling = async <T,>(
    operation: () => Promise<T>,
    errorMessage: string
  ): Promise<boolean> => {
    try {
      setError(null);
      setOperationLoading(true);
      await operation();
      refreshSounds();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(`${errorMessage}: ${message}`);
      console.error(errorMessage, err);
      return false;
    } finally {
      setOperationLoading(false);
    }
  };

  const loadSound = async (slot: number, label?: string): Promise<boolean> => {
    console.log('a');
    return withErrorHandling(async () => {
      console.log('b');
      const filePath = await pickAndValidateAudioFile();
      if (!filePath) {
        throw new Error('No file selected');
      }
      await loadSoundFile(slot, label || `Sound ${slot}`, filePath);
    }, `Failed to load sound in slot ${slot}`);
  };

  const playSound = async (slot: number): Promise<boolean> => {
    try {
      setError(null);
      await playSoundSlot(slot);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : `Unknown error ${err}`;
      setError(`Failed to play sound in slot ${slot}: ${message}`);
      return false;
    }
  };

  const removeSound = async (slot: number): Promise<boolean> => {
    return withErrorHandling(
      () => removeSoundSlot(slot),
      `Failed to remove sound from slot ${slot}`
    );
  };

  const getSoundInSlot = (slot: number): SoundInfo | undefined => {
    return soundsBySlot().get(slot);
  };

  const contextValue: AudioContextType = {
    sounds,
    isLoading,
    error,

    soundsBySlot,
    emptySlots,
    nextAvailableSlot,

    loadSound,
    playSound,
    removeSound,
    clearError,

    getSoundInSlot,
  };

  return <AudioContext.Provider value={contextValue}>{props.children}</AudioContext.Provider>;
}

export function useAudio(): AudioContextType {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
