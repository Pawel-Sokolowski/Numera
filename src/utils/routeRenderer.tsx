import { lazy, Suspense } from 'react';
import { Dashboard } from '../components/Dashboard';
import { ClientForm } from '../components/ClientForm';
import { ClientList } from '../components/ClientList';
import { ClientDetails } from '../components/ClientDetails';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import type { View } from '../config/menuConfig';
import type { Client, User, EmailTemplate, Email } from '../types/client';

// Lazy load heavy components to reduce initial bundle size
const AutomaticInvoicing = lazy(() =>
  import('../components/AutomaticInvoicing').then((module) => ({
    default: module.AutomaticInvoicing,
  }))
);
const BankIntegration = lazy(() =>
  import('../components/BankIntegration').then((module) => ({ default: module.BankIntegration }))
);
const ContractManagement = lazy(() =>
  import('../components/ContractManagement').then((module) => ({
    default: module.ContractManagement,
  }))
);
const TeamChat = lazy(() =>
  import('../components/TeamChat').then((module) => ({ default: module.TeamChat }))
);
const EnhancedEmailCenter = lazy(() =>
  import('../components/EnhancedEmailCenter').then((module) => ({
    default: module.EnhancedEmailCenter,
  }))
);
const EnhancedInvoiceManager = lazy(() =>
  import('../components/EnhancedInvoiceManager').then((module) => ({
    default: module.EnhancedInvoiceManager,
  }))
);
const AdvancedCalendar = lazy(() =>
  import('../components/AdvancedCalendar').then((module) => ({ default: module.AdvancedCalendar }))
);
const UserManagement = lazy(() =>
  import('../components/UserManagement').then((module) => ({ default: module.UserManagement }))
);
const InvoiceTemplates = lazy(() =>
  import('../components/SimpleInvoiceTemplates').then((module) => ({
    default: module.SimpleInvoiceTemplates,
  }))
);
const EmailTemplates = lazy(() =>
  import('../components/EmailTemplates').then((module) => ({ default: module.EmailTemplates }))
);
const UserProfileManagement = lazy(() =>
  import('../components/UserProfileManagement').then((module) => ({
    default: module.UserProfileManagement,
  }))
);
const DocumentManager = lazy(() =>
  import('../components/DocumentManager').then((module) => ({ default: module.DocumentManager }))
);
const MonthlyDataPanel = lazy(() =>
  import('../components/MonthlyDataPanel').then((module) => ({ default: module.MonthlyDataPanel }))
);
const SystemSettings = lazy(() =>
  import('../components/SystemSettings').then((module) => ({ default: module.SystemSettings }))
);
const TimeTracker = lazy(() =>
  import('../components/TimeTracker').then((module) => ({ default: module.TimeTracker }))
);
const WorkTimeReport = lazy(() =>
  import('../components/WorkTimeReport').then((module) => ({ default: module.WorkTimeReport }))
);
const FormFieldDetectorExample = lazy(() =>
  import('../components/FormFieldDetectorExample').then((module) => ({
    default: module.FormFieldDetectorExample,
  }))
);

export interface RouteRendererProps {
  currentView: View;
  currentUser: User | null;
  clients: Client[];
  selectedClient: Client | null;
  users: User[];
  emails: Email[];
  emailTemplates: EmailTemplate[];
  onNavigate: (view: View) => void;
  onViewClient: (client: Client) => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  onAddClient: () => void;
  onSaveClient: (clientData: Partial<Client>) => void;
  onCancelForm: () => void;
  onBackToClients: () => void;
  onSendEmail: (email: Omit<Email, 'id'>) => Email;
  onUpdateEmail: (emailId: string, updates: Partial<Email>) => void;
  onDeleteEmail: (emailId: string) => void;
  onSaveEmailTemplate: (template: EmailTemplate) => void;
  onDeleteEmailTemplate: (templateId: string) => void;
  onSaveProfile: (updatedUser: Partial<User>) => void;
}

export function renderRoute(props: RouteRendererProps) {
  const {
    currentView,
    currentUser,
    clients,
    selectedClient,
    users,
    emails,
    emailTemplates,
    onNavigate,
    onViewClient,
    onEditClient,
    onDeleteClient,
    onAddClient,
    onSaveClient,
    onCancelForm,
    onBackToClients,
    onSendEmail,
    onUpdateEmail,
    onDeleteEmail,
    onSaveEmailTemplate,
    onDeleteEmailTemplate,
    onSaveProfile,
  } = props;

  switch (currentView) {
    case 'dashboard':
      return <Dashboard currentUser={currentUser} onNavigate={onNavigate} />;

    case 'clients':
      return (
        <ClientList
          clients={clients}
          onViewClient={onViewClient}
          onEditClient={onEditClient}
          onDeleteClient={onDeleteClient}
          onAddClient={onAddClient}
        />
      );

    case 'add-client':
      return <ClientForm onSave={onSaveClient} onCancel={onCancelForm} />;

    case 'edit-client':
      return selectedClient ? (
        <ClientForm client={selectedClient} onSave={onSaveClient} onCancel={onCancelForm} />
      ) : null;

    case 'view-client':
      return selectedClient ? (
        <ClientDetails client={selectedClient} onBack={onBackToClients} onEdit={onEditClient} />
      ) : null;

    case 'chat':
      return (
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <TeamChat currentUser={currentUser} allUsers={users} />
          </Suspense>
        </ErrorBoundary>
      );

    case 'email':
      return (
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <EnhancedEmailCenter
              clients={clients}
              templates={emailTemplates}
              emails={emails}
              onSendEmail={onSendEmail}
              onUpdateEmail={onUpdateEmail}
              onDeleteEmail={onDeleteEmail}
            />
          </Suspense>
        </ErrorBoundary>
      );

    case 'invoices':
      return (
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <EnhancedInvoiceManager clients={clients} />
          </Suspense>
        </ErrorBoundary>
      );

    case 'calendar':
      return (
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <AdvancedCalendar currentUser={currentUser} allUsers={users} />
          </Suspense>
        </ErrorBoundary>
      );

    case 'users':
      return (
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <UserManagement />
          </Suspense>
        </ErrorBoundary>
      );

    case 'email-templates':
      return (
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <EmailTemplates
              templates={emailTemplates}
              onSaveTemplate={onSaveEmailTemplate}
              onDeleteTemplate={onDeleteEmailTemplate}
            />
          </Suspense>
        </ErrorBoundary>
      );

    case 'invoice-templates':
      return (
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <InvoiceTemplates />
          </Suspense>
        </ErrorBoundary>
      );

    case 'profile':
      return (
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <UserProfileManagement
              user={currentUser}
              onSave={onSaveProfile}
              isAdmin={currentUser?.role === 'administrator'}
            />
          </Suspense>
        </ErrorBoundary>
      );

    case 'documents':
      return (
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <DocumentManager clients={clients} />
          </Suspense>
        </ErrorBoundary>
      );

    case 'monthly-data':
      return (
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <MonthlyDataPanel clients={clients} />
          </Suspense>
        </ErrorBoundary>
      );

    case 'settings':
      return (
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <SystemSettings />
          </Suspense>
        </ErrorBoundary>
      );

    case 'bank-integration':
      return (
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <BankIntegration />
          </Suspense>
        </ErrorBoundary>
      );

    case 'contracts':
      return (
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <ContractManagement />
          </Suspense>
        </ErrorBoundary>
      );

    case 'time-tracker':
      return (
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <TimeTracker currentUser={currentUser} />
          </Suspense>
        </ErrorBoundary>
      );

    case 'work-time-report':
      return (
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <WorkTimeReport currentUser={currentUser} clients={clients} users={users} />
          </Suspense>
        </ErrorBoundary>
      );

    case 'auto-invoicing':
      return (
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <AutomaticInvoicing clients={clients} />
          </Suspense>
        </ErrorBoundary>
      );

    case 'field-detector':
      return (
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <FormFieldDetectorExample />
          </Suspense>
        </ErrorBoundary>
      );

    default:
      return <Dashboard currentUser={currentUser} onNavigate={onNavigate} />;
  }
}
