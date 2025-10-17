import { create } from 'zustand';

type View =
  | 'dashboard'
  | 'clients'
  | 'add-client'
  | 'edit-client'
  | 'view-client'
  | 'chat'
  | 'email'
  | 'invoices'
  | 'calendar'
  | 'users'
  | 'email-templates'
  | 'invoice-templates'
  | 'profile'
  | 'documents'
  | 'monthly-data'
  | 'settings'
  | 'bank-integration'
  | 'contracts'
  | 'time-tracker'
  | 'work-time-report'
  | 'auto-invoicing';

interface AppState {
  currentView: View;
  sidebarOpen: boolean;
  selectedClientId: string | null;
  setView: (view: View) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSelectedClient: (clientId: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'dashboard',
  sidebarOpen: true,
  selectedClientId: null,
  setView: (view) => set({ currentView: view }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSelectedClient: (clientId) => set({ selectedClientId: clientId }),
}));
