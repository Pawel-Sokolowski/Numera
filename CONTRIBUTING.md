# Contributing to Office Management System (Numera)

Thank you for your interest in contributing to the Office Management System! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)
- [Testing](#testing)

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR-USERNAME/Numera.git`
3. Install dependencies: `npm install`
4. Set up the database: `npm run setup-db`
5. Start development: `npm run dev`

## 💻 Development Setup

### Prerequisites
- Node.js 18.x or higher
- PostgreSQL 13 or higher
- Modern web browser (Chrome, Firefox, Edge, Safari)

### Environment Setup
1. Copy `.env.example` to `.env`
2. Configure database connection:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=office_management
   DB_USER=your_username
   DB_PASSWORD=your_password
   ```

## 📁 Project Structure

```
Numera/
├── public/                  # Static assets and PWA files
│   ├── pdf-templates/       # Official PDF form templates (DO NOT MODIFY)
│   ├── manifest.webmanifest # PWA manifest
│   ├── sw.js               # Service worker
│   └── 404.html            # GitHub Pages SPA routing
├── src/                    # React application source
│   ├── components/         # React components
│   │   ├── ui/            # Reusable UI components
│   │   ├── common/        # Common components
│   │   └── gui/           # GUI-specific components
│   ├── utils/             # Utilities and services
│   │   ├── pdfGenerator.ts      # PDF generation service
│   │   ├── taxFormService.ts    # Tax form filling service
│   │   └── universalPdfFiller.ts # Universal form filler
│   ├── types/             # TypeScript type definitions
│   ├── contexts/          # React context providers
│   ├── data/              # Mock data and constants
│   └── App.tsx            # Main application component
├── server/                # Express backend server
│   ├── index.js          # Server entry point
│   └── routes/           # API routes
├── scripts/              # Database setup and utility scripts
├── docs/                 # Documentation
│   ├── guides/          # User guides
│   ├── features/        # Feature documentation
│   ├── development/     # Developer documentation
│   ├── deployment/      # Deployment guides
│   └── archive/         # Historical documentation
└── PDFFile/             # Official government forms (DO NOT MODIFY)
```

## 🎨 Coding Standards

### TypeScript
- Use strict TypeScript with proper type annotations
- Avoid `any` types - use proper type inference or explicit types
- Follow existing type definitions in `src/types/`
- Use interfaces for data structures

### React
- Use functional components with hooks
- Follow existing component structure
- Maintain responsive design patterns
- Use Radix UI components for consistency
- Implement proper error boundaries and loading states

### Code Style
- Use 2 spaces for indentation
- Follow existing code formatting
- Add comments only when necessary to explain complex logic
- Use meaningful variable and function names

### PDF Form Filling
**CRITICAL**: This is a core feature of the application.
- **Use Template-Based Approach**: Always fill existing official PDF templates
- **Primary Library**: Use `pdf-lib` for official form filling
- **Official Templates**: All forms are in `public/pdf-templates/` and `PDFFile/`
- **DO NOT MODIFY**: Never change files in the `PDFFile/` folder
- **Coordinate-Based Placement**: Use coordinate mapping in `mapping.json` files
- **Polish Character Support**: Ensure full support for Polish characters (ą, ć, ę, ł, ń, ó, ś, ź, ż)

## 📝 Submitting Changes

### Branch Naming
- Feature: `feature/description`
- Bug fix: `fix/description`
- Documentation: `docs/description`

### Commit Messages
- Use clear, descriptive commit messages
- Start with a verb: "Add", "Fix", "Update", "Remove"
- Reference issue numbers when applicable

Example:
```
Add OCR-based field detection for PDF forms

- Implement Tesseract.js integration
- Add field coordinate detection
- Update documentation

Fixes #123
```

### Pull Request Process
1. Update documentation if needed
2. Test your changes manually
3. Ensure the build passes: `npm run build`
4. Submit PR with clear description
5. Link related issues

## 🧪 Testing

### Manual Testing
This project uses manual testing (no automated unit tests).

- Test changes in the browser
- Use existing test scripts in `scripts/` directory
- Test with real data when possible
- Verify PDF generation outputs manually

### Test Edge Cases
- Missing optional fields
- Very long text values
- Special/Polish characters
- Negative numbers and zero values

### Test Scripts
```bash
# Test UPL-1 form coordinates
node scripts/test-upl1-coordinates.js

# Test PDF field detection
node scripts/test-field-detection.js
```

## 📚 Documentation

### When to Update Documentation
- Adding new features or significant functionality
- Changing existing APIs or service interfaces
- Modifying PDF form filling behavior
- Adding new form types or templates

### Documentation Locations
- `docs/features/` - Feature implementation guides
- `docs/guides/` - User and developer guides
- `docs/fixes/` - Bug fixes and improvements
- `README.md` files in feature directories

## 🔒 Protected Directories

**DO NOT MODIFY**:
- `PDFFile/` - Official government forms
- `docs/archive/` - Historical documentation

**Be Careful With**:
- `public/pdf-templates/` - Template directory structure

## 🤝 Community

- Be respectful and inclusive
- Help others in discussions
- Report bugs and suggest improvements
- Share your knowledge

## 📄 License

By contributing, you agree that your contributions will be licensed under the project's license.

## ❓ Questions?

- Check the [Documentation](docs/README.md)
- Open an issue on GitHub
- Review existing issues and discussions

---

**Thank you for contributing!** 🎉
