import { create } from "zustand";

interface PromptStore {
  pendingPrompt: string | null;
  setPendingPrompt: (prompt: string) => void;
  clearPendingPrompt: () => void;
}

export const usePromptStore = create<PromptStore>((set) => ({
  pendingPrompt: null,
  setPendingPrompt: (prompt) => set({ pendingPrompt: prompt }),
  clearPendingPrompt: () => set({ pendingPrompt: null }),
}));
