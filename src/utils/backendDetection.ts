/**
 * Backend Detection Utility
 * 
 * Detects if the application is running with a backend server or as a static-only deployment (e.g., GitHub Pages).
 * This allows the app to gracefully handle features that require server-side functionality.
 */

let backendAvailable: boolean | null = null;
let checkPromise: Promise<boolean> | null = null;

/**
 * Check if the backend server is available
 * @returns Promise<boolean> - true if backend is available, false otherwise
 */
export async function isBackendAvailable(): Promise<boolean> {
  // Return cached result if available
  if (backendAvailable !== null) {
    return backendAvailable;
  }

  // Return existing check if in progress
  if (checkPromise) {
    return checkPromise;
  }

  // Start new check
  checkPromise = (async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      const response = await fetch('/api/health', {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-cache'
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        backendAvailable = true;
        return true;
      }
    } catch (error) {
      // Backend not available - likely static deployment
      console.info('Backend not available - running in static mode (e.g., GitHub Pages)');
    }

    backendAvailable = false;
    return false;
  })();

  return checkPromise;
}

/**
 * Reset the backend availability check (useful for testing)
 */
export function resetBackendCheck(): void {
  backendAvailable = null;
  checkPromise = null;
}

/**
 * Get deployment mode
 * @returns 'full' | 'static' | 'unknown'
 */
export async function getDeploymentMode(): Promise<'full' | 'static' | 'unknown'> {
  if (backendAvailable === null) {
    await isBackendAvailable();
  }
  
  return backendAvailable === true ? 'full' : 
         backendAvailable === false ? 'static' : 
         'unknown';
}
