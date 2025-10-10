import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Checkbox } from "./ui/checkbox";
import { Plus, Edit, Trash2, Mail, Copy, Eye } from "lucide-react";
import { EmailTemplate } from "../types/client";
import { mockEmailTemplates } from "../data/mockData";
import { toast } from 'sonner';

export function EmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(mockEmailTemplates);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    businessTypes: [] as string[],
    isActive: true
  });

  const businessTypeLabels = {
    'sp_zoo': 'Spółka z o.o.',
    'komandytowa': 'Spółka komandytowa',
    'akcyjna': 'Spółka akcyjna',
    'jednoosobowa': 'Jednoosobowa działalność gospodarcza',
    'spolka_cywilna': 'Spółka cywilna',
    'fundacja': 'Fundacja',
    'stowarzyszenie': 'Stowarzyszenie'
  };

  const handleCreate = () => {
    setFormData({
      name: '',
      subject: '',
      content: '',
      businessTypes: [],
      isActive: true
    });
    setSelectedTemplate(null);
    setIsCreating(true);
    setIsEditing(false);
  };

  const handleEdit = (template: EmailTemplate) => {
    setFormData({
      name: template.name,
      subject: template.subject,
      content: template.content,
      businessTypes: template.businessTypes,
      isActive: template.isActive
    });
    setSelectedTemplate(template);
    setIsCreating(true);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.subject || !formData.content) {
      toast.error("Wypełnij wszystkie wymagane pola");
      return;
    }

    if (formData.businessTypes.length === 0) {
      toast.error("Wybierz co najmniej jeden rodzaj działalności");
      return;
    }

    const templateData: EmailTemplate = {
      id: selectedTemplate?.id || Date.now().toString(),
      name: formData.name,
      subject: formData.subject,
      content: formData.content,
      businessTypes: formData.businessTypes,
      isActive: formData.isActive
    };

    if (isEditing && selectedTemplate) {
      setTemplates(prev => prev.map(t => t.id === selectedTemplate.id ? templateData : t));
      toast.success("Szablon został zaktualizowany");
    } else {
      setTemplates(prev => [...prev, templateData]);
      toast.success("Szablon został utworzony");
    }

    setIsCreating(false);
    setIsEditing(false);
    setSelectedTemplate(null);
  };

  const handleDelete = (templateId: string) => {
    if (confirm('Czy na pewno chcesz usunąć ten szablon?')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      toast.success("Szablon został usunięty");
    }
  };

  const handleCopyTemplate = (template: EmailTemplate) => {
    const newTemplate: EmailTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (kopia)`,
      isActive: false
    };
    setTemplates(prev => [...prev, newTemplate]);
    toast.success("Szablon został skopiowany");
  };

  const toggleBusinessType = (businessType: string) => {
    setFormData(prev => ({
      ...prev,
      businessTypes: prev.businessTypes.includes(businessType)
        ? prev.businessTypes.filter(bt => bt !== businessType)
        : [...prev.businessTypes, businessType]
    }));
  };

  const toggleTemplateStatus = (templateId: string) => {
    setTemplates(prev => prev.map(t => 
      t.id === templateId ? { ...t, isActive: !t.isActive } : t
    ));
  };

  const getVariables = () => [
    { name: '{{IMIE_NAZWISKO}}', description: 'Imię i nazwisko klienta' },
    { name: '{{NAZWA_FIRMY}}', description: 'Nazwa firmy klienta' },
    { name: '{{NIP}}', description: 'NIP firmy' },
    { name: '{{EMAIL}}', description: 'Adres email klienta' },
    { name: '{{TELEFON}}', description: 'Numer telefonu' },
    { name: '{{RODZAJ_DZIALALNOSCI}}', description: 'Rodzaj działalności' },
    { name: '{{FORMA_PODATKOWA}}', description: 'Forma rozliczenia podatkowego' },
    { name: '{{RODZAJ_KSIEGOWOSCI}}', description: 'Rodzaj księgowości' },
    { name: '{{DATA_DZISIAJ}}', description: 'Dzisiejsza data' },
    { name: '{{NAZWA_BIURA}}', description: 'Nazwa naszego biura' }
  ];

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.content;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      
      setFormData(prev => ({
        ...prev,
        content: before + variable + after
      }));
      
      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Szablony Emailowe</h1>
          <p className="text-muted-foreground">
            Zarządzaj szablonami emaili dla różnych rodzajów działalności
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nowy Szablon
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className={`${!template.isActive ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={template.isActive}
                    onCheckedChange={() => toggleTemplateStatus(template.id)}
                    size="sm"
                  />
                </div>
              </div>
              <CardDescription>{template.subject}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Rodzaje działalności:</p>
                <div className="flex flex-wrap gap-1">
                  {template.businessTypes.map((type) => (
                    <Badge key={type} variant="outline" className="text-xs">
                      {businessTypeLabels[type as keyof typeof businessTypeLabels]}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {template.content.length} znaków
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewTemplate(template)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(template)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyTemplate(template)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(template.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Template Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edytuj szablon' : 'Utwórz nowy szablon'}
            </DialogTitle>
            <DialogDescription>
              Stwórz szablon emaila dla określonych rodzajów działalności
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nazwa szablonu *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="np. Powitanie nowego klienta"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Temat wiadomości *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Temat emaila"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Treść wiadomości *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Treść emaila..."
                  rows={12}
                />
              </div>

              <div className="space-y-2">
                <Label>Rodzaje działalności *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.entries(businessTypeLabels).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.businessTypes.includes(key)}
                        onCheckedChange={() => toggleBusinessType(key)}
                      />
                      <Label className="text-sm">{label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label>Aktywny szablon</Label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Dostępne zmienne</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {getVariables().map((variable) => (
                    <div
                      key={variable.name}
                      className="p-2 border rounded cursor-pointer hover:bg-muted/50"
                      onClick={() => insertVariable(variable.name)}
                    >
                      <div className="font-mono text-sm text-blue-600">
                        {variable.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {variable.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>Kliknij na zmienną, aby wstawić ją do treści.</p>
                <p>Zmienne będą automatycznie zastąpione danymi klienta podczas wysyłania.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave}>
              {isEditing ? 'Zaktualizuj szablon' : 'Utwórz szablon'}
            </Button>
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Anuluj
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Template Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {previewTemplate?.name}
            </DialogTitle>
            <DialogDescription>
              Podgląd szablonu emaila
            </DialogDescription>
          </DialogHeader>
          
          {previewTemplate && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/20">
                <div className="text-sm text-muted-foreground mb-1">Temat:</div>
                <div className="font-medium">{previewTemplate.subject}</div>
              </div>
              
              <div className="p-4 border rounded-lg bg-muted/20">
                <div className="text-sm text-muted-foreground mb-2">Treść:</div>
                <div className="whitespace-pre-wrap text-sm">
                  {previewTemplate.content}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-2">Rodzaje działalności:</div>
                <div className="flex flex-wrap gap-2">
                  {previewTemplate.businessTypes.map((type) => (
                    <Badge key={type} variant="outline">
                      {businessTypeLabels[type as keyof typeof businessTypeLabels]}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant={previewTemplate.isActive ? 'default' : 'secondary'}>
                  {previewTemplate.isActive ? 'Aktywny' : 'Nieaktywny'}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}