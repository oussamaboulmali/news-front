# Folder Structure Documentation

## Table of Contents

- [Overview](#overview)
- [Root Directory](#root-directory)
- [Source Directory (/src)](#source-directory-src)
- [Pages Directory](#pages-directory)
- [Components Directory](#components-directory)
- [Services & Utilities](#services--utilities)
- [Assets Directory](#assets-directory)
- [Configuration Files](#configuration-files)
- [Documentation Directory](#documentation-directory)
- [Best Practices](#best-practices)

## Overview

This document provides a detailed explanation of the project's folder structure, the purpose of each directory, and guidelines for organizing code within the project.

### Structure Philosophy

The project follows a **feature-based structure** combined with **atomic design principles**:
- **Pages**: Top-level route components (templates)
- **UI Components**: Reusable components (molecules/organisms)
- **Assets**: Static files (images, styles, etc.)
- **Services**: Business logic and API calls
- **Helpers**: Utility functions
- **Context**: Global state management

## Root Directory

```
newonline-dashbord/
├── docs/                          # Documentation (this directory)
├── public/                        # Static public assets
├── src/                           # Source code
├── .env                           # Environment variables (DO NOT COMMIT)
├── .env.example                   # Environment template
├── .gitignore                     # Git ignore rules
├── eslint.config.js               # ESLint configuration
├── index.html                     # HTML template
├── package.json                   # Dependencies and scripts
├── package-lock.json              # Locked dependency versions
├── README.md                      # Project overview
└── vite.config.js                 # Vite build configuration
```

### Root Files Explained

#### `package.json`
**Purpose**: Defines project metadata, dependencies, and npm scripts

**Key Sections**:
```json
{
  "name": "newonline-dashbord",
  "scripts": {
    "dev": "vite",              // Development server
    "build": "vite build",      // Production build
    "preview": "vite preview",  // Preview production build
    "lint": "eslint ."          // Code linting
  },
  "dependencies": { /* runtime dependencies */ },
  "devDependencies": { /* development dependencies */ }
}
```

#### `vite.config.js`
**Purpose**: Vite bundler configuration

**Configuration**:
- Build settings
- Development server settings
- Plugin configuration
- Path aliases (if any)

#### `eslint.config.js`
**Purpose**: Code linting rules

**Checks**:
- Code quality
- Best practices
- Potential errors
- Style consistency

#### `index.html`
**Purpose**: Root HTML template

**Content**:
- Application mount point (`<div id="root">`)
- Meta tags
- Script imports

#### `.gitignore`
**Purpose**: Files/folders to exclude from version control

**Excluded**:
- `node_modules/`
- `.env`
- `dist/`
- IDE config files

## Source Directory (/src)

```
src/
├── App.jsx                        # Root component
├── App.css                        # Root component styles
├── main.jsx                       # Application entry point
├── index.css                      # Global styles
│
├── Pages/                         # Page components (routes)
├── Menu/                          # Navigation components
├── UI/                            # Reusable UI components
├── Context/                       # React Context providers
├── services/                      # API service layer
├── helpers/                       # Utility functions
├── Locales/                       # Internationalization
├── Log/                           # Logging utilities
├── noData/                        # Empty state components
└── assets/                        # Static assets
```

### Main Entry Files

#### `main.jsx`
**Purpose**: Application entry point

**Responsibilities**:
- Imports root component (App)
- Mounts React app to DOM
- Wraps with StrictMode

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

#### `App.jsx`
**Purpose**: Root application component

**Responsibilities**:
- Router setup
- Authentication flow
- Context providers
- Theme setup
- Dynamic route generation

#### `index.css`
**Purpose**: Global CSS styles

**Contents**:
- CSS reset/normalize
- Global font settings
- Base element styles
- Utility classes

## Pages Directory

```
src/Pages/
├── index.jsx                      # Page router/exporter
│
├── Auth/                          # Authentication pages
│   └── index.jsx                  # Login page
│
├── Acceuil/                       # Dashboard/Home
│   ├── index.jsx                  # Dashboard container
│   ├── indexParent.jsx            # Parent wrapper
│   ├── admin.jsx                  # Admin dashboard
│   ├── abonnees.jsx               # Subscribers view
│   └── AdvenceSearch.jsx          # Advanced search
│
├── Utilisateurs/                  # User management
│   ├── index.jsx                  # User list
│   ├── indexParent.jsx            # Parent wrapper
│   ├── userAdd.jsx                # Add user form
│   ├── editUserInfo.jsx           # Edit user form
│   ├── userDetails.jsx            # User detail view
│   ├── restPassword.jsx           # Password reset
│   └── userAgencies.jsx           # Agency assignment
│
├── Agences/                       # Agency management
│   ├── index.jsx                  # Agency container
│   ├── agencyParent.jsx           # Parent wrapper
│   ├── agencyList.jsx             # Agency list
│   ├── agencyContent.jsx          # Agency content
│   └── itemContent.jsx            # Item details
│
├── Configuration/                 # System configuration
│   ├── index.jsx                  # Config main page
│   ├── indexParent.jsx            # Parent wrapper
│   ├── agenciesAdd.jsx            # Add agency
│   ├── agenciesImage.jsx          # Logo management
│   └── agenciesUser.jsx           # User assignment
│
└── Logs/                          # Logging pages
    ├── logs_list.jsx              # Log list
    ├── log_item.jsx               # Log details
    └── sessions.jsx               # Active sessions
```

### Page Structure Pattern

Each feature follows this pattern:

```
FeatureName/
├── index.jsx                      # Main container (smart component)
├── indexParent.jsx                # Optional parent wrapper
├── [feature]List.jsx              # List view
├── [feature]Add.jsx               # Create form
├── [feature]Edit.jsx              # Edit form
├── [feature]Details.jsx           # Detail view
└── [feature]Delete.jsx            # Delete confirmation
```

**Component Types**:

1. **Container Components (Smart)**
   - Manage state
   - API calls
   - Business logic
   - Pass data to children

2. **Presentation Components (Dumb)**
   - Receive props
   - Render UI
   - Emit events
   - No business logic

### Example: User Management Structure

```
Utilisateurs/
├── index.jsx               # List all users (container)
├── indexParent.jsx         # Parent layout wrapper
├── userAdd.jsx             # Add user form (presentation)
├── editUserInfo.jsx        # Edit user form (presentation)
├── userDetails.jsx         # User detail view (presentation)
├── restPassword.jsx        # Password reset form (presentation)
└── userAgencies.jsx        # Agency assignment (container + presentation)
```

## Components Directory

```
src/
├── Menu/                          # Navigation components
│   ├── NavBar/
│   │   └── index.jsx              # Top navigation bar
│   ├── SideBarMenu/
│   │   └── index.jsx              # Sidebar menu
│   └── Footer/
│       └── index.jsx              # Footer component
│
├── UI/                            # Reusable UI components
│   ├── Alerts/
│   │   └── ConfirmDialogue.jsx   # Confirmation dialog
│   └── Pagination/
│       └── index.jsx              # Pagination component
│
└── noData/                        # Empty state components
    ├── noComponent.jsx            # 404 page
    ├── noDataFound.jsx            # No data message
    └── noStats.jsx                # No statistics message
```

### Menu Components

#### NavBar
**Purpose**: Top navigation bar

**Features**:
- Menu toggle button
- User menu/profile
- Language switcher
- Notifications (if applicable)

**Props**:
```javascript
{
  toggleSidebar: Function,
  isSidebarOpen: boolean,
  isMobileView: boolean
}
```

#### SideBarMenu
**Purpose**: Left sidebar navigation

**Features**:
- Dynamic menu items based on permissions
- Collapsible/expandable
- Active route highlighting
- Icon + text display

**Props**:
```javascript
{
  isSidebarOpen: boolean,
  isMobile: boolean,
  setIsSidebarOpen: Function
}
```

#### Footer
**Purpose**: Bottom footer

**Features**:
- Copyright notice
- Version information
- Links (if applicable)

### UI Components

#### ConfirmDialogue
**Purpose**: Reusable confirmation dialog

**Props**:
```javascript
{
  open: boolean,
  message: string,
  icon: string or component,
  confirmAction: Function,
  concleAction: Function,
  withInput: boolean,
  note: string,
  setNote: Function,
  buttonConfirm: string,
  buttonCancle: string
}
```

**Usage**:
```jsx
<ConfirmDialog
  open={openDialog}
  message="Are you sure you want to delete?"
  confirmAction={handleDelete}
  concleAction={() => setOpenDialog(false)}
/>
```

#### Pagination
**Purpose**: Reusable pagination component

**Props**:
```javascript
{
  currentPage: number,
  totalPages: number,
  onPrev: Function,
  onNext: Function
}
```

## Services & Utilities

```
src/
├── services/                      # API service layer
│   └── useAxios.jsx               # Custom Axios hook
│
├── helpers/                       # Utility functions
│   └── Gfunc.js                   # Global helper functions
│
├── Context/                       # React Context
│   └── contextProvider.jsx        # Global state context
│
├── Locales/                       # Internationalization
│   └── translations.jsx           # Translation strings
│
└── Log/                           # Logging
    └── costumLog.jsx              # Custom logger
```

### services/useAxios.jsx

**Purpose**: Custom React hook for HTTP requests

**Features**:
- State management (loading, error, response)
- Security headers injection
- Error handling
- Session management
- Automatic logout on auth failure

**Usage**:
```javascript
const { response, loading, error, fetchData, clearData } = useAxios({
  method: "post",
  url: "/api/users",
  body: { username: "test" }
});

useEffect(() => {
  fetchData();
}, []);
```

### helpers/Gfunc.js

**Purpose**: Global utility functions

**Categories**:
- **Validation**: Email, phone, SQL injection detection
- **Formatting**: Date formatting, string manipulation
- **Security**: Encryption/decryption, sanitization
- **Data**: Array operations, sorting
- **UI**: Icon mapping, path formatting

**Example Functions**:
```javascript
// Validation
validateEmail(email)
validatePhone(phone)
detectSQLInjection(input)

// Formatting
formaterDate(dateISO)
formatAndCapitalize(string)

// Security
useDecryptedLocalStorage(key, secretKey)
BloquerUser(code, api)

// Data
sortedAscendingArray(array, attribute)
DeleteElementfromArray(array, id, idName)
```

### Context/contextProvider.jsx

**Purpose**: Global state management

**Provides**:
```javascript
{
  handleValidateLogin: Function,
  handleDisconnect: Function,
  baseUrl: string,
  emptyData: string,
  routes: Array,
  ImageUrl: string,
  lang: Object,
  prefixe: string,
  secretKey: string,
  updateRoutes: Function
}
```

### Locales/translations.jsx

**Purpose**: Multi-language support

**Structure**:
```javascript
{
  fr: { /* French translations */ },
  ar: { /* Arabic translations */ },
  en: { /* English translations */ }
}
```

**Usage**:
```javascript
import translations from './Locales/translations';

const lang = translations['fr'];
console.log(lang.logout); // "Déconnexion"
```

## Assets Directory

```
src/assets/
├── images/                        # Images and icons
│   ├── defaultImage.png
│   ├── user.png
│   ├── user1.png
│   ├── session.png
│   └── Logos/                     # Logo files
│       ├── bg.jpg
│       ├── Logo-news-bgw.png
│       ├── Logo-news.png
│       ├── Logo.png
│       └── logo.svg
│
├── Styled/                        # Styled components
│   ├── StyledCard.jsx
│   ├── StyledFieldset.jsx
│   └── StyledLegend.jsx
│
└── styles/                        # CSS and theme files
    ├── theme.jsx                  # MUI theme configuration
    ├── article.css
    ├── logs.css
    ├── menu.css
    ├── navbar.css
    ├── sidebar.css
    ├── stats.css
    ├── drag-drop-input.css
    └── datatable_costum.js
```

### Image Organization

**Guidelines**:
- Use descriptive names
- Group by category
- Optimize before adding
- Use appropriate formats:
  - PNG: Logos, icons with transparency
  - JPG: Photos, backgrounds
  - SVG: Scalable logos and icons

### Styled Components

**Purpose**: Reusable styled Material-UI components

**Example**:
```jsx
// StyledCard.jsx
import { styled } from '@mui/material/styles';
import { Card } from '@mui/material';

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2]
}));

export default StyledCard;
```

### Theme Configuration

**Location**: `assets/styles/theme.jsx`

**Purpose**: Centralized MUI theme

**Configuration**:
```javascript
const theme = createTheme({
  palette: {
    primary: { main: '#263949' },
    secondary: { main: '#f50057' }
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif'
  },
  // ... more settings
});
```

## Configuration Files

### Environment Configuration

**File**: `.env` (DO NOT COMMIT)

```env
VITE_APP_STATUS=dev
VITE_BASE_URL=http://localhost:3000/api/v1/
VITE_IMAGE_URL=http://localhost:3000/uploads/
VITE_APP_ID=your-api-key
VITE_KEY=your-encryption-key
VITE_PREF=_app
VITE_EMPTY_DATA=No data available
```

**Access in Code**:
```javascript
const apiKey = import.meta.env.VITE_APP_ID;
const baseUrl = import.meta.env.VITE_BASE_URL;
```

## Documentation Directory

```
docs/
├── architecture.md                # System architecture
├── api.md                         # API documentation
├── workflow.md                    # User workflows
├── permissions.md                 # RBAC documentation
├── database-schema.md             # Database structure
├── deployment.md                  # Deployment guide
├── security.md                    # Security documentation
└── folder-structure.md            # This file
```

## Best Practices

### File Naming

1. **Components**: PascalCase
   - `UserList.jsx`
   - `ConfirmDialog.jsx`

2. **Utilities**: camelCase
   - `useAxios.jsx`
   - `costumLog.jsx`

3. **CSS**: kebab-case
   - `navbar.css`
   - `drag-drop-input.css`

4. **Indexes**: lowercase
   - `index.jsx`
   - `index.css`

### Component Organization

```jsx
// 1. Imports (grouped)
import { useState, useEffect } from 'react';  // React
import { Button, Box } from '@mui/material';  // External libraries
import { useAxios } from '../../services/useAxios';  // Internal services
import './styles.css';  // Styles

// 2. Component definition
function MyComponent({ prop1, prop2 }) {
  // 3. State declarations
  const [state, setState] = useState();
  
  // 4. Hooks
  useEffect(() => {
    // Effect logic
  }, []);
  
  // 5. Event handlers
  const handleClick = () => {
    // Handler logic
  };
  
  // 6. Render helpers
  const renderItem = (item) => {
    return <div>{item}</div>;
  };
  
  // 7. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}

// 8. PropTypes (if using)
MyComponent.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.func
};

// 9. Export
export default MyComponent;
```

### Folder Organization Tips

1. **Feature-First**: Group by feature, not by type
   ```
   ✓ Good:
   Utilisateurs/
     ├── UserList.jsx
     ├── UserAdd.jsx
     └── UserEdit.jsx
   
   ✗ Bad:
   Lists/
     └── UserList.jsx
   Forms/
     ├── UserAdd.jsx
     └── UserEdit.jsx
   ```

2. **Colocate Related Files**: Keep related files together
   ```
   UserList/
     ├── index.jsx
     ├── UserList.css
     ├── UserListItem.jsx
     └── useUserList.js
   ```

3. **Index Files**: Use for cleaner imports
   ```javascript
   // src/UI/index.js
   export { default as ConfirmDialog } from './Alerts/ConfirmDialog';
   export { default as Pagination } from './Pagination';
   
   // Import usage
   import { ConfirmDialog, Pagination } from './UI';
   ```

4. **Avoid Deep Nesting**: Max 3-4 levels deep
   ```
   ✓ Good: src/Pages/Users/UserList.jsx
   ✗ Bad: src/Pages/Admin/Users/Management/List/UserList.jsx
   ```

### Code Organization

1. **One Component Per File**: Except for small, tightly coupled components
2. **Separate Business Logic**: Keep complex logic in custom hooks or utilities
3. **Constants in Separate Files**: For reusability and maintainability
4. **Styles**: Component-specific styles in same directory

### Adding New Features

When adding a new feature:

1. **Create Feature Directory** in `Pages/`
2. **Add Main Component** (`index.jsx`)
3. **Add Sub-Components** as needed
4. **Create Related Services** in `services/`
5. **Add Utilities** in `helpers/` if reusable
6. **Update Routes** in `App.jsx` (if not dynamic)
7. **Add Translations** in `Locales/translations.jsx`
8. **Document** in appropriate `docs/` file

---

**Last Updated**: 2024
**Author**: APS Development Team
