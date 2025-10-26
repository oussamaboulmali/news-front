# Database Schema Documentation

## Table of Contents

- [Overview](#overview)
- [Database Design Principles](#database-design-principles)
- [Entity Relationship Diagram](#entity-relationship-diagram)
- [Core Tables](#core-tables)
- [Relationship Tables](#relationship-tables)
- [Logging Tables](#logging-tables)
- [Indexes](#indexes)
- [Constraints](#constraints)
- [Sample Queries](#sample-queries)
- [Database Migrations](#database-migrations)

## Overview

This document describes the expected database schema for the News Dashboard application. While the frontend application doesn't directly interact with the database (it communicates through the REST API), understanding the schema helps in understanding data relationships and API responses.

### Database Technology

**Recommended**: PostgreSQL 12+ or MySQL 8+

**Reasons**:
- ACID compliance
- Advanced indexing
- Full-text search
- JSON support
- Robust transaction support
- Proven reliability

## Database Design Principles

### Normalization

The database follows **3rd Normal Form (3NF)** to:
- Eliminate data redundancy
- Ensure data integrity
- Simplify maintenance
- Improve query performance

### Naming Conventions

- **Tables**: Plural, lowercase, snake_case (e.g., `users`, `agencies`, `user_agencies`)
- **Columns**: Lowercase, snake_case (e.g., `user_id`, `created_at`)
- **Primary Keys**: `id` (auto-increment integer)
- **Foreign Keys**: `{table}_id` (e.g., `user_id`, `agency_id`)
- **Timestamps**: `created_at`, `updated_at`, `deleted_at`

### Data Types

- **IDs**: `BIGINT` (supports large datasets)
- **Text**: `VARCHAR` (limited length) or `TEXT` (unlimited)
- **Numbers**: `INTEGER`, `DECIMAL`
- **Dates**: `TIMESTAMP WITH TIME ZONE`
- **Booleans**: `BOOLEAN`
- **JSON**: `JSONB` (PostgreSQL) or `JSON` (MySQL)

## Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Users     │────┬───│User_Agencies │────┬───│  Agencies   │
│             │    │    │              │    │    │             │
│ • id        │    │    │ • user_id    │    │    │ • id        │
│ • username  │    │    │ • agency_id  │    │    │ • name      │
│ • email     │    │    │ • created_at │    │    │ • name_ar   │
│ • password  │    │    └──────────────┘    │    │ • slug      │
│ • role_id   │    │                        │    │ • logo      │
│ • status    │    │                        │    │ • status    │
│ • lang_id   │    │                        │    └─────────────┘
└─────────────┘    │                        │
       │           │                        │
       │           │    ┌──────────────┐    │
       └───────────┼───│   Articles   │────┘
                   │    │              │
                   │    │ • id         │
                   │    │ • title      │
                   │    │ • content    │
                   │    │ • agency_id  │
                   │    │ • author_id  │
                   │    │ • status     │
                   │    └──────────────┘
                   │
                   │    ┌──────────────┐
                   └───│   Sessions   │
                        │              │
                        │ • id         │
                        │ • user_id    │
                        │ • token      │
                        │ • ip_address │
                        │ • user_agent │
                        │ • expires_at │
                        └──────────────┘
                        
┌─────────────┐
│    Roles    │
│             │
│ • id        │
│ • name      │
│ • permissions (JSON)
└─────────────┘

┌─────────────┐
│    Logs     │
│             │
│ • id        │
│ • user_id   │
│ • type      │
│ • level     │
│ • action    │
│ • description
│ • ip_address
│ • created_at
└─────────────┘
```

## Core Tables

### users

Stores user account information.

```sql
CREATE TABLE users (
  id                BIGSERIAL PRIMARY KEY,
  username          VARCHAR(50) UNIQUE NOT NULL,
  email             VARCHAR(255) UNIQUE NOT NULL,
  phone             VARCHAR(20),
  password_hash     VARCHAR(255) NOT NULL,
  role_id           INTEGER NOT NULL,
  lang_id           INTEGER DEFAULT 2, -- 1:AR, 2:FR, 3:EN
  status            VARCHAR(20) DEFAULT 'active', -- active, inactive, blocked, deleted
  blocked_code      VARCHAR(50), -- Block reason code
  blocked_date      TIMESTAMP WITH TIME ZONE,
  blocked_by        BIGINT,
  last_login        TIMESTAMP WITH TIME ZONE,
  login_count       INTEGER DEFAULT 0,
  failed_attempts   INTEGER DEFAULT 0,
  last_failed_login TIMESTAMP WITH TIME ZONE,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by        VARCHAR(50),
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_by        VARCHAR(50),
  deleted_at        TIMESTAMP WITH TIME ZONE,
  deleted_by        VARCHAR(50),
  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (blocked_by) REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
```

**Fields Explanation**:
- `password_hash`: Bcrypt hashed password (never store plain text)
- `status`: Current account status
- `blocked_code`: Reason for blocking (e.g., SQL_INJECTION_DETECTED)
- `failed_attempts`: Track failed login attempts for brute force protection
- `lang_id`: User's preferred language (1=Arabic, 2=French, 3=English)

---

### roles

Defines user roles and permissions.

```sql
CREATE TABLE roles (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB, -- JSON object of permissions
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Default roles
INSERT INTO roles (id, name, description, permissions) VALUES
(1, 'super_admin', 'Super Administrator', '{
  "user": {"view": true, "create": true, "edit": true, "delete": true},
  "agency": {"view": true, "create": true, "edit": true, "delete": true},
  "content": {"view": true, "create": true, "edit": true, "delete": true},
  "logs": {"view": true, "export": true},
  "config": {"view": true, "edit": true}
}'),
(2, 'admin', 'Administrator', '{
  "user": {"view": true, "create": true, "edit": true, "delete": true},
  "agency": {"view": true, "edit": true},
  "content": {"view": true, "create": true, "edit": true, "delete": true},
  "logs": {"view": true}
}'),
(3, 'agency_manager', 'Agency Manager', '{
  "user": {"view": true},
  "agency": {"view": true},
  "content": {"view": true, "create": true, "edit": true, "delete": true},
  "logs": {"view": true}
}'),
(4, 'editor', 'Editor', '{
  "content": {"view": true, "create": true, "edit": true, "delete": true}
}'),
(5, 'journalist', 'Journalist', '{
  "content": {"view": true, "create": true, "edit_own": true}
}'),
(6, 'viewer', 'Viewer', '{
  "content": {"view": true}
}');
```

---

### agencies

Stores news agency information.

```sql
CREATE TABLE agencies (
  id           BIGSERIAL PRIMARY KEY,
  name         VARCHAR(255) NOT NULL,
  name_ar      VARCHAR(255),
  slug         VARCHAR(255) UNIQUE NOT NULL,
  email        VARCHAR(255),
  phone        VARCHAR(20),
  logo         VARCHAR(500), -- Path to logo file
  status       VARCHAR(20) DEFAULT 'active', -- active, inactive, deleted
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by   VARCHAR(50),
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_by   VARCHAR(50),
  deleted_at   TIMESTAMP WITH TIME ZONE,
  deleted_by   VARCHAR(50)
);

-- Indexes
CREATE INDEX idx_agencies_slug ON agencies(slug);
CREATE INDEX idx_agencies_status ON agencies(status);
CREATE INDEX idx_agencies_deleted_at ON agencies(deleted_at);

-- Sample data
INSERT INTO agencies (name, name_ar, slug, status) VALUES
('APS Arabe', 'وكالة الأنباء الجزائرية', 'aps-arabe', 'active'),
('APS Français', 'وكالة باللغة الفرنسية', 'aps-francais', 'active'),
('APS English', 'وكالة باللغة الإنجليزية', 'aps-english', 'active');
```

---

### articles

Stores news articles/content.

```sql
CREATE TABLE articles (
  id            BIGSERIAL PRIMARY KEY,
  title         VARCHAR(500) NOT NULL,
  slug          VARCHAR(500) UNIQUE NOT NULL,
  content       TEXT NOT NULL,
  summary       TEXT,
  agency_id     BIGINT NOT NULL,
  author_id     BIGINT NOT NULL,
  editor_id     BIGINT, -- User who edited/published
  status        VARCHAR(20) DEFAULT 'draft', -- draft, review, published, archived
  published_at  TIMESTAMP WITH TIME ZONE,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at    TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (agency_id) REFERENCES agencies(id),
  FOREIGN KEY (author_id) REFERENCES users(id),
  FOREIGN KEY (editor_id) REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_articles_agency_id ON articles(agency_id);
CREATE INDEX idx_articles_author_id ON articles(author_id);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_published_at ON articles(published_at);
CREATE INDEX idx_articles_deleted_at ON articles(deleted_at);
-- Full-text search index
CREATE INDEX idx_articles_title_content ON articles USING GIN(to_tsvector('french', title || ' ' || content));
```

---

### sessions

Tracks active user sessions.

```sql
CREATE TABLE sessions (
  id           VARCHAR(255) PRIMARY KEY,
  user_id      BIGINT NOT NULL,
  token        VARCHAR(500) NOT NULL,
  ip_address   VARCHAR(45),
  user_agent   TEXT,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at   TIMESTAMP WITH TIME ZONE NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_sessions_created_at ON sessions(created_at);
```

## Relationship Tables

### user_agencies

Maps users to agencies (many-to-many relationship).

```sql
CREATE TABLE user_agencies (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT NOT NULL,
  agency_id  BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(50),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE,
  UNIQUE(user_id, agency_id)
);

-- Indexes
CREATE INDEX idx_user_agencies_user_id ON user_agencies(user_id);
CREATE INDEX idx_user_agencies_agency_id ON user_agencies(agency_id);
```

## Logging Tables

### logs

Comprehensive audit log for all system activities.

```sql
CREATE TABLE logs (
  id           BIGSERIAL PRIMARY KEY,
  user_id      BIGINT,
  username     VARCHAR(50),
  type         VARCHAR(50) NOT NULL, -- user, agency, article, security, error
  level        VARCHAR(20) NOT NULL, -- info, warning, error
  action       VARCHAR(100) NOT NULL, -- USER_CREATED, LOGIN_FAILED, etc.
  description  TEXT,
  reference    VARCHAR(255), -- Reference to related entity (e.g., user_id:123)
  ip_address   VARCHAR(45),
  user_agent   TEXT,
  metadata     JSONB, -- Additional contextual data
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_logs_user_id ON logs(user_id);
CREATE INDEX idx_logs_type ON logs(type);
CREATE INDEX idx_logs_level ON logs(level);
CREATE INDEX idx_logs_action ON logs(action);
CREATE INDEX idx_logs_created_at ON logs(created_at);
CREATE INDEX idx_logs_metadata ON logs USING GIN(metadata);
```

**Log Types**:
- `user`: User management actions
- `agency`: Agency management actions
- `article`: Content management actions
- `security`: Security events
- `error`: System errors
- `session`: Session events

**Log Levels**:
- `info`: Informational events
- `warning`: Warning events
- `error`: Error events

---

### login_attempts

Track failed login attempts for brute force protection.

```sql
CREATE TABLE login_attempts (
  id           BIGSERIAL PRIMARY KEY,
  username     VARCHAR(50) NOT NULL,
  ip_address   VARCHAR(45) NOT NULL,
  success      BOOLEAN DEFAULT FALSE,
  error_message VARCHAR(255),
  user_agent   TEXT,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_login_attempts_username ON login_attempts(username);
CREATE INDEX idx_login_attempts_ip_address ON login_attempts(ip_address);
CREATE INDEX idx_login_attempts_created_at ON login_attempts(created_at);
```

## Indexes

### Performance Indexes

```sql
-- Composite indexes for common queries
CREATE INDEX idx_users_status_role ON users(status, role_id);
CREATE INDEX idx_articles_agency_status ON articles(agency_id, status);
CREATE INDEX idx_logs_type_level_date ON logs(type, level, created_at);

-- Partial indexes for active records
CREATE INDEX idx_users_active ON users(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_agencies_active ON agencies(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_articles_published ON articles(id) WHERE status = 'published';
```

## Constraints

### Check Constraints

```sql
-- Users
ALTER TABLE users ADD CONSTRAINT chk_users_status 
  CHECK (status IN ('active', 'inactive', 'blocked', 'deleted'));

ALTER TABLE users ADD CONSTRAINT chk_users_lang_id 
  CHECK (lang_id IN (1, 2, 3));

-- Agencies
ALTER TABLE agencies ADD CONSTRAINT chk_agencies_status 
  CHECK (status IN ('active', 'inactive', 'deleted'));

-- Articles
ALTER TABLE articles ADD CONSTRAINT chk_articles_status 
  CHECK (status IN ('draft', 'review', 'published', 'archived'));

-- Logs
ALTER TABLE logs ADD CONSTRAINT chk_logs_level 
  CHECK (level IN ('info', 'warning', 'error'));
```

### Triggers

#### Update Timestamps

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON agencies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Sample Queries

### Get User with Agencies

```sql
SELECT 
  u.id,
  u.username,
  u.email,
  r.name as role,
  json_agg(json_build_object(
    'id', a.id,
    'name', a.name,
    'slug', a.slug
  )) as agencies
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN user_agencies ua ON u.id = ua.user_id
LEFT JOIN agencies a ON ua.agency_id = a.id
WHERE u.id = $1 AND u.deleted_at IS NULL
GROUP BY u.id, u.username, u.email, r.name;
```

### Get Articles by Agency with Author

```sql
SELECT 
  ar.id,
  ar.title,
  ar.slug,
  ar.status,
  ar.published_at,
  json_build_object(
    'id', u.id,
    'username', u.username
  ) as author,
  json_build_object(
    'id', ag.id,
    'name', ag.name
  ) as agency
FROM articles ar
JOIN users u ON ar.author_id = u.id
JOIN agencies ag ON ar.agency_id = ag.id
WHERE ar.agency_id = $1 
  AND ar.deleted_at IS NULL
ORDER BY ar.published_at DESC
LIMIT 10 OFFSET $2;
```

### Get User Activity Logs

```sql
SELECT 
  l.id,
  l.type,
  l.level,
  l.action,
  l.description,
  l.ip_address,
  l.created_at
FROM logs l
WHERE l.user_id = $1
  AND l.created_at >= NOW() - INTERVAL '30 days'
ORDER BY l.created_at DESC
LIMIT 100;
```

### Get Active Sessions

```sql
SELECT 
  s.id,
  s.user_id,
  u.username,
  s.ip_address,
  s.created_at,
  s.last_activity,
  EXTRACT(EPOCH FROM (NOW() - s.created_at))/60 as duration_minutes
FROM sessions s
JOIN users u ON s.user_id = u.id
WHERE s.expires_at > NOW()
ORDER BY s.last_activity DESC;
```

### Get Dashboard Statistics

```sql
-- User statistics
SELECT 
  COUNT(*) FILTER (WHERE deleted_at IS NULL) as total_users,
  COUNT(*) FILTER (WHERE status = 'active' AND deleted_at IS NULL) as active_users,
  COUNT(*) FILTER (WHERE status = 'blocked') as blocked_users,
  COUNT(*) FILTER (WHERE last_login >= NOW() - INTERVAL '24 hours') as logged_in_24h
FROM users;

-- Article statistics
SELECT 
  a.id,
  a.name,
  COUNT(ar.id) as article_count
FROM agencies a
LEFT JOIN articles ar ON a.id = ar.agency_id
WHERE a.deleted_at IS NULL
GROUP BY a.id, a.name
ORDER BY article_count DESC;
```

## Database Migrations

### Migration Strategy

Use a migration tool like:
- **Prisma Migrate** (recommended)
- **Sequelize**
- **Knex.js**
- **TypeORM**

### Example Migration (Prisma)

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            BigInt      @id @default(autoincrement())
  username      String      @unique @db.VarChar(50)
  email         String      @unique @db.VarChar(255)
  passwordHash  String      @map("password_hash") @db.VarChar(255)
  roleId        Int         @map("role_id")
  status        String      @default("active") @db.VarChar(20)
  createdAt     DateTime    @default(now()) @map("created_at") @db.Timestamptz
  updatedAt     DateTime    @updatedAt @map("updated_at") @db.Timestamptz
  
  role          Role        @relation(fields: [roleId], references: [id])
  agencies      UserAgency[]
  articles      Article[]
  sessions      Session[]
  logs          Log[]
  
  @@map("users")
}

// ... other models
```

### Running Migrations

```bash
# Create migration
npx prisma migrate dev --name add_users_table

# Apply migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

---

**Last Updated**: 2024
**Author**: APS Development Team
**Note**: This schema represents the expected backend database structure. Actual implementation may vary based on backend framework and requirements.
