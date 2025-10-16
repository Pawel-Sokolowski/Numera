import { useEffect, useState } from 'react';
import { Info, X } from 'lucide-react';
import { isBackendAvailable } from '../../utils/backendDetection';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';

export function StaticModeBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isStatic, setIsStatic] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkBackend = async () => {
      const backendAvailable = await isBackendAvailable();
      setIsStatic(!backendAvailable);
      
      // Check if banner was previously dismissed
      const wasDismissed = localStorage.getItem('staticModeBannerDismissed') === 'true';
      setDismissed(wasDismissed);
      
      if (!backendAvailable && !wasDismissed) {
        setShowBanner(true);
      }
    };

    checkBackend();
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    setShowBanner(false);
    localStorage.setItem('staticModeBannerDismissed', 'true');
  };

  if (!showBanner || !isStatic || dismissed) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Tryb statyczny (GitHub Pages):</strong> Aplikacja działa w trybie demonstracyjnym. 
              Wszystkie dane są przechowywane lokalnie w przeglądarce. Niektóre funkcje wymagające serwera 
              mogą być niedostępne.
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleDismiss}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
