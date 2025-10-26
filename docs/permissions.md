# 🔐 Permissions & Access Control Documentation

## Table of Contents

- [Overview](#overview)
- [RBAC Model](#rbac-model)
- [User Roles](#user-roles)
- [Permission Types](#permission-types)
- [Agency Access Control](#agency-access-control)
- [Feature Permissions](#feature-permissions)
- [Permission Checks](#permission-checks)
- [Dynamic Menu System](#dynamic-menu-system)
- [Best Practices](#best-practices)
- [Permission Management](#permission-management)

---

## Overview

The APS News Dashboard implements a comprehensive Role-Based Access Control (RBAC) system that determines what users can see and do within the application. This system ensures that users only have access to the features and data necessary for their role.

### Key Concepts

**Role**: A collection of permissions assigned to a user  
**Permission**: The right to perform a specific action or access a resource  
**Agency**: Organizational unit that users can be assigned to  
**Resource**: Pages, features, or data that can be accessed

---

## RBAC Model

### Architecture

```
User
  ├── Has Role(s)
  │     └── Contains Permissions
  │           └── Grants Access to Resources
  │
  └── Assigned to Agency/Agencies
        └── Limits Data Scope
```

### Permission Inheritance

```
Super Admin
    └── Admin
          └── Editor
                └── User
                      └── Guest
```

Higher roles inherit all permissions from lower roles.

---

## User Roles

### 1. Super Administrator

**Description**: Full system access, can manage everything  
**User Count**: Limited (1-2 users)  
**Typical Users**: System administrators, CTO

**Permissions:**
- Full CRUD on all resources
- User management (create, edit, delete users)
- Role assignment and modification
- System configuration
- View all logs and audit trails
- Agency management
- Security settings
- Backup and restore
- System monitoring

**Access:**
```javascript
{
  pages: ["*"],  // All pages
  actions: ["*"],  // All actions
  agencies: ["*"]  // All agencies
}
```

---

### 2. Administrator

**Description**: Manages users, agencies, and content  
**User Count**: Limited (5-10 users)  
**Typical Users**: Department heads, senior managers

**Permissions:**
- User management (create, edit users)
- Agency management
- Content management
- View logs and reports
- Configuration (limited)
- User role assignment (below Admin level)

**Restrictions:**
- Cannot delete Super Admins
- Cannot change Super Admin roles
- Cannot access system-level settings
- Cannot manage security configurations

**Access:**
```javascript
{
  pages: [
    "Acceuil",
    "Utilisateurs",
    "Agences",
    "Configuration",
    "Logs"
  ],
  actions: [
    "create_user",
    "edit_user",
    "view_user",
    "delete_user",
    "manage_agencies",
    "view_logs",
    "edit_config"
  ],
  agencies: ["*"]  // All agencies
}
```

---

### 3. Editor

**Description**: Creates and edits content within assigned agencies  
**User Count**: Moderate (20-50 users)  
**Typical Users**: Journalists, content creators

**Permissions:**
- View dashboard
- Create content in assigned agencies
- Edit own content
- Edit content in assigned agencies (if approved)
- View agency information
- View own profile
- Change own password

**Restrictions:**
- Cannot manage users
- Cannot access system configuration
- Cannot view system logs
- Limited to assigned agencies only
- Cannot delete published content

**Access:**
```javascript
{
  pages: [
    "Acceuil",
    "Agences"  // Only assigned agencies
  ],
  actions: [
    "view_dashboard",
    "create_content",
    "edit_own_content",
    "edit_agency_content",
    "view_agency",
    "view_profile"
  ],
  agencies: [1, 2, 5]  // Assigned agency IDs
}
```

---

### 4. Subscriber/Viewer

**Description**: Read-only access to content  
**User Count**: High (100+ users)  
**Typical Users**: Clients, partners, external users

**Permissions:**
- View dashboard (limited)
- View published content
- View agency information (public)
- View own profile

**Restrictions:**
- No content creation
- No editing capabilities
- No access to user management
- No access to configuration
- No access to logs
- Limited agency access

**Access:**
```javascript
{
  pages: [
    "Acceuil"  // Dashboard only
  ],
  actions: [
    "view_dashboard",
    "view_content",
    "view_profile"
  ],
  agencies: []  // No specific agency access
}
```

---

### 5. Guest

**Description**: Minimal access, pre-login state  
**User Count**: N/A (not stored)  
**Typical Users**: Not logged in users

**Permissions:**
- Access login page only

**Restrictions:**
- No access to any protected resources
- Redirected to login page

**Access:**
```javascript
{
  pages: ["Login"],
  actions: ["login"],
  agencies: []
}
```

---

## Permission Types

### 1. Resource Permissions

Control access to entire pages/modules.

```javascript
const RESOURCE_PERMISSIONS = {
  "acceuil": "VIEW_DASHBOARD",
  "utilisateurs": "MANAGE_USERS",
  "agences": "MANAGE_AGENCIES",
  "configuration": "MANAGE_CONFIG",
  "logs": "VIEW_LOGS"
};
```

### 2. Action Permissions

Control specific actions within resources.

```javascript
const ACTION_PERMISSIONS = {
  // User actions
  "create_user": "CREATE_USER",
  "edit_user": "EDIT_USER",
  "delete_user": "DELETE_USER",
  "view_user": "VIEW_USER",
  
  // Content actions
  "create_content": "CREATE_CONTENT",
  "edit_content": "EDIT_CONTENT",
  "delete_content": "DELETE_CONTENT",
  "publish_content": "PUBLISH_CONTENT",
  
  // Agency actions
  "create_agency": "CREATE_AGENCY",
  "edit_agency": "EDIT_AGENCY",
  "delete_agency": "DELETE_AGENCY",
  "view_agency": "VIEW_AGENCY",
  
  // Configuration actions
  "edit_config": "EDIT_CONFIG",
  "view_config": "VIEW_CONFIG",
  
  // Log actions
  "view_logs": "VIEW_LOGS",
  "export_logs": "EXPORT_LOGS"
};
```

### 3. Data Permissions

Control access to specific data items.

```javascript
const DATA_PERMISSIONS = {
  // Own data
  "own_profile": true,
  "own_content": true,
  
  // Agency data
  "agency_content": ["1", "2", "5"],  // Agency IDs
  "agency_users": ["1", "2", "5"],
  
  // All data (admin only)
  "all_data": false
};
```

---

## Agency Access Control

### Agency Assignment

Users can be assigned to one or multiple agencies:

```javascript
{
  userId: "123",
  username: "john.doe",
  agencies: [
    {
      id: 1,
      name: "APS AR",
      alias: "aps-ar",
      role: "editor"
    },
    {
      id: 2,
      name: "APS FR",
      alias: "aps-fr",
      role: "viewer"
    }
  ]
}
```

### Agency Hierarchy

```
Fils de Presse (Parent)
  ├── APS AR (Child)
  ├── APS FR (Child)
  └── APS EN (Child)
```

Users with access to parent agency automatically have access to all child agencies.

### Agency Permissions

| Permission | Description | Roles |
|------------|-------------|-------|
| **Full Access** | Create, edit, delete all content | Admin |
| **Edit Access** | Create and edit content | Editor |
| **View Access** | View content only | Subscriber |
| **No Access** | No access to agency | - |

---

## Feature Permissions

### Dashboard (Acceuil)

| Feature | Super Admin | Admin | Editor | Subscriber |
|---------|-------------|-------|--------|------------|
| View Statistics | ✅ | ✅ | ✅ | ✅ (Limited) |
| View All Agencies | ✅ | ✅ | ❌ | ❌ |
| Manage Subscribers | ✅ | ✅ | ❌ | ❌ |
| Advanced Search | ✅ | ✅ | ✅ | ✅ |
| Export Data | ✅ | ✅ | ✅ | ❌ |

### User Management (Utilisateurs)

| Feature | Super Admin | Admin | Editor | Subscriber |
|---------|-------------|-------|--------|------------|
| View Users List | ✅ | ✅ | ❌ | ❌ |
| Create User | ✅ | ✅ | ❌ | ❌ |
| Edit User | ✅ | ✅ | Own Only | Own Only |
| Delete User | ✅ | ✅ | ❌ | ❌ |
| Reset Password | ✅ | ✅ | Own Only | Own Only |
| Assign Roles | ✅ | ✅ (Limited) | ❌ | ❌ |
| Assign Agencies | ✅ | ✅ | ❌ | ❌ |

### Agency Management (Agences)

| Feature | Super Admin | Admin | Editor | Subscriber |
|---------|-------------|-------|--------|------------|
| View All Agencies | ✅ | ✅ | ❌ | ❌ |
| View Assigned Agencies | ✅ | ✅ | ✅ | ✅ |
| Create Agency | ✅ | ✅ | ❌ | ❌ |
| Edit Agency | ✅ | ✅ | ❌ | ❌ |
| Delete Agency | ✅ | ❌ | ❌ | ❌ |
| Manage Content | ✅ | ✅ | ✅ (Assigned) | ❌ |
| Upload Images | ✅ | ✅ | ✅ | ❌ |

### Configuration

| Feature | Super Admin | Admin | Editor | Subscriber |
|---------|-------------|-------|--------|------------|
| View Config | ✅ | ✅ | ❌ | ❌ |
| Edit Config | ✅ | ✅ (Limited) | ❌ | ❌ |
| Manage Agencies | ✅ | ✅ | ❌ | ❌ |
| Manage Images | ✅ | ✅ | ❌ | ❌ |
| System Settings | ✅ | ❌ | ❌ | ❌ |

### Logs

| Feature | Super Admin | Admin | Editor | Subscriber |
|---------|-------------|-------|--------|------------|
| View All Logs | ✅ | ✅ | ❌ | ❌ |
| View Own Logs | ✅ | ✅ | ✅ | ❌ |
| Export Logs | ✅ | ✅ | ❌ | ❌ |
| Delete Logs | ✅ | ❌ | ❌ | ❌ |
| View Sessions | ✅ | ✅ | Own Only | ❌ |

---

## Permission Checks

### Frontend Permission Checks

#### Check Page Access

```javascript
// In App.jsx - Dynamic route generation
const routes = response?.data?.data;

// Routes are generated based on user permissions
// User only sees menu items they have access to
```

#### Check Action Permission

```javascript
// Example: Check if user can create content
const canCreateContent = user.permissions.includes("CREATE_CONTENT") && 
                         user.agencies.length > 0;

// Show/hide create button
{canCreateContent && (
  <Button onClick={handleCreate}>Create Content</Button>
)}
```

#### Check Agency Access

```javascript
// Check if user has access to specific agency
const hasAgencyAccess = (agencyId) => {
  // Admin has access to all
  if (user.role === "admin" || user.role === "super_admin") {
    return true;
  }
  
  // Check if agency in user's assigned agencies
  return user.agencies.some(a => a.id === agencyId);
};
```

### Backend Permission Checks

```javascript
// Middleware to check permissions
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    const user = req.session.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    
    if (!user.permissions.includes(requiredPermission)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Insufficient permissions"
      });
    }
    
    next();
  };
};

// Usage in routes
router.post('/users', 
  checkPermission('CREATE_USER'),
  createUserController
);
```

---

## Dynamic Menu System

### How It Works

1. **User Logs In**
   ```javascript
   // User authenticates
   POST /auth/login
   ```

2. **Backend Returns Permissions**
   ```javascript
   // Backend determines user's menu based on role and agencies
   POST /users/menu
   
   Response:
   {
     "Acceuil": "Acceuil",
     "Utilisateurs": "Utilisateurs",
     "Agences": {
       "Fils de Presse": [
         { name: "APS AR", id: 1, alias: "aps-ar" },
         { name: "APS FR", id: 2, alias: "aps-fr" }
       ]
     }
   }
   ```

3. **Frontend Generates Routes**
   ```javascript
   // App.jsx dynamically creates routes
   const fetchRoutes = async () => {
     const menuData = response.data.data;
     const routeArray = [];
     
     // Convert menu to route objects
     for (const key in menuData) {
       if (typeof menuData[key] === "string") {
         // Simple route
         routeArray.push({
           path: menuData[key],
           component: await DynamicComponent(key)
         });
       } else {
         // Nested routes (agencies)
         // ...
       }
     }
     
     setRoutes(routeArray);
   };
   ```

4. **Menu Rendered**
   ```javascript
   // SideBarMenu component displays only accessible items
   {routes.map(route => (
     <MenuItem path={route.path}>
       {route.name}
     </MenuItem>
   ))}
   ```

### Menu Structure

```javascript
// Super Admin Menu
{
  "Acceuil": "Acceuil",
  "Utilisateurs": "Utilisateurs",
  "Configuration": "Configuration",
  "Logs": "Logs",
  "Agences": {
    "Fils de Presse": [
      { name: "APS AR", id: 1 },
      { name: "APS FR", id: 2 },
      { name: "APS EN", id: 3 }
    ]
  }
}

// Editor Menu (limited agencies)
{
  "Acceuil": "Acceuil",
  "Agences": {
    "Fils de Presse": [
      { name: "APS AR", id: 1 }  // Only assigned agency
    ]
  }
}

// Subscriber Menu
{
  "Acceuil": "Acceuil"
}
```

---

## Best Practices

### For Developers

#### 1. Always Check Permissions

```javascript
// ✅ GOOD: Check before showing UI
{hasPermission("CREATE_USER") && (
  <Button onClick={createUser}>Create User</Button>
)}

// ❌ BAD: Show UI without checking
<Button onClick={createUser}>Create User</Button>
```

#### 2. Check on Both Frontend and Backend

```javascript
// Frontend check (UX)
if (!canDelete) {
  return toast.error("You don't have permission");
}

// Backend check (Security)
if (!user.permissions.includes("DELETE_USER")) {
  return res.status(403).json({ error: "Forbidden" });
}
```

#### 3. Graceful Permission Denials

```javascript
// ✅ GOOD: User-friendly message
if (!hasPermission) {
  toast.info("Contact your administrator for access");
  return;
}

// ❌ BAD: Technical error
if (!hasPermission) {
  throw new Error("403 Forbidden");
}
```

### For Administrators

#### 1. Principle of Least Privilege

- Grant minimum necessary permissions
- Review permissions regularly
- Remove unused permissions

#### 2. Role Assignment Guidelines

- Use appropriate role for each user
- Don't assign Admin role unless necessary
- Limit Super Admin accounts

#### 3. Agency Assignment

- Assign users to specific agencies
- Avoid giving access to all agencies unless required
- Review agency assignments quarterly

---

## Permission Management

### Adding New Permissions

1. **Define Permission**
   ```javascript
   const NEW_PERMISSION = {
     name: "EXPORT_REPORTS",
     description: "Export reports to PDF/Excel",
     resource: "Reports",
     action: "export"
   };
   ```

2. **Update Role Definitions**
   ```javascript
   const ROLES = {
     admin: {
       permissions: [
         ...existingPermissions,
         "EXPORT_REPORTS"
       ]
     }
   };
   ```

3. **Implement Check in Code**
   ```javascript
   if (hasPermission("EXPORT_REPORTS")) {
     // Show export button
   }
   ```

4. **Update Backend**
   ```javascript
   router.get('/export',
     checkPermission("EXPORT_REPORTS"),
     exportController
   );
   ```

### Modifying Existing Permissions

1. Update role definitions in backend
2. Update frontend permission checks
3. Test with different user roles
4. Document changes
5. Notify affected users

### Auditing Permissions

```sql
-- Get user permissions
SELECT u.username, r.role_name, p.permission_name
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.id = ?;

-- Get users with specific permission
SELECT u.username, u.email, r.role_name
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE p.permission_name = 'DELETE_USER';
```

---

## Permission Matrix

### Complete Permission Matrix

| Feature | Super Admin | Admin | Editor | Subscriber |
|---------|-------------|-------|--------|------------|
| **Dashboard** |
| View Dashboard | ✅ | ✅ | ✅ | ✅ |
| View All Stats | ✅ | ✅ | ❌ | ❌ |
| **Users** |
| List Users | ✅ | ✅ | ❌ | ❌ |
| Create User | ✅ | ✅ | ❌ | ❌ |
| Edit User | ✅ | ✅ | Own | Own |
| Delete User | ✅ | ✅ | ❌ | ❌ |
| **Agencies** |
| List All | ✅ | ✅ | ❌ | ❌ |
| List Assigned | ✅ | ✅ | ✅ | ✅ |
| Create Agency | ✅ | ✅ | ❌ | ❌ |
| Edit Agency | ✅ | ✅ | ❌ | ❌ |
| Delete Agency | ✅ | ❌ | ❌ | ❌ |
| **Content** |
| Create | ✅ | ✅ | ✅ | ❌ |
| Edit Own | ✅ | ✅ | ✅ | ❌ |
| Edit Others | ✅ | ✅ | ❌ | ❌ |
| Delete | ✅ | ✅ | Own | ❌ |
| Publish | ✅ | ✅ | ❌ | ❌ |
| **Configuration** |
| View Config | ✅ | ✅ | ❌ | ❌ |
| Edit Config | ✅ | Limited | ❌ | ❌ |
| **Logs** |
| View All Logs | ✅ | ✅ | ❌ | ❌ |
| View Own Logs | ✅ | ✅ | ✅ | ❌ |
| Export Logs | ✅ | ✅ | ❌ | ❌ |
| **System** |
| System Settings | ✅ | ❌ | ❌ | ❌ |
| Backup/Restore | ✅ | ❌ | ❌ | ❌ |
| Security Config | ✅ | ❌ | ❌ | ❌ |

---

**Document Version**: 1.0  
**Last Updated**: October 2024  
**Maintained By**: APS Security & Development Team
