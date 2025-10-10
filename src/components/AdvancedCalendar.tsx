import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Calendar, CalendarDays, Plus, Users, User, Eye, Edit, Trash2, Clock, MapPin, Bell } from "lucide-react";
import { CalendarEvent, CalendarView, User as UserType } from "../types/client";
import { toast } from 'sonner';

interface AdvancedCalendarProps {
  currentUser: UserType;
  allUsers: UserType[];
}

export function AdvancedCalendar({ currentUser, allUsers }: AdvancedCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [calendarViews, setCalendarViews] = useState<CalendarView[]>([
    {
      id: '1',
      name: 'Mój kalendarz',
      type: 'personal',
      ownerId: currentUser.id,
      visibleTo: [currentUser.id],
      color: '#3b82f6',
      isDefault: true
    },
    {
      id: '2',
      name: 'Kalendarz zespołowy',
      type: 'shared',
      visibleTo: allUsers.map(u => u.id),
      color: '#10b981',
      isDefault: false
    }
  ]);
  const [activeViews, setActiveViews] = useState<string[]>(['1', '2']);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isNewEvent, setIsNewEvent] = useState(false);

  // Mock events
  useEffect(() => {
    const mockEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Spotkanie z klientem - Tech Solutions',
        description: 'Omówienie nowego projektu',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        isAllDay: false,
        category: 'spotkanie',
        attendees: [currentUser.id],
        clientId: '1',
        createdBy: currentUser.id,
        location: 'Biuro - sala konferencyjna'
      },
      {
        id: '2',
        title: 'Termin składania deklaracji VAT',
        description: 'Przypomnienie o terminie',
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        isAllDay: true,
        category: 'termin',
        attendees: allUsers.map(u => u.id),
        createdBy: currentUser.id
      }
    ];
    setEvents(mockEvents);
  }, [currentUser.id, allUsers]);

  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: '',
    description: '',
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
    isAllDay: false,
    category: 'spotkanie',
    attendees: [currentUser.id],
    location: ''
  });

  const handleAddEvent = () => {
    if (!newEvent.title) {
      toast.error("Wprowadź tytuł wydarzenia");
      return;
    }

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title!,
      description: newEvent.description || '',
      startDate: newEvent.startDate!,
      endDate: newEvent.endDate!,
      isAllDay: newEvent.isAllDay!,
      category: newEvent.category!,
      attendees: newEvent.attendees!,
      createdBy: currentUser.id,
      location: newEvent.location || ''
    };

    setEvents(prev => [...prev, event]);
    setIsEventDialogOpen(false);
    setNewEvent({
      title: '',
      description: '',
      startDate: new Date().toISOString().slice(0, 16),
      endDate: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
      isAllDay: false,
      category: 'spotkanie',
      attendees: [currentUser.id],
      location: ''
    });
    toast.success("Wydarzenie zostało dodane");
  };

  const handleUpdateEvent = () => {
    if (!selectedEvent || !newEvent.title) {
      toast.error("Wprowadź tytuł wydarzenia");
      return;
    }

    const updatedEvent: CalendarEvent = {
      ...selectedEvent,
      title: newEvent.title!,
      description: newEvent.description || '',
      startDate: newEvent.startDate!,
      endDate: newEvent.endDate!,
      isAllDay: newEvent.isAllDay!,
      category: newEvent.category!,
      attendees: newEvent.attendees!,
      location: newEvent.location || ''
    };

    setEvents(prev => prev.map(event => 
      event.id === selectedEvent.id ? updatedEvent : event
    ));
    setIsEventDialogOpen(false);
    setSelectedEvent(null);
    toast.success("Wydarzenie zostało zaktualizowane");
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Czy na pewno chcesz usunąć to wydarzenie?')) {
      setEvents(prev => prev.filter(event => event.id !== eventId));
      toast.success("Wydarzenie zostało usunięte");
    }
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description,
      startDate: event.startDate.slice(0, 16),
      endDate: event.endDate.slice(0, 16),
      isAllDay: event.isAllDay,
      category: event.category,
      attendees: event.attendees,
      location: event.location
    });
    setIsNewEvent(false);
    setIsEventDialogOpen(true);
  };

  const handleNewEvent = () => {
    setSelectedEvent(null);
    setNewEvent({
      title: '',
      description: '',
      startDate: new Date().toISOString().slice(0, 16),
      endDate: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
      isAllDay: false,
      category: 'spotkanie',
      attendees: [currentUser.id],
      location: ''
    });
    setIsNewEvent(true);
    setIsEventDialogOpen(true);
  };

  const toggleCalendarView = (viewId: string) => {
    setActiveViews(prev => 
      prev.includes(viewId) 
        ? prev.filter(id => id !== viewId)
        : [...prev, viewId]
    );
  };

  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      spotkanie: 'bg-blue-500',
      termin: 'bg-red-500',
      przypomnienie: 'bg-yellow-500',
      wakacje: 'bg-green-500',
      inne: 'bg-gray-500'
    };
    return colors[category as keyof typeof colors] || colors.inne;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      spotkanie: 'Spotkanie',
      termin: 'Termin',
      przypomnienie: 'Przypomnienie',
      wakacje: 'Wakacje',
      inne: 'Inne'
    };
    return labels[category as keyof typeof labels] || 'Inne';
  };

  const filterEventsByActiveViews = (events: CalendarEvent[]) => {
    return events.filter(event => {
      // Sprawdź czy wydarzenie jest widoczne w aktywnych widokach
      const eventViews = calendarViews.filter(view => {
        if (view.type === 'personal' && view.ownerId === event.createdBy) {
          return activeViews.includes(view.id);
        }
        if (view.type === 'shared') {
          return activeViews.includes(view.id);
        }
        return false;
      });
      return eventViews.length > 0;
    });
  };

  const visibleEvents = filterEventsByActiveViews(events);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Kalendarz</h1>
          <p className="text-muted-foreground">
            Zarządzaj swoimi wydarzeniami i harmonogramem zespołu
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Miesiąc</SelectItem>
              <SelectItem value="week">Tydzień</SelectItem>
              <SelectItem value="day">Dzień</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleNewEvent}>
            <Plus className="mr-2 h-4 w-4" />
            Nowe wydarzenie
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar z widokami kalendarza */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Widoki kalendarza
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {calendarViews.map(view => (
              <div key={view.id} className="flex items-center space-x-2">
                <Switch
                  checked={activeViews.includes(view.id)}
                  onCheckedChange={() => toggleCalendarView(view.id)}
                />
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: view.color }}
                  />
                  <div>
                    <Label className="flex items-center gap-1">
                      {view.type === 'personal' ? <User className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                      {view.name}
                    </Label>
                    {view.type === 'personal' && (
                      <p className="text-xs text-muted-foreground">Kalendarz osobisty</p>
                    )}
                    {view.type === 'shared' && (
                      <p className="text-xs text-muted-foreground">Kalendarz zespołowy</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Główny widok kalendarza */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>
              {viewMode === 'month' && selectedDate.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}
              {viewMode === 'week' && `Tydzień ${selectedDate.toLocaleDateString('pl-PL')}`}
              {viewMode === 'day' && selectedDate.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value="calendar" className="w-full">
              <TabsList>
                <TabsTrigger value="calendar">Kalendarz</TabsTrigger>
                <TabsTrigger value="list">Lista wydarzeń</TabsTrigger>
              </TabsList>
              
              <TabsContent value="calendar" className="mt-4">
                {/* Uproszczony widok kalendarza - w prawdziwej aplikacji użyjesz biblioteki kalendarza */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie'].map(day => (
                    <div key={day} className="p-2 text-center font-medium text-sm">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }, (_, i) => {
                    const date = new Date();
                    date.setDate(1);
                    date.setDate(date.getDate() + i - date.getDay() + 1);
                    const dayEvents = getEventsForDay(date);
                    
                    return (
                      <div
                        key={i}
                        className={`min-h-24 p-2 border rounded-lg cursor-pointer hover:bg-accent ${
                          date.toDateString() === selectedDate.toDateString() ? 'bg-primary text-primary-foreground' : ''
                        }`}
                        onClick={() => setSelectedDate(date)}
                      >
                        <div className="text-sm">{date.getDate()}</div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map(event => (
                            <div
                              key={event.id}
                              className={`text-xs p-1 rounded text-white truncate ${getCategoryColor(event.category)}`}
                              title={event.title}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{dayEvents.length - 2} więcej
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="list" className="mt-4">
                <div className="space-y-4">
                  {visibleEvents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Brak wydarzeń w wybranych kalendarzach
                    </div>
                  ) : (
                    visibleEvents.map(event => (
                      <div key={event.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{event.title}</h3>
                              <Badge variant="outline">
                                {getCategoryLabel(event.category)}
                              </Badge>
                            </div>
                            {event.description && (
                              <p className="text-sm text-muted-foreground">{event.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {event.isAllDay 
                                  ? 'Cały dzień'
                                  : `${new Date(event.startDate).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })} - ${new Date(event.endDate).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}`
                                }
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {event.location}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {event.attendees.length} uczestników
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditEvent(event)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteEvent(event.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Dialog dodawania/edycji wydarzenia */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isNewEvent ? 'Dodaj nowe wydarzenie' : 'Edytuj wydarzenie'}
            </DialogTitle>
            <DialogDescription>
              Wprowadź szczegóły wydarzenia
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tytuł *</Label>
              <Input
                id="title"
                value={newEvent.title || ''}
                onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Tytuł wydarzenia"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Opis</Label>
              <Textarea
                id="description"
                value={newEvent.description || ''}
                onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Opcjonalny opis wydarzenia"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Data i godzina rozpoczęcia</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={newEvent.startDate || ''}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Data i godzina zakończenia</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={newEvent.endDate || ''}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="allDay"
                checked={newEvent.isAllDay || false}
                onCheckedChange={(checked) => setNewEvent(prev => ({ ...prev, isAllDay: checked }))}
              />
              <Label htmlFor="allDay">Cały dzień</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategoria</Label>
              <Select
                value={newEvent.category || 'spotkanie'}
                onValueChange={(value: any) => setNewEvent(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spotkanie">Spotkanie</SelectItem>
                  <SelectItem value="termin">Termin</SelectItem>
                  <SelectItem value="przypomnienie">Przypomnienie</SelectItem>
                  <SelectItem value="wakacje">Wakacje</SelectItem>
                  <SelectItem value="inne">Inne</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Lokalizacja</Label>
              <Input
                id="location"
                value={newEvent.location || ''}
                onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Miejsce wydarzenia"
              />
            </div>

            <div className="space-y-2">
              <Label>Uczestnicy</Label>
              <div className="space-y-2">
                {allUsers.map(user => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <Switch
                      checked={newEvent.attendees?.includes(user.id) || false}
                      onCheckedChange={(checked) => {
                        const attendees = newEvent.attendees || [];
                        if (checked) {
                          setNewEvent(prev => ({ 
                            ...prev, 
                            attendees: [...attendees.filter(id => id !== user.id), user.id] 
                          }));
                        } else {
                          setNewEvent(prev => ({ 
                            ...prev, 
                            attendees: attendees.filter(id => id !== user.id) 
                          }));
                        }
                      }}
                    />
                    <Label>{user.firstName} {user.lastName}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEventDialogOpen(false)}>
                Anuluj
              </Button>
              <Button onClick={isNewEvent ? handleAddEvent : handleUpdateEvent}>
                {isNewEvent ? 'Dodaj wydarzenie' : 'Zapisz zmiany'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}