import { useState, useEffect } from "react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { ThemeToggle } from "./components/gui/ThemeToggle";
import { ActiveTimerDisplay } from "./components/gui/ActiveTimerDisplay";
import { Login } from "./components/Login";
import { DatabaseSetupWizard } from "./components/DatabaseSetupWizard";
import { Toaster } from "./components/ui/sonner";
import { LoadingSpinner } from "./components/common/LoadingSpinner";
import { StaticModeBanner } from "./components/common/StaticModeBanner";
import { PermissionProvider } from "./contexts/PermissionContext";
import { toast } from 'sonner';
import { Client, User, EmailTemplate, Email } from "./types/client";
import { electronAPI, isElectron } from "./utils/electronAPI";
import { menuSections, type View } from "./config/menuConfig";
import { renderRoute } from "./utils/routeRenderer";

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
          const response = await window.fetch('/api/db-status');
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
    if (window.confirm('Czy na pewno chcesz usunąć tego klienta?')) {
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

  const handleSaveEmailTemplate = (template: EmailTemplate) => {
    if (template.id) {
      setEmailTemplates(prev => prev.map(t => t.id === template.id ? template : t));
      toast.success("Szablon został zaktualizowany");
    } else {
      const newTemplate = { ...template, id: Date.now().toString() };
      setEmailTemplates(prev => [...prev, newTemplate]);
      toast.success("Nowy szablon został utworzony");
    }
  };

  const handleDeleteEmailTemplate = (templateId: string) => {
    setEmailTemplates(prev => prev.filter(t => t.id !== templateId));
    toast.success("Szablon został usunięty");
  };

  const handleSaveProfile = (updatedUser: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...updatedUser } : u));
    toast.success("Profil został zaktualizowany");
  };

  const renderContent = () => {
    return renderRoute({
      currentView,
      currentUser,
      clients,
      selectedClient,
      users,
      emails,
      emailTemplates,
      onNavigate: setCurrentView,
      onViewClient: handleViewClient,
      onEditClient: handleEditClient,
      onDeleteClient: handleDeleteClient,
      onAddClient: handleAddClient,
      onSaveClient: handleSaveClient,
      onCancelForm: handleCancelForm,
      onBackToClients: handleBackToClients,
      onSendEmail: addEmail,
      onUpdateEmail: updateEmail,
      onDeleteEmail: deleteEmail,
      onSaveEmailTemplate: handleSaveEmailTemplate,
      onDeleteEmailTemplate: handleDeleteEmailTemplate,
      onSaveProfile: handleSaveProfile
    });
  };

  return (
    <PermissionProvider>
      <SidebarProvider>
        <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarContent>
            {menuSections.map((section) => (
              <SidebarGroup key={section.label}>
                <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          onClick={() => setCurrentView(item.view)}
                          isActive={currentView === item.view}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
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
          
          <StaticModeBanner />
          
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