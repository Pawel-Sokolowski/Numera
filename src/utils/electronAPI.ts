// Browser-compatible mock for Electron APIs
interface ElectronAPI {
  getVersion: () => Promise<string>;
  showMessageBox: (options: any) => Promise<any>;
  showSaveDialog: (options: any) => Promise<any>;
  showOpenDialog: (options: any) => Promise<any>;
  dbQuery: (query: string, params?: any[]) => Promise<any>;
  dbSetupCheck?: () => Promise<any>;
  dbSetupTestConnection?: (config: any) => Promise<any>;
  dbSetupRun?: (config: any) => Promise<any>;
  selectFile: () => Promise<any>;
  saveFile: (data: any, filePath: string) => Promise<any>;
  platform: string;
  isElectron: boolean;
}

// Check if we're running in Electron
const isElectron = !!(window as any).electronAPI;

// Mock Electron API for browser environment
const mockElectronAPI: ElectronAPI = {
  getVersion: async () => '1.0.0-web',
  
  showMessageBox: async (options) => {
    // Use browser's built-in alert/confirm for basic dialogs
    if (options.type === 'question') {
      return { response: window.confirm(options.message) ? 0 : 1 };
    } else {
      window.alert(options.message);
      return { response: 0 };
    }
  },
  
  showSaveDialog: async (options) => {
    // In browser, we'll use download functionality
    const filename = prompt('Enter filename:', options.defaultPath || 'file.txt');
    return { 
      canceled: !filename,
      filePath: filename || ''
    };
  },
  
  showOpenDialog: async (options) => {
    // Create a hidden file input for file selection
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = options.properties?.includes('multiSelections') || false;
      
      if (options.filters) {
        const extensions = options.filters.flatMap((f: any) => f.extensions);
        input.accept = extensions.map((ext: string) => `.${ext}`).join(',');
      }
      
      input.onchange = (e) => {
        const files = Array.from((e.target as HTMLInputElement).files || []);
        resolve({
          canceled: files.length === 0,
          filePaths: files.map(f => f.name)
        });
      };
      
      input.oncancel = () => {
        resolve({ canceled: true, filePaths: [] });
      };
      
      input.click();
    });
  },
  
  dbQuery: async (query: string, params?: any[]) => {
    // In browser mode, make HTTP requests to the API server
    try {
      const response = await fetch('/api/db-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, params })
      });
      return await response.json();
    } catch (error) {
      console.error('Database query error:', error);
      return { success: false, error: 'Database query failed' };
    }
  },
  
  selectFile: async () => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        resolve(file ? { filePath: file.name, file } : null);
      };
      
      input.oncancel = () => resolve(null);
      input.click();
    });
  },
  
  saveFile: async (data: any, filePath: string) => {
    // In browser, trigger a download
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filePath;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return { success: true };
    } catch (error) {
      console.error('Save file error:', error);
      return { success: false, error: 'Failed to save file' };
    }
  },
  
  platform: navigator.platform,
  isElectron: false
};

// Export the appropriate API based on environment
export const electronAPI: ElectronAPI = isElectron 
  ? (window as any).electronAPI 
  : mockElectronAPI;

export { isElectron };