import { create } from 'zustand'

export type NavItem =
  | 'dashboard'
  | 'analytics'
  | 'knowledge'
  | 'appointments'
  | 'emails'
  | 'calls'
  | 'integrations'
  | 'embed'
  | 'chat'
  | 'settings'

interface AppState {
  activeNav: NavItem
  sidebarOpen: boolean
  setActiveNav: (nav: NavItem) => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>((set) => ({
  activeNav: 'dashboard',
  sidebarOpen: false,
  setActiveNav: (nav) => set({ activeNav: nav, sidebarOpen: false }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}))