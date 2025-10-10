import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { 
  FileText, 
  Upload, 
  Download, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Folder,
  Plus,
  File,
  Image,
  FileSpreadsheet,
  Calendar,
  FilePlus
} from "lucide-react";
import { Client, User } from "../types/client";
import { toast } from 'sonner';
import { AuthorizationFormDialog } from "./gui/AuthorizationFormDialog";

interface Document {
  id: string;
  name: string;
  type: 'contract' | 'authorization' | 'declaration' | 'invoice' | 'other';
  category: 'księgowe' | 'kadrowe' | 'podatkowe' | 'prawne' | 'inne';
  clientId: string;
  uploadDate: string;
  lastModified: string;
  size: number;
  fileType: string;
  version: number;
  tags: string[];
  notes?: string;
  isArchived: boolean;
}

interface DocumentManagerProps {
  clients: Client[];
}

export function DocumentManager({ clients }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isAuthFormDialogOpen, setIsAuthFormDialogOpen] = useState(false);

  // Mock employees for authorization forms
  const mockEmployees: User[] = [
    {
      id: '1',
      firstName: 'Anna',
      lastName: 'Kowalska',
      email: 'anna.kowalska@firma.pl',
      role: 'księgowa',
      position: 'Główna księgowa',
      phone: '+48 123 456 789',
      isActive: true
    },
    {
      id: '2',
      firstName: 'Piotr',
      lastName: 'Nowak',
      email: 'piotr.nowak@firma.pl',
      role: 'ksiegowosc',
      position: 'Specjalista ds. ZUS',
      phone: '+48 234 567 890',
      isActive: true
    },
    {
      id: '3',
      firstName: 'Maria',
      lastName: 'Wiśniewska',
      email: 'maria.wisniewska@firma.pl',
      role: 'kadry',
      position: 'Specjalista kadrowy',
      phone: '+48 345 678 901',
      isActive: true
    }
  ];

  useEffect(() => {
    // Mock documents
    const mockDocuments: Document[] = [
      {
        id: '1',
        name: 'Umowa o prowadzenie księgowości',
        type: 'contract',
        category: 'księgowe',
        clientId: clients[0]?.id || '1',
        uploadDate: '2024-11-01',
        lastModified: '2024-11-01',
        size: 2048000,
        fileType: 'application/pdf',
        version: 1,
        tags: ['umowa', 'księgowość'],
        isArchived: false
      },
      {
        id: '2',
        name: 'Pełnomocnictwo do US',
        type: 'authorization',
        category: 'prawne',
        clientId: clients[0]?.id || '1',
        uploadDate: '2024-11-02',
        lastModified: '2024-11-02',
        size: 1024000,
        fileType: 'application/pdf',
        version: 1,
        tags: ['pełnomocnictwo', 'urząd skarbowy'],
        isArchived: false
      }
    ];
    setDocuments(mockDocuments);
  }, [clients]);

  const [newDocument, setNewDocument] = useState({
    name: '',
    type: 'other' as Document['type'],
    category: 'inne' as Document['category'],
    clientId: '',
    tags: '',
    notes: ''
  });

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
    if (fileType.includes('image')) return <Image className="h-4 w-4 text-blue-500" />;
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) 
      return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
    return <File className="h-4 w-4 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : 'Nieznany klient';
  };

  const handleUploadDocument = () => {
    if (!newDocument.name || !newDocument.clientId) {
      toast.error("Wprowadź nazwę dokumentu i wybierz klienta");
      return;
    }

    const document: Document = {
      id: Date.now().toString(),
      name: newDocument.name,
      type: newDocument.type,
      category: newDocument.category,
      clientId: newDocument.clientId,
      uploadDate: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      size: Math.floor(Math.random() * 5000000), // Random size for demo
      fileType: 'application/pdf',
      version: 1,
      tags: newDocument.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      notes: newDocument.notes,
      isArchived: false
    };

    setDocuments(prev => [...prev, document]);
    setIsUploadDialogOpen(false);
    setNewDocument({
      name: '',
      type: 'other',
      category: 'inne',
      clientId: '',
      tags: '',
      notes: ''
    });
    toast.success("Dokument został przesłany");
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesClient = selectedClient === 'all' || doc.clientId === selectedClient;
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesClient && matchesCategory && matchesSearch && !doc.isArchived;
  });

  const getTypeLabel = (type: Document['type']) => {
    const labels = {
      'contract': 'Umowa',
      'authorization': 'Pełnomocnictwo',
      'declaration': 'Deklaracja',
      'invoice': 'Faktura',
      'other': 'Inne'
    };
    return labels[type];
  };

  const getCategoryLabel = (category: Document['category']) => {
    const labels = {
      'księgowe': 'Księgowe',
      'kadrowe': 'Kadrowe',
      'podatkowe': 'Podatkowe',
      'prawne': 'Prawne',
      'inne': 'Inne'
    };
    return labels[category];
  };

  const handlePreviewDocument = (document: Document) => {
    toast.info(`Podgląd dokumentu: ${document.name}`);
    // TODO: Implement document preview functionality
  };

  const handleDownloadDocument = (document: Document) => {
    toast.success(`Pobieranie dokumentu: ${document.name}`);
    // TODO: Implement actual download functionality
  };

  const handleEditDocument = (document: Document) => {
    toast.info(`Edycja dokumentu: ${document.name}`);
    // TODO: Implement document edit functionality
  };

  const handleDeleteDocument = (documentId: string) => {
    const document = documents.find(d => d.id === documentId);
    if (document) {
      setDocuments(prev => prev.filter(d => d.id !== documentId));
      toast.success(`Dokument "${document.name}" został usunięty`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Zarządzanie Dokumentami</h1>
          <p className="text-muted-foreground">
            Przechowywanie i organizacja dokumentów klientów
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsAuthFormDialogOpen(true)}>
            <FilePlus className="mr-2 h-4 w-4" />
            Generuj pełnomocnictwo
          </Button>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Prześlij dokument
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Szukaj dokumentów..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedClient} onValueChange={setSelectedClient}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszyscy klienci</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.firstName} {client.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie</SelectItem>
            <SelectItem value="księgowe">Księgowe</SelectItem>
            <SelectItem value="kadrowe">Kadrowe</SelectItem>
            <SelectItem value="podatkowe">Podatkowe</SelectItem>
            <SelectItem value="prawne">Prawne</SelectItem>
            <SelectItem value="inne">Inne</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filter Summary */}
      {(selectedClient !== 'all' || selectedCategory !== 'all' || searchTerm) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Aktywne filtry:</span>
                {selectedClient !== 'all' && (
                  <Badge variant="secondary">
                    Klient: {getClientName(selectedClient)}
                  </Badge>
                )}
                {selectedCategory !== 'all' && (
                  <Badge variant="secondary">
                    Kategoria: {getCategoryLabel(selectedCategory as Document['category'])}
                  </Badge>
                )}
                {searchTerm && (
                  <Badge variant="secondary">
                    Wyszukiwanie: "{searchTerm}"
                  </Badge>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setSelectedClient('all');
                    setSelectedCategory('all');
                    setSearchTerm('');
                  }}
                >
                  Wyczyść filtry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Dokumenty</CardTitle>
              <CardDescription>
                Wyświetlono {filteredDocuments.length} z {documents.filter(d => !d.isArchived).length} dokumentów
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dokument</TableHead>
                <TableHead>Klient</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Kategoria</TableHead>
                <TableHead>Data przesłania</TableHead>
                <TableHead>Rozmiar</TableHead>
                <TableHead className="text-right">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nie znaleziono dokumentów spełniających kryteria wyszukiwania
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocuments.map((document) => (
                <TableRow key={document.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getFileIcon(document.fileType)}
                      <div>
                        <p className="font-medium">{document.name}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {document.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getClientName(document.clientId)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getTypeLabel(document.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getCategoryLabel(document.category)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(document.uploadDate).toLocaleDateString('pl-PL')}
                  </TableCell>
                  <TableCell>{formatFileSize(document.size)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handlePreviewDocument(document)}
                        title="Podgląd"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDownloadDocument(document)}
                        title="Pobierz"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditDocument(document)}
                        title="Edytuj"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteDocument(document.id)}
                        title="Usuń"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog przesyłania dokumentu */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Prześlij dokument</DialogTitle>
            <DialogDescription>
              Dodaj nowy dokument do systemu
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="documentName">Nazwa dokumentu *</Label>
              <Input
                id="documentName"
                value={newDocument.name}
                onChange={(e) => setNewDocument(prev => ({ ...prev, name: e.target.value }))}
                placeholder="np. Umowa o prowadzenie księgowości"
              />
            </div>

            <div className="space-y-2">
              <Label>Klient *</Label>
              <Select
                value={newDocument.clientId}
                onValueChange={(value) => setNewDocument(prev => ({ ...prev, clientId: value }))}
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Typ dokumentu</Label>
                <Select
                  value={newDocument.type}
                  onValueChange={(value: any) => setNewDocument(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contract">Umowa</SelectItem>
                    <SelectItem value="authorization">Pełnomocnictwo</SelectItem>
                    <SelectItem value="declaration">Deklaracja</SelectItem>
                    <SelectItem value="invoice">Faktura</SelectItem>
                    <SelectItem value="other">Inne</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Kategoria</Label>
                <Select
                  value={newDocument.category}
                  onValueChange={(value: any) => setNewDocument(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="księgowe">Księgowe</SelectItem>
                    <SelectItem value="kadrowe">Kadrowe</SelectItem>
                    <SelectItem value="podatkowe">Podatkowe</SelectItem>
                    <SelectItem value="prawne">Prawne</SelectItem>
                    <SelectItem value="inne">Inne</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tagi</Label>
              <Input
                id="tags"
                value={newDocument.tags}
                onChange={(e) => setNewDocument(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="Oddziel przecinkami, np: umowa, księgowość"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notatki</Label>
              <Input
                id="notes"
                value={newDocument.notes}
                onChange={(e) => setNewDocument(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Opcjonalne notatki"
              />
            </div>

            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Przeciągnij plik tutaj lub kliknij, aby wybrać
              </p>
              <Button variant="outline" className="mt-2">
                Wybierz plik
              </Button>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                Anuluj
              </Button>
              <Button onClick={handleUploadDocument}>
                Prześlij dokument
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Authorization Form Dialog */}
      <AuthorizationFormDialog
        isOpen={isAuthFormDialogOpen}
        onClose={() => setIsAuthFormDialogOpen(false)}
        clients={clients}
        employees={mockEmployees}
        preSelectedClientId={selectedClient !== 'all' ? selectedClient : undefined}
      />
    </div>
  );
}