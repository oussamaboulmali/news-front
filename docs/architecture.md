# 🏗️ Architecture Documentation

## Table of Contents

- [Overview](#overview)
- [Frontend Architecture](#frontend-architecture)
- [Application Layers](#application-layers)
- [Component Architecture](#component-architecture)
- [State Management](#state-management)
- [Routing Architecture](#routing-architecture)
- [Security Architecture](#security-architecture)
- [Performance Optimization](#performance-optimization)
- [Scalability Considerations](#scalability-considerations)

---

## Overview

The APS News Dashboard follows a modern, component-based architecture built on React 18 and Vite. The application implements a layered architecture pattern with clear separation of concerns.

### Key Architectural Principles

1. **Component-Based Architecture**: Modular, reusable React components
2. **Layered Design**: Clear separation between UI, business logic, and data layers
3. **Security-First**: Built-in security at every layer
4. **Performance-Oriented**: Optimized for fast load times and smooth interactions
5. **Internationalization**: Multi-language support with RTL/LTR layouts

---

## Frontend Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Presentation Layer                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  React Components                                           │ │
│  │  - Pages (Routes)                                           │ │
│  │  - UI Components (Buttons, Forms, Tables)                   │ │
│  │  - Layout Components (NavBar, Sidebar, Footer)              │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────────┐
│                      Application Logic Layer                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  State Management                                           │ │
│  │  - React Context API (Global State)                         │ │
│  │  - Local State (useState, useReducer)                       │ │
│  │  - Custom Hooks (useAxios, useAuth)                         │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Business Logic                                             │ │
│  │  - Validation Functions                                     │ │
│  │  - Data Transformation                                      │ │
│  │  - Security Checks                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────────┐
│                        Data Access Layer                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  API Services                                               │ │
│  │  - useAxios Hook (HTTP Client)                              │ │
│  │  - Request Interceptors                                     │ │
│  │  - Response Handlers                                        │ │
│  │  - Error Management                                         │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────────┐
│                       External Services                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Backend REST API (Node.js/Express)                         │ │
│  │  - Authentication Service                                   │ │
│  │  - User Management Service                                  │ │
│  │  - Agency Management Service                                │ │
│  │  - Logging Service                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Application Layers

### 1. Presentation Layer

**Purpose**: User interface and user interaction

**Components:**
- **Pages**: Top-level route components (`/Pages`)
  - Acceuil (Home/Dashboard)
  - Agences (Agency Management)
  - Utilisateurs (User Management)
  - Configuration (System Settings)
  - Auth (Login)

- **Layout Components**: (`/Menu`)
  - NavBar: Top navigation with user info and language selector
  - SideBarMenu: Collapsible side navigation
  - Footer: Copyright and version info

- **Reusable UI Components**: (`/UI`)
  - ConfirmDialogue: Confirmation modals
  - Pagination: Data table pagination
  - Forms: Input components
  - Cards: Content containers

**Technologies:**
- React 18 (Functional Components + Hooks)
- Material-UI (MUI) 6.x
- Emotion (CSS-in-JS)
- React Router 6.x

---

### 2. Application Logic Layer

#### State Management

**Global State (Context API)**

Located in `/src/Context/contextProvider.jsx`

```javascript
ContextProvider {
  // Authentication
  isLogged: boolean
  handleValidateLogin: function
  handleDisconnect: function
  
  // Configuration
  baseUrl: string
  ImageUrl: string
  prefixe: string
  secretKey: string
  
  // User Preferences
  lang: object (translations)
  routes: array (dynamic routes)
  
  // Utilities
  updateRoutes: function
}
```

**Local State**

Each component manages its own local state using:
- `useState`: For simple state values
- `useEffect`: For side effects and lifecycle management
- Custom hooks: For reusable stateful logic

#### Business Logic

Located in `/src/helpers/Gfunc.js`

**Categories:**

1. **Authentication & Security**
   - `LougoutCoookiesSession()`: Logout functionality
   - `TreatError()`: Session error handling
   - `detectSQLInjection()`: SQL injection detection
   - `BloquerUser()`: User blocking mechanism

2. **Data Validation**
   - `validateEmail()`: Email format validation
   - `validatePhone()`: Phone number validation
   - `validateAndCleanString()`: String sanitization

3. **Data Transformation**
   - `formaterDate()`: Date formatting
   - `formatAndCapitalize()`: String capitalization
   - `transformString()`: String transformation
   - `TraitText()`: HTML text processing
   - `TransformText()`: Text conversion

4. **Encryption & Security**
   - `useDecryptedLocalStorage()`: Decrypt localStorage data
   - `useDecryptedUrl()`: Decrypt URL parameters

5. **Array & Object Manipulation**
   - `sortedAscendingArray()`: Array sorting
   - `DeleteElementfromArray()`: Element removal
   - `sortByDateAscending()`: Date-based sorting

---

### 3. Data Access Layer

#### useAxios Hook

Located in `/src/services/useAxios.jsx`

**Purpose**: Centralized HTTP request handling

**Features:**
- Loading state management
- Error handling and reporting
- Response caching
- Session validation
- Security headers injection

**Usage Pattern:**

```javascript
const { response, loading, error, fetchData, clearData } = useAxios({
  method: 'post',
  url: baseUrl + 'endpoint',
  body: { data }
});

// Trigger request
useEffect(() => {
  fetchData();
}, []);
```

**Security Headers:**
```javascript
headers: {
  "x-api-key": import.meta.env.VITE_APP_ID,
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "geolocation=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains"
}
```

---

## Component Architecture

### Component Hierarchy

```
App.jsx (Root Component)
│
├── CacheProvider (RTL/LTR Support)
│   └── ThemeProvider (Material-UI Theme)
│       └── ContextProvider (Global State)
│           ├── Router (React Router)
│           │   ├── Route: /login (Public)
│           │   │   └── Login Component
│           │   │
│           │   └── Route: / (Protected)
│           │       └── Main Component
│           │           ├── NavBar
│           │           ├── SideBarMenu
│           │           ├── Outlet (Nested Routes)
│           │           │   ├── Home Dashboard
│           │           │   ├── Agency Management
│           │           │   ├── User Management
│           │           │   ├── Configuration
│           │           │   └── Logs
│           │           └── Footer
│           │
│           └── ToastContainer (Notifications)
```

### Component Design Patterns

#### 1. Container/Presenter Pattern

**Container Components** (Smart Components)
- Manage state and logic
- Fetch data
- Handle events
- Pass data to presenters

**Presenter Components** (Dumb Components)
- Receive props from containers
- Render UI
- Emit events
- No business logic

#### 2. Higher-Order Components (HOC)

Used for:
- Authentication guards
- Permission checks
- Common UI wrappers

#### 3. Custom Hooks Pattern

Reusable stateful logic:
- `useAxios`: API requests
- `useAuth`: Authentication state
- `usePermissions`: Permission checks

---

## State Management

### Global State Architecture

```
Context Provider
├── Authentication State
│   ├── isLogged
│   ├── username
│   └── langId
│
├── Configuration
│   ├── baseUrl
│   ├── ImageUrl
│   ├── secretKey
│   └── prefixe
│
├── User Data
│   ├── routes (permissions)
│   ├── language translations
│   └── menu items
│
└── Actions
    ├── handleValidateLogin()
    ├── handleDisconnect()
    └── updateRoutes()
```

### State Flow

```
User Action → Component Event Handler → State Update → Re-render
     ↓
  API Call (if needed) → Response → State Update → Re-render
```

### LocalStorage Usage

**Encrypted Data** (using AES encryption):
- `isLogged`: Authentication status
- `username`: User identifier
- `langId`: Language preference

**Storage Pattern:**
```javascript
// Write
localStorage.setItem(
  key + prefixe,
  CryptoJS.AES.encrypt(value, secretKey)
);

// Read
const decrypted = useDecryptedLocalStorage(key + prefixe, secretKey);
```

---

## Routing Architecture

### Dynamic Route Generation

The application uses a **permission-based dynamic routing** system:

1. **User Login** → Backend returns user permissions
2. **Route Generation** → Frontend creates routes based on permissions
3. **Menu Rendering** → Only accessible routes displayed
4. **Component Loading** → Lazy-loaded on demand

### Route Structure

```javascript
// Static Routes
/login → Login Page (Public)
/ → Main Layout (Protected)

// Dynamic Routes (Based on Permissions)
/acceuil → Dashboard
/agences → Agency Management
  ├── /agences/:agencyName → Agency Details
  └── /agences/:agencyName/:id → Item Details
/utilisateurs → User Management
/configuration → System Configuration
/logs → System Logs
  ├── /logs/agences
  ├── /logs/users
  ├── /logs/blocage
  ├── /logs/erreurs_connexion
  └── /logs/sessions
```

### Route Protection

```javascript
// Protected Route Example
<Route
  path="/"
  element={isLogged ? <Main /> : <Navigate to="/login" />}
>
  {/* Nested protected routes */}
</Route>

// Public Route Example
<Route
  path="/login"
  element={!isLogged ? <Login /> : <Navigate to="/" />}
/>
```

---

## Security Architecture

### Multi-Layer Security

#### 1. Input Layer Security
- SQL injection detection
- XSS prevention
- HTML sanitization
- Input validation (email, phone, password)

#### 2. Transport Layer Security
- HTTPS enforcement
- Secure headers
- CORS configuration
- Cookie security (httpOnly, secure)

#### 3. Application Layer Security
- Authentication required for all protected routes
- Session management
- Encrypted local storage
- CSRF protection

#### 4. Data Layer Security
- Encrypted sensitive data
- Secure API communication
- No sensitive data in URLs
- API key authentication

### Security Data Flow

```
User Input
    ↓
[Validation Layer]
    ├── SQL Injection Check
    ├── XSS Check
    └── Format Validation
    ↓
[Encryption Layer]
    └── AES Encryption for sensitive data
    ↓
[Transport Layer]
    ├── HTTPS
    ├── Security Headers
    └── Credentials (cookies)
    ↓
Backend API
    ↓
Response
    ↓
[Decryption Layer]
    └── Decrypt sensitive data
    ↓
Application State
```

---

## Performance Optimization

### 1. Code Splitting

**Route-Based Code Splitting:**
```javascript
const DynamicComponent = async (key) => {
  const module = await import(`./Pages/${key}/index.jsx`);
  return module.default;
};
```

**Benefits:**
- Smaller initial bundle size
- Faster page load
- On-demand loading

### 2. Asset Optimization

**Images:**
- Optimized image formats
- Lazy loading
- Responsive images

**CSS:**
- CSS-in-JS with Emotion
- Tree shaking
- Critical CSS inline

### 3. Caching Strategy

**Browser Caching:**
```
Static Assets: 1 year
API Responses: No cache (dynamic data)
```

**Memory Caching:**
- Component state caching
- API response caching (useAxios)

### 4. Rendering Optimization

**Techniques Used:**
- React.memo for expensive components
- useMemo for computed values
- useCallback for stable function references
- Virtualization for long lists

---

## Scalability Considerations

### Horizontal Scalability

The frontend can be scaled by:
1. **CDN Distribution**: Serve static assets from CDN
2. **Load Balancing**: Multiple server instances
3. **Edge Computing**: Deploy to edge locations

### Vertical Scalability

Optimizations for handling more users:
1. **Code Splitting**: Reduce bundle size
2. **Lazy Loading**: Load components on demand
3. **Efficient State Management**: Minimize re-renders
4. **API Request Optimization**: Batch requests, caching

### Future Enhancements

1. **Progressive Web App (PWA)**
   - Offline support
   - Service workers
   - App-like experience

2. **Real-Time Features**
   - WebSocket integration
   - Live notifications
   - Real-time collaboration

3. **Advanced Caching**
   - Redux Toolkit Query
   - React Query
   - GraphQL with Apollo

4. **Micro-Frontend Architecture**
   - Module Federation
   - Independent deployment
   - Team autonomy

---

## Technology Decision Rationale

### Why React?
- Large ecosystem and community
- Component-based architecture
- Excellent performance with Virtual DOM
- Great tooling and developer experience

### Why Vite?
- Extremely fast development server
- Optimized production builds
- Modern ESM-based architecture
- Better than Create React App

### Why Material-UI?
- Comprehensive component library
- Professional design system
- Excellent documentation
- RTL support for Arabic

### Why Context API over Redux?
- Simpler for this application size
- No additional dependencies
- Built into React
- Sufficient for current needs

---

## Architectural Best Practices

### 1. Separation of Concerns
- Keep components focused and small
- Separate business logic from UI
- Modular helper functions

### 2. DRY (Don't Repeat Yourself)
- Reusable components
- Custom hooks for common logic
- Shared utility functions

### 3. Single Responsibility
- Each component has one job
- Functions do one thing well
- Clear module boundaries

### 4. Dependency Injection
- Pass dependencies as props
- Use Context for global dependencies
- Avoid tight coupling

### 5. Error Boundaries
- Graceful error handling
- User-friendly error messages
- Error logging for debugging

---

## Conclusion

The APS News Dashboard architecture is designed to be:
- **Maintainable**: Clear structure and documentation
- **Scalable**: Can grow with business needs
- **Secure**: Built-in security at every layer
- **Performant**: Optimized for speed
- **Testable**: Modular and loosely coupled

This architecture provides a solid foundation for current needs while allowing for future enhancements and scaling.

---

**Document Version**: 1.0  
**Last Updated**: October 2024  
**Maintained By**: APS Development Team
