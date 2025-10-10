# GUI Components

This folder contains reusable UI components that are presentation-focused and can be used across the application.

## Components

### AuthorizationFormDialog
**Purpose:** Dialog for generating tax forms and authorization documents

**Features:**
- Tabbed interface for different form categories (Pełnomocnictwa, PIT, VAT, CIT, ZUS, JPK)
- Client and employee selection
- Form type selection with complexity indicators
- Automatic form generation and download

**Usage:**
```tsx
import { AuthorizationFormDialog } from './components/gui/AuthorizationFormDialog';

<AuthorizationFormDialog
  isOpen={isDialogOpen}
  onClose={() => setIsDialogOpen(false)}
  clients={clients}
  employees={employees}
  preSelectedClientId={selectedClientId}
/>
```

### ThemeToggle
**Purpose:** Toggle button for switching between light and dark themes

**Features:**
- Persists theme preference to localStorage
- Respects system preferences
- Smooth theme transitions

**Usage:**
```tsx
import { ThemeToggle } from './components/gui/ThemeToggle';

<ThemeToggle />
```

### ActiveTimerDisplay
**Purpose:** Display and control active time tracking timers

**Features:**
- Real-time timer display
- Start/pause/stop controls
- Client and project information
- Elapsed time tracking

**Usage:**
```tsx
import { ActiveTimerDisplay } from './components/gui/ActiveTimerDisplay';

<ActiveTimerDisplay />
```

## Design Guidelines

### When to Add Components Here

Add components to this folder when they:
- Are primarily UI/presentation focused
- Can be reused across multiple views
- Have minimal business logic
- Are self-contained and composable

### When NOT to Add Components Here

Keep components in the main `components/` folder if they:
- Are page/view components (Dashboard, ClientList, etc.)
- Have significant business logic
- Are tightly coupled to specific features
- Manage complex state or data fetching

## Import Pattern

Components in this folder should import from parent directories:
```tsx
// UI components
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";

// Types
import { Client } from "../../types/client";

// Utils
import { formatDate } from "../../utils/formatters";
```

## Contributing

When adding new components:
1. Add clear JSDoc comments
2. Include usage examples in this README
3. Ensure responsive design
4. Follow existing naming conventions
5. Update imports in consuming components
