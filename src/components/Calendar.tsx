import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Calendar as CalendarIcon, Plus, Clock, MapPin, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarEvent, User } from "../types/client";
import { mockCalendarEvents, mockUsers } from "../data/mockData";
import { toast } from 'sonner';

export function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>(mockCalendarEvents);
  const [users] = useState<User[]>(mockUsers);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    isAllDay: false,
    category: 'spotkanie' as CalendarEvent['category'],
    attendees: [] as string[],
    location: ''
  });

  // Calendar navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const today = () => {
    setCurrentDate(new Date());
  };

  // Get calendar days for current month
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    
    // Start from Monday
    const dayOfWeek = firstDay.getDay();
    startDate.setDate(firstDay.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    const days = [];
    const currentDay = new Date(startDate);

    for (let i = 0; i < 42; i++) { // 6 weeks × 7 days
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }

    return days;
  };

  // Get events for specific date
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventDate = new Date(event.startDate).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.startDate) {
      toast.error("Wprowadź tytuł i datę wydarzenia");
      return;
    }

    const startDateTime = newEvent.isAllDay 
      ? `${newEvent.startDate}T00:00:00Z`
      : `${newEvent.startDate}T${newEvent.startTime}:00Z`;
    
    const endDateTime = newEvent.isAllDay
      ? `${newEvent.endDate || newEvent.startDate}T23:59:59Z`
      : `${newEvent.endDate || newEvent.startDate}T${newEvent.endTime || newEvent.startTime}:00Z`;

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      description: newEvent.description,
      startDate: startDateTime,
      endDate: endDateTime,
      isAllDay: newEvent.isAllDay,
      category: newEvent.category,
      attendees: newEvent.attendees,
      createdBy: '1', // Current user
      location: newEvent.location
    };

    setEvents(prev => [...prev, event]);
    setIsCreating(false);
    setNewEvent({
      title: '',
      description: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      isAllDay: false,
      category: 'spotkanie',
      attendees: [],
      location: ''
    });
    toast.success("Wydarzenie zostało dodane");
  };

  const getCategoryColor = (category: CalendarEvent['category']) => {
    const colors = {
      'spotkanie': 'bg-blue-500',
      'termin': 'bg-red-500',
      'przypomnienie': 'bg-yellow-500',
      'wakacje': 'bg-green-500',
      'inne': 'bg-gray-500'
    };
    return colors[category] || colors.inne;
  };

  const getCategoryLabel = (category: CalendarEvent['category']) => {
    const labels = {
      'spotkanie': 'Spotkanie',
      'termin': 'Termin',
      'przypomnienie': 'Przypomnienie',
      'wakacje': 'Wakacje',
      'inne': 'Inne'
    };
    return labels[category] || 'Inne';
  };

  const formatTime = (dateStr: string, isAllDay: boolean) => {
    if (isAllDay) return 'Cały dzień';
    return new Date(dateStr).toLocaleTimeString('pl-PL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Nieznany użytkownik';
  };

  const calendarDays = getCalendarDays();
  const monthNames = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
  ];
  const dayNames = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Kalendarz</h1>
          <p className="text-muted-foreground">
            Zarządzaj spotkaniami i terminami zespołu
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nowe Wydarzenie
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Dodaj nowe wydarzenie</DialogTitle>
              <DialogDescription>
                Wypełnij szczegóły wydarzenia
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tytuł *</Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Nazwa wydarzenia"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Opis</Label>
                <Textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Opis wydarzenia"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isAllDay"
                  checked={newEvent.isAllDay}
                  onCheckedChange={(checked) => setNewEvent(prev => ({ ...prev, isAllDay: checked }))}
                />
                <Label htmlFor="isAllDay">Wydarzenie całodniowe</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data rozpoczęcia *</Label>
                  <Input
                    type="date"
                    value={newEvent.startDate}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                {!newEvent.isAllDay && (
                  <div className="space-y-2">
                    <Label>Godzina rozpoczęcia</Label>
                    <Input
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, startTime: e.target.value }))}
                    />
                  </div>
                )}
              </div>

              {!newEvent.isAllDay && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data zakończenia</Label>
                    <Input
                      type="date"
                      value={newEvent.endDate}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Godzina zakończenia</Label>
                    <Input
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, endTime: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kategoria</Label>
                  <Select
                    value={newEvent.category}
                    onValueChange={(value: CalendarEvent['category']) => 
                      setNewEvent(prev => ({ ...prev, category: value }))
                    }
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
                  <Label>Lokalizacja</Label>
                  <Input
                    value={newEvent.location}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Miejsce spotkania"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreateEvent}>
                  Dodaj wydarzenie
                </Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Anuluj
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-lg font-semibold">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </div>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={today}>
                Dzisiaj
              </Button>
            </div>
            <div className="flex gap-2">
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {dayNames.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isToday = day.toDateString() === new Date().toDateString();
              const dayEvents = getEventsForDate(day);
              
              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border rounded-lg cursor-pointer hover:bg-muted/50 ${
                    isCurrentMonth ? 'bg-background' : 'bg-muted/20'
                  } ${isToday ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className={`text-sm mb-2 ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {day.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs p-1 rounded text-white truncate ${getCategoryColor(event.category)}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                        }}
                      >
                        {formatTime(event.startDate, event.isAllDay)} {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayEvents.length - 3} więcej
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getCategoryColor(selectedEvent.category)}`} />
                {selectedEvent.title}
              </DialogTitle>
              <DialogDescription>
                {getCategoryLabel(selectedEvent.category)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>
                  {formatTime(selectedEvent.startDate, selectedEvent.isAllDay)}
                  {!selectedEvent.isAllDay && (
                    <> - {formatTime(selectedEvent.endDate, selectedEvent.isAllDay)}</>
                  )}
                </span>
              </div>
              
              {selectedEvent.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}
              
              {selectedEvent.attendees.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  <span>
                    Uczestniczy: {selectedEvent.attendees.map(getUserName).join(', ')}
                  </span>
                </div>
              )}
              
              {selectedEvent.description && (
                <div>
                  <h4 className="font-medium mb-2">Opis</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedEvent.description}
                  </p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Edytuj
                </Button>
                <Button variant="outline" size="sm">
                  Usuń
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}