import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  Plus, 
  Edit,
  Trash2,
  Timer,
  Calendar,
  BarChart3,
  Download
} from "lucide-react";
import { toast } from 'sonner';
import { User } from "../types/client";

interface TimeTrackerProps {
  currentUser?: User;
}

interface TimeEntry {
  id: string;
  clientId: string;
  clientName: string;
  projectName: string;
  taskName: string;
  description: string;
  startTime: string;
  endTime?: string;
  duration: number; // in seconds
  date: string;
  isRunning: boolean;
  hourlyRate?: number;
  category: string;
}

interface ActiveTimer {
  id: string;
  clientId: string;
  clientName: string;
  projectName: string;
  taskName: string;
  description: string;
  startTime: string;
  elapsedTime: number;
}

export function TimeTracker({ currentUser }: TimeTrackerProps) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    projectName: '',
    taskName: '',
    description: '',
    hourlyRate: 50,
    category: 'development'
  });

  // Mock clients for dropdown
  const mockClients = [
    { id: '1', name: 'ABC Sp. z o.o.' },
    { id: '2', name: 'XYZ SA' },
    { id: '3', name: 'DEF Usługi' }
  ];

  const categories = [
    { value: 'development', label: 'Rozwój oprogramowania' },
    { value: 'accounting', label: 'Księgowość' },
    { value: 'consulting', label: 'Konsultacje' },
    { value: 'administration', label: 'Administracja' },
    { value: 'support', label: 'Wsparcie techniczne' },
    { value: 'meeting', label: 'Spotkania' },
    { value: 'documentation', label: 'Dokumentacja' }
  ];

  useEffect(() => {
    if (activeTimer) {
      intervalRef.current = window.setInterval(() => {
        setActiveTimer(prev => {
          if (prev) {
            const now = new Date();
            const start = new Date(prev.startTime);
            const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000);
            return { ...prev, elapsedTime: elapsed };
          }
          return prev;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [activeTimer]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (!formData.clientId || !formData.projectName || !formData.taskName) {
      toast.error("Wypełnij wszystkie wymagane pola");
      return;
    }

    // Check if there's already an active timer
    if (activeTimer) {
      toast.error("Zatrzymaj obecny czasomierz przed rozpoczęciem nowego");
      return;
    }

    const now = new Date().toISOString();
    const newTimer: ActiveTimer = {
      id: Date.now().toString(),
      clientId: formData.clientId,
      clientName: formData.clientName,
      projectName: formData.projectName,
      taskName: formData.taskName,
      description: formData.description,
      startTime: now,
      elapsedTime: 0
    };

    setActiveTimer(newTimer);
    setIsCreating(false);
    
    // Reset form after starting timer
    setFormData({
      clientId: '',
      clientName: '',
      projectName: '',
      taskName: '',
      description: '',
      hourlyRate: 50,
      category: 'development'
    });
    
    toast.success("Czasomierz został uruchomiony");
  };

  const pauseTimer = () => {
    if (activeTimer) {
      const now = new Date();
      const start = new Date(activeTimer.startTime);
      const duration = Math.floor((now.getTime() - start.getTime()) / 1000);
      
      const timeEntry: TimeEntry = {
        id: activeTimer.id,
        clientId: activeTimer.clientId,
        clientName: activeTimer.clientName,
        projectName: activeTimer.projectName,
        taskName: activeTimer.taskName,
        description: activeTimer.description,
        startTime: activeTimer.startTime,
        endTime: now.toISOString(),
        duration: duration,
        date: new Date().toLocaleDateString('pl-PL'),
        isRunning: false,
        hourlyRate: formData.hourlyRate,
        category: formData.category
      };

      setTimeEntries(prev => [...prev, timeEntry]);
      setActiveTimer(null);
      toast.success("Czasomierz został zatrzymany i zapisany");
    }
  };

  const stopTimer = () => {
    if (activeTimer) {
      pauseTimer();
    }
  };

  const deleteTimeEntry = (entryId: string) => {
    if (confirm('Czy na pewno chcesz usunąć ten wpis czasu?')) {
      setTimeEntries(prev => prev.filter(entry => entry.id !== entryId));
      toast.success("Wpis czasu został usunięty");
    }
  };

  const getTotalTimeForDay = (date: string) => {
    return timeEntries
      .filter(entry => entry.date === date)
      .reduce((total, entry) => total + entry.duration, 0);
  };

  const getTotalEarnings = () => {
    return timeEntries.reduce((total, entry) => {
      const rate = entry.hourlyRate || 0;
      const hours = entry.duration / 3600;
      return total + (rate * hours);
    }, 0);
  };

  const exportTimesheet = () => {
    const csv = [
      'Data,Klient,Projekt,Zadanie,Opis,Czas rozpoczęcia,Czas zakończenia,Czas trwania,Stawka godzinowa,Wartość,Kategoria',
      ...timeEntries.map(entry => {
        const hours = (entry.duration / 3600).toFixed(2);
        const value = ((entry.hourlyRate || 0) * parseFloat(hours)).toFixed(2);
        return `${entry.date},"${entry.clientName}","${entry.projectName}","${entry.taskName}","${entry.description}",${new Date(entry.startTime).toLocaleTimeString('pl-PL')},${entry.endTime ? new Date(entry.endTime).toLocaleTimeString('pl-PL') : ''},${formatTime(entry.duration)},${entry.hourlyRate || 0},${value},${entry.category}`;
      })
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `timesheet_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    toast.success("Raport czasu został wyeksportowany");
  };

  const groupedEntries = timeEntries.reduce((groups, entry) => {
    const date = entry.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, TimeEntry[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Czasomierz Pracy</h1>
          <p className="text-muted-foreground">
            Śledź czas pracy nad projektami klientów
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportTimesheet}>
            <Download className="mr-2 h-4 w-4" />
            Eksportuj
          </Button>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button disabled={!!activeTimer}>
                <Plus className="mr-2 h-4 w-4" />
                Nowy Czasomierz
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Uruchom nowy czasomierz</DialogTitle>
                <DialogDescription>
                  Skonfiguruj parametry dla nowego zadania
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Klient *</Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(value) => {
                      const client = mockClients.find(c => c.id === value);
                      setFormData(prev => ({
                        ...prev,
                        clientId: value,
                        clientName: client?.name || ''
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz klienta" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockClients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Projekt *</Label>
                    <Input
                      value={formData.projectName}
                      onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                      placeholder="Nazwa projektu"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Zadanie *</Label>
                    <Input
                      value={formData.taskName}
                      onChange={(e) => setFormData(prev => ({ ...prev, taskName: e.target.value }))}
                      placeholder="Nazwa zadania"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Kategoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Stawka godzinowa (PLN)</Label>
                  <Input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: parseInt(e.target.value) }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Opis</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Dodatkowy opis zadania..."
                    rows={3}
                  />
                </div>

                <Button onClick={startTimer} className="w-full">
                  <Play className="mr-2 h-4 w-4" />
                  Uruchom Czasomierz
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Active Timer */}
      {activeTimer && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-green-600" />
              Aktywny Czasomierz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{activeTimer.clientName} - {activeTimer.projectName}</p>
                <p className="text-sm text-muted-foreground">{activeTimer.taskName}</p>
                {activeTimer.description && (
                  <p className="text-sm text-muted-foreground mt-1">{activeTimer.description}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-mono font-bold text-green-600">
                  {formatTime(activeTimer.elapsedTime)}
                </div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" onClick={pauseTimer}>
                    <Pause className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={stopTimer}>
                    <Square className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Dziś</p>
                <p className="text-xl font-bold">
                  {formatTime(getTotalTimeForDay(new Date().toLocaleDateString('pl-PL')))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Łączne zarobki</p>
                <p className="text-xl font-bold">{getTotalEarnings().toFixed(2)} PLN</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Łączne wpisy</p>
                <p className="text-xl font-bold">{timeEntries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Entries */}
      <div className="space-y-4">
        {Object.entries(groupedEntries)
          .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
          .map(([date, entries]) => (
            <Card key={date}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{date}</span>
                  <Badge variant="outline">
                    {formatTime(getTotalTimeForDay(date))}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {entries.map(entry => (
                    <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {categories.find(c => c.value === entry.category)?.label}
                          </Badge>
                          <span className="font-medium">{entry.clientName}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {entry.projectName} - {entry.taskName}
                        </p>
                        {entry.description && (
                          <p className="text-xs text-muted-foreground mt-1">{entry.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{new Date(entry.startTime).toLocaleTimeString('pl-PL')}</span>
                          {entry.endTime && (
                            <>
                              <span>-</span>
                              <span>{new Date(entry.endTime).toLocaleTimeString('pl-PL')}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold">
                          {formatTime(entry.duration)}
                        </div>
                        {entry.hourlyRate && (
                          <div className="text-sm text-muted-foreground">
                            {((entry.hourlyRate * entry.duration) / 3600).toFixed(2)} PLN
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTimeEntry(entry.id)}
                          className="mt-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {timeEntries.length === 0 && !activeTimer && (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Brak wpisów czasu</h3>
            <p className="text-muted-foreground mb-4">
              Rozpocznij pierwszy czasomierz, aby śledzić swój czas pracy
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Uruchom Czasomierz
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}