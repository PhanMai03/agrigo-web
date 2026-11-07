import { useToastStore } from '@/stores/toastStore';

export function ToastViewport() { const { toasts, remove } = useToastStore(); return <div className="fixed right-4 top-4 z-[100] space-y-3">{toasts.map((toast) => <button className={`block max-w-sm rounded-xl px-4 py-3 text-left text-sm font-semibold text-white shadow-lg ${toast.type === 'success' ? 'bg-primary-700' : 'bg-red-600'}`} key={toast.id} onClick={() => remove(toast.id)} type="button">{toast.message}</button>)}</div>; }
