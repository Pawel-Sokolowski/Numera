/**
 * Document Storage Service
 * 
 * Provides document storage capabilities that work in both full deployment (with backend)
 * and static deployment (GitHub Pages) modes using LocalStorage.
 */

export interface StoredDocument {
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
  // File data stored as base64 for LocalStorage
  fileData?: string;
  fileName?: string;
}

const STORAGE_KEY = 'numera_documents';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit for LocalStorage

/**
 * Get all documents from LocalStorage
 */
export function getDocuments(): StoredDocument[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading documents from storage:', error);
    return [];
  }
}

/**
 * Save a document to LocalStorage
 */
export function saveDocument(document: StoredDocument): boolean {
  try {
    const documents = getDocuments();
    
    // Check if document already exists
    const existingIndex = documents.findIndex(d => d.id === document.id);
    
    if (existingIndex >= 0) {
      documents[existingIndex] = document;
    } else {
      documents.push(document);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    return true;
  } catch (error) {
    console.error('Error saving document to storage:', error);
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded. Please delete some documents or reduce file sizes.');
    }
    return false;
  }
}

/**
 * Delete a document from LocalStorage
 */
export function deleteDocument(documentId: string): boolean {
  try {
    const documents = getDocuments();
    const filtered = documents.filter(d => d.id !== documentId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting document from storage:', error);
    return false;
  }
}

/**
 * Update a document in LocalStorage
 */
export function updateDocument(documentId: string, updates: Partial<StoredDocument>): boolean {
  try {
    const documents = getDocuments();
    const index = documents.findIndex(d => d.id === documentId);
    
    if (index === -1) {
      return false;
    }
    
    documents[index] = { ...documents[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    return true;
  } catch (error) {
    console.error('Error updating document in storage:', error);
    return false;
  }
}

/**
 * Convert File to base64 for storage
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      reject(new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Convert base64 to Blob for download
 */
export function base64ToBlob(base64: string): Blob {
  const parts = base64.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
  const bstr = atob(parts[1]);
  const n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  
  return new Blob([u8arr], { type: mime });
}

/**
 * Download a document
 */
export function downloadDocument(document: StoredDocument): void {
  if (!document.fileData) {
    throw new Error('Document has no file data');
  }

  const blob = base64ToBlob(document.fileData);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = document.fileName || document.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Get storage usage information
 */
export function getStorageInfo(): { used: number; available: number; percentage: number } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const used = stored ? new Blob([stored]).size : 0;
    const available = 5 * 1024 * 1024; // Approximate localStorage limit
    const percentage = (used / available) * 100;
    
    return { used, available, percentage };
  } catch (error) {
    return { used: 0, available: 0, percentage: 0 };
  }
}

/**
 * Clear all documents from storage
 */
export function clearAllDocuments(): void {
  localStorage.removeItem(STORAGE_KEY);
}
