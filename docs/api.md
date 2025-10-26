# 🌐 API Documentation

## Table of Contents

- [Overview](#overview)
- [Base Configuration](#base-configuration)
- [Authentication](#authentication)
- [API Request Structure](#api-request-structure)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Authentication Endpoints](#authentication-endpoints)
  - [User Management Endpoints](#user-management-endpoints)
  - [Agency Management Endpoints](#agency-management-endpoints)
  - [Configuration Endpoints](#configuration-endpoints)
  - [Logging Endpoints](#logging-endpoints)
- [Security](#security)
- [Rate Limiting](#rate-limiting)
- [Pagination](#pagination)

---

## Overview

This document describes the REST API endpoints consumed by the APS News Dashboard frontend application. The backend API is built with Node.js/Express and follows REST principles.

**API Version**: v1  
**Protocol**: HTTPS (Production), HTTP (Development)  
**Data Format**: JSON  
**Authentication**: Session-based with HTTP-only cookies

---

## Base Configuration

### Environment-Based URLs

**Development:**
```
Base URL: http://localhost:3000/api/v1/
Image URL: http://localhost:3000
```

**Production:**
```
Base URL: https://api.aps.dz/api/v1/
Image URL: https://api.aps.dz
```

### Configuration in Frontend

```javascript
// Configured in .env
VITE_BASE_URL=http://localhost:3000/api/v1/
VITE_IMAGE_URL=http://localhost:3000
VITE_APP_ID=your-api-key-here
```

---

## Authentication

### Authentication Method

The API uses **session-based authentication** with HTTP-only cookies.

1. User logs in with credentials
2. Backend validates and creates session
3. Session ID stored in HTTP-only cookie
4. Cookie automatically sent with each request
5. Backend validates session on each request

### Session Management

**Session Duration**: 24 hours (configurable)  
**Concurrent Sessions**: Detected and manageable  
**Session Storage**: Server-side (Redis/Memory)

---

## API Request Structure

### Common Headers

All API requests include the following headers:

```http
x-api-key: {VITE_APP_ID}
Content-Type: application/json
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Permissions-Policy: geolocation=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### Request with useAxios Hook

```javascript
import { useAxios } from './services/useAxios';

const { response, loading, error, fetchData } = useAxios({
  method: 'post',        // 'get' | 'post' | 'put' | 'delete'
  url: baseUrl + 'users',
  body: {
    name: "John Doe",
    email: "john@example.com"
  }
});
```

### Credentials

```javascript
withCredentials: true  // Always true for session cookies
```

---

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  },
  "timestamp": "2024-10-26T10:30:00Z"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Detailed error information"
  },
  "timestamp": "2024-10-26T10:30:00Z"
}
```

### Pagination Response

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Authentication required or session expired |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (e.g., duplicate) |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

### Error Handling in Frontend

```javascript
try {
  const res = await axios[method](url, body, config);
  setResponse(res);
} catch (error) {
  if (error.response) {
    // Server responded with error
    if (error.response.data.logout) {
      // Session expired - redirect to login
      localStorage.clear();
      window.location.replace("/login");
    }
    setError(error.response.data.message);
  } else if (error.request) {
    // No response from server
    setError("No server response");
  }
}
```

---

## Endpoints

### Authentication Endpoints

#### 1. Login

**Endpoint**: `POST /auth/login`  
**Authentication**: None (Public)  
**Description**: Authenticates user and creates session

**Request Body:**
```json
{
  "username": "john.doe",
  "password": "SecurePassword123"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": "123",
    "username": "john.doe",
    "lang": 2,
    "sessionId": "session-id-here"
  },
  "hasSession": false
}
```

**Existing Session Response** (200):
```json
{
  "success": true,
  "message": "User has active session",
  "data": {
    "userId": "123",
    "sessionId": "existing-session-id"
  },
  "hasSession": true
}
```

**Error Responses:**
- 401: Invalid credentials
- 422: Validation error (missing fields)
- 429: Too many login attempts

---

#### 2. Logout

**Endpoint**: `POST /auth/logout`  
**Authentication**: Required  
**Description**: Terminates user session

**Request Body:**
```json
{
  "username": "john.doe"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

#### 3. Close Existing Session

**Endpoint**: `POST /auth/close`  
**Authentication**: None (Special case)  
**Description**: Closes an existing session when user wants to login on another device

**Request Body:**
```json
{
  "sessionId": "session-to-close",
  "userId": "123",
  "username": "john.doe",
  "password": "SecurePassword123"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Previous session closed",
  "data": {
    "userId": "123",
    "username": "john.doe",
    "lang": 2
  }
}
```

---

### User Management Endpoints

#### 4. Get User Menu/Permissions

**Endpoint**: `POST /users/menu`  
**Authentication**: Required  
**Description**: Returns menu items and routes based on user permissions

**Request Body:**
```json
{}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "Acceuil": "Acceuil",
    "Utilisateurs": "Utilisateurs",
    "Configuration": "Configuration",
    "Logs": "Logs",
    "Agences": {
      "Fils de Presse": [
        {
          "name": "APS AR",
          "id_agency": 1,
          "alias": "aps-ar"
        },
        {
          "name": "APS FR",
          "id_agency": 2,
          "alias": "aps-fr"
        }
      ]
    }
  }
}
```

---

#### 5. List Users

**Endpoint**: `GET /users`  
**Authentication**: Required  
**Permissions**: Admin or User Manager  
**Description**: Get list of all users

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search term
- `role` (optional): Filter by role
- `agency` (optional): Filter by agency

**Example Request:**
```
GET /users?page=1&limit=20&search=john
```

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "123",
      "username": "john.doe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "Editor",
      "agency": "APS AR",
      "status": "active",
      "createdAt": "2024-01-15T10:30:00Z",
      "lastLogin": "2024-10-26T08:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

#### 6. Get User Details

**Endpoint**: `GET /users/:id`  
**Authentication**: Required  
**Permissions**: Admin, User Manager, or Own Profile  
**Description**: Get detailed information about a specific user

**Path Parameters:**
- `id`: User ID

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "123",
    "username": "john.doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "0123456789",
    "role": "Editor",
    "agencies": ["APS AR", "APS FR"],
    "permissions": ["read", "write", "publish"],
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-10-20T14:20:00Z",
    "lastLogin": "2024-10-26T08:00:00Z",
    "loginCount": 156
  }
}
```

**Error Responses:**
- 404: User not found
- 403: Insufficient permissions

---

#### 7. Create User

**Endpoint**: `POST /users`  
**Authentication**: Required  
**Permissions**: Admin or User Manager  
**Description**: Create a new user account

**Request Body:**
```json
{
  "username": "jane.smith",
  "email": "jane@example.com",
  "password": "SecurePassword123",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "0123456789",
  "role": "Editor",
  "agencies": [1, 2],
  "permissions": ["read", "write"]
}
```

**Success Response** (201):
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "124",
    "username": "jane.smith",
    "email": "jane@example.com"
  }
}
```

**Error Responses:**
- 409: Username or email already exists
- 422: Validation error
- 403: Insufficient permissions

---

#### 8. Update User

**Endpoint**: `PUT /users/:id`  
**Authentication**: Required  
**Permissions**: Admin, User Manager, or Own Profile  
**Description**: Update user information

**Path Parameters:**
- `id`: User ID

**Request Body** (all fields optional):
```json
{
  "email": "newemail@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "0987654321",
  "role": "Senior Editor",
  "agencies": [1, 2, 3],
  "permissions": ["read", "write", "publish"],
  "status": "active"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "123",
    "username": "john.doe",
    "email": "newemail@example.com"
  }
}
```

---

#### 9. Delete User

**Endpoint**: `DELETE /users/:id`  
**Authentication**: Required  
**Permissions**: Admin only  
**Description**: Delete a user account

**Path Parameters:**
- `id`: User ID

**Success Response** (200):
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error Responses:**
- 404: User not found
- 403: Insufficient permissions
- 409: Cannot delete user with active sessions

---

#### 10. Reset User Password

**Endpoint**: `PUT /users/:id/password`  
**Authentication**: Required  
**Permissions**: Admin, User Manager, or Own Profile  
**Description**: Reset user password

**Path Parameters:**
- `id`: User ID

**Request Body:**
```json
{
  "currentPassword": "OldPassword123",  // Required for own password
  "newPassword": "NewSecurePassword456",
  "confirmPassword": "NewSecurePassword456"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

#### 11. Block User

**Endpoint**: `PUT /users/block`  
**Authentication**: Required  
**Permissions**: Admin only  
**Description**: Block a user account due to policy violations

**Request Body:**
```json
{
  "blockCode": "SQL_INJECTION"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "User blocked successfully"
}
```

---

### Agency Management Endpoints

#### 12. List Agencies

**Endpoint**: `GET /agencies`  
**Authentication**: Required  
**Description**: Get list of all agencies

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `type` (optional): Filter by agency type

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "APS AR",
      "alias": "aps-ar",
      "type": "News Agency",
      "description": "Arabic News Service",
      "status": "active",
      "itemCount": 245,
      "subscriberCount": 120
    }
  ]
}
```

---

#### 13. Get Agency Details

**Endpoint**: `GET /agencies/:id`  
**Authentication**: Required  
**Permissions**: User must have access to agency  
**Description**: Get detailed information about an agency

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "APS AR",
    "alias": "aps-ar",
    "type": "News Agency",
    "description": "Arabic News Service",
    "logo": "/images/agencies/aps-ar-logo.png",
    "settings": {
      "language": "ar",
      "timezone": "Africa/Algiers"
    },
    "statistics": {
      "totalArticles": 245,
      "subscribers": 120,
      "activeUsers": 15
    }
  }
}
```

---

### Configuration Endpoints

#### 14. Get System Configuration

**Endpoint**: `GET /config`  
**Authentication**: Required  
**Permissions**: Admin only  
**Description**: Get system configuration

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "systemName": "APS News Dashboard",
    "version": "1.0.0",
    "supportedLanguages": ["ar", "fr", "en"],
    "defaultLanguage": "fr",
    "sessionTimeout": 86400,
    "maxLoginAttempts": 5
  }
}
```

---

#### 15. Update System Configuration

**Endpoint**: `PUT /config`  
**Authentication**: Required  
**Permissions**: Admin only  
**Description**: Update system configuration

**Request Body:**
```json
{
  "defaultLanguage": "ar",
  "sessionTimeout": 43200,
  "maxLoginAttempts": 3
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Configuration updated successfully"
}
```

---

### Logging Endpoints

#### 16. Get Activity Logs

**Endpoint**: `GET /logs/:type`  
**Authentication**: Required  
**Permissions**: Admin or designated log viewers  
**Description**: Get system activity logs

**Path Parameters:**
- `type`: Log type (agences, users, blocage, erreurs_connexion)

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `startDate`: Filter by start date
- `endDate`: Filter by end date
- `userId`: Filter by user

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "log-123",
      "type": "user_action",
      "action": "CREATE_USER",
      "userId": "123",
      "username": "john.doe",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "details": {
        "targetUser": "jane.smith",
        "changes": ["email", "role"]
      },
      "timestamp": "2024-10-26T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1234
  }
}
```

---

#### 17. Get Active Sessions

**Endpoint**: `GET /logs/sessions`  
**Authentication**: Required  
**Permissions**: Admin only  
**Description**: Get list of active user sessions

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "sessionId": "session-abc-123",
      "userId": "123",
      "username": "john.doe",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "loginTime": "2024-10-26T08:00:00Z",
      "lastActivity": "2024-10-26T10:30:00Z",
      "expiresAt": "2024-10-27T08:00:00Z"
    }
  ]
}
```

---

## Security

### API Key Authentication

All requests must include the API key in headers:

```http
x-api-key: {VITE_APP_ID}
```

### Session Validation

Backend validates session on each request:
1. Check if session cookie exists
2. Validate session ID in storage
3. Check session expiration
4. Verify user permissions

### HTTPS Enforcement

**Production**: All requests must use HTTPS
```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### CORS Configuration

**Allowed Origins**: Configured in backend
**Credentials**: Always included (`withCredentials: true`)

---

## Rate Limiting

### Limits

| Endpoint Type | Limit | Window |
|--------------|-------|---------|
| Authentication | 5 requests | 15 minutes |
| API Endpoints | 100 requests | 15 minutes |
| File Uploads | 10 requests | 1 hour |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1635252000
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "message": "Too many requests",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "retryAfter": 300
  }
}
```

---

## Pagination

### Query Parameters

```
?page=1&limit=20
```

### Response Format

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Default Values

- **Default Page**: 1
- **Default Limit**: 20
- **Max Limit**: 100

---

## Best Practices

### For Frontend Developers

1. **Always Handle Errors**: Check for `error` in response
2. **Show Loading States**: Use `loading` state from useAxios
3. **Validate Before Sending**: Validate input before API calls
4. **Handle Session Expiry**: Redirect to login on 401
5. **Use Toast Notifications**: Inform users of success/failure

### Example Implementation

```javascript
const { response, loading, error, fetchData } = useAxios({
  method: 'post',
  url: baseUrl + 'users',
  body: userData
});

useEffect(() => {
  if (response?.data?.success) {
    toast.success('User created successfully');
    navigate('/users');
  }
}, [response]);

useEffect(() => {
  if (error) {
    toast.error(error);
  }
}, [error]);

return (
  <>
    {loading && <CircularProgress />}
    {!loading && <UserForm onSubmit={fetchData} />}
  </>
);
```

---

## Troubleshooting

### Common Issues

**Issue**: 401 Unauthorized  
**Solution**: Check if user is logged in, session may have expired

**Issue**: CORS Error  
**Solution**: Ensure `withCredentials: true` and backend CORS configured

**Issue**: 404 Not Found  
**Solution**: Verify endpoint URL and API base URL configuration

**Issue**: Slow Response  
**Solution**: Check network, consider pagination for large datasets

---

**Document Version**: 1.0  
**Last Updated**: October 2024  
**API Backend Repository**: [Internal Link]
