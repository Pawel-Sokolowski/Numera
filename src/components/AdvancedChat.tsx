import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";
import { 
  MessageSquare, 
  Hash, 
  Lock, 
  Users, 
  Plus, 
  Send, 
  Settings, 
  Search,
  Phone,
  Video,
  MoreVertical,
  UserPlus,
  Archive,
  Star,
  Reply
} from "lucide-react";
import { ChatChannel, ChatMessage, PrivateMessage, User as UserType } from "../types/client";
import { toast } from 'sonner';

interface AdvancedChatProps {
  currentUser: UserType;
  allUsers: UserType[];
}

export function AdvancedChat({ currentUser, allUsers }: AdvancedChatProps) {
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<ChatChannel | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [channelMessages, setChannelMessages] = useState<{ [key: string]: ChatMessage[] }>({});
  const [privateMessages, setPrivateMessages] = useState<{ [key: string]: PrivateMessage[] }>({});
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewChannelDialogOpen, setIsNewChannelDialogOpen] = useState(false);
  const [newChannel, setNewChannel] = useState<Partial<ChatChannel>>({
    name: '',
    description: '',
    type: 'public',
    members: [currentUser.id],
    admins: [currentUser.id]
  });
  const [activeTab, setActiveTab] = useState('channels');

  // Mock data initialization
  useEffect(() => {
    const mockChannels: ChatChannel[] = [
      {
        id: '1',
        name: 'ogólny',
        description: 'Główny kanał dla całego zespołu',
        type: 'public',
        members: allUsers.map(u => u.id),
        admins: [currentUser.id],
        isArchived: false,
        createdBy: currentUser.id,
        createdAt: '2024-01-01',
        lastActivity: new Date().toISOString()
      },
      {
        id: '2',
        name: 'księgowość',
        description: 'Kanał dla zespołu księgowego',
        type: 'private',
        members: allUsers.filter(u => u.role === 'ksiegowosc' || u.role === 'admin').map(u => u.id),
        admins: [currentUser.id],
        isArchived: false,
        createdBy: currentUser.id,
        createdAt: '2024-01-01',
        lastActivity: new Date().toISOString()
      },
      {
        id: '3',
        name: 'kadry',
        description: 'Kanał dla spraw personalnych',
        type: 'private',
        members: allUsers.filter(u => u.role === 'kadry' || u.role === 'admin').map(u => u.id),
        admins: [currentUser.id],
        isArchived: false,
        createdBy: currentUser.id,
        createdAt: '2024-01-01',
        lastActivity: new Date().toISOString()
      }
    ];

    const mockChannelMessages: { [key: string]: ChatMessage[] } = {
      '1': [
        {
          id: '1',
          senderId: allUsers[0]?.id || currentUser.id,
          senderName: `${allUsers[0]?.firstName || currentUser.firstName} ${allUsers[0]?.lastName || currentUser.lastName}`,
          content: 'Witajcie! Jak minął poniedziałek?',
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          type: 'text',
          channelId: '1'
        },
        {
          id: '2',
          senderId: currentUser.id,
          senderName: `${currentUser.firstName} ${currentUser.lastName}`,
          content: 'Świetnie! Udało się zamknąć projekt z Tech Solutions.',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          type: 'text',
          channelId: '1'
        }
      ],
      '2': [
        {
          id: '3',
          senderId: currentUser.id,
          senderName: `${currentUser.firstName} ${currentUser.lastName}`,
          content: 'Przypominam o terminie składania deklaracji VAT - 25 stycznia.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          type: 'text',
          channelId: '2'
        }
      ]
    };

    const mockPrivateMessages: { [key: string]: PrivateMessage[] } = {};
    allUsers.forEach(user => {
      if (user.id !== currentUser.id) {
        mockPrivateMessages[user.id] = [
          {
            id: `pm_${user.id}_1`,
            senderId: user.id,
            receiverId: currentUser.id,
            content: `Cześć ${currentUser.firstName}! Masz chwilę na rozmowę?`,
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            isRead: false,
            type: 'text'
          }
        ];
      }
    });

    setChannels(mockChannels);
    setChannelMessages(mockChannelMessages);
    setPrivateMessages(mockPrivateMessages);
    setSelectedChannel(mockChannels[0]);
  }, [currentUser, allUsers]);

  const sendChannelMessage = () => {
    if (!messageInput.trim() || !selectedChannel) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      senderName: `${currentUser.firstName} ${currentUser.lastName}`,
      content: messageInput,
      timestamp: new Date().toISOString(),
      type: 'text',
      channelId: selectedChannel.id
    };

    setChannelMessages(prev => ({
      ...prev,
      [selectedChannel.id]: [...(prev[selectedChannel.id] || []), newMessage]
    }));

    setMessageInput('');
    toast.success("Wiadomość została wysłana");
  };

  const sendPrivateMessage = () => {
    if (!messageInput.trim() || !selectedUser) return;

    const newMessage: PrivateMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      receiverId: selectedUser.id,
      content: messageInput,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'text'
    };

    setPrivateMessages(prev => ({
      ...prev,
      [selectedUser.id]: [...(prev[selectedUser.id] || []), newMessage]
    }));

    setMessageInput('');
    toast.success("Prywatna wiadomość została wysłana");
  };

  const createChannel = () => {
    if (!newChannel.name) {
      toast.error("Wprowadź nazwę kanału");
      return;
    }

    const channel: ChatChannel = {
      id: Date.now().toString(),
      name: newChannel.name!,
      description: newChannel.description || '',
      type: newChannel.type!,
      members: newChannel.members!,
      admins: newChannel.admins!,
      isArchived: false,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };

    setChannels(prev => [...prev, channel]);
    setIsNewChannelDialogOpen(false);
    setNewChannel({
      name: '',
      description: '',
      type: 'public',
      members: [currentUser.id],
      admins: [currentUser.id]
    });
    toast.success("Kanał został utworzony");
  };

  const getUserInitials = (user: UserType) => {
    return `${user.firstName[0]}${user.lastName[0]}`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'teraz';
    if (diffMins < 60) return `${diffMins} min temu`;
    if (diffHours < 24) return `${diffHours} godz temu`;
    if (diffDays < 7) return `${diffDays} dni temu`;
    return date.toLocaleDateString('pl-PL');
  };

  const getUnreadCount = (userId: string) => {
    const userMessages = privateMessages[userId] || [];
    return userMessages.filter(msg => msg.senderId === userId && !msg.isRead).length;
  };

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    channel.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = allUsers.filter(user =>
    user.id !== currentUser.id &&
    (`${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Chat Zespołowy</h1>
          <p className="text-muted-foreground">
            Komunikuj się z zespołem poprzez kanały i prywatne wiadomości
          </p>
        </div>
        <Dialog open={isNewChannelDialogOpen} onOpenChange={setIsNewChannelDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nowy kanał
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Utwórz nowy kanał</DialogTitle>
              <DialogDescription>
                Kanały służą do organizacji rozmów według tematów
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="channelName">Nazwa kanału *</Label>
                <Input
                  id="channelName"
                  value={newChannel.name || ''}
                  onChange={(e) => setNewChannel(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="np. marketing, programiści"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="channelDescription">Opis kanału</Label>
                <Textarea
                  id="channelDescription"
                  value={newChannel.description || ''}
                  onChange={(e) => setNewChannel(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Opcjonalny opis kanału"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Rodzaj kanału</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="public"
                      checked={newChannel.type === 'public'}
                      onChange={() => setNewChannel(prev => ({ ...prev, type: 'public' }))}
                    />
                    <Label htmlFor="public" className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Publiczny - wszyscy mogą dołączyć
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="private"
                      checked={newChannel.type === 'private'}
                      onChange={() => setNewChannel(prev => ({ ...prev, type: 'private' }))}
                    />
                    <Label htmlFor="private" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Prywatny - tylko zaproszeni użytkownicy
                    </Label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsNewChannelDialogOpen(false)}>
                  Anuluj
                </Button>
                <Button onClick={createChannel}>
                  Utwórz kanał
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
        {/* Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Komunikacja</CardTitle>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Szukaj..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
                <TabsTrigger value="channels">Kanały</TabsTrigger>
                <TabsTrigger value="direct">Wiadomości</TabsTrigger>
              </TabsList>

              <TabsContent value="channels" className="mt-0">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-1 p-4">
                    {filteredChannels.map(channel => (
                      <div
                        key={channel.id}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-accent ${
                          selectedChannel?.id === channel.id ? 'bg-accent' : ''
                        }`}
                        onClick={() => {
                          setSelectedChannel(channel);
                          setSelectedUser(null);
                        }}
                      >
                        {channel.type === 'public' ? (
                          <Hash className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{channel.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {channel.members.length} członków
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="direct" className="mt-0">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-1 p-4">
                    {filteredUsers.map(user => {
                      const unreadCount = getUnreadCount(user.id);
                      return (
                        <div
                          key={user.id}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-accent ${
                            selectedUser?.id === user.id ? 'bg-accent' : ''
                          }`}
                          onClick={() => {
                            setSelectedUser(user);
                            setSelectedChannel(null);
                            // Mark messages as read
                            setPrivateMessages(prev => ({
                              ...prev,
                              [user.id]: (prev[user.id] || []).map(msg => ({ ...msg, isRead: true }))
                            }));
                          }}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium truncate">
                                {user.firstName} {user.lastName}
                              </p>
                              {unreadCount > 0 && (
                                <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                                  {unreadCount}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{user.role}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Main Chat Area */}
        <Card className="lg:col-span-3">
          {selectedChannel || selectedUser ? (
            <>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedChannel ? (
                      <>
                        {selectedChannel.type === 'public' ? (
                          <Hash className="h-5 w-5" />
                        ) : (
                          <Lock className="h-5 w-5" />
                        )}
                        <div>
                          <h3 className="font-medium">{selectedChannel.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {selectedChannel.description}
                          </p>
                        </div>
                      </>
                    ) : selectedUser ? (
                      <>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{getUserInitials(selectedUser)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">
                            {selectedUser.firstName} {selectedUser.lastName}
                          </h3>
                          <p className="text-sm text-muted-foreground">{selectedUser.role}</p>
                        </div>
                      </>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedUser && (
                      <>
                        <Button variant="ghost" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Video className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col h-[450px]">
                <ScrollArea className="flex-1 mb-4">
                  <div className="space-y-4">
                    {selectedChannel
                      ? (channelMessages[selectedChannel.id] || []).map(message => (
                          <div key={message.id} className="flex items-start gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {message.senderName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{message.senderName}</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatTimestamp(message.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm">{message.content}</p>
                            </div>
                          </div>
                        ))
                      : selectedUser
                      ? (privateMessages[selectedUser.id] || []).map(message => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.senderId === currentUser.id ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.senderId === currentUser.id
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs opacity-75 mt-1">
                                {formatTimestamp(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))
                      : null}
                  </div>
                </ScrollArea>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder={
                      selectedChannel
                        ? `Napisz wiadomość na #${selectedChannel.name}`
                        : selectedUser
                        ? `Napisz do ${selectedUser.firstName}...`
                        : 'Napisz wiadomość...'
                    }
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        selectedChannel ? sendChannelMessage() : sendPrivateMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={selectedChannel ? sendChannelMessage : sendPrivateMessage}
                    disabled={!messageInput.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Wybierz kanał lub rozmowę</h3>
                <p>Wybierz kanał z lewej strony, aby rozpocząć rozmowę</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}