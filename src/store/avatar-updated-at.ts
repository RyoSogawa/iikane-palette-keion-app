import { create } from 'zustand';

type State = {
  avatarUpdatedAt: string;
};

type Action = {
  update: () => void;
};

export const useAvatarUpdatedAt = create<State & Action>((set) => ({
  avatarUpdatedAt: '',
  update: () => set({ avatarUpdatedAt: new Date().getTime().toString() }),
}));
