import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ArtifactData } from '../types';

interface AppState {
  selectedArtifact: ArtifactData | null;
  filterDestination: 'all' | 'moon' | 'mars' | 'deep-space';
  filterStatus: 'all' | 'active' | 'silent' | 'ghost';
  visitedArtifacts: string[];
  ghostMailsSent: number;
  soundEnabled: boolean;
  signalRoomVisited: boolean;
  gameHighScore: number;

  setSelectedArtifact: (artifact: ArtifactData | null) => void;
  setFilterDestination: (dest: 'all' | 'moon' | 'mars' | 'deep-space') => void;
  setFilterStatus: (status: 'all' | 'active' | 'silent' | 'ghost') => void;
  markVisited: (id: string) => void;
  toggleSound: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  incrementGhostMails: () => void;
  setSignalRoomVisited: () => void;
  setGameHighScore: (score: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedArtifact: null,
      filterDestination: 'all',
      filterStatus: 'all',
      visitedArtifacts: [],
      ghostMailsSent: 0,
      soundEnabled: false,
      signalRoomVisited: false,
      gameHighScore: 0,

      setSelectedArtifact: (artifact) => set({ selectedArtifact: artifact }),
      setFilterDestination: (dest) => set({ filterDestination: dest }),
      setFilterStatus: (status) => set({ filterStatus: status }),
      markVisited: (id) =>
        set((state) => ({
          visitedArtifacts: state.visitedArtifacts.includes(id)
            ? state.visitedArtifacts
            : [...state.visitedArtifacts, id],
        })),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      incrementGhostMails: () =>
        set((state) => ({ ghostMailsSent: state.ghostMailsSent + 1 })),
      setSignalRoomVisited: () => set({ signalRoomVisited: true }),
      setGameHighScore: (score) =>
        set((state) => ({
          gameHighScore: Math.max(state.gameHighScore, score),
        })),
    }),
    {
      name: 'space-graveyard-storage',
    }
  )
);
