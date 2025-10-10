import { Clock, Zap } from "lucide-react";
import { useState, lazy, Suspense, useEffect } from "react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { ThemeToggle } from "./components/gui/ThemeToggle";
import { ActiveTimerDisplay } from "./components/gui/ActiveTimerDisplay";
import { Dashboard } from "./components/Dashboard";
import { ClientForm } from "./components/ClientForm";
import { ClientList } from "./components/ClientList";
import { ClientDetails } from "./components/ClientDetails";
import { Login } from "./components/Login";
import { DatabaseSetupWizard } from "./components/DatabaseSetupWizard";
import { Toaster } from "./components/ui/sonner";
import { LoadingSpinner } from "./components/common/LoadingSpinner";
import { PermissionProvider } from "./contexts/PermissionContext";
import { LayoutDashboard, Users, UserPlus, MessageSquare, Mail, FileText, Settings, CalendarDays, UserCog, MailOpen, FolderOpen, BarChart3, CreditCard, ScrollText, Building2, Timer } from "lucide-react";
import { toast } from 'sonner';
import { Client, User, EmailTemplate, Email } from "./types/client";
import { electronAPI, isElectron } from "./utils/electronAPI";

// Lazy load heavy components to reduce initial bundle size
const AutomaticInvoicing = lazy(() => import("./components/AutomaticInvoicing").then(module => ({ default: module.AutomaticInvoicing })));
const BankIntegration = lazy(() => import("./components/BankIntegration").then(module => ({ default: module.BankIntegration })));
const ContractManagement = lazy(() => import("./components/ContractManagement").then(module => ({ default: module.ContractManagement })));
const TeamChat = lazy(() => import("./components/TeamChat").then(module => ({ default: module.TeamChat })));
const EnhancedEmailCenter = lazy(() => import("./components/EnhancedEmailCenter").then(module => ({ default: module.EnhancedEmailCenter })));
const EnhancedInvoiceManager = lazy(() => import("./components/EnhancedInvoiceManager").then(module => ({ default: module.EnhancedInvoiceManager })));
const AdvancedCalendar = lazy(() => import("./components/AdvancedCalendar").then(module => ({ default: module.AdvancedCalendar })));
const UserManagement = lazy(() => import("./components/UserManagement").then(module => ({ default: module.UserManagement })));
const InvoiceTemplates = lazy(() => import("./components/SimpleInvoiceTemplates").then(module => ({ default: module.SimpleInvoiceTemplates })));
const EmailTemplates = lazy(() => import("./components/EmailTemplates").then(module => ({ default: module.EmailTemplates })));
const UserProfileManagement = lazy(() => import("./components/UserProfileManagement").then(module => ({ default: module.UserProfileManagement })));
const DocumentManager = lazy(() => import("./components/DocumentManager").then(module => ({ default: module.DocumentManager })));
const MonthlyDataPanel = lazy(() => import("./components/MonthlyDataPanel").then(module => ({ default: module.MonthlyDataPanel })));
const SystemSettings = lazy(() => import("./components/SystemSettings").then(module => ({ default: module.SystemSettings })));
const TimeTracker = lazy(() => import("./components/TimeTracker").then(module => ({ default: module.TimeTracker })));
const WorkTimeReport = lazy(() => import("./components/WorkTimeReport").then(module => ({ default: module.WorkTimeReport })));

type View = 'dashboard' | 'clients' | 'add-client' | 'edit-client' | 'view-client' | 'chat' | 'email' | 'invoices' | 'calendar' | 'users' | 'email-templates' | 'invoice-templates' | 'profile' | 'documents' | 'monthly-data' | 'settings' | 'bank-integration' | 'contracts' | 'time-tracker' | 'work-time-report' | 'auto-invoicing';

// Mock data - should be moved to separate file
import { mockClients } from "./data/mockClients";
import { mockUsers, mockEmailTemplates } from "./data/mockData";

const initialEmails: Email[] = [
  {
    id: '1',
    from: 'jan.kowalski@abc.pl',
    to: ['biuro@firma.pl'],
    subject: 'Zapytanie o usługi księgowe',
    content: 'Dzień dobry,\n\nChciałbym zapytać o cennik usług księgowych dla mojej firmy. Czy moglibyście przesłać mi szczegółową ofertę?\n\nPozdrawiam,\nJan Kowalski\nABC Sp. z o.o.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    clientId: '1',
    folder: 'inbox',
    isStarred: false,
    isArchived: false,
    isDeleted: false
  },
  {
    id: '2',
    from: 'anna.nowak@xyz.pl',
    to: ['biuro@firma.pl'],
    subject: 'Miesięczne dokumenty księgowe',
    content: 'Witam,\n\nPrzesyłam dokumenty za listopad 2024. Wszystkie faktury i rachunki są w załączeniu.\n\nW razie pytań proszę o kontakt.\n\nPozdrawiam,\nAnna Nowak',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    attachments: [
      {
        id: '1',
        name: 'faktury_listopad_2024.pdf',
        size: 2048000,
        type: 'application/pdf',
        url: '#'
      }
    ],
    clientId: '2',
    folder: 'inbox',
    isStarred: true,
    isArchived: false,
    isDeleted: false
  },
  {
    id: '3',
    from: 'biuro@firma.pl',
    to: ['jan.kowalski@abc.pl'],
    subject: 'Re: Zapytanie o usługi księgowe',
    content: 'Dzień dobry,\n\nDziękuję za zapytanie. W załączeniu przesyłam szczegółową ofertę na usługi księgowe.\n\nOferta obejmuje:\n- Pełną obsługę księgową\n- Rozliczenia VAT\n- Sporządzanie deklaracji\n- Konsultacje podatkowe\n\nCena: 800 PLN miesięcznie\n\nPozdrawiam,\nTeam Firma',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    clientId: '1',
    folder: 'sent',
    isStarred: false,
    isArchived: false,
    isDeleted: false
  }
];

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [emails, setEmails] = useState<Email[]>(initialEmails);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(mockEmailTemplates);
  const [databaseSetupRequired, setDatabaseSetupRequired] = useState(false);
  const [checkingDatabase, setCheckingDatabase] = useState(true);

  // Check database setup on mount (Electron only)
  useEffect(() => {
    const checkDatabaseSetup = async () => {
      if (isElectron && electronAPI.dbSetupCheck) {
        try {
          const result = await electronAPI.dbSetupCheck();
          if (result.requiresSetup) {
            setDatabaseSetupRequired(true);
          }
        } catch (error) {
          console.error('Database check error:', error);
          // If check fails, assume setup is needed
          setDatabaseSetupRequired(true);
        }
      } else {
        // For web version, check via API
        try {
          const response = await fetch('/api/db-status');
          const data = await response.json();
          if (data.requiresSetup || !data.connected) {
            setDatabaseSetupRequired(true);
          }
        } catch (error) {
          console.error('Database check error:', error);
          // Don't require setup for web version if check fails
        }
      }
      setCheckingDatabase(false);
    };

    checkDatabaseSetup();
  }, []);

  // Show loading while checking database
  if (checkingDatabase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Show database setup wizard if needed
  if (databaseSetupRequired) {
    return (
      <PermissionProvider>
        <DatabaseSetupWizard onComplete={() => setDatabaseSetupRequired(false)} />
        <Toaster />
      </PermissionProvider>
    );
  }

  // If not logged in, show login screen
  if (!currentUser) {
    return (
      <PermissionProvider>
        <Login onLogin={setCurrentUser} />
        <Toaster />
      </PermissionProvider>
    );
  }

  // Email management functions
  const addEmail = (email: Omit<Email, 'id'>) => {
    const newEmail: Email = {
      id: Date.now().toString(),
      ...email
    };
    setEmails(prev => [...prev, newEmail]);
    return newEmail;
  };

  const updateEmail = (emailId: string, updates: Partial<Email>) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId ? { ...email, ...updates } : email
    ));
  };

  const deleteEmail = (emailId: string) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId ? { ...email, isDeleted: true, folder: 'trash' } : email
    ));
  };

  const handleSaveClient = (clientData: Partial<Client>) => {
    if (selectedClient) {
      // Update existing client
      setClients(prev => 
        prev.map(client => 
          client.id === selectedClient.id 
            ? { ...client, ...clientData }
            : client
        )
      );
      toast.success("Klient został zaktualizowany");
    } else {
      // Add new client
      const newClient: Client = {
        id: Date.now().toString(),
        ...clientData as Omit<Client, 'id'>
      };
      setClients(prev => [...prev, newClient]);
      toast.success("Nowy klient został dodany");
    }
    setCurrentView('clients');
    setSelectedClient(null);
  };

  const handleDeleteClient = (clientId: string) => {
    if (confirm('Czy na pewno chcesz usunąć tego klienta?')) {
      setClients(prev => prev.filter(client => client.id !== clientId));
      toast.success("Klient został usunięty pomyślnie");
    }
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setCurrentView('view-client');
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setCurrentView('edit-client');
  };

  const handleAddClient = () => {
    setSelectedClient(null);
    setCurrentView('add-client');
  };

  const handleCancelForm = () => {
    setSelectedClient(null);
    setCurrentView('clients');
  };

  const handleBackToClients = () => {
    setSelectedClient(null);
    setCurrentView('clients');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard currentUser={currentUser} onNavigate={setCurrentView} />;
      case 'clients':
        return (
          <ClientList
            clients={clients}
            onViewClient={handleViewClient}
            onEditClient={handleEditClient}
            onDeleteClient={handleDeleteClient}
            onAddClient={handleAddClient}
          />
        );
      case 'add-client':
        return (
          <ClientForm
            onSave={handleSaveClient}
            onCancel={handleCancelForm}
          />
        );
      case 'edit-client':
        return selectedClient ? (
          <ClientForm
            client={selectedClient}
            onSave={handleSaveClient}
            onCancel={handleCancelForm}
          />
        ) : null;
      case 'view-client':
        return selectedClient ? (
          <ClientDetails
            client={selectedClient}
            onBack={handleBackToClients}
            onEdit={handleEditClient}
          />
        ) : null;
      case 'chat':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <TeamChat currentUser={currentUser} allUsers={users} />
          </Suspense>
        );
      case 'email':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <EnhancedEmailCenter 
              clients={clients} 
              templates={emailTemplates}
              emails={emails}
              onSendEmail={addEmail}
              onUpdateEmail={updateEmail}
              onDeleteEmail={deleteEmail}
            />
          </Suspense>
        );
      case 'invoices':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <EnhancedInvoiceManager clients={clients} />
          </Suspense>
        );
      case 'calendar':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <AdvancedCalendar currentUser={currentUser} allUsers={users} />
          </Suspense>
        );
      case 'users':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <UserManagement />
          </Suspense>
        );
      case 'email-templates':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <EmailTemplates 
              templates={emailTemplates}
              onSaveTemplate={(template) => {
                if (template.id) {
                  setEmailTemplates(prev => prev.map(t => t.id === template.id ? template : t));
                  toast.success("Szablon został zaktualizowany");
                } else {
                  const newTemplate = { ...template, id: Date.now().toString() };
                  setEmailTemplates(prev => [...prev, newTemplate]);
                  toast.success("Nowy szablon został utworzony");
                }
              }}
              onDeleteTemplate={(templateId) => {
                setEmailTemplates(prev => prev.filter(t => t.id !== templateId));
                toast.success("Szablon został usunięty");
              }}
            />
          </Suspense>
        );
      case 'invoice-templates':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <InvoiceTemplates />
          </Suspense>
        );
      case 'profile':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <UserProfileManagement 
              user={currentUser as any} 
              onSave={(updatedUser) => {
                setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...updatedUser } : u));
                toast.success("Profil został zaktualizowany");
              }}
              isAdmin={currentUser.role === 'administrator'}
            />
          </Suspense>
        );
      case 'documents':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <DocumentManager clients={clients} />
          </Suspense>
        );
      case 'monthly-data':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <MonthlyDataPanel clients={clients} />
          </Suspense>
        );
      case 'settings':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <SystemSettings />
          </Suspense>
        );
      case 'bank-integration':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <BankIntegration />
          </Suspense>
        );
      case 'contracts':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ContractManagement />
          </Suspense>
        );
      case 'time-tracker':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <TimeTracker currentUser={currentUser} />
          </Suspense>
        );
      case 'work-time-report':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <WorkTimeReport currentUser={currentUser} clients={clients} users={users} />
          </Suspense>
        );
      case 'auto-invoicing':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <AutomaticInvoicing clients={clients} />
          </Suspense>
        );
      default:
        return <Dashboard currentUser={currentUser} onNavigate={setCurrentView} />;
    }
  };

  const menuItems = [
    {
      title: "Panel Główny",
      icon: LayoutDashboard,
      onClick: () => setCurrentView('dashboard'),
      active: currentView === 'dashboard'
    },
    {
      title: "Wszyscy Klienci",
      icon: Users,
      onClick: () => setCurrentView('clients'),
      active: currentView === 'clients'
    },
    {
      title: "Dokumenty",
      icon: FolderOpen,
      onClick: () => setCurrentView('documents'),
      active: currentView === 'documents'
    },
    {
      title: "Dane Miesięczne",
      icon: BarChart3,
      onClick: () => setCurrentView('monthly-data'),
      active: currentView === 'monthly-data'
    }
  ];

  const communicationItems = [
    {
      title: "Chat Zespołowy",
      icon: MessageSquare,
      onClick: () => setCurrentView('chat'),
      active: currentView === 'chat'
    },
    {
      title: "Centrum Email",
      icon: Mail,
      onClick: () => setCurrentView('email'),
      active: currentView === 'email'
    },
    {
      title: "Kalendarz",
      icon: CalendarDays,
      onClick: () => setCurrentView('calendar'),
      active: currentView === 'calendar'
    }
  ];

  const businessItems = [
    {
      title: "Faktury",
      icon: FileText,
      onClick: () => setCurrentView('invoices'),
      active: currentView === 'invoices'
    },
    {
      title: "Automatyczne Faktury",
      icon: Zap,
      onClick: () => setCurrentView('auto-invoicing'),
      active: currentView === 'auto-invoicing'
    },
    {
      title: "Szablony Faktur",
      icon: ScrollText,
      onClick: () => setCurrentView('invoice-templates'),
      active: currentView === 'invoice-templates'
    },
    {
      title: "Integracja Bankowa",
      icon: CreditCard,
      onClick: () => setCurrentView('bank-integration'),
      active: currentView === 'bank-integration'
    },
    {
      title: "Zarządzanie Kontraktami",
      icon: Building2,
      onClick: () => setCurrentView('contracts'),
      active: currentView === 'contracts'
    }
  ];

  const organizationItems = [
    {
      title: "Czasomierz",
      icon: Clock,
      onClick: () => setCurrentView('time-tracker'),
      active: currentView === 'time-tracker'
    },
    {
      title: "Raport Czasu Pracy", 
      icon: Timer,
      onClick: () => setCurrentView('work-time-report'),
      active: currentView === 'work-time-report'
    },
    {
      title: "Zarządzanie Personelem",
      icon: UserCog,
      onClick: () => setCurrentView('users'),
      active: currentView === 'users'
    },
    {
      title: "Szablony Email",
      icon: MailOpen,
      onClick: () => setCurrentView('email-templates'),
      active: currentView === 'email-templates'
    }
  ];

  return (
    <PermissionProvider>
      <SidebarProvider>
        <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Zarządzanie Klientami</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        onClick={item.onClick}
                        isActive={item.active}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Komunikacja</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {communicationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        onClick={item.onClick}
                        isActive={item.active}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Biznes</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {businessItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        onClick={item.onClick}
                        isActive={item.active}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Organizacja</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {organizationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        onClick={item.onClick}
                        isActive={item.active}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <SidebarGroup>
              <SidebarGroupLabel>Ustawienia</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => setCurrentView('profile')}
                      isActive={currentView === 'profile'}
                    >
                      <UserCog className="h-4 w-4" />
                      <span>Mój Profil</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => setCurrentView('settings')}
                      isActive={currentView === 'settings'}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Preferencje</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="border-b px-6 py-4 flex items-center justify-between">
            <SidebarTrigger />
            <div className="flex items-center gap-4">
              <ActiveTimerDisplay onStartTimer={() => setCurrentView('time-tracker')} />
              <ThemeToggle />
            </div>
          </header>
          
          <div className="flex-1 overflow-auto p-6">
            {renderContent()}
          </div>
        </main>
      </div>
      
      <Toaster />
    </SidebarProvider>
    </PermissionProvider>
  );
}