import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { PdfFieldDetector, FieldDetectionResult, DetectedField } from '../utils/pdfFieldDetector';
import { Loader2, Upload, Download, Eye, Edit2, Check, X } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '../lib/utils';

interface PdfFieldDetectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PdfFieldDetectorDialog({ open, onOpenChange }: PdfFieldDetectorDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionResult, setDetectionResult] = useState<FieldDetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formType, setFormType] = useState('');
  const [formVersion, setFormVersion] = useState('2023');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editedFields, setEditedFields] = useState<Record<string, DetectedField>>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
      setDetectionResult(null);
    } else {
      setError('Please select a valid PDF file');
    }
  };

  const handleDetect = async () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    if (!formType) {
      setError('Please enter a form type (e.g., UPL-1, PEL)');
      return;
    }

    setIsDetecting(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const detector = new PdfFieldDetector();
      const result = await detector.detectFields(arrayBuffer);
      
      setDetectionResult(result);
      
      // Initialize edited fields with detected fields
      const fieldsMap: Record<string, DetectedField> = {};
      result.fields.forEach(field => {
        fieldsMap[field.name] = { ...field };
      });
      setEditedFields(fieldsMap);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to detect fields');
      console.error('Detection error:', err);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleFieldEdit = (fieldName: string, property: keyof DetectedField, value: any) => {
    setEditedFields(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        [property]: value
      }
    }));
  };

  const handleDeleteField = (fieldName: string) => {
    setEditedFields(prev => {
      const newFields = { ...prev };
      delete newFields[fieldName];
      return newFields;
    });
  };

  const handleDownloadMapping = () => {
    if (!detectionResult) return;

    const detector = new PdfFieldDetector();
    
    // Use edited fields instead of original detection result
    const modifiedResult = {
      ...detectionResult,
      fields: Object.values(editedFields)
    };
    
    const mapping = detector.generateMapping(modifiedResult, formVersion);
    
    const blob = new Blob([JSON.stringify(mapping, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formType}_mapping.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFile(null);
    setDetectionResult(null);
    setError(null);
    setFormType('');
    setEditedFields({});
    setEditingField(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Automated PDF Field Detection</DialogTitle>
          <DialogDescription>
            Upload a PDF form to automatically detect form fields using OCR and image processing.
            Review and adjust the detected fields before downloading the mapping file.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload Section */}
          <div className="space-y-2">
            <Label htmlFor="pdf-file">PDF File</Label>
            <div className="flex gap-2">
              <Input
                id="pdf-file"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={isDetecting}
              />
              {file && (
                <span className="text-sm text-muted-foreground flex items-center">
                  {file.name}
                </span>
              )}
            </div>
          </div>

          {/* Form Type Input */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="form-type">Form Type</Label>
              <Input
                id="form-type"
                placeholder="e.g., UPL-1, PEL, ZAW-FA"
                value={formType}
                onChange={(e) => setFormType(e.target.value.toUpperCase())}
                disabled={isDetecting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="form-version">Form Version</Label>
              <Input
                id="form-version"
                placeholder="e.g., 2023"
                value={formVersion}
                onChange={(e) => setFormVersion(e.target.value)}
                disabled={isDetecting}
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Detect Button */}
          <Button
            onClick={handleDetect}
            disabled={!file || !formType || isDetecting}
            className="w-full"
          >
            {isDetecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Detecting fields...
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Detect Fields
              </>
            )}
          </Button>

          {/* Detection Results */}
          {detectionResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Detected Fields ({Object.keys(editedFields).length})
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <X className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                  <Button size="sm" onClick={handleDownloadMapping}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Mapping
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-[400px] border rounded-md p-4">
                <div className="space-y-2">
                  {Object.entries(editedFields).map(([fieldName, field]) => (
                    <div
                      key={fieldName}
                      className="p-3 border rounded-md space-y-2 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-1">
                          {editingField === fieldName ? (
                            <div className="space-y-2">
                              <Input
                                value={field.name}
                                onChange={(e) => handleFieldEdit(fieldName, 'name', e.target.value)}
                                placeholder="Field name"
                                className="h-8"
                              />
                              <Input
                                value={field.label}
                                onChange={(e) => handleFieldEdit(fieldName, 'label', e.target.value)}
                                placeholder="Field label"
                                className="h-8"
                              />
                              <div className="grid grid-cols-4 gap-2">
                                <Input
                                  type="number"
                                  value={field.x}
                                  onChange={(e) => handleFieldEdit(fieldName, 'x', parseInt(e.target.value))}
                                  placeholder="X"
                                  className="h-8"
                                />
                                <Input
                                  type="number"
                                  value={field.y}
                                  onChange={(e) => handleFieldEdit(fieldName, 'y', parseInt(e.target.value))}
                                  placeholder="Y"
                                  className="h-8"
                                />
                                <Input
                                  type="number"
                                  value={field.width}
                                  onChange={(e) => handleFieldEdit(fieldName, 'width', parseInt(e.target.value))}
                                  placeholder="Width"
                                  className="h-8"
                                />
                                <Input
                                  type="number"
                                  value={field.height}
                                  onChange={(e) => handleFieldEdit(fieldName, 'height', parseInt(e.target.value))}
                                  placeholder="Height"
                                  className="h-8"
                                />
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-medium">{field.name}</span>
                                {field.label && (
                                  <span className="text-sm text-muted-foreground">- {field.label}</span>
                                )}
                                <span className={cn(
                                  "text-xs px-2 py-0.5 rounded",
                                  field.type === 'text' && "bg-blue-100 text-blue-700",
                                  field.type === 'checkbox' && "bg-green-100 text-green-700",
                                  field.type === 'signature' && "bg-purple-100 text-purple-700"
                                )}>
                                  {field.type}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground font-mono">
                                Page {field.page} | x: {field.x}, y: {field.y} | 
                                {field.width}×{field.height} | 
                                Confidence: {(field.confidence * 100).toFixed(0)}%
                              </div>
                            </>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {editingField === fieldName ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingField(null)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingField(fieldName)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteField(fieldName)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Summary */}
              <div className="p-3 bg-muted rounded-md text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>Pages: {detectionResult.pageCount}</div>
                  <div>Fields: {Object.keys(editedFields).length}</div>
                  <div>Page Size: {detectionResult.pageSize.width} × {detectionResult.pageSize.height}</div>
                  <div>Rectangles: {detectionResult.rectangles.length}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
