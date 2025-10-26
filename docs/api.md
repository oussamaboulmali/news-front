# API Documentation

## Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Request Format](#request-format)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Authentication Endpoints](#authentication-endpoints)
- [User Management Endpoints](#user-management-endpoints)
- [Agency Management Endpoints](#agency-management-endpoints)
- [Configuration Endpoints](#configuration-endpoints)
- [Logging Endpoints](#logging-endpoints)
- [Statistics Endpoints](#statistics-endpoints)
- [Rate Limiting](#rate-limiting)

## Overview

This document describes the REST API endpoints used by the News Dashboard frontend application. The API follows RESTful principles and uses JSON for request/response payloads.

### API Versioning

Current API Version: **v1**

All endpoints are prefixed with `/api/v1/`

### Environment Configuration

```javascript
// Development
const baseUrl = process.env.VITE_BASE_URL; // http://localhost:3000/api/v1/

// Production
const baseUrl = "/api/v1/";
```

## Base URL

### Development
```
http://localhost:3000/api/v1/
```

### Production
```
https://your-domain.com/api/v1/
```

## Authentication

### Authentication Method

The API uses **cookie-based session authentication**:

- Session cookies are HTTP-only and secure
- Cookies are automatically included in requests
- Sessions expire after inactivity timeout
- Multiple concurrent sessions can be detected and managed

### Required Headers

All API requests must include these headers:

```javascript
{
  "Content-Type": "application/json",
  "x-api-key": "your-api-key-here",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "geolocation=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains"
}
```

### Session Cookie

```
Set-Cookie: sessionId=abc123; HttpOnly; Secure; SameSite=Strict
```

## Request Format

### Standard Request

```javascript
// Using axios
axios({
  method: 'POST',
  url: baseUrl + 'endpoint',
  data: {
    // Request payload
  },
  withCredentials: true, // Include cookies
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey
  }
});
```

### GET Request with Query Parameters

```javascript
GET /api/v1/users?page=1&limit=10&role=admin&status=active
```

### POST/PUT Request with Body

```javascript
POST /api/v1/users
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "role": "editor",
  "agencies": [1, 2, 3]
}
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful",
  "hasSession": true,
  "logout": false
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description",
  "hasSession": false,
  "logout": true,
  "code": "ERROR_CODE"
}
```

### Pagination Response

```json
{
  "success": true,
  "data": {
    "items": [ /* array of items */ ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 95,
      "itemsPerPage": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## Error Handling

### HTTP Status Codes

| Status Code | Meaning | Description |
|------------|---------|-------------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (duplicate) |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Server maintenance |

### Error Codes

```javascript
{
  "INVALID_CREDENTIALS": "Invalid username or password",
  "SESSION_EXPIRED": "Your session has expired",
  "ACCOUNT_BLOCKED": "Your account has been blocked",
  "PERMISSION_DENIED": "You don't have permission for this action",
  "DUPLICATE_USERNAME": "Username already exists",
  "DUPLICATE_EMAIL": "Email already exists",
  "VALIDATION_ERROR": "Input validation failed",
  "SQL_INJECTION_DETECTED": "Suspicious input detected",
  "RATE_LIMIT_EXCEEDED": "Too many requests"
}
```

### Error Response Example

```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Input validation failed",
  "details": {
    "username": "Username must be at least 3 characters",
    "email": "Invalid email format"
  },
  "hasSession": true,
  "logout": false
}
```

## Authentication Endpoints

### POST /auth/login

Authenticate user and create session.

**Request:**
```json
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "SecurePass123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "hasSession": false,
  "data": {
    "userId": 123,
    "username": "john_doe",
    "role": "admin",
    "lang": 2,
    "agencies": [1, 2],
    "sessionId": "abc123xyz"
  },
  "message": "Login successful"
}
```

**Existing Session Response (200):**
```json
{
  "success": true,
  "hasSession": true,
  "data": {
    "userId": 123,
    "sessionId": "existing_session_id",
    "lastActivity": "2024-01-15T10:30:00Z",
    "ipAddress": "192.168.1.100"
  },
  "message": "Active session found"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "INVALID_CREDENTIALS",
  "message": "Invalid username or password",
  "hasSession": false,
  "logout": false
}
```

---

### POST /auth/logout

Terminate current session.

**Request:**
```json
POST /api/v1/auth/logout
Content-Type: application/json

{
  "username": "john_doe"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### POST /auth/close

Close existing session and create new one.

**Request:**
```json
POST /api/v1/auth/close
Content-Type: application/json

{
  "sessionId": "old_session_id",
  "userId": 123,
  "username": "john_doe",
  "password": "SecurePass123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": 123,
    "username": "john_doe",
    "role": "admin",
    "lang": 2,
    "sessionId": "new_session_id"
  },
  "message": "Previous session closed, new session created"
}
```

## User Management Endpoints

### GET /users

Get list of users with optional filtering.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `role` (string, optional)
- `status` (string: active|inactive|blocked|deleted)
- `agency` (number, optional)
- `search` (string, optional)

**Request:**
```
GET /api/v1/users?page=1&limit=10&status=active&role=editor
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com",
        "role": "editor",
        "status": "active",
        "agencies": [
          { "id": 1, "name": "APS Arabe" }
        ],
        "created_at": "2024-01-01T00:00:00Z",
        "last_login": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 47,
      "itemsPerPage": 10
    }
  }
}
```

---

### GET /users/:id

Get single user details.

**Request:**
```
GET /api/v1/users/123
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "username": "john_doe",
    "email": "john@example.com",
    "phone": "0123456789",
    "role": "editor",
    "status": "active",
    "lang": 2,
    "agencies": [
      { "id": 1, "name": "APS Arabe", "name_ar": "وكالة الأنباء الجزائرية" }
    ],
    "created_at": "2024-01-01T00:00:00Z",
    "created_by": "admin",
    "modified_at": "2024-01-10T14:20:00Z",
    "modified_by": "super_admin",
    "last_login": "2024-01-15T10:30:00Z",
    "login_count": 45
  }
}
```

---

### POST /users

Create new user.

**Request:**
```json
POST /api/v1/users
Content-Type: application/json

{
  "username": "jane_smith",
  "email": "jane@example.com",
  "phone": "0123456789",
  "password": "SecurePass123",
  "role": "editor",
  "agencies": [1, 2],
  "lang": 2,
  "status": "active"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 124,
    "username": "jane_smith",
    "email": "jane@example.com"
  },
  "message": "User created successfully"
}
```

**Validation Error (422):**
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "details": {
    "username": "Username already exists",
    "email": "Invalid email format",
    "agencies": "At least one agency is required"
  }
}
```

---

### PUT /users/:id

Update user information.

**Request:**
```json
PUT /api/v1/users/123
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "phone": "0987654321",
  "role": "admin",
  "agencies": [1, 2, 3],
  "status": "active"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "username": "john_doe",
    "email": "john.doe@example.com"
  },
  "message": "User updated successfully"
}
```

---

### DELETE /users/:id

Delete (soft delete) user.

**Request:**
```json
DELETE /api/v1/users/123
Content-Type: application/json

{
  "reason": "User requested account deletion"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### PUT /users/:id/password

Reset user password.

**Request:**
```json
PUT /api/v1/users/123/password
Content-Type: application/json

{
  "password": "NewSecurePass456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

### PUT /users/:id/block

Block user account.

**Request:**
```json
PUT /api/v1/users/123/block
Content-Type: application/json

{
  "reason": "Security violation detected",
  "blockCode": "SQL_INJECTION_DETECTED"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User blocked successfully"
}
```

---

### PUT /users/:id/unblock

Unblock user account.

**Request:**
```json
PUT /api/v1/users/123/unblock
Content-Type: application/json

{
  "note": "Issue resolved, account restored"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User unblocked successfully"
}
```

---

### POST /users/menu

Get user menu based on permissions.

**Request:**
```json
POST /api/v1/users/menu
Content-Type: application/json

{}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "Acceuil": "Acceuil",
    "Utilisateurs": "Utilisateurs",
    "Configuration": "Configuration",
    "Fils_de_presse": {
      "Fils_de_presse": [
        {
          "id_agency": 1,
          "name": "APS Arabe",
          "name_ar": "وكالة الأنباء الجزائرية",
          "alias": "aps-arabe"
        }
      ]
    },
    "Logs": "Logs"
  }
}
```

## Agency Management Endpoints

### GET /agencies

Get list of agencies.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `status` (string: active|inactive)
- `search` (string, optional)

**Request:**
```
GET /api/v1/agencies?page=1&limit=10&status=active
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "agencies": [
      {
        "id": 1,
        "name": "APS Arabe",
        "name_ar": "وكالة الأنباء الجزائرية",
        "slug": "aps-arabe",
        "email": "arabe@aps.dz",
        "phone": "0123456789",
        "logo": "/uploads/logos/aps-arabe.png",
        "status": "active",
        "user_count": 15,
        "article_count": 1250,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25
    }
  }
}
```

---

### GET /agencies/:id

Get single agency details.

**Request:**
```
GET /api/v1/agencies/1
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "APS Arabe",
    "name_ar": "وكالة الأنباء الجزائرية",
    "slug": "aps-arabe",
    "email": "arabe@aps.dz",
    "phone": "0123456789",
    "logo": "/uploads/logos/aps-arabe.png",
    "status": "active",
    "users": [
      { "id": 1, "username": "user1", "role": "editor" }
    ],
    "statistics": {
      "total_articles": 1250,
      "active_users": 15,
      "articles_this_week": 45
    },
    "created_at": "2024-01-01T00:00:00Z",
    "modified_at": "2024-01-10T10:00:00Z"
  }
}
```

---

### POST /agencies

Create new agency.

**Request:**
```json
POST /api/v1/agencies
Content-Type: multipart/form-data

{
  "name": "APS English",
  "name_ar": "وكالة باللغة الإنجليزية",
  "email": "english@aps.dz",
  "phone": "0123456789",
  "logo": [File],
  "status": "active"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "name": "APS English",
    "slug": "aps-english"
  },
  "message": "Agency created successfully"
}
```

---

### PUT /agencies/:id

Update agency.

**Request:**
```json
PUT /api/v1/agencies/1
Content-Type: application/json

{
  "name": "APS Arabe Updated",
  "email": "arabe_new@aps.dz",
  "status": "inactive"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Agency updated successfully",
  "warning": "All users have been unassigned due to status change"
}
```

---

### DELETE /agencies/:id

Delete agency.

**Request:**
```
DELETE /api/v1/agencies/1
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Agency deleted successfully"
}
```

---

### PUT /agencies/:id/logo

Update agency logo.

**Request:**
```
PUT /api/v1/agencies/1/logo
Content-Type: multipart/form-data

{
  "logo": [File]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "logo_url": "/uploads/logos/aps-arabe-new.png"
  },
  "message": "Logo updated successfully"
}
```

## Configuration Endpoints

### GET /config

Get system configuration.

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "refresh_interval": 5,
    "max_login_attempts": 5,
    "session_timeout": 3600,
    "supported_languages": ["ar", "fr", "en"],
    "default_language": "fr"
  }
}
```

---

### PUT /config

Update system configuration.

**Request:**
```json
PUT /api/v1/config
Content-Type: application/json

{
  "refresh_interval": 10,
  "max_login_attempts": 3
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Configuration updated successfully"
}
```

## Logging Endpoints

### GET /logs

Get system logs.

**Query Parameters:**
- `page` (number)
- `limit` (number)
- `type` (string: user|agency|error|security|session)
- `level` (string: info|warning|error)
- `start_date` (ISO date)
- `end_date` (ISO date)
- `user_id` (number)

**Request:**
```
GET /api/v1/logs?type=user&level=info&start_date=2024-01-01&end_date=2024-01-15
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": 1,
        "type": "user",
        "level": "info",
        "action": "USER_CREATED",
        "description": "New user created: jane_smith",
        "user_id": 5,
        "username": "admin",
        "ip_address": "192.168.1.100",
        "user_agent": "Mozilla/5.0...",
        "reference": "user_id:124",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": { /* ... */ }
  }
}
```

---

### GET /logs/sessions

Get active sessions.

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "abc123",
        "user_id": 5,
        "username": "john_doe",
        "ip_address": "192.168.1.100",
        "user_agent": "Mozilla/5.0...",
        "connected_at": "2024-01-15T09:00:00Z",
        "last_activity": "2024-01-15T10:30:00Z",
        "duration_minutes": 90
      }
    ]
  }
}
```

## Statistics Endpoints

### GET /stats/dashboard

Get dashboard statistics.

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 150,
      "active": 120,
      "inactive": 20,
      "blocked": 10,
      "connected_now": 15
    },
    "agencies": {
      "total": 25,
      "active": 20
    },
    "articles": {
      "total": 15000,
      "this_week": 250,
      "today": 45
    },
    "connected_users": [
      {
        "username": "john_doe",
        "role": "editor",
        "last_activity": "2024-01-15T10:30:00Z",
        "duration": "2 hours, 30 minutes"
      }
    ],
    "articles_by_agency": [
      { "agency": "APS Arabe", "count": 5000 },
      { "agency": "APS Français", "count": 7000 }
    ],
    "publishing_activity": [
      { "date": "2024-01-09", "count": 35 },
      { "date": "2024-01-10", "count": 42 }
    ]
  }
}
```

## Rate Limiting

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

### Rate Limits

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Authentication | 5 requests | 15 minutes |
| General API | 100 requests | 1 minute |
| Search/Filter | 30 requests | 1 minute |
| Export | 10 requests | 5 minutes |

### Rate Limit Exceeded

```json
{
  "success": false,
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please try again later.",
  "retry_after": 60
}
```

---

**Last Updated**: 2024
**Author**: APS Development Team
