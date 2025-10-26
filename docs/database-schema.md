# 🗄️ Database Schema Documentation

## Table of Contents

- [Overview](#overview)
- [Database Design Principles](#database-design-principles)
- [Schema Diagram](#schema-diagram)
- [Core Tables](#core-tables)
- [Relationships](#relationships)
- [Indexes](#indexes)
- [Constraints](#constraints)
- [Sample Queries](#sample-queries)
- [Migration Strategy](#migration-strategy)

---

## Overview

This document describes the database schema for the APS News Dashboard backend. While this frontend repository doesn't directly interact with the database, understanding the data structure is crucial for effective frontend development.

**Note**: The actual database is managed by the backend API (separate repository). This documentation describes the logical data model as understood by the frontend.

### Database Technology

**Development**: MySQL 8.0+ or PostgreSQL 13+  
**Production**: PostgreSQL 14+ (Recommended)  
**ORM**: Prisma / Sequelize (Backend)

---

## Database Design Principles

### 1. Normalization

- Database normalized to 3NF (Third Normal Form)
- Eliminates data redundancy
- Maintains data integrity

### 2. Security

- Password hashing (bcrypt)
- Sensitive data encryption
- Row-level security where applicable
- Audit trails for critical tables

### 3. Performance

- Strategic indexing
- Denormalization where beneficial
- Optimized for read-heavy operations

### 4. Scalability

- Designed for horizontal scaling
- Partition-ready for large tables
- Efficient foreign key relationships

---

## Schema Diagram

### Entity Relationship Diagram (ERD)

```
┌─────────────────┐         ┌──────────────────┐
│     Users       │         │      Roles       │
├─────────────────┤         ├──────────────────┤
│ PK id           │         │ PK id            │
│    username     │───┐     │    name          │
│    email        │   │     │    description   │
│    password     │   │     │    permissions   │
│    firstName    │   │     │    createdAt     │
│    lastName     │   │     │    updatedAt     │
│    phone        │   │     └──────────────────┘
│ FK roleId       │───┘              │
│    status       │                  │
│    createdAt    │                  │
│    updatedAt    │                  │
│    lastLogin    │                  │
└─────────────────┘                  │
        │                            │
        │ 1:N                        │
        │                            │
        ↓                            │
┌─────────────────┐                  │
│  UserAgencies   │                  │
├─────────────────┤                  │
│ PK id           │                  │
│ FK userId       │                  │
│ FK agencyId     │                  │
│    role         │                  │
│    createdAt    │                  │
└─────────────────┘                  │
        │                            │
        │ N:1                        │
        ↓                            │
┌─────────────────┐                  │
│    Agencies     │                  │
├─────────────────┤                  │
│ PK id           │                  │
│    name         │                  │
│    alias        │                  │
│    type         │                  │
│    description  │                  │
│    logo         │                  │
│    settings     │                  │
│ FK parentId     │───┐              │
│    status       │   │              │
│    createdAt    │   │              │
│    updatedAt    │   │              │
└─────────────────┘   │              │
        │             │              │
        │ Self-ref    │              │
        └─────────────┘              │
                                     │
┌─────────────────┐                  │
│    Sessions     │                  │
├─────────────────┤                  │
│ PK id           │                  │
│    sessionId    │                  │
│ FK userId       │───────┐          │
│    ipAddress    │       │          │
│    userAgent    │       │          │
│    active       │       │          │
│    createdAt    │       │          │
│    expiresAt    │       │          │
│    lastActivity │       │          │
└─────────────────┘       │          │
                          │          │
                          │          │
┌─────────────────┐       │          │
│      Logs       │       │          │
├─────────────────┤       │          │
│ PK id           │       │          │
│    type         │       │          │
│    level        │       │          │
│    action       │       │          │
│ FK userId       │───────┘          │
│    targetType   │                  │
│    targetId     │                  │
│    ipAddress    │                  │
│    userAgent    │                  │
│    details      │                  │
│    success      │                  │
│    message      │                  │
│    timestamp    │                  │
└─────────────────┘                  │
                                     │
┌─────────────────┐                  │
│ RolePermissions │                  │
├─────────────────┤                  │
│ PK id           │                  │
│ FK roleId       │──────────────────┘
│    permission   │
│    resource     │
│    action       │
│    createdAt    │
└─────────────────┘
```

---

## Core Tables

### 1. Users Table

Stores user account information.

```sql
CREATE TABLE users (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  username           VARCHAR(50) UNIQUE NOT NULL,
  email              VARCHAR(100) UNIQUE NOT NULL,
  password           VARCHAR(255) NOT NULL,  -- bcrypt hashed
  firstName          VARCHAR(50),
  lastName           VARCHAR(50),
  phone              VARCHAR(20),
  roleId             INT NOT NULL,
  status             ENUM('active', 'inactive', 'blocked') DEFAULT 'active',
  profileImage       VARCHAR(255),
  language           TINYINT DEFAULT 2,  -- 1: AR, 2: FR, 3: EN
  failedLoginCount   INT DEFAULT 0,
  lastFailedLogin    DATETIME,
  createdAt          DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt          DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lastLogin          DATETIME,
  
  FOREIGN KEY (roleId) REFERENCES roles(id),
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_roleId (roleId)
);
```

**Column Descriptions:**

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary key, auto-increment |
| `username` | VARCHAR(50) | Unique username for login |
| `email` | VARCHAR(100) | User's email address |
| `password` | VARCHAR(255) | Bcrypt hashed password |
| `firstName` | VARCHAR(50) | User's first name |
| `lastName` | VARCHAR(50) | User's last name |
| `phone` | VARCHAR(20) | Contact phone number |
| `roleId` | INT | Foreign key to roles table |
| `status` | ENUM | Account status (active/inactive/blocked) |
| `language` | TINYINT | Preferred language (1: Arabic, 2: French, 3: English) |
| `failedLoginCount` | INT | Number of consecutive failed login attempts |
| `lastFailedLogin` | DATETIME | Timestamp of last failed login |
| `createdAt` | DATETIME | Account creation timestamp |
| `updatedAt` | DATETIME | Last update timestamp |
| `lastLogin` | DATETIME | Last successful login timestamp |

---

### 2. Roles Table

Defines user roles and their base permissions.

```sql
CREATE TABLE roles (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(50) UNIQUE NOT NULL,
  displayName    VARCHAR(100),
  description    TEXT,
  level          INT NOT NULL,  -- Hierarchy level (higher = more power)
  permissions    JSON,          -- Base permissions for the role
  createdAt      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_name (name),
  INDEX idx_level (level)
);
```

**Sample Data:**

```sql
INSERT INTO roles (name, displayName, level, permissions) VALUES
('super_admin', 'Super Administrator', 100, '["*"]'),
('admin', 'Administrator', 80, '["manage_users", "manage_agencies", "view_logs", "edit_config"]'),
('editor', 'Editor', 50, '["view_dashboard", "create_content", "edit_content"]'),
('subscriber', 'Subscriber', 20, '["view_dashboard", "view_content"]');
```

---

### 3. Agencies Table

Stores information about news agencies.

```sql
CREATE TABLE agencies (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(100) NOT NULL,
  alias          VARCHAR(100) UNIQUE NOT NULL,
  type           VARCHAR(50),
  description    TEXT,
  logo           VARCHAR(255),
  parentId       INT,  -- For hierarchical agencies
  settings       JSON,
  status         ENUM('active', 'inactive') DEFAULT 'active',
  createdAt      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (parentId) REFERENCES agencies(id),
  INDEX idx_alias (alias),
  INDEX idx_type (type),
  INDEX idx_parentId (parentId),
  INDEX idx_status (status)
);
```

**Sample Data:**

```sql
INSERT INTO agencies (name, alias, type, description) VALUES
('Fils de Presse', 'fils-de-presse', 'parent', 'Parent news agency'),
('APS AR', 'aps-ar', 'child', 'Arabic News Service'),
('APS FR', 'aps-fr', 'child', 'French News Service'),
('APS EN', 'aps-en', 'child', 'English News Service');

-- Set parent relationships
UPDATE agencies SET parentId = 1 WHERE alias IN ('aps-ar', 'aps-fr', 'aps-en');
```

---

### 4. UserAgencies Table

Junction table for many-to-many relationship between users and agencies.

```sql
CREATE TABLE user_agencies (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  userId         INT NOT NULL,
  agencyId       INT NOT NULL,
  role           VARCHAR(50),  -- Role specific to this agency
  permissions    JSON,         -- Additional permissions for this agency
  createdAt      DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (agencyId) REFERENCES agencies(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_agency (userId, agencyId),
  INDEX idx_userId (userId),
  INDEX idx_agencyId (agencyId)
);
```

**Sample Data:**

```sql
-- Assign user 123 to agencies 1 and 2 as editor
INSERT INTO user_agencies (userId, agencyId, role) VALUES
(123, 1, 'editor'),
(123, 2, 'editor');
```

---

### 5. Sessions Table

Manages user sessions.

```sql
CREATE TABLE sessions (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  sessionId      VARCHAR(255) UNIQUE NOT NULL,
  userId         INT NOT NULL,
  ipAddress      VARCHAR(45),  -- Supports IPv6
  userAgent      VARCHAR(500),
  active         BOOLEAN DEFAULT TRUE,
  createdAt      DATETIME DEFAULT CURRENT_TIMESTAMP,
  expiresAt      DATETIME NOT NULL,
  lastActivity   DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_sessionId (sessionId),
  INDEX idx_userId (userId),
  INDEX idx_active (active),
  INDEX idx_expiresAt (expiresAt)
);
```

**Auto-cleanup:**

```sql
-- Stored procedure to clean expired sessions
DELIMITER //
CREATE PROCEDURE cleanup_expired_sessions()
BEGIN
  DELETE FROM sessions WHERE expiresAt < NOW();
END//
DELIMITER ;

-- Schedule cleanup (every hour)
CREATE EVENT cleanup_sessions_event
ON SCHEDULE EVERY 1 HOUR
DO CALL cleanup_expired_sessions();
```

---

### 6. Logs Table

Comprehensive audit logging.

```sql
CREATE TABLE logs (
  id             BIGINT AUTO_INCREMENT PRIMARY KEY,
  type           VARCHAR(50) NOT NULL,  -- USER_MANAGEMENT, SECURITY, etc.
  level          VARCHAR(20) NOT NULL,  -- INFO, WARN, ERROR, SECURITY
  action         VARCHAR(100) NOT NULL,
  userId         INT,
  targetType     VARCHAR(50),
  targetId       INT,
  ipAddress      VARCHAR(45),
  userAgent      VARCHAR(500),
  details        JSON,
  success        BOOLEAN DEFAULT TRUE,
  message        TEXT,
  statusCode     INT,
  timestamp      DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_type (type),
  INDEX idx_level (level),
  INDEX idx_action (action),
  INDEX idx_userId (userId),
  INDEX idx_timestamp (timestamp),
  INDEX idx_success (success)
);
```

**Partitioning for Performance:**

```sql
-- Partition by month for better performance
ALTER TABLE logs
PARTITION BY RANGE (TO_DAYS(timestamp)) (
  PARTITION p202410 VALUES LESS THAN (TO_DAYS('2024-11-01')),
  PARTITION p202411 VALUES LESS THAN (TO_DAYS('2024-12-01')),
  PARTITION p202412 VALUES LESS THAN (TO_DAYS('2025-01-01')),
  -- Add partitions as needed
  PARTITION pmax VALUES LESS THAN MAXVALUE
);
```

---

### 7. RolePermissions Table

Granular permissions for roles.

```sql
CREATE TABLE role_permissions (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  roleId         INT NOT NULL,
  permission     VARCHAR(100) NOT NULL,
  resource       VARCHAR(100),
  action         VARCHAR(50),
  conditions     JSON,  -- Additional permission conditions
  createdAt      DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (roleId) REFERENCES roles(id) ON DELETE CASCADE,
  UNIQUE KEY unique_role_permission (roleId, permission, resource, action),
  INDEX idx_roleId (roleId),
  INDEX idx_permission (permission)
);
```

**Sample Data:**

```sql
-- Admin permissions
INSERT INTO role_permissions (roleId, permission, resource, action) VALUES
(2, 'MANAGE_USERS', 'users', 'all'),
(2, 'MANAGE_AGENCIES', 'agencies', 'all'),
(2, 'VIEW_LOGS', 'logs', 'read'),
(2, 'EDIT_CONFIG', 'config', 'write');

-- Editor permissions
INSERT INTO role_permissions (roleId, permission, resource, action) VALUES
(3, 'CREATE_CONTENT', 'content', 'create'),
(3, 'EDIT_CONTENT', 'content', 'update'),
(3, 'VIEW_AGENCY', 'agencies', 'read');
```

---

## Relationships

### One-to-Many Relationships

1. **Roles → Users**
   - One role can have many users
   - Each user has exactly one role

2. **Users → Sessions**
   - One user can have multiple sessions
   - Each session belongs to one user

3. **Users → Logs**
   - One user can generate many log entries
   - Each log entry belongs to one user

4. **Agencies → UserAgencies**
   - One agency can be assigned to many users
   - Through junction table

### Many-to-Many Relationships

1. **Users ↔ Agencies** (via UserAgencies)
   - Users can belong to multiple agencies
   - Agencies can have multiple users

### Self-Referential Relationships

1. **Agencies → Agencies** (Parent-Child)
   - Hierarchical agency structure
   - One parent can have many children

---

## Indexes

### Purpose of Indexes

Indexes improve query performance but have trade-offs:
- **Pros**: Faster SELECT queries, faster JOIN operations
- **Cons**: Slower INSERT/UPDATE/DELETE, additional storage

### Primary Indexes

All tables have a primary key index on `id` column.

### Secondary Indexes

| Table | Column(s) | Purpose |
|-------|-----------|---------|
| users | username | Fast login lookup |
| users | email | Email validation, password reset |
| users | roleId | Filter users by role |
| sessions | sessionId | Session validation |
| sessions | userId | User's sessions lookup |
| sessions | expiresAt | Cleanup expired sessions |
| logs | timestamp | Time-based queries |
| logs | userId | User activity lookup |
| logs | type | Filter by log type |
| agencies | alias | URL routing |
| user_agencies | userId, agencyId | Unique constraint, fast joins |

### Composite Indexes

```sql
-- Composite index for common query patterns
CREATE INDEX idx_logs_user_time ON logs(userId, timestamp);
CREATE INDEX idx_sessions_user_active ON sessions(userId, active);
```

---

## Constraints

### Primary Key Constraints

Every table has a `PRIMARY KEY` constraint on the `id` column.

### Foreign Key Constraints

Ensure referential integrity:

```sql
-- Users table
FOREIGN KEY (roleId) REFERENCES roles(id)

-- UserAgencies table
FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
FOREIGN KEY (agencyId) REFERENCES agencies(id) ON DELETE CASCADE

-- Sessions table
FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE

-- Logs table
FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
```

### Unique Constraints

```sql
-- Users table
UNIQUE (username)
UNIQUE (email)

-- Agencies table
UNIQUE (alias)

-- Sessions table
UNIQUE (sessionId)

-- UserAgencies table
UNIQUE (userId, agencyId)
```

### Check Constraints

```sql
-- Users table
CHECK (failedLoginCount >= 0)
CHECK (language IN (1, 2, 3))

-- Sessions table
CHECK (expiresAt > createdAt)
```

---

## Sample Queries

### User Authentication

```sql
-- Get user by username
SELECT u.*, r.name as roleName, r.permissions
FROM users u
JOIN roles r ON u.roleId = r.id
WHERE u.username = 'john.doe'
  AND u.status = 'active';
```

### Get User Permissions

```sql
-- Get all permissions for a user
SELECT 
  u.id,
  u.username,
  r.name as role,
  rp.permission,
  rp.resource,
  rp.action
FROM users u
JOIN roles r ON u.roleId = r.id
LEFT JOIN role_permissions rp ON r.id = rp.roleId
WHERE u.id = 123;
```

### Get User Agencies

```sql
-- Get user's assigned agencies
SELECT 
  u.username,
  a.id as agencyId,
  a.name as agencyName,
  a.alias,
  ua.role as agencyRole
FROM users u
JOIN user_agencies ua ON u.id = ua.userId
JOIN agencies a ON ua.agencyId = a.id
WHERE u.id = 123
  AND a.status = 'active';
```

### Session Management

```sql
-- Get active sessions for user
SELECT 
  sessionId,
  ipAddress,
  userAgent,
  createdAt,
  expiresAt,
  lastActivity
FROM sessions
WHERE userId = 123
  AND active = TRUE
  AND expiresAt > NOW();
```

### Activity Logs

```sql
-- Get user activity logs (last 30 days)
SELECT 
  l.timestamp,
  l.type,
  l.action,
  l.message,
  l.ipAddress,
  u.username
FROM logs l
JOIN users u ON l.userId = u.id
WHERE l.timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY l.timestamp DESC
LIMIT 100;
```

### Security Events

```sql
-- Get security violations
SELECT 
  l.timestamp,
  l.action,
  l.message,
  l.ipAddress,
  u.username,
  l.details
FROM logs l
LEFT JOIN users u ON l.userId = u.id
WHERE l.level = 'SECURITY'
  AND l.timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY l.timestamp DESC;
```

---

## Migration Strategy

### Version Control

Use migration tools like:
- **Flyway** (Java-based)
- **Liquibase** (XML/YAML-based)
- **Prisma Migrate** (Node.js)
- **Sequelize CLI** (Node.js)

### Migration Example

```sql
-- Migration: 20241026_create_users_table.sql
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(50),
  lastName VARCHAR(50),
  phone VARCHAR(20),
  roleId INT NOT NULL,
  status ENUM('active', 'inactive', 'blocked') DEFAULT 'active',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lastLogin DATETIME,
  FOREIGN KEY (roleId) REFERENCES roles(id)
);

-- Rollback: 20241026_create_users_table_rollback.sql
DROP TABLE IF EXISTS users;
```

### Best Practices

1. **Never modify existing migrations**
2. **Always provide rollback scripts**
3. **Test migrations on staging first**
4. **Backup database before migration**
5. **Document breaking changes**

---

## Data Integrity

### Triggers

```sql
-- Update 'updatedAt' timestamp automatically
DELIMITER //
CREATE TRIGGER before_user_update
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
  SET NEW.updatedAt = CURRENT_TIMESTAMP;
END//
DELIMITER ;
```

### Stored Procedures

```sql
-- Get user with all related data
DELIMITER //
CREATE PROCEDURE get_user_details(IN user_id INT)
BEGIN
  -- User basic info
  SELECT * FROM users WHERE id = user_id;
  
  -- User agencies
  SELECT a.* FROM agencies a
  JOIN user_agencies ua ON a.id = ua.agencyId
  WHERE ua.userId = user_id;
  
  -- User permissions
  SELECT rp.* FROM role_permissions rp
  JOIN users u ON rp.roleId = u.roleId
  WHERE u.id = user_id;
END//
DELIMITER ;
```

---

## Backup & Recovery

### Backup Strategy

```bash
# Full backup
mysqldump -u root -p aps_database > backup_$(date +%Y%m%d).sql

# Backup specific tables
mysqldump -u root -p aps_database users roles > backup_users.sql

# Compressed backup
mysqldump -u root -p aps_database | gzip > backup.sql.gz
```

### Recovery

```bash
# Restore from backup
mysql -u root -p aps_database < backup_20241026.sql

# Restore compressed backup
gunzip < backup.sql.gz | mysql -u root -p aps_database
```

---

**Document Version**: 1.0  
**Last Updated**: October 2024  
**Database Version**: 1.0  
**Maintained By**: APS Backend Team
