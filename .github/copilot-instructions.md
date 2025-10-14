# GitHub Copilot Instructions for Numera

## Project Overview

Numera is a comprehensive office management system built as a **Progressive Web Application (PWA)** with React, TypeScript, and PostgreSQL. The system specializes in PDF form filling for official Polish government forms using template-based approaches.

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL
- **PDF Libraries**: pdf-lib (primary), jsPDF, pdfmake
- **UI Components**: Radix UI, Tailwind CSS
- **Testing**: No formal test framework (manual testing)

## Core Guidelines

### 1. TypeScript Best Practices

- Use strict TypeScript with proper type annotations
- Leverage existing type definitions in `src/types/`
- Use interfaces for data structures (e.g., `Client`, `User`, `Invoice`)
- Avoid `any` types - use proper type inference or explicit types
- Follow functional programming patterns where appropriate
- Use async/await for asynchronous operations

### 2. React Patterns

- Use functional components with hooks (useState, useEffect, useContext)
- Follow existing component structure in `src/components/`
- Maintain responsive design patterns for desktop, tablet, and mobile
- Use Radix UI components for consistent UI elements
- Implement proper error boundaries and loading states
- Keep components focused and maintainable

### 3. Code Structure and Organization

- Maintain existing directory structure:
  - `src/components/` - React components
  - `src/utils/` - Utility functions and services
  - `src/types/` - TypeScript type definitions
  - `src/contexts/` - React context providers
  - `server/` - Express backend code
  - `scripts/` - Database setup and utility scripts
  - `docs/` - Comprehensive documentation
- Use dependency injection patterns where appropriate
- Keep business logic separate from UI components
- Create service classes for complex functionality

### 4. PDF Form Filling

**Critical**: This is a core feature of the application. Follow these guidelines:

- **Use Template-Based Approach**: Always fill existing official PDF templates, never generate PDFs programmatically for government forms
- **Primary Library**: Use `pdf-lib` for official form filling
- **Official Templates**: All government form PDFs are located in `public/pdf-templates/` and `PDFFile/`
- **DO NOT MODIFY**: Never change files in the `PDFFile/` folder - these are official government forms
- **Coordinate-Based Placement**: Use coordinate mapping in `mapping.json` files for field positioning
- **Polish Character Support**: Ensure full support for Polish characters (ą, ć, ę, ł, ń, ó, ś, ź, ż)
- **Form Types**: Support UPL-1, PEL, PIT-37, PIT-R, ZAW-FA, and other Polish tax/administrative forms

### 5. Documentation

- Update documentation when making significant changes
- Key documentation locations:
  - `docs/features/` - Feature implementation guides
  - `docs/guides/` - User and developer guides
  - `docs/fixes/` - Bug fixes and improvements
  - `README.md` files in feature directories
- **Suggest changes to the `docs/` folder** when:
  - Adding new features or significant functionality
  - Changing existing APIs or service interfaces
  - Modifying PDF form filling behavior
  - Adding new form types or templates
- Follow existing documentation style and structure
- Include code examples and usage instructions

### 6. Testing Approach

**Note**: This project uses manual testing, not automated unit tests.

- Test changes manually in the browser
- Use existing test scripts in `scripts/` directory:
  - `test-upl1-coordinates.js` - Test UPL-1 form coordinates
  - `test-field-detection.js` - Test PDF field detection
- Test with real data when possible
- Verify PDF generation outputs manually
- Test edge cases:
  - Missing optional fields
  - Very long text values
  - Special/Polish characters
  - Negative numbers and zero values
- Document test results and scenarios

### 7. Error Handling

- Use try-catch blocks for async operations
- Provide clear, user-friendly error messages
- Log errors appropriately (console.error or winston logger)
- Handle missing templates gracefully with helpful error messages
- Validate input data before processing
- Return meaningful error responses from API endpoints

### 8. Security Practices

- Never commit secrets or credentials to source code
- Use environment variables for sensitive configuration (`.env` files)
- Implement proper input validation using `validator` library
- Use JWT for authentication (already implemented)
- Sanitize user inputs to prevent XSS attacks
- Follow role-based access control patterns

### 9. Database Operations

- Use PostgreSQL with parameterized queries to prevent SQL injection
- Follow existing database schema in `src/database/`
- Use connection pooling for efficiency
- Handle database errors gracefully
- Test database operations with the setup script: `npm run setup-db`

### 10. API Development

- Follow RESTful conventions for API endpoints
- Use Express middleware for common operations
- Implement rate limiting (already configured)
- Use CORS properly for cross-origin requests
- Return consistent response formats
- Document API endpoints when adding new ones

## Common Tasks

### Adding New PDF Form Templates

1. Place official PDF in `public/pdf-templates/[FORM-TYPE]/[YEAR]/`
2. Create or update `mapping.json` with field coordinates
3. Add README.md with usage instructions
4. Update `TaxFormService` or create new generator class
5. Test thoroughly with real data
6. Document in `docs/features/` or `docs/guides/`

### Adding New Features

1. Review existing architecture and patterns
2. Create feature branch from main
3. Implement following existing code patterns
4. Update documentation in `docs/`
5. Test manually with various scenarios
6. Create summary document if significant change

### Updating Dependencies

- Be cautious with major version updates
- Test thoroughly after updates
- Update package.json and package-lock.json
- Check for breaking changes in changelogs
- Verify PDF generation still works

## File and Folder Conventions

### Protected Directories

- **DO NOT MODIFY**: `PDFFile/` - Official government forms
- **Careful with**: `public/pdf-templates/` - Template directory structure
- **Archive**: `docs/archive/` - Historical documentation (do not edit)

### Configuration Files

- `.env.example` - Environment variable template
- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies and scripts

### Documentation Style

- Use Markdown format
- Include code examples with syntax highlighting
- Add clear section headers
- Provide usage instructions
- Document assumptions and requirements
- Link to related documentation

## Performance Considerations

- Minimize bundle size (code splitting already implemented)
- Cache PDF templates in browser
- Use lazy loading for large components
- Optimize database queries
- Compress PDFs when possible
- Use service workers for offline support (PWA)

## Browser Compatibility

- Support modern browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Test PWA functionality across devices
- Ensure responsive design works on mobile, tablet, and desktop
- Verify PDF generation works in all supported browsers

## Development Workflow

1. Install dependencies: `npm ci`
2. Run development server: `npm run dev`
3. Build for production: `npm run build`
4. Preview build: `npm run preview`
5. Setup database: `npm run setup-db`

## Key Services and Utilities

- **TaxFormService** (`src/utils/taxFormService.ts`) - Core PDF form filling service
- **AuthorizationFormGenerator** (`src/utils/authorizationFormGenerator.ts`) - Form generation
- **PDFGenerator** (`src/utils/pdfGenerator.ts`) - Invoice and custom PDF generation
- **UniversalPdfFiller** (`src/utils/universalPdfFiller.ts`) - Universal form filling
- **PdfFieldDetector** (`src/utils/pdfFieldDetector.ts`) - OCR-based field detection

## Resources

- **Main Documentation**: [docs/README.md](docs/README.md)
- **PDF Generation Guide**: [docs/guides/PDF_GENERATION_GUIDE.md](docs/guides/PDF_GENERATION_GUIDE.md)
- **Tax Form Service Guide**: [docs/features/TAX_FORM_SERVICE_GUIDE.md](docs/features/TAX_FORM_SERVICE_GUIDE.md)
- **Architecture**: [docs/features/TAX_FORM_ARCHITECTURE.md](docs/features/TAX_FORM_ARCHITECTURE.md)
- **Deployment**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **OCR Field Detection**: [AUTOMATED_FIELD_DETECTION_README.md](AUTOMATED_FIELD_DETECTION_README.md)

## Important Notes

1. **Language**: This is a TypeScript/React project, not Go. Ignore any Go-related suggestions.
2. **Testing**: No formal test framework exists. Use manual testing and existing test scripts.
3. **Forms**: Government forms in `PDFFile/` are official documents and must never be modified.
4. **Documentation**: Extensive documentation exists in `docs/` - reference it when making changes.
5. **PWA**: This is a Progressive Web Application - consider offline functionality and mobile UX.
6. **Polish Language**: Application supports Polish language and characters throughout.

## Getting Help

When uncertain about:
- **PDF form filling**: Check `docs/features/TAX_FORM_SERVICE_GUIDE.md`
- **Architecture**: Review `docs/features/TAX_FORM_ARCHITECTURE.md`
- **API usage**: See example files like `src/utils/taxFormService.example.ts`
- **Scripts**: Check `scripts/README.md`
- **General setup**: Refer to `README.md` in the root directory

---

*Follow these guidelines to maintain code quality, consistency, and the integrity of the Numera office management system.*
