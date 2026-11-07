import { create } from 'zustand';

export type Toast = { id: number; type: 'success' | 'error'; message: string };
type ToastState = { toasts: Toast[]; push: (toast: Omit<Toast, 'id'>) => void; remove: (id: number) => void };

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) => { const id = Date.now() + Math.random(); set((state) => ({ toasts: [...state.toasts, { ...toast, id }] })); window.setTimeout(() => set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) })), 3500); },
  remove: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));
