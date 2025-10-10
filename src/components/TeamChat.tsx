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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  MessageSquare, 
  Hash, 
  Lock, 
  Plus, 
  Send, 
  Settings, 
  Search,
  Phone,
  Video,
  MoreVertical,
  UserPlus,
  PenSquare,
  Clock,
  CheckCheck,
  Eye,
  Users
} from "lucide-react";
import { ChatChannel, ChatMessage, PrivateMessage, User as UserType, Conversation } from "../types/client";
import { toast } from 'sonner';

interface TeamChatProps {
  currentUser: UserType;
  allUsers: UserType[];
}

export function TeamChat({ currentUser, allUsers }: TeamChatProps) {
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<ChatChannel | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [channelMessages, setChannelMessages] = useState<{ [key: string]: ChatMessage[] }>({});
  const [privateMessages, setPrivateMessages] = useState<{ [key: string]: PrivateMessage[] }>({});
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewChannelDialogOpen, setIsNewChannelDialogOpen] = useState(false);
  const [isNewMessageDialogOpen, setIsNewMessageDialogOpen] = useState(false);
  const [newChannel, setNewChannel] = useState<Partial<ChatChannel>>({
    name: '',
    description: '',
    type: 'public',
    members: [currentUser.id],
    admins: [currentUser.id]
  });
  const [selectedRecipient, setSelectedRecipient] = useState<string>('');
  const [newMessageContent, setNewMessageContent] = useState('');
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
        lastActivity: new Date().toISOString(),
        unreadCount: 0
      },
      {
        id: '2',
        name: 'księgowość',
        description: 'Kanał dla zespołu księgowego',
        type: 'private',
        members: allUsers.filter(u => u.role === 'ksiegowa' || u.role === 'administrator').map(u => u.id),
        admins: [currentUser.id],
        isArchived: false,
        createdBy: currentUser.id,
        createdAt: '2024-01-01',
        lastActivity: new Date().toISOString(),
        unreadCount: 2
      },
      {
        id: '3',
        name: 'kadry',
        description: 'Kanał dla spraw personalnych',
        type: 'private',
        members: allUsers.filter(u => u.role === 'kadrowa' || u.role === 'administrator').map(u => u.id),
        admins: [currentUser.id],
        isArchived: false,
        createdBy: currentUser.id,
        createdAt: '2024-01-01',
        lastActivity: new Date().toISOString(),
        unreadCount: 0
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

    // Create conversations with other users
    const mockConversations: Conversation[] = [];
    const mockPrivateMessages: { [key: string]: PrivateMessage[] } = {};
    
    allUsers.forEach(user => {
      if (user.id !== currentUser.id) {
        const conversationId = `conv_${currentUser.id}_${user.id}`;
        const messages: PrivateMessage[] = [
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
        
        mockConversations.push({
          id: conversationId,
          participants: [currentUser.id, user.id],
          lastMessage: messages[messages.length - 1],
          lastActivity: messages[messages.length - 1].timestamp,
          unreadCount: messages.filter(msg => msg.senderId === user.id && !msg.isRead).length,
          isArchived: false
        });
        
        mockPrivateMessages[conversationId] = messages;
      }
    });

    setChannels(mockChannels);
    setChannelMessages(mockChannelMessages);
    setConversations(mockConversations);
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

    // Update channel last activity
    setChannels(prev => prev.map(channel => 
      channel.id === selectedChannel.id 
        ? { ...channel, lastActivity: new Date().toISOString() }
        : channel
    ));

    setMessageInput('');
    toast.success("Wiadomość została wysłana");
  };

  const sendPrivateMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const receiverId = selectedConversation.participants.find(id => id !== currentUser.id);
    if (!receiverId) return;

    const newMessage: PrivateMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      receiverId: receiverId,
      content: messageInput,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'text'
    };

    setPrivateMessages(prev => ({
      ...prev,
      [selectedConversation.id]: [...(prev[selectedConversation.id] || []), newMessage]
    }));

    // Update conversation
    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation.id 
        ? { 
            ...conv, 
            lastMessage: newMessage, 
            lastActivity: new Date().toISOString() 
          }
        : conv
    ));

    setMessageInput('');
    toast.success("Prywatna wiadomość została wysłana");
  };

  const startNewConversation = () => {
    if (!selectedRecipient || !newMessageContent.trim()) {
      toast.error("Wybierz odbiorcę i wpisz wiadomość");
      return;
    }

    const recipient = allUsers.find(u => u.id === selectedRecipient);
    if (!recipient) return;

    // Check if conversation already exists
    const existingConv = conversations.find(conv => 
      conv.participants.includes(selectedRecipient) && conv.participants.includes(currentUser.id)
    );

    if (existingConv) {
      // Use existing conversation
      const newMessage: PrivateMessage = {
        id: Date.now().toString(),
        senderId: currentUser.id,
        receiverId: selectedRecipient,
        content: newMessageContent,
        timestamp: new Date().toISOString(),
        isRead: false,
        type: 'text'
      };

      setPrivateMessages(prev => ({
        ...prev,
        [existingConv.id]: [...(prev[existingConv.id] || []), newMessage]
      }));

      setConversations(prev => prev.map(conv => 
        conv.id === existingConv.id 
          ? { 
              ...conv, 
              lastMessage: newMessage, 
              lastActivity: new Date().toISOString() 
            }
          : conv
      ));

      setSelectedConversation(existingConv);
    } else {
      // Create new conversation
      const conversationId = `conv_${currentUser.id}_${selectedRecipient}`;
      const newMessage: PrivateMessage = {
        id: Date.now().toString(),
        senderId: currentUser.id,
        receiverId: selectedRecipient,
        content: newMessageContent,
        timestamp: new Date().toISOString(),
        isRead: false,
        type: 'text'
      };

      const newConversation: Conversation = {
        id: conversationId,
        participants: [currentUser.id, selectedRecipient],
        lastMessage: newMessage,
        lastActivity: new Date().toISOString(),
        unreadCount: 0,
        isArchived: false
      };

      setConversations(prev => [...prev, newConversation]);
      setPrivateMessages(prev => ({
        ...prev,
        [conversationId]: [newMessage]
      }));

      setSelectedConversation(newConversation);
    }

    setActiveTab('direct');
    setSelectedChannel(null);
    setIsNewMessageDialogOpen(false);
    setSelectedRecipient('');
    setNewMessageContent('');
    toast.success("Nowa rozmowa została rozpoczęta");
  };

  const getUserFromConversation = (conversation: Conversation) => {
    const otherUserId = conversation.participants.find(id => id !== currentUser.id);
    return allUsers.find(u => u.id === otherUserId);
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

  const createChannel = () => {
    if (!newChannel.name?.trim()) {
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
      lastActivity: new Date().toISOString(),
      unreadCount: 0
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

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    channel.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredConversations = conversations.filter(conversation => {
    const otherUser = getUserFromConversation(conversation);
    if (!otherUser) return false;
    return (`${otherUser.firstName} ${otherUser.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      otherUser.email.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const availableUsers = allUsers.filter(user => user.id !== currentUser.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Chat Zespołowy</h1>
          <p className="text-muted-foreground">
            Komunikuj się z zespołem poprzez kanały i prywatne wiadomości
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isNewMessageDialogOpen} onOpenChange={setIsNewMessageDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <PenSquare className="mr-2 h-4 w-4" />
                Nowa wiadomość
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nowa wiadomość</DialogTitle>
                <DialogDescription>
                  Rozpocznij nową rozmowę z członkiem zespołu
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Odbiorca *</Label>
                  <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz pracownika..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {getUserInitials(user)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span>{user.firstName} {user.lastName}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                {user.role}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Wiadomość *</Label>
                  <Textarea
                    value={newMessageContent}
                    onChange={(e) => setNewMessageContent(e.target.value)}
                    placeholder="Napisz swoją wiadomość..."
                    rows={4}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsNewMessageDialogOpen(false);
                      setSelectedRecipient('');
                      setNewMessageContent('');
                    }}
                  >
                    Anuluj
                  </Button>
                  <Button onClick={startNewConversation}>
                    <Send className="mr-2 h-4 w-4" />
                    Wyślij
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

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
                <TabsTrigger value="direct">Rozmowy</TabsTrigger>
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
                          setSelectedConversation(null);
                        }}
                      >
                        {channel.type === 'public' ? (
                          <Hash className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium truncate">{channel.name}</p>
                            {channel.unreadCount && channel.unreadCount > 0 && (
                              <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                                {channel.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            <Users className="h-3 w-3 inline mr-1" />
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
                    {filteredConversations.map(conversation => {
                      const otherUser = getUserFromConversation(conversation);
                      if (!otherUser) return null;
                      return (
                        <div
                          key={conversation.id}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-accent ${
                            selectedConversation?.id === conversation.id ? 'bg-accent' : ''
                          }`}
                          onClick={() => {
                            setSelectedConversation(conversation);
                            setSelectedChannel(null);
                            // Mark as read
                            setConversations(prev => prev.map(conv => 
                              conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
                            ));
                          }}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{getUserInitials(otherUser)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium truncate">
                                {otherUser.firstName} {otherUser.lastName}
                              </p>
                              {conversation.unreadCount > 0 && (
                                <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-muted-foreground truncate">
                                {conversation.lastMessage?.content}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatTimestamp(conversation.lastActivity)}
                              </p>
                            </div>
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
          {selectedChannel || selectedConversation ? (
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
                    ) : selectedConversation ? (
                      <>
                        {(() => {
                          const otherUser = getUserFromConversation(selectedConversation);
                          return otherUser ? (
                            <>
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{getUserInitials(otherUser)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium">
                                  {otherUser.firstName} {otherUser.lastName}
                                </h3>
                                <p className="text-sm text-muted-foreground">{otherUser.role}</p>
                              </div>
                            </>
                          ) : null;
                        })()}
                      </>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedConversation && (
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
                      : selectedConversation
                      ? (privateMessages[selectedConversation.id] || []).map(message => (
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
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-xs opacity-75">
                                  {formatTimestamp(message.timestamp)}
                                </p>
                                {message.senderId === currentUser.id && (
                                  <div className="flex items-center gap-1">
                                    {message.isRead ? (
                                      <CheckCheck className="h-3 w-3" />
                                    ) : (
                                      <Eye className="h-3 w-3" />
                                    )}
                                  </div>
                                )}
                              </div>
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
                        : selectedConversation
                        ? `Napisz wiadomość...`
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
                <p>Wybierz kanał lub rozpocznij nową rozmowę, aby rozpocząć komunikację</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsNewMessageDialogOpen(true)}
                >
                  <PenSquare className="mr-2 h-4 w-4" />
                  Nowa wiadomość
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}