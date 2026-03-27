import { create } from 'zustand';

interface AlertBoxStore {
  message: string | null;
  setMessage: (message: string) => void;

  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
}

export const useAlertBoxStore = create<AlertBoxStore>((set) => ({
  message: null,
  setMessage: (message) => set(() => ({ message })),

  isVisible: false,
  setIsVisible: (isVisible) => set(() => ({ isVisible })),
}));
