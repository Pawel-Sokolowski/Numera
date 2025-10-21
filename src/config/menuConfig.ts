import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Mail,
  FileText,
  Settings,
  CalendarDays,
  UserCog,
  MailOpen,
  FolderOpen,
  BarChart3,
  CreditCard,
  ScrollText,
  Building2,
  Timer,
  Clock,
  Zap,
  FileSearch,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type View =
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
  | 'auto-invoicing'
  | 'field-detector';

export interface MenuItem {
  title: string;
  icon: LucideIcon;
  view: View;
}

export interface MenuSection {
  label: string;
  items: MenuItem[];
}

export const menuSections: MenuSection[] = [
  {
    label: 'Zarządzanie Klientami',
    items: [
      {
        title: 'Panel Główny',
        icon: LayoutDashboard,
        view: 'dashboard',
      },
      {
        title: 'Wszyscy Klienci',
        icon: Users,
        view: 'clients',
      },
      {
        title: 'Dokumenty',
        icon: FolderOpen,
        view: 'documents',
      },
      {
        title: 'Dane Miesięczne',
        icon: BarChart3,
        view: 'monthly-data',
      },
    ],
  },
  {
    label: 'Komunikacja',
    items: [
      {
        title: 'Chat Zespołowy',
        icon: MessageSquare,
        view: 'chat',
      },
      {
        title: 'Centrum Email',
        icon: Mail,
        view: 'email',
      },
      {
        title: 'Kalendarz',
        icon: CalendarDays,
        view: 'calendar',
      },
    ],
  },
  {
    label: 'Biznes',
    items: [
      {
        title: 'Faktury',
        icon: FileText,
        view: 'invoices',
      },
      {
        title: 'Automatyczne Faktury',
        icon: Zap,
        view: 'auto-invoicing',
      },
      {
        title: 'Szablony Faktur',
        icon: ScrollText,
        view: 'invoice-templates',
      },
      {
        title: 'Integracja Bankowa',
        icon: CreditCard,
        view: 'bank-integration',
      },
      {
        title: 'Zarządzanie Kontraktami',
        icon: Building2,
        view: 'contracts',
      },
    ],
  },
  {
    label: 'Organizacja',
    items: [
      {
        title: 'Czasomierz',
        icon: Clock,
        view: 'time-tracker',
      },
      {
        title: 'Raport Czasu Pracy',
        icon: Timer,
        view: 'work-time-report',
      },
      {
        title: 'Zarządzanie Personelem',
        icon: UserCog,
        view: 'users',
      },
      {
        title: 'Szablony Email',
        icon: MailOpen,
        view: 'email-templates',
      },
    ],
  },
  {
    label: 'Ustawienia',
    items: [
      {
        title: 'Mój Profil',
        icon: UserCog,
        view: 'profile',
      },
      {
        title: 'Preferencje',
        icon: Settings,
        view: 'settings',
      },
      {
        title: 'Detektor Pól PDF',
        icon: FileSearch,
        view: 'field-detector',
      },
    ],
  },
];
