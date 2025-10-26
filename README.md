# 📰 APS News Dashboard - Front-end Application

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.10-646CFF.svg)](https://vitejs.dev/)
[![MUI](https://img.shields.io/badge/MUI-6.1.7-007FFF.svg)](https://mui.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()

> **Algeria Press Service (APS)** - Modern, secure, and multilingual news management dashboard for editorial teams and administrators.

---

## 📋 Table of Contents

- [Project Introduction](#-project-introduction)
- [Features & Capabilities](#-features--capabilities)
- [System Workflow](#-system-workflow)
- [Architecture Overview](#-architecture-overview)
- [Technology Stack](#-technology-stack)
- [Prerequisites](#-prerequisites)
- [Installation Guide](#-installation-guide)
- [Configuration](#-configuration)
- [Folder Structure](#-folder-structure)
- [Development](#-development)
- [Production Deployment](#-production-deployment)
- [Security Features](#-security-features)
- [API Integration](#-api-integration)
- [Internationalization](#-internationalization)
- [Screenshots](#-screenshots)
- [Additional Documentation](#-additional-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Project Introduction

The **APS News Dashboard** is a sophisticated front-end application designed for Algeria Press Service, the national news agency of Algeria. This React-based Single Page Application (SPA) provides a comprehensive platform for managing news content, users, agencies, and system configurations with enterprise-grade security and multilingual support.

### Mission

To deliver a secure, user-friendly, and efficient content management system that empowers editorial teams and administrators to:
- Manage and distribute news content across multiple agencies
- Control user access with role-based permissions
- Monitor system activities and user sessions
- Configure organizational settings
- Support multiple languages with RTL/LTR layouts

---

## ✨ Features & Capabilities

### 🔐 Authentication & Security
- **Secure Login System**
  - Username/password authentication
  - SQL injection detection and prevention
  - Password strength validation (6-20 characters)
  - Session management with concurrent session handling
  - Encrypted credential storage using AES encryption
  - Automatic IP blocking on suspicious activities
  - Security audit logging

### 👥 User Management
- **User Administration**
  - Create, read, update, and delete user accounts
  - User profile management with detailed information
  - Agency assignment for users
  - Password reset functionality
  - User activity tracking
  - Role-based access control (RBAC)

### 🏢 Agency Management
- **Multi-Agency Support**
  - Agency listing and detailed views
  - Agency content management
  - Agency configuration (images, settings)
  - Hierarchical agency structure
  - Agency-specific permissions

### ⚙️ Configuration Management
- **System Configuration**
  - Agency settings configuration
  - User-agency relationships
  - Image and branding management
  - System-wide settings

### 📊 Dashboard & Analytics
- **Home Dashboard**
  - Statistics and metrics overview
  - Subscriber management
  - Admin controls
  - Quick access to key features
  - Advanced search functionality

### 📝 Logging & Monitoring
- **Comprehensive Logging System**
  - Agency activity logs
  - User action logs
  - Security event logs (blocking, failed logins)
  - Session tracking and management
  - Error logging with detailed information

### 🌍 Internationalization (i18n)
- **Multi-Language Support**
  - Arabic (RTL layout)
  - French (LTR layout)
  - English (LTR layout)
  - Dynamic language switching
  - Localized UI components
  - Date and time formatting per locale

### 🎨 UI/UX Features
- **Modern Interface**
  - Material Design (MUI) components
  - Responsive design (mobile, tablet, desktop)
  - Dark/Light theme support
  - Intuitive navigation with sidebar and navbar
  - Toast notifications for user feedback
  - Confirmation dialogs for critical actions
  - Loading states and error handling
  - Pagination for large datasets
  - Data tables with sorting and filtering

---

## 🔄 System Workflow

### User Authentication Flow
1. User enters credentials on login page
2. System validates input for SQL injection and password constraints
3. Backend authenticates credentials
4. If user has active session:
   - Display confirmation dialog
   - Option to close existing session or cancel
5. On successful authentication:
   - Encrypt and store user data in localStorage
   - Fetch user-specific menu/routes based on permissions
   - Set language preference
   - Redirect to dashboard

### Permission-Based Routing
1. User logs in successfully
2. Backend returns user's accessible menu items
3. Frontend dynamically generates routes based on permissions
4. Components are lazy-loaded as needed
5. Unauthorized routes redirect to 404 page

### Data Flow
```
User Action → Component → useAxios Hook → API Request → Backend
                ↓                                           ↓
         Update UI State ← Error Handling ← Response ← Backend
```

### Session Management
- Sessions stored as HTTP-only cookies (backend)
- Session validation on each API request
- Automatic logout on session expiry
- Session activity tracking and logging
- Concurrent session detection and handling

---

## 🏗️ Architecture Overview

### Frontend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface Layer                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React Components (Pages, UI, Menu)                  │  │
│  │  - Material-UI Components                             │  │
│  │  - Responsive Layouts                                 │  │
│  │  - Form Validation                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   State Management Layer                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React Context API                                    │  │
│  │  - Global State (Auth, Config, Language)             │  │
│  │  - Local State (useState, useEffect)                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Services & Utilities                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  useAxios Hook (API Communication)                    │  │
│  │  Helper Functions (Validation, Encryption, Formatting)│  │
│  │  Custom Logging                                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Backend API Layer                       │
│  REST API (Node.js/Express - not in this repo)              │
│  - Authentication endpoints                                  │
│  - CRUD operations                                           │
│  - Session management                                        │
│  - File uploads                                              │
└─────────────────────────────────────────────────────────────┘
```

### Component Structure

```
App.jsx (Root)
├── Router
│   ├── Login Page (Public Route)
│   └── Main Layout (Protected Routes)
│       ├── NavBar
│       ├── SideBar
│       ├── Content Area
│       │   ├── Home (Dashboard)
│       │   ├── Agencies
│       │   ├── Users
│       │   ├── Configuration
│       │   └── Logs
│       └── Footer
```

### Data Flow Architecture

1. **Component Layer**: User interactions trigger actions
2. **Service Layer**: `useAxios` handles API communication
3. **Helper Layer**: Validation, encryption, formatting
4. **Context Layer**: Global state management
5. **Backend Layer**: REST API (separate repository)

---

## 🛠️ Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI library for building component-based interfaces |
| **Vite** | 5.4.10 | Fast build tool and dev server |
| **React Router** | 6.28.0 | Client-side routing and navigation |
| **Axios** | 1.7.7 | HTTP client for API requests |

### UI & Styling

| Technology | Version | Purpose |
|------------|---------|---------|
| **Material-UI (MUI)** | 6.1.7 | Comprehensive React component library |
| **Emotion** | 11.13.x | CSS-in-JS library |
| **Stylis** | 4.3.4 | CSS preprocessor with RTL support |

### State & Data Management

| Technology | Version | Purpose |
|------------|---------|---------|
| **React Context API** | Built-in | Global state management |
| **React Hooks** | Built-in | State and lifecycle management |

### Security

| Technology | Version | Purpose |
|------------|---------|---------|
| **CryptoJS** | 4.2.0 | AES encryption for sensitive data |
| **DOMPurify** | 3.2.4 | XSS protection and HTML sanitization |

### Internationalization

| Technology | Version | Purpose |
|------------|---------|---------|
| **Custom i18n** | - | Translation management |
| **dayjs** | 1.11.13 | Date/time formatting and manipulation |
| **stylis-plugin-rtl** | 2.1.1 | RTL layout support |

### Data Visualization & Export

| Technology | Version | Purpose |
|------------|---------|---------|
| **Recharts** | 2.14.1 | Charts and data visualization |
| **react-data-table-component** | 7.6.2 | Advanced data tables |
| **ExcelJS** | 4.4.0 | Excel file generation |
| **docx** | 9.1.0 | Word document generation |
| **html2canvas** | 1.4.1 | Screenshot and image generation |
| **pdf-lib** | 1.17.1 | PDF manipulation |
| **print-js** | 1.6.0 | Print functionality |

### Utilities

| Technology | Version | Purpose |
|------------|---------|---------|
| **lodash** | 4.17.21 | Utility functions |
| **file-saver** | 2.0.5 | File download helper |
| **react-toastify** | 10.0.6 | Toast notifications |
| **react-responsive** | 10.0.0 | Responsive design utilities |
| **loglevel** | 1.9.2 | Logging framework |

### Development Tools

| Technology | Version | Purpose |
|------------|---------|---------|
| **ESLint** | 9.13.0 | JavaScript linting |
| **esbuild** | 0.25.1 | Fast JavaScript bundler |

---

## 📦 Prerequisites

Before installing the application, ensure you have the following installed on your system:

### Required

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher (comes with Node.js)
- **Git**: For version control

### Optional

- **VS Code**: Recommended IDE with ESLint and Prettier extensions
- **Modern Web Browser**: Chrome, Firefox, Edge, or Safari (latest versions)

### System Requirements

- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM**: Minimum 4GB (8GB recommended)
- **Disk Space**: Minimum 500MB free space

---

## 🚀 Installation Guide

### Development Environment Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/your-organization/aps-news-dashboard.git
cd aps-news-dashboard
```

#### 2. Install Dependencies

```bash
npm install
```

This will install all required packages listed in `package.json`.

#### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration (see [Configuration](#-configuration) section).

#### 4. Start Development Server

```bash
npm run dev
```

The application will be available at: `http://localhost:5173` (or configured host)

#### 5. Verify Installation

- Navigate to `http://localhost:5173` in your browser
- You should see the login page
- Check the browser console for any errors

### Troubleshooting Installation

**Issue**: Port 5173 already in use
```bash
# Solution: Change port in vite.config.js or kill the process
lsof -ti:5173 | xargs kill -9
```

**Issue**: Dependencies not installing
```bash
# Solution: Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Issue**: Vite build errors
```bash
# Solution: Ensure Node.js version is 18+
node --version
# If lower, upgrade Node.js
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Application Status
VITE_APP_STATUS=dev                    # dev | prod

# API Configuration
VITE_BASE_URL=http://localhost:3000/api/v1/
VITE_IMAGE_URL=http://localhost:3000

# Application Settings
VITE_APP_ID=your-api-key-here
VITE_EMPTY_DATA=No data available

# Security Configuration
VITE_KEY=your-aes-encryption-key-here
VITE_PREF=_aps_                        # localStorage prefix
```

### Environment Variable Descriptions

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `VITE_APP_STATUS` | Application environment mode | `dev` or `prod` | Yes |
| `VITE_BASE_URL` | Backend API base URL | `http://localhost:3000/api/v1/` | Yes |
| `VITE_IMAGE_URL` | Base URL for images | `http://localhost:3000` | Yes |
| `VITE_APP_ID` | API key for backend authentication | `abc123xyz` | Yes |
| `VITE_EMPTY_DATA` | Default text for empty data states | `No data available` | Yes |
| `VITE_KEY` | AES encryption secret key (32+ chars) | `your-32-char-secret-key-here` | Yes |
| `VITE_PREF` | localStorage key prefix | `_aps_` | Yes |

### Production Configuration

For production deployment:

1. Set `VITE_APP_STATUS=prod`
2. Update `VITE_BASE_URL` to your production API URL
3. Use strong, unique keys for `VITE_KEY` and `VITE_APP_ID`
4. Ensure HTTPS is enabled for all URLs

### Vite Configuration

The `vite.config.js` file contains build and server configurations:

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    host: "localhost",
    port: 5173,
    strictPort: true,
    open: false,
  },
  // Uncomment for custom build output
  // build: {
  //   outDir: "/var/www/dist",
  //   emptyOutDir: true,
  // },
});
```

---

## 📁 Folder Structure

```
/workspace/
├── public/                          # Static assets
│   └── favicon.ico
│
├── src/                             # Source code
│   ├── assets/                      # Asset files
│   │   ├── images/                  # Images and logos
│   │   │   ├── Logos/              # Logo variations
│   │   │   ├── defaultImage.png
│   │   │   ├── session.png
│   │   │   └── user.png
│   │   ├── Styled/                  # Styled components
│   │   │   ├── StyledCard.jsx
│   │   │   ├── StyledFieldset.jsx
│   │   │   └── StyledLegend.jsx
│   │   └── styles/                  # CSS and style utilities
│   │       ├── article.css
│   │       ├── menu.css
│   │       ├── navbar.css
│   │       ├── sidebar.css
│   │       ├── stats.css
│   │       └── theme.jsx            # MUI theme configuration
│   │
│   ├── Context/                     # React Context providers
│   │   └── contextProvider.jsx      # Global app context
│   │
│   ├── helpers/                     # Helper utilities
│   │   └── Gfunc.js                 # Global utility functions
│   │
│   ├── Locales/                     # Internationalization
│   │   └── translations.jsx         # Translation files
│   │
│   ├── Log/                         # Logging utilities
│   │   └── costumLog.jsx            # Custom logger
│   │
│   ├── Menu/                        # Navigation components
│   │   ├── Footer/
│   │   │   └── index.jsx
│   │   ├── NavBar/
│   │   │   └── index.jsx            # Top navigation bar
│   │   └── SideBarMenu/
│   │       └── index.jsx            # Sidebar navigation
│   │
│   ├── noData/                      # Empty state components
│   │   ├── noComponent.jsx          # 404 page
│   │   ├── noDataFound.jsx          # Empty data message
│   │   └── noStats.jsx              # Empty stats message
│   │
│   ├── Pages/                       # Page components
│   │   ├── Acceuil/                 # Home/Dashboard
│   │   │   ├── index.jsx
│   │   │   ├── indexParent.jsx
│   │   │   ├── admin.jsx
│   │   │   ├── abonnees.jsx
│   │   │   └── AdvenceSearch.jsx
│   │   ├── Agences/                 # Agency management
│   │   │   ├── index.jsx
│   │   │   ├── agencyParent.jsx
│   │   │   ├── agencyList.jsx
│   │   │   ├── agencyContent.jsx
│   │   │   └── itemContent.jsx
│   │   ├── Auth/                    # Authentication
│   │   │   └── index.jsx            # Login page
│   │   ├── Configuration/           # System configuration
│   │   │   ├── index.jsx
│   │   │   ├── indexParent.jsx
│   │   │   ├── agenciesAdd.jsx
│   │   │   ├── agenciesImage.jsx
│   │   │   └── agenciesUser.jsx
│   │   ├── Utilisateurs/            # User management
│   │   │   ├── index.jsx
│   │   │   ├── indexParent.jsx
│   │   │   ├── userAdd.jsx
│   │   │   ├── userDetails.jsx
│   │   │   ├── editUserInfo.jsx
│   │   │   ├── restPassword.jsx
│   │   │   └── userAgencies.jsx
│   │   └── index.jsx                # Main pages router
│   │
│   ├── services/                    # API services
│   │   └── useAxios.jsx             # Axios hook for API calls
│   │
│   ├── UI/                          # Reusable UI components
│   │   ├── Alerts/
│   │   │   └── ConfirmDialogue.jsx  # Confirmation dialog
│   │   └── Pagination/
│   │       └── index.jsx            # Pagination component
│   │
│   ├── App.css                      # Global app styles
│   ├── App.jsx                      # Root component
│   ├── index.css                    # Global CSS
│   └── main.jsx                     # Application entry point
│
├── .env                             # Environment variables (not in git)
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore rules
├── eslint.config.js                 # ESLint configuration
├── index.html                       # HTML template
├── package.json                     # Project dependencies
├── package-lock.json                # Dependency lock file
├── README.md                        # This file
└── vite.config.js                   # Vite configuration
```

### Key Directory Descriptions

- **`/src/Pages`**: Contains all page components organized by feature
- **`/src/services`**: API communication layer and custom hooks
- **`/src/helpers`**: Utility functions for validation, formatting, encryption
- **`/src/Context`**: Global state management using React Context
- **`/src/assets`**: Static resources (images, styles, themes)
- **`/src/UI`**: Reusable UI components
- **`/src/Locales`**: Translation files for i18n support

---

## 💻 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write code following project conventions
   - Add JSDoc comments for new functions
   - Test changes in development environment

3. **Lint Your Code**
   ```bash
   npm run lint
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "Add feature: description"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Coding Standards

#### JavaScript/React
- Use functional components with hooks
- Follow React best practices
- Add JSDoc comments for all functions
- Use meaningful variable and function names
- Keep components small and focused

#### Styling
- Use MUI components when possible
- Follow the established theme structure
- Support RTL layouts for Arabic
- Ensure responsive design

#### File Naming
- Components: PascalCase (`UserList.jsx`)
- Utilities: camelCase (`helperFunctions.js`)
- Styles: kebab-case (`user-list.css`)

---

## 🚢 Production Deployment

### Building for Production

```bash
# Build optimized production bundle
npm run build
```

This creates an optimized build in the `dist/` directory.

### Deployment Options

#### Option 1: Static Hosting (Recommended for SPA)

**Nginx Configuration**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/aps-dashboard/dist;
    index index.html;
    
    # SPA routing - all routes to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
}
```

**Apache Configuration**

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/aps-dashboard/dist
    
    <Directory /var/www/aps-dashboard/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # SPA routing
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    # Security headers
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-Content-Type-Options "nosniff"
    Header set X-XSS-Protection "1; mode=block"
</VirtualHost>
```

#### Option 2: Docker Deployment

**Dockerfile**

```dockerfile
# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Build and Run**

```bash
# Build Docker image
docker build -t aps-dashboard .

# Run container
docker run -p 80:80 aps-dashboard
```

#### Option 3: Cloud Platforms

**Vercel**
```bash
npm install -g vercel
vercel --prod
```

**Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Post-Deployment Checklist

- [ ] Verify all environment variables are set correctly
- [ ] Test login functionality
- [ ] Check all routes are accessible
- [ ] Verify API connectivity
- [ ] Test internationalization (Arabic RTL, French, English)
- [ ] Validate security headers
- [ ] Test on multiple browsers
- [ ] Verify mobile responsiveness
- [ ] Check SSL certificate (HTTPS)
- [ ] Monitor error logs

---

## 🔒 Security Features

### Implemented Security Measures

#### 1. **Input Validation & Sanitization**
- SQL injection detection on all user inputs
- XSS prevention using DOMPurify
- Password strength validation
- Email and phone format validation
- HTML tag filtering

#### 2. **Authentication Security**
- Encrypted credential storage (AES-256)
- Secure session management
- Concurrent session detection
- Automatic logout on suspicious activity
- Failed login attempt tracking

#### 3. **HTTP Security Headers**
- `Strict-Transport-Security`: Force HTTPS
- `X-Content-Type-Options`: Prevent MIME sniffing
- `X-Frame-Options`: Prevent clickjacking
- `Referrer-Policy`: Control referrer information
- `Permissions-Policy`: Restrict browser features

#### 4. **Data Protection**
- LocalStorage encryption for sensitive data
- Secure URL parameter transmission
- Cookie security with httpOnly flag
- CSRF token validation (backend)

#### 5. **Security Monitoring**
- Activity logging for all user actions
- Security event logging (SQL injection attempts, XSS)
- IP tracking and blocking
- Session activity monitoring

### Security Best Practices

**For Developers:**
- Always validate and sanitize user inputs
- Use the provided helper functions (`detectSQLInjection`, `validateEmail`, etc.)
- Never store sensitive data in plain text
- Use HTTPS in production
- Keep dependencies updated
- Follow the principle of least privilege

**For Administrators:**
- Regularly review security logs
- Monitor suspicious activities
- Keep the application and dependencies updated
- Use strong passwords and keys
- Implement rate limiting on API endpoints
- Regular security audits

---

## 🌐 API Integration

### API Configuration

The application communicates with a backend REST API. Configure the API URL in `.env`:

```env
VITE_BASE_URL=http://localhost:3000/api/v1/
```

### API Request Structure

All API requests include:

```javascript
{
  headers: {
    "x-api-key": "your-api-key",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Permissions-Policy": "geolocation=()",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains"
  },
  withCredentials: true  // Include cookies for session management
}
```

### Common API Endpoints

| Endpoint | Method | Purpose | Authentication |
|----------|--------|---------|----------------|
| `/auth/login` | POST | User login | No |
| `/auth/logout` | POST | User logout | Yes |
| `/auth/close` | POST | Close existing session | Yes |
| `/users/menu` | POST | Get user menu/permissions | Yes |
| `/users` | GET | List all users | Yes |
| `/users/:id` | GET | Get user details | Yes |
| `/users` | POST | Create new user | Yes |
| `/users/:id` | PUT | Update user | Yes |
| `/users/:id` | DELETE | Delete user | Yes |
| `/users/block` | PUT | Block user account | Yes |

### Using the `useAxios` Hook

```javascript
import { useAxios } from './services/useAxios';

function MyComponent() {
  const { response, loading, error, fetchData } = useAxios({
    method: 'post',
    url: baseUrl + 'users',
    body: { name: 'John Doe', email: 'john@example.com' }
  });

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <div>Error: {error}</div>;
  if (response) return <div>Success!</div>;
}
```

### Error Handling

The application handles the following error scenarios:

- **404 Not Found**: Display "Resource not found" message
- **401 Unauthorized**: Redirect to login page
- **403 Forbidden**: Display "Access denied" message
- **500 Server Error**: Display "Server error" message
- **Network Error**: Redirect to login page with error toast

---

## 🌍 Internationalization

### Supported Languages

1. **Arabic (RTL)**
   - Language ID: `1`
   - Direction: Right-to-Left
   - Full UI translation

2. **French (LTR)**
   - Language ID: `2`
   - Direction: Left-to-Right
   - Full UI translation

3. **English (LTR)**
   - Language ID: `3`
   - Direction: Left-to-Right
   - Full UI translation

### Translation Structure

Translations are stored in `src/Locales/translations.jsx`:

```javascript
const translations = {
  ar: {
    welcome: "مرحبا",
    login: "تسجيل الدخول",
    // ... more translations
  },
  fr: {
    welcome: "Bienvenue",
    login: "Connexion",
    // ... more translations
  },
  en: {
    welcome: "Welcome",
    login: "Login",
    // ... more translations
  }
};
```

### Using Translations

```javascript
import { useContext } from 'react';
import { ContextProvider } from './Context/contextProvider';

function MyComponent() {
  const { lang } = useContext(ContextProvider);
  
  return <h1>{lang.welcome}</h1>;
}
```

### Adding New Translations

1. Open `src/Locales/translations.jsx`
2. Add the new key to all language objects
3. Use the key in your component

```javascript
// In translations.jsx
const translations = {
  ar: { newKey: "الترجمة العربية" },
  fr: { newKey: "Traduction française" },
  en: { newKey: "English translation" }
};

// In component
<p>{lang.newKey}</p>
```

---

## 📸 Screenshots

_Screenshots will be added here once the application is deployed._

### Login Page
- Clean, modern login interface
- Background image with overlay
- Password visibility toggle
- Responsive design

### Dashboard
- Statistics cards
- Recent activity
- Quick actions
- Navigation menu

### User Management
- User list with data table
- Search and filter capabilities
- User details modal
- Add/Edit user forms

### Agency Management
- Agency list view
- Agency details page
- Content management interface

---

## 📚 Additional Documentation

For more detailed documentation, please refer to the `/docs` directory:

- **[Workflow Documentation](docs/workflow.md)** - Editorial roles and article lifecycle
- **[Architecture Documentation](docs/architecture.md)** - System architecture and design
- **[API Documentation](docs/api.md)** - Complete API endpoint reference
- **[Permissions Documentation](docs/permissions.md)** - RBAC and access control
- **[Database Schema](docs/database-schema.md)** - Database structure and relationships
- **[Deployment Guide](docs/deployment.md)** - Detailed deployment instructions
- **[Security Documentation](docs/security.md)** - Security best practices and guidelines

---

## 🤝 Contributing

We welcome contributions to improve the APS News Dashboard! Please follow these guidelines:

### How to Contribute

1. **Fork the Repository**
2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit Your Changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the Branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Contribution Guidelines

- Follow the existing code style
- Add JSDoc comments to new functions
- Write clear commit messages
- Test your changes thoroughly
- Update documentation as needed
- Do NOT break existing functionality

### Code Review Process

1. Automated tests will run on your PR
2. At least one maintainer will review your code
3. Address any requested changes
4. Once approved, your PR will be merged

---

## 📄 License

**Proprietary License**

Copyright © 2024 Algeria Press Service (APS). All rights reserved.

This software and associated documentation files are proprietary to Algeria Press Service. Unauthorized copying, distribution, modification, or use of this software is strictly prohibited.

---

## 📞 Support & Contact

For support, bug reports, or feature requests:

- **Email**: support@aps.dz
- **Internal Issue Tracker**: [Internal Link]
- **Documentation**: See `/docs` directory

---

## 🙏 Acknowledgments

- Algeria Press Service development team
- Material-UI for the excellent component library
- React community for best practices and tools

---

**Made with ❤️ by the APS Development Team**

*Last Updated: October 2024*
