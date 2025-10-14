# Static Deployment Guide (GitHub Pages)

This guide explains the differences between static deployment (e.g., GitHub Pages) and full deployment with backend server.

---

## Overview

The Office Management System can be deployed in two ways:

1. **Full Deployment** (with backend server) - All features available
2. **Static Deployment** (GitHub Pages) - Limited features, browser-based storage

---

## Static Deployment (GitHub Pages)

### How It Works

When deployed to GitHub Pages or any static hosting:
- No backend server is available
- The app automatically detects this and enters "static mode"
- Documents are stored in browser's LocalStorage
- All PDF generation features work client-side

### Features Available

✅ **Working Features:**
- Document upload with file storage in browser
- Document download from LocalStorage
- PDF form generation (UPL-1, PEL, etc.)
- Invoice PDF generation
- Client management (stored in memory/LocalStorage)
- All UI components and navigation

### Features Limited

⚠️ **Limited Features:**
- **Document Storage**: Limited to ~5MB per file, ~10MB total
- **Persistence**: Documents only persist in the same browser
- **No Server-Side Processing**: No database queries or API calls
- **No Multi-User Support**: Each browser has its own data

❌ **Not Available:**
- Database integration
- User authentication with backend
- Email integration
- File sync across devices
- Large file uploads (>5MB)

### Deployment Instructions

The application is already configured for GitHub Pages deployment:

1. **Build the app**:
```bash
npm run build
```

2. **Deploy to GitHub Pages**:
   - The `.github/workflows/github-pages.yml` workflow automatically deploys on push to `main`
   - Or manually trigger deployment from GitHub Actions tab

3. **Access the app**:
   - URL: `https://[username].github.io/Numera/`
   - Example: `https://pawel-sokolowski.github.io/Numera/`

### User Experience

When users access the static deployment:

1. **Alert Banner**: They see an informative message:
   ```
   Tryb statyczny (GitHub Pages): Dokumenty są przechowywane lokalnie w przeglądarce. 
   Aby uzyskać pełną funkcjonalność z bazą danych, wdróż aplikację z serwerem backend.
   ```

2. **File Upload**: When uploading documents:
   - File selection dialog appears
   - File is converted to base64 and stored in LocalStorage
   - Success message: "Dokument został zapisany w pamięci lokalnej"

3. **File Download**: When downloading documents:
   - File is reconstructed from base64
   - Browser download is triggered
   - Success message: "Pobrano dokument: [filename]"

### Storage Limits

- **Per-file limit**: 5MB
- **Total storage**: ~5-10MB (browser dependent)
- **Storage location**: Browser's LocalStorage
- **Data persistence**: Only in the same browser, cleared if user clears browser data

---

## Full Deployment (with Backend)

### How It Works

When deployed with a backend server:
- Full PostgreSQL database integration
- All features enabled
- Multi-user support with authentication
- File storage in database or file system
- Email integration and other server-side features

### Setup Instructions

See [PWA_DEPLOYMENT.md](PWA_DEPLOYMENT.md) for full deployment instructions.

---

## Feature Comparison Table

| Feature | Static (GitHub Pages) | Full (with Backend) |
|---------|----------------------|---------------------|
| Document Upload | ✅ (LocalStorage, <5MB) | ✅ (Database, unlimited) |
| Document Download | ✅ | ✅ |
| PDF Generation | ✅ | ✅ |
| Client Management | ✅ (Memory only) | ✅ (Database) |
| User Authentication | ❌ | ✅ |
| Database Integration | ❌ | ✅ |
| Email Integration | ❌ | ✅ |
| Multi-User Support | ❌ | ✅ |
| Data Persistence | ⚠️ (Browser only) | ✅ (Server) |
| File Size Limit | 5MB | Unlimited |

---

## Technical Implementation

### Backend Detection

The app uses `src/utils/backendDetection.ts` to check if a backend is available:

```typescript
import { isBackendAvailable } from '../utils/backendDetection';

// In component
const [hasBackend, setHasBackend] = useState<boolean | null>(null);

useEffect(() => {
  isBackendAvailable().then(setHasBackend);
}, []);
```

### LocalStorage Document Management

Documents in static mode are managed via `src/utils/documentStorage.ts`:

```typescript
import { 
  saveDocument, 
  getDocuments, 
  downloadDocument,
  deleteDocument 
} from '../utils/documentStorage';

// Save document
const doc: StoredDocument = { /* ... */ };
saveDocument(doc);

// Get all documents
const docs = getDocuments();

// Download document
downloadDocument(doc);

// Delete document
deleteDocument(docId);
```

---

## Troubleshooting

### "Storage quota exceeded" error

**Solution**: 
- Delete some documents to free up space
- Use smaller file sizes (compress PDFs before upload)
- Clear browser data and start fresh

### Documents disappear after closing browser

**Cause**: User cleared browser data or used incognito mode

**Solution**: 
- Don't use incognito/private browsing
- Avoid clearing browser data
- For permanent storage, deploy with backend

### File upload doesn't work

**Possible causes**:
1. File too large (>5MB)
2. Browser storage full
3. Unsupported file type

**Solution**:
- Check file size
- Clear some documents
- Use supported formats (PDF, DOC, DOCX, XLS, XLSX, images)

---

## Best Practices

### For Users

1. **Regular Backups**: Download important documents regularly
2. **File Size**: Keep files under 2MB for best performance
3. **Browser**: Use modern browsers (Chrome, Firefox, Edge, Safari)
4. **Storage**: Monitor storage usage, clear old documents

### For Developers

1. **Error Handling**: Always handle QuotaExceededError
2. **File Validation**: Check file size before upload
3. **User Feedback**: Show clear messages about storage limitations
4. **Graceful Degradation**: Features should work in both modes

---

## Migration Path

To migrate from static to full deployment:

1. **Export Data**: Download all documents from static deployment
2. **Deploy Backend**: Follow [PWA_DEPLOYMENT.md](PWA_DEPLOYMENT.md)
3. **Import Data**: Re-upload documents to full deployment
4. **Update DNS**: Point domain to new deployment

---

## Support

For issues or questions:
- **GitHub Issues**: https://github.com/Pawel-Sokolowski/Numera/issues
- **Documentation**: /docs/README.md

---

**Version**: 1.0.0  
**Last Updated**: October 2025
