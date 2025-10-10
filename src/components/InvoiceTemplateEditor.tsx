import { useState, useRef, useCallback } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Save, 
  Download, 
  Copy,
  Type,
  Image,
  BarChart3,
  Calendar,
  DollarSign,
  FileText,
  Grip,
  Move3D,
  Settings,
  Palette,
  Layout,
  AlignLeft,
  AlignCenter,
  AlignRight
} from "lucide-react";
import { toast } from 'sonner';

interface InvoiceTemplate {
  id: string;
  name: string;
  type: 'standard' | 'proforma' | 'correction' | 'receipt' | 'vat';
  layout: TemplateLayout;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  lastModified: string;
}

interface TemplateLayout {
  elements: TemplateElement[];
  pageSettings: PageSettings;
  styles: GlobalStyles;
}

interface TemplateElement {
  id: string;
  type: 'text' | 'logo' | 'table' | 'line' | 'signature' | 'date' | 'total' | 'qr';
  position: { x: number; y: number };
  size: { width: number; height: number };
  content: string;
  styles: ElementStyles;
  locked?: boolean;
}

interface PageSettings {
  format: 'A4' | 'A5' | 'Letter';
  orientation: 'portrait' | 'landscape';
  margins: { top: number; right: number; bottom: number; left: number };
  backgroundColor: string;
}

interface GlobalStyles {
  fontFamily: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
}

interface ElementStyles {
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  color: string;
  textAlign: 'left' | 'center' | 'right';
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

const ELEMENT_TYPES = [
  { type: 'text', label: 'Tekst', icon: Type },
  { type: 'logo', label: 'Logo', icon: Image },
  { type: 'table', label: 'Tabela', icon: BarChart3 },
  { type: 'date', label: 'Data', icon: Calendar },
  { type: 'total', label: 'Suma', icon: DollarSign },
  { type: 'signature', label: 'Podpis', icon: FileText }
];

interface DraggableElementProps {
  element: TemplateElement;
  onUpdate: (id: string, updates: Partial<TemplateElement>) => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

function DraggableElement({ element, onUpdate, onSelect, isSelected }: DraggableElementProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'element',
    item: { id: element.id, type: element.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Remove the hover drop logic that was causing issues
  drag(ref);

  return (
    <div
      ref={ref}
      className={`absolute cursor-move border-2 transition-all duration-200 ${
        isSelected ? 'border-blue-500 shadow-lg' : 'border-transparent hover:border-gray-300'
      } ${isDragging ? 'opacity-50 z-50' : 'hover:shadow-md'}`}
      style={{
        left: element.position.x,
        top: element.position.y,
        width: element.size.width,
        height: element.size.height,
        fontSize: element.styles?.fontSize || 14,
        fontWeight: element.styles?.fontWeight || 'normal',
        color: element.styles?.color || '#000000',
        textAlign: element.styles?.textAlign || 'left',
        backgroundColor: element.styles?.backgroundColor || 'transparent',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(element.id);
      }}
    >
      {isSelected && (
        <div className="absolute -top-6 left-0 bg-blue-500 text-white px-2 py-1 text-xs rounded">
          <Grip className="h-3 w-3 inline mr-1" />
          {element.type}
        </div>
      )}
      
      {element.type === 'text' && (
        <div>{element.content || 'Tekst'}</div>
      )}
      
      {element.type === 'logo' && (
        <div className="border-2 border-dashed border-gray-300 h-full flex items-center justify-center">
          <Image className="h-8 w-8 text-gray-400" />
        </div>
      )}
      
      {element.type === 'table' && (
        <div className="border border-gray-300">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-1">Lp.</th>
                <th className="border p-1">Opis</th>
                <th className="border p-1">Ilość</th>
                <th className="border p-1">Cena</th>
                <th className="border p-1">Wartość</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-1">1</td>
                <td className="border p-1">Przykładowa usługa</td>
                <td className="border p-1">1</td>
                <td className="border p-1">100,00</td>
                <td className="border p-1">100,00</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      
      {element.type === 'date' && (
        <div>{new Date().toLocaleDateString('pl-PL')}</div>
      )}
      
      {element.type === 'total' && (
        <div className="font-bold">
          <div>Razem netto: 1000,00 zł</div>
          <div>VAT 23%: 230,00 zł</div>
          <div>Razem brutto: 1230,00 zł</div>
        </div>
      )}
      
      {element.type === 'signature' && (
        <div className="border-t border-gray-400 pt-2 text-center">
          Podpis i pieczęć
        </div>
      )}
    </div>
  );
}

interface A4PreviewProps {
  template: TemplateLayout;
  selectedElementId: string | null;
  onUpdateElement: (id: string, updates: Partial<TemplateElement>) => void;
  onSelectElement: (id: string) => void;
  onDropElement: (elementType: string, position: { x: number; y: number }) => void;
}

function A4Preview({ template, selectedElementId, onUpdateElement, onSelectElement, onDropElement }: A4PreviewProps) {
  const [{ isOver }, drop] = useDrop({
    accept: ['element', 'new-element'],
    drop: (item: any, monitor) => {
      const offset = monitor.getClientOffset();
      const containerRect = document.getElementById('a4-preview')?.getBoundingClientRect();
      
      if (offset && containerRect) {
        // Account for scale transformation (0.6) and margins
        const scale = 0.6;
        const rawX = (offset.x - containerRect.left) / scale;
        const rawY = (offset.y - containerRect.top) / scale;
        
        // Convert margins from mm to pixels (assuming 96 DPI: 1mm ≈ 3.78px)
        const marginLeft = template.pageSettings?.margins?.left || 10;
        const marginTop = template.pageSettings?.margins?.top || 10;
        const marginLeftPx = marginLeft * 3.78;
        const marginTopPx = marginTop * 3.78;
        
        const x = Math.max(0, rawX - marginLeftPx);
        const y = Math.max(0, rawY - marginTopPx);
        
        if (item.elementType) {
          // New element from panel
          onDropElement(item.elementType, { x, y });
        } else if (item.id) {
          // Existing element being moved
          onUpdateElement(item.id, { position: { x, y } });
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      id="a4-preview"
      ref={drop}
      className={`relative bg-white shadow-lg mx-auto transition-all duration-200 ${
        isOver ? 'ring-2 ring-blue-400 ring-opacity-50 bg-blue-50' : ''
      }`}
      style={{
        width: '210mm',
        height: '297mm',
        transform: 'scale(0.6)',
        transformOrigin: 'top center',
        backgroundColor: template.pageSettings?.backgroundColor || '#ffffff',
        padding: `${template.pageSettings?.margins?.top || 10}mm ${template.pageSettings?.margins?.right || 10}mm ${template.pageSettings?.margins?.bottom || 10}mm ${template.pageSettings?.margins?.left || 10}mm`,
      }}
    >
      {/* Domyślne elementy faktury */}
      <div className="absolute top-4 left-4 text-xs text-gray-500">
        Edytor szablonu faktury - przeciągnij elementy z panelu bocznego
      </div>
      
      {template.elements.map((element) => (
        <DraggableElement
          key={element.id}
          element={element}
          onUpdate={onUpdateElement}
          onSelect={onSelectElement}
          isSelected={selectedElementId === element.id}
        />
      ))}
    </div>
  );
}

interface ElementPanelProps {
  onAddElement: (elementType: string) => void;
}

function ElementPanel({ onAddElement }: ElementPanelProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Elementy szablonu</h3>
      <div className="grid grid-cols-2 gap-2">
        {ELEMENT_TYPES.map(({ type, label, icon: Icon }) => {
          const [{ isDragging }, drag] = useDrag({
            type: 'new-element',
            item: { elementType: type },
            collect: (monitor) => ({
              isDragging: monitor.isDragging(),
            }),
          });

          return (
            <div
              key={type}
              ref={drag}
              className={`border rounded-lg p-3 cursor-move transition-all duration-200 ${
                isDragging 
                  ? 'opacity-50 scale-105 border-blue-400 bg-blue-50' 
                  : 'hover:bg-gray-50 hover:border-gray-400 hover:scale-105'
              }`}
              onClick={() => onAddElement(type)}
              title={`Przeciągnij ${label.toLowerCase()} na podgląd lub kliknij, aby dodać`}
            >
              <div className="flex flex-col items-center gap-2">
                <Icon className="h-6 w-6 text-gray-600" />
                <span className="text-xs text-center">{label}</span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        💡 Przeciągnij elementy na podgląd A4 lub kliknij, aby dodać
      </p>
    </div>
  );
}

interface ElementPropertiesProps {
  element: TemplateElement | null;
  onUpdate: (updates: Partial<TemplateElement>) => void;
  onDelete: () => void;
}

function ElementProperties({ element, onUpdate, onDelete }: ElementPropertiesProps) {
  if (!element) {
    return (
      <div className="space-y-4">
        <h3 className="font-medium">Właściwości elementu</h3>
        <p className="text-sm text-muted-foreground">
          Wybierz element na podglądzie, aby edytować jego właściwości
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Właściwości: {element.type}</h3>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {element.type === 'text' && (
          <div className="space-y-2">
            <Label>Treść</Label>
            <Textarea
              value={element.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              placeholder="Wprowadź tekst..."
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>Pozycja X</Label>
            <Input
              type="number"
              value={element.position.x}
              onChange={(e) => onUpdate({ 
                position: { ...element.position, x: parseInt(e.target.value) || 0 }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label>Pozycja Y</Label>
            <Input
              type="number"
              value={element.position.y}
              onChange={(e) => onUpdate({ 
                position: { ...element.position, y: parseInt(e.target.value) || 0 }
              })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>Szerokość</Label>
            <Input
              type="number"
              value={element.size.width}
              onChange={(e) => onUpdate({ 
                size: { ...element.size, width: parseInt(e.target.value) || 0 }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label>Wysokość</Label>
            <Input
              type="number"
              value={element.size.height}
              onChange={(e) => onUpdate({ 
                size: { ...element.size, height: parseInt(e.target.value) || 0 }
              })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Rozmiar czcionki</Label>
          <Input
            type="number"
            value={element.styles.fontSize}
            onChange={(e) => onUpdate({ 
              styles: { ...element.styles, fontSize: parseInt(e.target.value) || 12 }
            })}
          />
        </div>

        <div className="space-y-2">
          <Label>Kolor tekstu</Label>
          <Input
            type="color"
            value={element.styles.color}
            onChange={(e) => onUpdate({ 
              styles: { ...element.styles, color: e.target.value }
            })}
          />
        </div>

        <div className="space-y-2">
          <Label>Wyrównanie</Label>
          <div className="flex gap-1">
            <Button
              variant={element.styles.textAlign === 'left' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onUpdate({ 
                styles: { ...element.styles, textAlign: 'left' }
              })}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant={element.styles.textAlign === 'center' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onUpdate({ 
                styles: { ...element.styles, textAlign: 'center' }
              })}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant={element.styles.textAlign === 'right' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onUpdate({ 
                styles: { ...element.styles, textAlign: 'right' }
              })}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={element.styles.fontWeight === 'bold'}
            onCheckedChange={(checked) => onUpdate({ 
              styles: { ...element.styles, fontWeight: checked ? 'bold' : 'normal' }
            })}
          />
          <Label>Pogrubienie</Label>
        </div>
      </div>
    </div>
  );
}

export function InvoiceTemplateEditor() {
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([
    {
      id: '1',
      name: 'Standardowy szablon VAT',
      type: 'vat',
      layout: {
        elements: [
          {
            id: '1',
            type: 'text',
            position: { x: 50, y: 50 },
            size: { width: 200, height: 40 },
            content: 'FAKTURA VAT',
            styles: {
              fontSize: 24,
              fontWeight: 'bold',
              color: '#000000',
              textAlign: 'center'
            }
          },
          {
            id: '2',
            type: 'text',
            position: { x: 400, y: 60 },
            size: { width: 150, height: 20 },
            content: 'Nr: {{INVOICE_NUMBER}}',
            styles: {
              fontSize: 14,
              fontWeight: 'normal',
              textAlign: 'right',
              color: '#000000'
            }
          },
          {
            id: '3',
            type: 'text',
            position: { x: 50, y: 120 },
            size: { width: 250, height: 100 },
            content: 'Sprzedawca:\n{{COMPANY_NAME}}\n{{COMPANY_ADDRESS}}\nNIP: {{COMPANY_NIP}}',
            styles: {
              fontSize: 12,
              fontWeight: 'normal',
              textAlign: 'left',
              color: '#000000'
            }
          },
          {
            id: '4',
            type: 'text',
            position: { x: 350, y: 120 },
            size: { width: 250, height: 100 },
            content: 'Nabywca:\n{{CLIENT_NAME}}\n{{CLIENT_ADDRESS}}\nNIP: {{CLIENT_NIP}}',
            styles: {
              fontSize: 12,
              fontWeight: 'normal',
              textAlign: 'left',
              color: '#000000'
            }
          }
        ],
        pageSettings: {
          format: 'A4',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
          backgroundColor: '#ffffff'
        },
        styles: {
          fontFamily: 'Arial',
          primaryColor: '#2563eb',
          secondaryColor: '#64748b',
          textColor: '#000000'
        }
      },
      isDefault: true,
      isActive: true,
      createdAt: '2024-12-01',
      lastModified: '2024-12-01'
    }
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<InvoiceTemplate | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const handleEditTemplate = (template: InvoiceTemplate) => {
    setCurrentTemplate(template);
    setIsEditing(true);
    setSelectedElementId(null);
  };

  const handleCreateTemplate = () => {
    const newTemplate: InvoiceTemplate = {
      id: Date.now().toString(),
      name: 'Nowy szablon',
      type: 'vat',
      layout: {
        elements: [],
        pageSettings: {
          format: 'A4',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
          backgroundColor: '#ffffff'
        },
        styles: {
          fontFamily: 'Arial',
          primaryColor: '#2563eb',
          secondaryColor: '#64748b',
          textColor: '#000000'
        }
      },
      isDefault: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    
    setCurrentTemplate(newTemplate);
    setIsEditing(true);
    setSelectedElementId(null);
  };

  const handleSaveTemplate = () => {
    if (!currentTemplate) return;

    setTemplates(prev => {
      const existing = prev.find(t => t.id === currentTemplate.id);
      if (existing) {
        return prev.map(t => t.id === currentTemplate.id ? currentTemplate : t);
      } else {
        return [...prev, currentTemplate];
      }
    });

    setIsEditing(false);
    toast.success('Szablon został zapisany');
  };

  const handleAddElement = useCallback((elementType: string) => {
    if (!currentTemplate) return;

    const newElement: TemplateElement = {
      id: Date.now().toString(),
      type: elementType as any,
      position: { x: 100, y: 100 },
      size: { width: 200, height: 50 },
      content: elementType === 'text' ? 'Nowy tekst' : '',
      styles: {
        fontSize: 14,
        fontWeight: 'normal',
        color: '#000000',
        textAlign: 'left'
      }
    };

    setCurrentTemplate(prev => prev ? {
      ...prev,
      layout: {
        ...prev.layout,
        elements: [...prev.layout.elements, newElement]
      }
    } : null);
  }, [currentTemplate]);

  const handleDropElement = useCallback((elementType: string, position: { x: number; y: number }) => {
    if (!currentTemplate) return;

    const newElement: TemplateElement = {
      id: Date.now().toString(),
      type: elementType as any,
      position,
      size: { width: 200, height: 50 },
      content: elementType === 'text' ? 'Nowy tekst' : '',
      styles: {
        fontSize: 14,
        fontWeight: 'normal',
        color: '#000000',
        textAlign: 'left'
      }
    };

    setCurrentTemplate(prev => prev ? {
      ...prev,
      layout: {
        ...prev.layout,
        elements: [...prev.layout.elements, newElement]
      }
    } : null);
  }, [currentTemplate]);

  const handleUpdateElement = useCallback((id: string, updates: Partial<TemplateElement>) => {
    if (!currentTemplate) return;

    setCurrentTemplate(prev => prev ? {
      ...prev,
      layout: {
        ...prev.layout,
        elements: prev.layout.elements.map(el => 
          el.id === id ? { ...el, ...updates } : el
        )
      }
    } : null);
  }, [currentTemplate]);

  const handleDeleteElement = useCallback(() => {
    if (!currentTemplate || !selectedElementId) return;

    setCurrentTemplate(prev => prev ? {
      ...prev,
      layout: {
        ...prev.layout,
        elements: prev.layout.elements.filter(el => el.id !== selectedElementId)
      }
    } : null);

    setSelectedElementId(null);
  }, [currentTemplate, selectedElementId]);

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('Czy na pewno chcesz usunąć ten szablon?')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      toast.success('Szablon został usunięty');
    }
  };

  const handleDuplicateTemplate = (template: InvoiceTemplate) => {
    const duplicatedTemplate: InvoiceTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (kopia)`,
      isDefault: false,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    
    setTemplates(prev => [...prev, duplicatedTemplate]);
    toast.success('Szablon został zduplikowany');
  };

  const handlePreviewTemplate = (template: InvoiceTemplate) => {
    // In a real app, this would open a print preview or PDF generation
    toast.info(`Podgląd szablonu: ${template.name}`);
  };

  const selectedElement = currentTemplate?.layout.elements.find(el => el.id === selectedElementId) || null;

  if (isEditing && currentTemplate) {
    return (
      <DndProvider backend={HTML5Backend}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1>Edytor szablonu: {currentTemplate.name}</h1>
              <p className="text-muted-foreground">
                Przeciągnij elementy z panelu bocznego na podgląd faktury
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Anuluj
              </Button>
              <Button onClick={handleSaveTemplate}>
                <Save className="mr-2 h-4 w-4" />
                Zapisz
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6">
            <div className="col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Elementy</CardTitle>
                </CardHeader>
                <CardContent>
                  <ElementPanel onAddElement={handleAddElement} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Właściwości</CardTitle>
                </CardHeader>
                <CardContent>
                  <ElementProperties
                    element={selectedElement}
                    onUpdate={(updates) => {
                      if (selectedElementId) {
                        handleUpdateElement(selectedElementId, updates);
                      }
                    }}
                    onDelete={handleDeleteElement}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="col-span-3">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Podgląd A4</CardTitle>
                  <CardDescription>
                    Kliknij na element, aby go wybrać. Przeciągaj, aby zmieniać pozycję.
                  </CardDescription>
                </CardHeader>
                <CardContent className="overflow-auto" style={{ height: 'calc(100vh - 200px)' }}>
                  <A4Preview
                    template={currentTemplate.layout}
                    selectedElementId={selectedElementId}
                    onUpdateElement={handleUpdateElement}
                    onSelectElement={setSelectedElementId}
                    onDropElement={handleDropElement}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DndProvider>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Edytor szablonów faktur</h1>
          <p className="text-muted-foreground">
            Zarządzaj wzorami dokumentów z edytorem drag & drop
          </p>
        </div>
        <Button onClick={handleCreateTemplate}>
          <Plus className="mr-2 h-4 w-4" />
          Nowy szablon
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className={`${template.isDefault ? 'ring-2 ring-blue-500' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                {template.isDefault && (
                  <Badge variant="default">Domyślny</Badge>
                )}
              </div>
              <CardDescription>
                Typ: {template.type} • {template.layout.elements.length} elementów
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                <p><span className="font-medium">Ostatnia modyfikacja:</span> {new Date(template.lastModified).toLocaleDateString('pl-PL')}</p>
                <p><span className="font-medium">Format:</span> {template.layout.pageSettings.format}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditTemplate(template)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edytuj
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePreviewTemplate(template)}
                  title="Podgląd"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDuplicateTemplate(template)}
                  title="Duplikuj"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                {!template.isDefault && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                    title="Usuń"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}