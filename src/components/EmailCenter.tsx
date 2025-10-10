import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { Mail, Send, Inbox, Sent, Archive, Trash2, Paperclip, Search, Filter } from "lucide-react";
import { Email } from "../types/client";
import { mockEmails } from "../data/mockData";
import { toast } from 'sonner';

export function EmailCenter() {
  const [emails, setEmails] = useState<Email[]>(mockEmails);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [composeData, setComposeData] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    content: ''
  });

  const unreadCount = emails.filter(email => !email.isRead).length;
  const sentEmails = emails.filter(email => email.from === 'ja@nasza-firma.pl');
  const inboxEmails = emails.filter(email => email.from !== 'ja@nasza-firma.pl');

  const filteredEmails = inboxEmails.filter(email => 
    email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email);
    setIsComposing(false);
    
    if (!email.isRead) {
      setEmails(prev => 
        prev.map(e => e.id === email.id ? { ...e, isRead: true } : e)
      );
    }
  };

  const handleCompose = () => {
    setSelectedEmail(null);
    setIsComposing(true);
    setComposeData({
      to: '',
      cc: '',
      bcc: '',
      subject: '',
      content: ''
    });
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!composeData.to || !composeData.subject || !composeData.content) {
      toast.error("Wypełnij wymagane pola");
      return;
    }

    const newEmail: Email = {
      id: Date.now().toString(),
      from: 'ja@nasza-firma.pl',
      to: composeData.to.split(',').map(email => email.trim()),
      cc: composeData.cc ? composeData.cc.split(',').map(email => email.trim()) : undefined,
      bcc: composeData.bcc ? composeData.bcc.split(',').map(email => email.trim()) : undefined,
      subject: composeData.subject,
      content: composeData.content,
      timestamp: new Date().toISOString(),
      isRead: true
    };

    setEmails(prev => [...prev, newEmail]);
    setIsComposing(false);
    toast.success("Email wysłany pomyślnie");
  };

  const handleReply = () => {
    if (selectedEmail) {
      setComposeData({
        to: selectedEmail.from,
        cc: '',
        bcc: '',
        subject: `Re: ${selectedEmail.subject}`,
        content: `\n\n--- Oryginalna wiadomość ---\nOd: ${selectedEmail.from}\nData: ${new Date(selectedEmail.timestamp).toLocaleString('pl-PL')}\nTemat: ${selectedEmail.subject}\n\n${selectedEmail.content}`
      });
      setIsComposing(true);
      setSelectedEmail(null);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pl-PL');
  };

  const renderEmailList = (emailList: Email[]) => (
    <div className="space-y-2">
      {emailList.map((email) => (
        <div
          key={email.id}
          className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${
            !email.isRead ? 'bg-blue-50 border-blue-200' : ''
          } ${selectedEmail?.id === email.id ? 'ring-2 ring-primary' : ''}`}
          onClick={() => handleEmailClick(email)}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className={`text-sm ${!email.isRead ? 'font-semibold' : ''}`}>
                {email.from}
              </span>
              {!email.isRead && <Badge variant="secondary" className="text-xs">Nowy</Badge>}
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDate(email.timestamp)}
            </span>
          </div>
          <div className="mb-1">
            <span className={`text-sm ${!email.isRead ? 'font-semibold' : ''}`}>
              {email.subject}
            </span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {email.content}
          </p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Centrum Emailowe</h1>
          <p className="text-muted-foreground">
            Zarządzaj swoją pocztą elektroniczną
          </p>
        </div>
        <Button onClick={handleCompose}>
          <Mail className="mr-2 h-4 w-4" />
          Nowy Email
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Inbox className="h-4 w-4" />
              Skrzynka odbiorcza
              {unreadCount > 0 && (
                <Badge variant="secondary">{unreadCount}</Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              <div className="relative flex-1">
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
          <CardContent>
            <ScrollArea className="h-96">
              {renderEmailList(filteredEmails)}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Email Content or Compose */}
        <Card className="lg:col-span-2">
          {isComposing ? (
            <>
              <CardHeader>
                <CardTitle>Nowy Email</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendEmail} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="to">Do *</Label>
                    <Input
                      id="to"
                      value={composeData.to}
                      onChange={(e) => setComposeData(prev => ({ ...prev, to: e.target.value }))}
                      placeholder="odbiorca@email.com"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cc">DW</Label>
                      <Input
                        id="cc"
                        value={composeData.cc}
                        onChange={(e) => setComposeData(prev => ({ ...prev, cc: e.target.value }))}
                        placeholder="dw@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bcc">UDW</Label>
                      <Input
                        id="bcc"
                        value={composeData.bcc}
                        onChange={(e) => setComposeData(prev => ({ ...prev, bcc: e.target.value }))}
                        placeholder="udw@email.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Temat *</Label>
                    <Input
                      id="subject"
                      value={composeData.subject}
                      onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Temat wiadomości"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Treść *</Label>
                    <Textarea
                      id="content"
                      value={composeData.content}
                      onChange={(e) => setComposeData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Treść wiadomości..."
                      rows={12}
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">
                      <Send className="mr-2 h-4 w-4" />
                      Wyślij
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsComposing(false)}>
                      Anuluj
                    </Button>
                    <Button type="button" variant="outline">
                      <Paperclip className="mr-2 h-4 w-4" />
                      Załącz plik
                    </Button>
                  </div>
                </form>
              </CardContent>
            </>
          ) : selectedEmail ? (
            <>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedEmail.subject}</CardTitle>
                    <CardDescription>
                      Od: {selectedEmail.from} • {formatDate(selectedEmail.timestamp)}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleReply}>
                      Odpowiedz
                    </Button>
                    <Button variant="outline" size="sm">
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm">
                    <strong>Do:</strong> {selectedEmail.to.join(', ')}
                    {selectedEmail.cc && (
                      <div><strong>DW:</strong> {selectedEmail.cc.join(', ')}</div>
                    )}
                  </div>
                  <Separator />
                  <div className="whitespace-pre-wrap">
                    {selectedEmail.content}
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-96">
              <div className="text-center text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4" />
                <p>Wybierz email do wyświetlenia lub napisz nowy</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}