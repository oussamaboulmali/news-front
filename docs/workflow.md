# User Workflows & System Processes

## Table of Contents

- [Overview](#overview)
- [User Roles](#user-roles)
- [Authentication Workflows](#authentication-workflows)
- [User Management Workflows](#user-management-workflows)
- [Agency Management Workflows](#agency-management-workflows)
- [Content Management Workflows](#content-management-workflows)
- [Logging & Monitoring Workflows](#logging--monitoring-workflows)
- [Configuration Workflows](#configuration-workflows)

## Overview

This document describes the key workflows and business processes in the News Dashboard application. Each workflow represents a common user journey or system operation.

## User Roles

### Role Hierarchy

```
┌──────────────────────────────────────────────────┐
│              Super Administrator                 │
│  - Full system access                           │
│  - User & agency management                     │
│  - System configuration                         │
│  - View all logs                                │
└──────────────────────────────────────────────────┘
                    │
    ┌───────────────┴───────────────┐
    │                               │
┌────────────────────┐    ┌────────────────────┐
│  Administrator     │    │  Agency Manager    │
│  - Agency-specific │    │  - Single agency   │
│  - User management │    │  - Content mgmt    │
│  - Content review  │    │  - User view       │
└────────────────────┘    └────────────────────┘
    │                               │
    │                      ┌────────┴────────┐
    │                      │                 │
┌────────────────────┐    │    ┌─────────────────────┐
│      Editor        │    │    │     Journalist      │
│  - Create content  │    │    │  - Submit articles  │
│  - Edit articles   │    │    │  - View own content │
│  - Publish         │    │    └─────────────────────┘
└────────────────────┘    │
                          │
                  ┌───────┴────────┐
                  │     Viewer     │
                  │  - Read-only   │
                  │  - No edit     │
                  └────────────────┘
```

### Permission Matrix

| Feature | Super Admin | Admin | Agency Mgr | Editor | Journalist | Viewer |
|---------|:-----------:|:-----:|:----------:|:------:|:----------:|:------:|
| **Users** |
| View Users | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Create User | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Edit User | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Delete User | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Block User | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Reset Password | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Agencies** |
| View Agencies | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create Agency | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Edit Agency | ✓ | ✓ | Limited | ✗ | ✗ | ✗ |
| Delete Agency | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Content** |
| View Content | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create Content | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Edit Content | ✓ | ✓ | ✓ | ✓ | Own | ✗ |
| Delete Content | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Publish Content | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| **Logs** |
| View Logs | ✓ | ✓ | Limited | ✗ | ✗ | ✗ |
| Export Logs | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Configuration** |
| System Config | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Agency Config | ✓ | ✓ | Limited | ✗ | ✗ | ✗ |
| User Preferences | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

## Authentication Workflows

### 1. Standard Login Flow

```mermaid
graph TD
    A[User visits application] --> B{Is authenticated?}
    B -->|Yes| C[Redirect to Dashboard]
    B -->|No| D[Show Login Page]
    D --> E[User enters credentials]
    E --> F[Client-side validation]
    F --> G{Valid format?}
    G -->|No| H[Show error message]
    H --> E
    G -->|Yes| I[Check for SQL injection]
    I --> J{Safe input?}
    J -->|No| K[Log security event & Block]
    J -->|Yes| L[Send POST to /auth/login]
    L --> M[Backend validates credentials]
    M --> N{Valid credentials?}
    N -->|No| O[Increment failed attempts]
    O --> P{Max attempts reached?}
    P -->|Yes| Q[Block account]
    P -->|No| R[Return error]
    R --> E
    N -->|Yes| S[Check for existing session]
    S --> T{Session exists?}
    T -->|No| U[Create new session]
    T -->|Yes| V[Show session warning dialog]
    V --> W{User confirms?}
    W -->|No| E
    W -->|Yes| X[Close old session]
    X --> U
    U --> Y[Set session cookie]
    Y --> Z[Encrypt user data in localStorage]
    Z --> AA[Fetch user menu/permissions]
    AA --> AB[Build dynamic routes]
    AB --> C
```

**Steps:**

1. **User Access**: User navigates to the application
2. **Auth Check**: Check if user has valid session
3. **Login Page**: Display login form if not authenticated
4. **Input Validation**: 
   - Check email/username format
   - Validate password length (6-20 characters)
   - Scan for SQL injection patterns
   - Scan for XSS attempts
5. **API Request**: Send credentials to backend
6. **Backend Validation**:
   - Verify credentials against database
   - Check account status (active/blocked)
   - Track failed login attempts
7. **Session Check**: Check for existing active session
8. **Session Warning** (if exists):
   - Display warning with last login details
   - User can force new session or cancel
9. **Session Creation**:
   - Generate secure session ID
   - Create HTTP-only cookie
   - Store session in database
10. **Client Setup**:
    - Encrypt user data (username, lang) in localStorage
    - Set `isLogged` flag
    - Fetch user menu permissions
11. **Route Generation**: Build dynamic routes based on role
12. **Redirect**: Navigate to dashboard

### 2. Duplicate Session Handling

**Scenario**: User logs in while already having an active session

```mermaid
graph TD
    A[Login attempt] --> B[Backend finds existing session]
    B --> C[Return session info to frontend]
    C --> D[Display confirmation dialog]
    D --> E{User action}
    E -->|Cancel| F[Stay on login page]
    E -->|Confirm| G[Send close session request]
    G --> H[Backend invalidates old session]
    H --> I[Create new session]
    I --> J[Continue login flow]
```

**Dialog Message**:
```
You already have an active session.
Last activity: 2024-01-15 10:30
IP Address: 192.168.1.100

Do you want to close the previous session and continue?
```

### 3. Logout Flow

```mermaid
graph TD
    A[User clicks logout] --> B[Show confirmation]
    B --> C{Confirm logout?}
    C -->|No| D[Cancel]
    C -->|Yes| E[Send POST /auth/logout]
    E --> F[Backend invalidates session]
    F --> G[Clear localStorage]
    G --> H[Clear sessionStorage]
    H --> I[Redirect to login]
```

### 4. Auto-Logout Flow

**Triggers**:
- Session expiration
- Account blocked
- Account deleted
- Permission revoked
- Security violation detected

```mermaid
graph TD
    A[API Request fails] --> B{Error type?}
    B -->|Session expired| C[Show expiration message]
    B -->|Account blocked| D[Show block message]
    B -->|Permission denied| E[Show permission message]
    C --> F[Clear local storage]
    D --> F
    E --> F
    F --> G[Redirect to login]
```

## User Management Workflows

### 1. Create New User

```mermaid
graph TD
    A[Admin clicks 'Add User'] --> B[Display user form]
    B --> C[Enter user details]
    C --> D[Select agencies]
    D --> E[Select role]
    E --> F[Set initial password]
    F --> G[Submit form]
    G --> H[Client-side validation]
    H --> I{Valid?}
    I -->|No| J[Show validation errors]
    J --> C
    I -->|Yes| K[Check for special characters]
    K --> L{Valid?}
    L -->|No| M[Show character warning]
    M --> C
    L -->|Yes| N[Send POST /users]
    N --> O[Backend validation]
    O --> P{Valid?}
    P -->|No| Q[Return errors]
    Q --> J
    P -->|Yes| R[Create user in database]
    R --> S[Log creation action]
    S --> T[Send email notification optional]
    T --> U[Show success message]
    U --> V[Refresh user list]
```

**Form Fields**:
- **Username** (required, unique)
- **Email** (required, valid format)
- **Phone** (optional, 10 digits)
- **Password** (required, 6-20 characters)
- **Role** (required, dropdown)
- **Agencies** (required, multi-select)
- **Status** (active/inactive)

**Validation Rules**:
```javascript
{
  username: {
    required: true,
    minLength: 3,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9_-]+$/,
    noSpecialChars: ['.', '/', '_', '-']
  },
  email: {
    required: true,
    format: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    required: true,
    minLength: 6,
    maxLength: 20
  },
  phone: {
    optional: true,
    pattern: /^\d{10}$/
  },
  agencies: {
    required: true,
    minCount: 1
  }
}
```

### 2. Edit User Information

```mermaid
graph TD
    A[Admin clicks Edit button] --> B[Fetch user details]
    B --> C[Display pre-filled form]
    C --> D[Modify fields]
    D --> E[Submit changes]
    E --> F[Client validation]
    F --> G{Valid?}
    G -->|No| H[Show errors]
    H --> D
    G -->|Yes| I[Show confirmation]
    I --> J{Confirm?}
    J -->|No| C
    J -->|Yes| K[Send PUT /users/:id]
    K --> L[Backend updates database]
    L --> M[Log modification]
    M --> N[Show success]
    N --> O[Refresh user list]
```

**Editable Fields**:
- Email
- Phone
- Role
- Agencies
- Status (active/inactive)

**Non-Editable**:
- Username (unique identifier)
- Creation date
- Created by

### 3. Reset User Password

```mermaid
graph TD
    A[Admin selects Reset Password] --> B[Show password reset dialog]
    B --> C[Enter new password]
    C --> D[Confirm password]
    D --> E[Submit]
    E --> F{Passwords match?}
    F -->|No| G[Show error]
    G --> C
    F -->|Yes| H{Valid length?}
    H -->|No| I[Show length requirement]
    I --> C
    H -->|Yes| J[Show confirmation]
    J --> K{Confirm reset?}
    K -->|No| B
    K -->|Yes| L[Send PUT /users/:id/password]
    L --> M[Backend hashes & saves]
    M --> N[Log password reset]
    N --> O[Optional: Send email notification]
    O --> P[Show success]
    P --> Q[Close dialog]
```

**Password Requirements**:
- Minimum 6 characters
- Maximum 20 characters
- Cannot be same as username
- Must match confirmation

### 4. Block/Unblock User

```mermaid
graph TD
    A[Admin clicks Block/Unblock] --> B[Show confirmation dialog]
    B --> C{Action type?}
    C -->|Block| D[Enter reason required]
    C -->|Unblock| E[Enter note optional]
    D --> F[Submit]
    E --> F
    F --> G{Note provided?}
    G -->|No & required| H[Show error: Note required]
    H --> D
    G -->|Yes| I[Show final confirmation]
    I --> J{Confirm?}
    J -->|No| K[Cancel]
    J -->|Yes| L[Send PUT /users/:id/block or unblock]
    L --> M[Backend updates status]
    M --> N[Terminate user sessions if blocking]
    N --> O[Log action with reason]
    O --> P[Show success message]
    P --> Q[Refresh user list]
```

**Block Reasons**:
- Security violation
- Policy violation
- Administrative action
- Suspicious activity
- SQL injection attempt
- XSS attempt
- Custom reason

### 5. Assign Agencies to User

```mermaid
graph TD
    A[Admin clicks Assign Agencies] --> B[Fetch user's current agencies]
    B --> C[Fetch all available agencies]
    C --> D[Display dual-list selector]
    D --> E[Available Agencies | Assigned Agencies]
    E --> F[User moves agencies between lists]
    F --> G[Submit changes]
    G --> H{At least 1 agency?}
    H -->|No| I[Show error: Min 1 agency]
    I --> F
    H -->|Yes| J[Show confirmation]
    J --> K{Confirm?}
    K -->|No| F
    K -->|Yes| L[Send PUT /users/:id/agencies]
    L --> M[Backend updates relations]
    M --> N[Log agency assignment changes]
    N --> O[Update user menu permissions]
    O --> P[Show success]
    P --> Q[Close dialog]
```

### 6. Delete User

```mermaid
graph TD
    A[Admin clicks Delete] --> B[Show danger confirmation]
    B --> C{Confirm delete?}
    C -->|No| D[Cancel]
    C -->|Yes| E[Show reason input]
    E --> F[Enter deletion reason]
    F --> G[Submit]
    G --> H{Reason provided?}
    H -->|No| I[Show error: Reason required]
    I --> F
    H -->|Yes| J[Send DELETE /users/:id]
    J --> K[Backend soft-delete user]
    K --> L[Terminate all sessions]
    L --> M[Log deletion with reason]
    M --> N[Show success]
    N --> O[Refresh user list]
```

**Deletion Types**:
- **Soft Delete** (default): Mark as deleted, keep data
- **Hard Delete** (admin only): Permanently remove data

## Agency Management Workflows

### 1. Create New Agency

```mermaid
graph TD
    A[Admin clicks Add Agency] --> B[Display agency form]
    B --> C[Enter agency details]
    C --> D[Upload logo optional]
    D --> E[Submit form]
    E --> F[Client validation]
    F --> G{Valid?}
    G -->|No| H[Show errors]
    H --> C
    G -->|Yes| I[Send POST /agencies]
    I --> J[Backend creates agency]
    J --> K[Upload logo to storage]
    K --> L[Log creation]
    L --> M[Show success]
    M --> N[Refresh agency list]
```

**Form Fields**:
- **Name (French)** (required)
- **Name (Arabic)** (required)
- **Phone** (optional)
- **Email** (optional)
- **Logo** (optional, drag-drop or browse)
- **Status** (active/inactive)

### 2. Edit Agency

```mermaid
graph TD
    A[Admin clicks Edit] --> B[Fetch agency details]
    B --> C[Display pre-filled form]
    C --> D[Modify fields]
    D --> E[Submit]
    E --> F[Show confirmation]
    F --> G{Deactivating?}
    G -->|Yes| H[Show warning: Users will be unassigned]
    H --> I{Still confirm?}
    I -->|No| C
    G -->|No| I
    I -->|Yes| J[Send PUT /agencies/:id]
    J --> K[Backend updates]
    K --> L{Deactivated?}
    L -->|Yes| M[Unassign all users]
    L -->|No| N[Log modification]
    M --> N
    N --> O[Show success]
    O --> P[Refresh agency list]
```

### 3. Update Agency Logo

```mermaid
graph TD
    A[Admin clicks Change Logo] --> B[Show image upload dialog]
    B --> C[Drag & drop or browse]
    C --> D[Preview image]
    D --> E[Submit]
    E --> F{Valid image?}
    F -->|No| G[Show error: Invalid format]
    G --> C
    F -->|Yes| H[Send PUT /agencies/:id/logo]
    H --> I[Backend validates image]
    I --> J{Valid?}
    J -->|No| K[Return error]
    K --> G
    J -->|Yes| L[Delete old logo]
    L --> M[Save new logo]
    M --> N[Update database]
    N --> O[Log change]
    O --> P[Show success]
    P --> Q[Refresh agency display]
```

**Image Requirements**:
- **Formats**: PNG, JPG, JPEG, SVG
- **Max Size**: 2MB
- **Recommended**: 200x200px minimum
- **Aspect Ratio**: Square preferred

### 4. Assign Users to Agency

```mermaid
graph TD
    A[Admin clicks Assign Users] --> B[Fetch agency's current users]
    B --> C[Fetch all users]
    C --> D[Display dual-list selector]
    D --> E[User moves users between lists]
    E --> F[Submit changes]
    F --> G[Show confirmation]
    G --> H{Confirm?}
    H -->|No| E
    H -->|Yes| I[Send PUT /agencies/:id/users]
    I --> J[Backend updates relations]
    J --> K[Update user menu permissions]
    K --> L[Log user assignment changes]
    L --> M[Show success]
    M --> N[Close dialog]
```

## Content Management Workflows

### 1. View Agency Content

```mermaid
graph TD
    A[User clicks agency] --> B[Fetch agency articles]
    B --> C[Display article list]
    C --> D[Apply filters optional]
    D --> E[Refresh list]
    E --> F[User clicks article]
    F --> G[Display article details]
    G --> H[Show full content]
    H --> I[Available actions based on role]
    I --> J{User role?}
    J -->|Viewer| K[Read-only view]
    J -->|Editor| L[Edit/Delete options]
    J -->|Admin| M[Full control]
```

### 2. Search and Filter Content

```mermaid
graph TD
    A[User opens search] --> B[Display search form]
    B --> C[Enter search criteria]
    C --> D[Title, date range, agency, author]
    D --> E[Submit search]
    E --> F[Send GET with query params]
    F --> G[Backend filters results]
    G --> H[Return filtered data]
    H --> I[Display results]
    I --> J[Pagination if needed]
    J --> K{User action?}
    K -->|Clear filters| B
    K -->|Select item| L[View details]
    K -->|Export results| M[Export to file]
```

## Logging & Monitoring Workflows

### 1. View System Logs

```mermaid
graph TD
    A[Admin clicks Logs] --> B[Display log categories]
    B --> C[User Logs, Agency Logs, Error Logs, etc.]
    C --> D[Select category]
    D --> E[Fetch logs]
    E --> F[Display logs table]
    F --> G[Apply filters]
    G --> H[Date range, level, user]
    H --> I[Refresh results]
    I --> J{User action?}
    J -->|View details| K[Show log item modal]
    J -->|Export| L[Download logs]
    J -->|Refresh| E
```

### 2. View Active Sessions

```mermaid
graph TD
    A[Admin clicks Sessions] --> B[Fetch active sessions]
    B --> C[Display sessions table]
    C --> D[Username, IP, Last Activity, Duration]
    D --> E{Admin action?}
    E -->|View details| F[Show session info]
    E -->|Terminate session| G[Show confirmation]
    G --> H{Confirm?}
    H -->|No| C
    H -->|Yes| I[Send DELETE /sessions/:id]
    I --> J[Backend invalidates session]
    J --> K[Log termination]
    K --> L[Show success]
    L --> M[Refresh session list]
```

### 3. Export Logs

```mermaid
graph TD
    A[Admin clicks Export] --> B[Show export options]
    B --> C[Select format: PDF, Excel, Word]
    C --> D[Select date range]
    D --> E[Select log types]
    E --> F[Submit export request]
    F --> G[Frontend generates file]
    G --> H[Trigger download]
    H --> I[Show success notification]
```

## Configuration Workflows

### 1. Update User Preferences

```mermaid
graph TD
    A[User clicks profile/settings] --> B[Display preferences]
    B --> C[Change language]
    C --> D[Change refresh interval]
    D --> E[Update password]
    E --> F[Submit changes]
    F --> G[Validate password if changed]
    G --> H{Valid?}
    H -->|No| I[Show error]
    I --> E
    H -->|Yes| J[Send PUT /users/preferences]
    J --> K[Backend updates]
    K --> L[Encrypt & save in localStorage]
    L --> M[Apply changes immediately]
    M --> N[Show success]
```

### 2. System Configuration (Super Admin)

```mermaid
graph TD
    A[Super Admin clicks Configuration] --> B[Display config sections]
    B --> C[General, Security, Notifications]
    C --> D[Modify settings]
    D --> E[Submit changes]
    E --> F[Show confirmation]
    F --> G{Critical changes?}
    G -->|Yes| H[Show warning & require reason]
    H --> I[Enter reason]
    I --> J{Confirm?}
    G -->|No| J
    J -->|No| D
    J -->|Yes| K[Send PUT /config]
    K --> L[Backend updates]
    L --> M[Log config change]
    M --> N[Apply changes]
    N --> O[Show success]
    O --> P[Restart services if needed]
```

---

**Last Updated**: 2024
**Author**: APS Development Team
