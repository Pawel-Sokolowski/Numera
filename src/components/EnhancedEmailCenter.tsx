import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { 
  Mail, 
  Send, 
  Inbox, 
  Archive, 
  Star, 
  Search, 
  Plus, 
  Paperclip, 
  Reply, 
  ReplyAll, 
  Forward, 
  Trash2, 
  Settings,
  Folder,
  Filter,
  Download,
  Eye,
  EyeOff,
  RefreshCw
} from "lucide-react";
import { Email, EmailAttachment, Client, EmailTemplate } from "../types/client";
import { toast } from 'sonner';

interface EmailFolder {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
  color?: string;
}

interface EmailAccount {
  id: string;
  email: string;
  provider: 'gmail' | 'outlook' | 'yahoo' | 'custom';
  imapHost: string;
  imapPort: number;
  smtpHost: string;
  smtpPort: number;
  username: string;
  password: string; // Encrypted
  isActive: boolean;
  lastSync?: string;
}

interface EnhancedEmailCenterProps {
  clients: Client[];
  templates: EmailTemplate[];
  emails: Email[];
  onSendEmail: (email: Omit<Email, 'id'>) => void;
  onUpdateEmail: (emailId: string, updates: Partial<Email>) => void;
  onDeleteEmail: (emailId: string) => void;
}

export function EnhancedEmailCenter({ 
  clients, 
  templates, 
  emails, 
  onSendEmail, 
  onUpdateEmail, 
  onDeleteEmail 
}: EnhancedEmailCenterProps) {
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [searchTerm, setSearchTerm] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string>('');

  // Calculate folder counts
  const inboxCount = emails.filter(e => e.folder === 'inbox' && !e.isDeleted).length;
  const sentCount = emails.filter(e => e.folder === 'sent' && !e.isDeleted).length;
  const draftsCount = emails.filter(e => e.folder === 'drafts' && !e.isDeleted).length;
  const starredCount = emails.filter(e => e.isStarred && !e.isDeleted).length;
  const archiveCount = emails.filter(e => e.isArchived && !e.isDeleted).length;
  const trashCount = emails.filter(e => e.isDeleted).length;

  const folders: EmailFolder[] = [
    { id: 'inbox', name: 'Skrzynka odbiorcza', icon: <Inbox className="h-4 w-4" />, count: inboxCount },
    { id: 'sent', name: 'Wysłane', icon: <Send className="h-4 w-4" />, count: sentCount },
    { id: 'drafts', name: 'Szkice', icon: <Mail className="h-4 w-4" />, count: draftsCount },
    { id: 'starred', name: 'Oznaczone', icon: <Star className="h-4 w-4" />, count: starredCount },
    { id: 'archive', name: 'Archiwum', icon: <Archive className="h-4 w-4" />, count: archiveCount },
    { id: 'trash', name: 'Kosz', icon: <Trash2 className="h-4 w-4" />, count: trashCount }
  ];

  // Automatyczne foldery na podstawie klientów
  const [clientFolders, setClientFolders] = useState<EmailFolder[]>([]);

  useEffect(() => {
    // Generowanie folderów klientów
    const generatedFolders = clients.slice(0, 5).map(client => ({
      id: `client_${client.id}`,
      name: client.company || `${client.firstName} ${client.lastName}`,
      icon: <Folder className="h-4 w-4" />,
      count: emails.filter(e => e.clientId === client.id && !e.isDeleted).length,
      color: '#3b82f6'
    }));
    setClientFolders(generatedFolders);

    // Mock email accounts
    const mockAccounts: EmailAccount[] = [
      {
        id: '1',
        email: 'biuro@firma.pl',
        provider: 'custom',
        imapHost: 'mail.firma.pl',
        imapPort: 993,
        smtpHost: 'mail.firma.pl',
        smtpPort: 587,
        username: 'biuro@firma.pl',
        password: 'encrypted_password',
        isActive: true,
        lastSync: new Date().toISOString()
      }
    ];

    setEmailAccounts(mockAccounts);
    if (mockAccounts.length > 0) {
      setSelectedAccount(mockAccounts[0].id);
    }
  }, [clients, emails]);

  const [newEmail, setNewEmail] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    content: '',
    template: '',
    clientId: ''
  });

  const [newAccount, setNewAccount] = useState<Partial<EmailAccount>>({
    email: '',
    provider: 'custom',
    imapHost: '',
    imapPort: 993,
    smtpHost: '',
    smtpPort: 587,
    username: '',
    password: '',
    isActive: true
  });

  const handleSendEmail = () => {
    if (!newEmail.to || !newEmail.subject) {
      toast.error("Wprowadź adresata i temat wiadomości");
      return;
    }

    const email: Omit<Email, 'id'> = {
      from: emailAccounts.find(acc => acc.id === selectedAccount)?.email || 'biuro@firma.pl',
      to: newEmail.to.split(',').map(email => email.trim()),
      cc: newEmail.cc ? newEmail.cc.split(',').map(email => email.trim()) : undefined,
      bcc: newEmail.bcc ? newEmail.bcc.split(',').map(email => email.trim()) : undefined,
      subject: newEmail.subject,
      content: newEmail.content,
      timestamp: new Date().toISOString(),
      isRead: true,
      clientId: newEmail.clientId || undefined,
      folder: 'sent',
      isStarred: false,
      isArchived: false,
      isDeleted: false
    };

    onSendEmail(email);
    setIsComposing(false);
    setNewEmail({
      to: '',
      cc: '',
      bcc: '',
      subject: '',
      content: '',
      template: '',
      clientId: ''
    });
    toast.success("Wiadomość została wysłana");
  };

  const handleAddAccount = () => {
    if (!newAccount.email || !newAccount.username) {
      toast.error("Wprowadź adres email i nazwę użytkownika");
      return;
    }

    const account: EmailAccount = {
      id: Date.now().toString(),
      email: newAccount.email!,
      provider: newAccount.provider!,
      imapHost: newAccount.imapHost!,
      imapPort: newAccount.imapPort!,
      smtpHost: newAccount.smtpHost!,
      smtpPort: newAccount.smtpPort!,
      username: newAccount.username!,
      password: newAccount.password!, // W rzeczywistości byłoby szyfrowane
      isActive: true,
      lastSync: new Date().toISOString()
    };

    setEmailAccounts(prev => [...prev, account]);
    setIsAccountSettingsOpen(false);
    setNewAccount({
      email: '',
      provider: 'custom',
      imapHost: '',
      imapPort: 993,
      smtpHost: '',
      smtpPort: 587,
      username: '',
      password: '',
      isActive: true
    });
    toast.success("Konto email zostało dodane");
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setNewEmail(prev => ({
        ...prev,
        subject: template.subject,
        content: template.content,
        template: templateId
      }));
      toast.success(`Szablon "${template.name}" został zastosowany`);
    }
  };

  // Email action handlers
  const handleReply = () => {
    if (!selectedEmail) return;
    const client = clients.find(c => c.id === selectedEmail.clientId);
    setNewEmail({
      to: selectedEmail.from,
      cc: '',
      bcc: '',
      subject: `Re: ${selectedEmail.subject}`,
      content: `\n\n--- Odpowiedź na wiadomość z ${new Date(selectedEmail.timestamp).toLocaleString('pl-PL')} ---\n${selectedEmail.content}`,
      template: '',
      clientId: selectedEmail.clientId || ''
    });
    setIsComposing(true);
    toast.success("Przygotowano odpowiedź");
  };

  const handleReplyAll = () => {
    if (!selectedEmail) return;
    const allRecipients = [selectedEmail.from, ...selectedEmail.to, ...(selectedEmail.cc || [])];
    const uniqueRecipients = [...new Set(allRecipients)].filter(email => email !== 'biuro@firma.pl');
    
    setNewEmail({
      to: uniqueRecipients.join(', '),
      cc: '',
      bcc: '',
      subject: `Re: ${selectedEmail.subject}`,
      content: `\n\n--- Odpowiedź na wiadomość z ${new Date(selectedEmail.timestamp).toLocaleString('pl-PL')} ---\n${selectedEmail.content}`,
      template: '',
      clientId: selectedEmail.clientId || ''
    });
    setIsComposing(true);
    toast.success("Przygotowano odpowiedź do wszystkich");
  };

  const handleForward = () => {
    if (!selectedEmail) return;
    setNewEmail({
      to: '',
      cc: '',
      bcc: '',
      subject: `Fwd: ${selectedEmail.subject}`,
      content: `\n\n--- Przekazana wiadomość ---\nOd: ${selectedEmail.from}\nDo: ${selectedEmail.to.join(', ')}\nData: ${new Date(selectedEmail.timestamp).toLocaleString('pl-PL')}\nTemat: ${selectedEmail.subject}\n\n${selectedEmail.content}`,
      template: '',
      clientId: selectedEmail.clientId || ''
    });
    setIsComposing(true);
    toast.success("Przygotowano przekazanie wiadomości");
  };

  const handleToggleStar = (emailId: string) => {
    const email = emails.find(e => e.id === emailId);
    if (email) {
      onUpdateEmail(emailId, { isStarred: !email.isStarred });
      toast.success(email.isStarred ? "Usunięto oznaczenie" : "Dodano do oznaczonych");
    }
  };

  const handleArchive = (emailId: string) => {
    onUpdateEmail(emailId, { isArchived: true, folder: 'archive' });
    toast.success("Wiadomość została zarchiwizowana");
    if (selectedEmail?.id === emailId) {
      setSelectedEmail(null);
    }
  };

  const handleDelete = (emailId: string) => {
    onDeleteEmail(emailId);
    toast.success("Wiadomość została przeniesiona do kosza");
    if (selectedEmail?.id === emailId) {
      setSelectedEmail(null);
    }
  };

  const handleMarkAsRead = (emailId: string, isRead: boolean) => {
    onUpdateEmail(emailId, { isRead });
    toast.success(isRead ? "Oznaczono jako przeczytane" : "Oznaczono jako nieprzeczytane");
  };

  const handleDownloadAttachment = (attachment: EmailAttachment) => {
    toast.success(`Pobieranie załącznika: ${attachment.name}`);
    // In a real app, this would trigger actual download
  };

  const formatEmailTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffHours < 24) {
      return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('pl-PL');
    }
  };

  const getClientName = (clientId?: string) => {
    if (!clientId) return null;
    const client = clients.find(c => c.id === clientId);
    return client ? (client.company || `${client.firstName} ${client.lastName}`) : null;
  };

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtrowanie po folderach
    if (selectedFolder === 'inbox') {
      return matchesSearch && email.folder === 'inbox' && !email.isDeleted;
    } else if (selectedFolder === 'sent') {
      return matchesSearch && email.folder === 'sent' && !email.isDeleted;
    } else if (selectedFolder === 'drafts') {
      return matchesSearch && email.folder === 'drafts' && !email.isDeleted;
    } else if (selectedFolder === 'starred') {
      return matchesSearch && email.isStarred && !email.isDeleted;
    } else if (selectedFolder === 'archive') {
      return matchesSearch && email.isArchived && !email.isDeleted;
    } else if (selectedFolder === 'trash') {
      return matchesSearch && email.isDeleted;
    } else if (selectedFolder.startsWith('client_')) {
      // Filter by client
      const clientId = selectedFolder.replace('client_', '');
      return matchesSearch && email.clientId === clientId && !email.isDeleted;
    }
    
    return matchesSearch;
  });

  const getProviderSettings = (provider: string) => {
    const presets = {
      gmail: {
        imapHost: 'imap.gmail.com',
        imapPort: 993,
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587
      },
      outlook: {
        imapHost: 'outlook.office365.com',
        imapPort: 993,
        smtpHost: 'smtp-mail.outlook.com',
        smtpPort: 587
      },
      yahoo: {
        imapHost: 'imap.mail.yahoo.com',
        imapPort: 993,
        smtpHost: 'smtp.mail.yahoo.com',
        smtpPort: 587
      }
    };

    return presets[provider as keyof typeof presets];
  };

  const applyProviderSettings = (provider: string) => {
    const settings = getProviderSettings(provider);
    if (settings) {
      setNewAccount(prev => ({
        ...prev,
        provider: provider as EmailAccount['provider'],
        ...settings
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Centrum Email</h1>
          <p className="text-muted-foreground">
            Zarządzanie pocztą elektroniczną z integracją IMAP/SMTP
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsAccountSettingsOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Konta email
          </Button>
          <Button onClick={() => setIsComposing(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nowa wiadomość
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
        {/* Sidebar - Folders */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Foldery</CardTitle>
              <Button variant="ghost" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="space-y-1 p-4">
                {/* Główne foldery */}
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-accent ${
                      selectedFolder === folder.id ? 'bg-accent' : ''
                    }`}
                    onClick={() => setSelectedFolder(folder.id)}
                  >
                    <div className="flex items-center gap-2">
                      {folder.icon}
                      <span className="text-sm">{folder.name}</span>
                    </div>
                    {folder.count > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {folder.count}
                      </Badge>
                    )}
                  </div>
                ))}

                <Separator className="my-4" />

                {/* Foldery klientów */}
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground px-2">Klienci</h4>
                  {clientFolders.map((folder) => (
                    <div
                      key={folder.id}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-accent ${
                        selectedFolder === folder.id ? 'bg-accent' : ''
                      }`}
                      onClick={() => setSelectedFolder(folder.id)}
                    >
                      <div className="flex items-center gap-2">
                        {folder.icon}
                        <span className="text-sm truncate">{folder.name}</span>
                      </div>
                      {folder.count > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {folder.count}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Email List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {folders.find(f => f.id === selectedFolder)?.name || 'Emails'}
                </CardTitle>
                <Button variant="ghost" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Szukaj emaili..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[450px]">
              <div className="space-y-1 p-4">
                {filteredEmails.map((email) => (
                  <div
                    key={email.id}
                    className={`p-3 rounded-lg cursor-pointer border hover:bg-accent ${
                      selectedEmail?.id === email.id ? 'bg-accent' : ''
                    } ${!email.isRead ? 'border-l-4 border-l-primary' : ''}`}
                    onClick={() => setSelectedEmail(email)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm truncate ${!email.isRead ? 'font-semibold' : ''}`}>
                          {selectedFolder === 'sent' ? email.to[0] : email.from}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatEmailTime(email.timestamp)}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <p className={`text-sm truncate ${!email.isRead ? 'font-medium' : ''}`}>
                          {email.subject}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {email.content.substring(0, 100)}...
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {email.attachments && email.attachments.length > 0 && (
                          <Paperclip className="h-3 w-3 text-muted-foreground" />
                        )}
                        {getClientName(email.clientId) && (
                          <Badge variant="outline" className="text-xs">
                            {getClientName(email.clientId)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Email Content */}
        <Card className="lg:col-span-2">
          {selectedEmail ? (
            <>
              <CardHeader>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="font-medium">{selectedEmail.subject}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {selectedEmail.from.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{selectedEmail.from}</span>
                        <span>•</span>
                        <span>{formatEmailTime(selectedEmail.timestamp)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={handleReply}
                        title="Odpowiedz"
                      >
                        <Reply className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={handleReplyAll}
                        title="Odpowiedz wszystkim"
                      >
                        <ReplyAll className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={handleForward}
                        title="Przekaż"
                      >
                        <Forward className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleToggleStar(selectedEmail.id)}
                        title={selectedEmail.isStarred ? "Usuń oznaczenie" : "Oznacz"}
                      >
                        <Star className={`h-4 w-4 ${selectedEmail.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleArchive(selectedEmail.id)}
                        title="Archiwizuj"
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(selectedEmail.id)}
                        title="Usuń"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleMarkAsRead(selectedEmail.id, !selectedEmail.isRead)}
                        title={selectedEmail.isRead ? "Oznacz jako nieprzeczytane" : "Oznacz jako przeczytane"}
                      >
                        {selectedEmail.isRead ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <p>Do: {selectedEmail.to.join(', ')}</p>
                    {selectedEmail.cc && selectedEmail.cc.length > 0 && (
                      <p>DW: {selectedEmail.cc.join(', ')}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap">{selectedEmail.content}</div>
                  </div>
                  
                  {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Załączniki:</h4>
                      {selectedEmail.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4" />
                            <div>
                              <p className="text-sm font-medium">{attachment.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(attachment.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Wybierz wiadomość</h3>
                <p>Kliknij na wiadomość z listy, aby ją wyświetlić</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Dialog nowej wiadomości */}
      <Dialog open={isComposing} onOpenChange={setIsComposing}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Nowa wiadomość</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Szablon email (opcjonalnie)</Label>
                <Select
                  value={newEmail.template}
                  onValueChange={handleTemplateSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz szablon..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Klient (opcjonalnie)</Label>
                <Select
                  value={newEmail.clientId}
                  onValueChange={(value) => setNewEmail(prev => ({ ...prev, clientId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz klienta..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.firstName} {client.lastName} - {client.company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Do *</Label>
              <Input
                value={newEmail.to}
                onChange={(e) => setNewEmail(prev => ({ ...prev, to: e.target.value }))}
                placeholder="adresat@example.com (oddziel przecinkami dla wielu adresatów)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>DW</Label>
                <Input
                  value={newEmail.cc}
                  onChange={(e) => setNewEmail(prev => ({ ...prev, cc: e.target.value }))}
                  placeholder="cc@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label>UDW</Label>
                <Input
                  value={newEmail.bcc}
                  onChange={(e) => setNewEmail(prev => ({ ...prev, bcc: e.target.value }))}
                  placeholder="bcc@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Temat *</Label>
              <Input
                value={newEmail.subject}
                onChange={(e) => setNewEmail(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Temat wiadomości"
              />
            </div>

            <div className="space-y-2">
              <Label>Treść</Label>
              <Textarea
                value={newEmail.content}
                onChange={(e) => setNewEmail(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Treść wiadomości..."
                rows={10}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsComposing(false)}>
                Anuluj
              </Button>
              <Button onClick={handleSendEmail}>
                <Send className="mr-2 h-4 w-4" />
                Wyślij
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog ustawień kont email */}
      <Dialog open={isAccountSettingsOpen} onOpenChange={setIsAccountSettingsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Konta email</DialogTitle>
            <DialogDescription>
              Zarządzaj kontami email i ustawieniami IMAP/SMTP
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="accounts">
            <TabsList>
              <TabsTrigger value="accounts">Konta</TabsTrigger>
              <TabsTrigger value="add">Dodaj konto</TabsTrigger>
            </TabsList>
            
            <TabsContent value="accounts" className="space-y-4">
              {emailAccounts.map((account) => (
                <div key={account.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">{account.email}</h4>
                      <p className="text-sm text-muted-foreground">
                        {account.provider} • Ostatnia synchronizacja: {
                          account.lastSync ? new Date(account.lastSync).toLocaleString('pl-PL') : 'Nigdy'
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={account.isActive} />
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="add" className="space-y-4">
              <div className="space-y-2">
                <Label>Dostawca email</Label>
                <Select
                  value={newAccount.provider}
                  onValueChange={(value) => {
                    setNewAccount(prev => ({ ...prev, provider: value as EmailAccount['provider'] }));
                    applyProviderSettings(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gmail">Gmail</SelectItem>
                    <SelectItem value="outlook">Outlook</SelectItem>
                    <SelectItem value="yahoo">Yahoo</SelectItem>
                    <SelectItem value="custom">Niestandardowy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Adres email *</Label>
                  <Input
                    value={newAccount.email || ''}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="twoj@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nazwa użytkownika *</Label>
                  <Input
                    value={newAccount.username || ''}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Zwykle taki sam jak email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Hasło *</Label>
                <Input
                  type="password"
                  value={newAccount.password || ''}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Hasło do konta email"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Serwer IMAP</Label>
                  <Input
                    value={newAccount.imapHost || ''}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, imapHost: e.target.value }))}
                    placeholder="imap.example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Port IMAP</Label>
                  <Input
                    type="number"
                    value={newAccount.imapPort || 993}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, imapPort: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Serwer SMTP</Label>
                  <Input
                    value={newAccount.smtpHost || ''}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, smtpHost: e.target.value }))}
                    placeholder="smtp.example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Port SMTP</Label>
                  <Input
                    type="number"
                    value={newAccount.smtpPort || 587}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAccountSettingsOpen(false)}>
                  Anuluj
                </Button>
                <Button onClick={handleAddAccount}>
                  Dodaj konto
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}