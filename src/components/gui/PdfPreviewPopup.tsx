import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Download, X, Loader2 } from "lucide-react";
import { toast } from 'sonner';

interface PdfPreviewPopupProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string | null;
  fileName: string;
  onDownload?: () => void;
}

export function PdfPreviewPopup({ 
  isOpen, 
  onClose, 
  pdfUrl,
  fileName,
  onDownload
}: PdfPreviewPopupProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && pdfUrl) {
      setIsLoading(true);
    }
  }, [isOpen, pdfUrl]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleDownload = () => {
    if (!pdfUrl) {
      toast.error("PDF nie jest dostępny");
      return;
    }

    if (onDownload) {
      onDownload();
    } else {
      // Default download behavior
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = fileName;
      link.click();
      toast.success("PDF został pobrany");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[80vw] max-h-[80vh] h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center justify-between">
            <span>Podgląd PDF - {fileName}</span>
          </DialogTitle>
          <DialogDescription>
            Możesz wypełnić puste pola w dokumencie. Kliknij "Pobierz", aby zapisać wypełniony formularz.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 relative bg-gray-100 overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Ładowanie PDF...</p>
              </div>
            </div>
          )}
          
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title="PDF Preview"
              onLoad={handleIframeLoad}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Brak PDF do wyświetlenia</p>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-white gap-2">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Zamknij
          </Button>
          <Button onClick={handleDownload} disabled={!pdfUrl}>
            <Download className="mr-2 h-4 w-4" />
            Pobierz PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
