import { create } from 'zustand';

export interface WindowState {
    id: string;
    title: string;
    icon?: React.ReactNode;
    component: React.ReactNode;
    isOpen: boolean;
    isMinimized: boolean;
    isMaximized: boolean;
    zIndex: number;
    position?: { x: number; y: number };
    size?: { width: number; height: number };
}

interface WindowStore {
    windows: WindowState[];
    activeWindowId: string | null;

    openWindow: (window: Omit<WindowState, 'isOpen' | 'isMinimized' | 'isMaximized' | 'zIndex'>) => void;
    closeWindow: (id: string) => void;
    minimizeWindow: (id: string) => void;
    maximizeWindow: (id: string) => void;
    focusWindow: (id: string) => void;
}

export const useWindowStore = create<WindowStore>((set) => ({
    windows: [],
    activeWindowId: null,

    openWindow: (window) =>
        set((state) => {
            const existingWindow = state.windows.find((w) => w.id === window.id);
            if (existingWindow) {
                return {
                    activeWindowId: window.id,
                    windows: state.windows.map((w) =>
                        w.id === window.id ? { ...w, isOpen: true, isMinimized: false, zIndex: state.windows.length + 1 } : w
                    ),
                };
            }
            return {
                activeWindowId: window.id,
                windows: [
                    ...state.windows,
                    { ...window, isOpen: true, isMinimized: false, isMaximized: false, zIndex: state.windows.length + 1 },
                ],
            };
        }),

    closeWindow: (id) =>
        set((state) => ({
            windows: state.windows.filter((w) => w.id !== id),
            activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
        })),

    minimizeWindow: (id) =>
        set((state) => ({
            windows: state.windows.map((w) => (w.id === id ? { ...w, isMinimized: true } : w)),
            activeWindowId: state.activeWindowId === id ? null : state.activeWindowId,
        })),

    maximizeWindow: (id) =>
        set((state) => ({
            windows: state.windows.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w)),
        })),

    focusWindow: (id) =>
        set((state) => {
            const maxZ = Math.max(...state.windows.map(w => w.zIndex), 0);
            return {
                activeWindowId: id,
                windows: state.windows.map((w) => w.id === id ? { ...w, zIndex: maxZ + 1, isMinimized: false } : w)
            }
        }),
}));
