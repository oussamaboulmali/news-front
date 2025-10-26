# Security Documentation

## Table of Contents

- [Overview](#overview)
- [Authentication Security](#authentication-security)
- [Input Validation & Sanitization](#input-validation--sanitization)
- [Data Protection](#data-protection)
- [Network Security](#network-security)
- [Session Management](#session-management)
- [Security Headers](#security-headers)
- [XSS Prevention](#xss-prevention)
- [CSRF Protection](#csrf-protection)
- [SQL Injection Prevention](#sql-injection-prevention)
- [Account Security](#account-security)
- [Logging & Monitoring](#logging--monitoring)
- [Security Best Practices](#security-best-practices)
- [Security Incident Response](#security-incident-response)
- [Security Checklist](#security-checklist)

## Overview

The News Dashboard implements multiple layers of security to protect against common vulnerabilities and attacks. This document outlines all security measures implemented in the application.

### Security Principles

1. **Defense in Depth**: Multiple layers of security controls
2. **Least Privilege**: Users have minimum necessary permissions
3. **Secure by Default**: Security features enabled by default
4. **Fail Securely**: Failures default to secure state
5. **Complete Mediation**: Every access checked
6. **Open Design**: Security not through obscurity

## Authentication Security

### Cookie-Based Sessions

**Implementation**:
```javascript
// Session cookie attributes
{
  httpOnly: true,        // Prevents JavaScript access
  secure: true,          // HTTPS only
  sameSite: 'strict',    // CSRF protection
  maxAge: 3600000,       // 1 hour timeout
  path: '/',
  domain: 'your-domain.com'
}
```

**Security Benefits**:
- ✓ HTTP-only prevents XSS token theft
- ✓ Secure flag ensures HTTPS transmission
- ✓ SameSite prevents CSRF attacks
- ✓ Automatic timeout prevents session hijacking
- ✓ Domain restriction limits cookie scope

### Login Security

#### Brute Force Protection

```javascript
// Backend implementation
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

async function checkLoginAttempts(username) {
  const attempts = await getFailedAttempts(username);
  
  if (attempts >= MAX_ATTEMPTS) {
    const lastAttempt = await getLastAttemptTime(username);
    const timeSince = Date.now() - lastAttempt;
    
    if (timeSince < LOCKOUT_TIME) {
      throw new Error('Account temporarily locked');
    }
    
    // Reset attempts after lockout period
    await resetAttempts(username);
  }
}
```

**Features**:
- Maximum 5 failed attempts
- 15-minute account lockout
- Automatic unlock after timeout
- IP-based tracking
- Alert on suspicious activity

#### Password Requirements

```javascript
const PASSWORD_POLICY = {
  minLength: 6,
  maxLength: 20,
  requireUppercase: false,  // Can be enabled
  requireLowercase: false,  // Can be enabled
  requireNumbers: false,    // Can be enabled
  requireSpecialChars: false, // Can be enabled
  preventCommonPasswords: true,
  preventUserInfo: true    // Username, email, etc.
};
```

**Validation**:
```javascript
function validatePassword(password, userInfo) {
  // Length check
  if (password.length < 6 || password.length > 20) {
    return { valid: false, error: 'Password must be 6-20 characters' };
  }
  
  // Prevent username in password
  if (password.toLowerCase().includes(userInfo.username.toLowerCase())) {
    return { valid: false, error: 'Password cannot contain username' };
  }
  
  // Additional checks...
  
  return { valid: true };
}
```

### Multi-Session Detection

```javascript
// In App.jsx - Login flow
if (response.data.hasSession === true) {
  // Show warning dialog
  setOpenDialog(true);
  setMsg('You already have an active session. Continue?');
  
  // User must confirm to proceed
  if (userConfirms) {
    // Close old session
    await axios.post('/auth/close', {
      sessionId: oldSessionId,
      userId: userId
    });
    
    // Create new session
    // ...
  }
}
```

**Benefits**:
- Prevents session hijacking
- Alerts user of suspicious activity
- Provides session control
- Logs all session changes

## Input Validation & Sanitization

### Client-Side Validation

#### SQL Injection Detection

```javascript
/**
 * Detects potential SQL injection attempts
 * @param {string} input - User input to validate
 * @returns {boolean} True if injection detected
 */
export const detectSQLInjection = (input) => {
  if (typeof input !== 'string' || !input.trim()) return false;

  const sqlInjectionPatterns = [
    /\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|EXEC|LIMIT)\b.*\b(FROM|TABLE|DATABASE|INTO|VALUES|SET)\b/i,
    /('|")\s*(OR|AND)\s*('|")?\s*=\s*('|")/i,
    /;\s*(DROP|TRUNCATE|ALTER)\s+\w+/i,
    /--[^\n]*$/m,
    /\/\*[\s\S]*?\*\//m
  ];

  return sqlInjectionPatterns.some(pattern => pattern.test(input));
};
```

**Usage**:
```javascript
// In login form
const handleLogin = (event) => {
  event.preventDefault();
  
  if (detectSQLInjection(username) || detectSQLInjection(password)) {
    // Log security event
    log.error('SQL injection attempt detected', 'security', 'SQL Injection', 220, 'blockip');
    
    // Block user
    BloquerUser('SQL_INJECTION_DETECTED');
    
    return;
  }
  
  // Proceed with login
  fetchSignIn();
};
```

#### Email Validation

```javascript
export const validateEmail = (value) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};
```

#### Phone Validation

```javascript
export const validatePhone = (value) => {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(value);
};
```

#### Special Character Filtering

```javascript
export function validateAndCleanString(input) {
  // Remove HTML tags
  const cleanedString = input.replace(/<\/?[^>]+(>|$)/g, "");
  
  // Check for special characters
  const specialCharsRegex = /[./_\-]/;
  const isValid = !specialCharsRegex.test(cleanedString);
  
  return { isValid, cleanedString };
}
```

### Server-Side Validation

**Backend validation should ALWAYS be performed**, regardless of frontend validation:

```javascript
// Backend example (conceptual)
app.post('/api/users', async (req, res) => {
  // 1. Validate input
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(422).json({ error: 'Validation failed' });
  }
  
  // 2. Sanitize input
  const sanitized = {
    username: sanitize(req.body.username),
    email: sanitize(req.body.email),
    // ...
  };
  
  // 3. Check SQL injection
  if (detectSQLInjection(sanitized.username)) {
    await logSecurityEvent('SQL_INJECTION_ATTEMPT');
    return res.status(400).json({ error: 'Invalid input' });
  }
  
  // 4. Proceed with creation
  // ...
});
```

## Data Protection

### Encryption

#### Local Storage Encryption

```javascript
import CryptoJS from 'crypto-js';

/**
 * Encrypt and store sensitive data
 */
function encryptAndStore(key, value, secretKey) {
  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(value),
    secretKey
  ).toString();
  
  localStorage.setItem(key, encrypted);
}

/**
 * Retrieve and decrypt data
 */
export const useDecryptedLocalStorage = (key, secretKey) => {
  const encryptedValue = localStorage.getItem(key);
  
  if (!encryptedValue) return null;
  
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedValue, secretKey);
    const value = decrypted.toString(CryptoJS.enc.Utf8);
    return value;
  } catch (error) {
    // Decryption failed - possibly tampered
    localStorage.removeItem(key);
    return null;
  }
};
```

**Encrypted Data**:
- Username
- User ID
- Language preference
- Session state

**NOT Encrypted** (Public data):
- Non-sensitive UI preferences
- Public configuration

#### URL Parameter Encryption

```javascript
export const useDecryptedUrl = (key, secretKey) => {
  if (!key) return {};
  
  try {
    const decrypted = CryptoJS.AES.decrypt(
      decodeURIComponent(key),
      secretKey
    );
    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    return {};
  }
};
```

### Password Handling

**Client Side**:
- Passwords NEVER stored locally
- Transmitted only over HTTPS
- Cleared from memory after use

**Server Side** (Backend):
- Hashed with bcrypt/argon2
- Salted with unique salt per password
- Minimum 10 rounds for bcrypt
- Never logged or displayed

```javascript
// Backend example
const bcrypt = require('bcrypt');

// Hash password
const hashedPassword = await bcrypt.hash(password, 12);

// Verify password
const isValid = await bcrypt.compare(password, hashedPassword);
```

## Network Security

### HTTPS Enforcement

**Client Side**:
```javascript
// In useAxios.jsx
headers: {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
}
```

**Server Side** (Apache):
```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# HSTS Header
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
```

### API Security

#### API Key Authentication

```javascript
// In useAxios.jsx
headers: {
  'x-api-key': import.meta.env.VITE_APP_ID
}
```

**Backend verification**:
```javascript
app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
});
```

#### CORS Configuration

**Backend**:
```javascript
const cors = require('cors');

app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-api-key']
}));
```

## Session Management

### Session Timeout

```javascript
const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour

// Backend
setInterval(() => {
  cleanupExpiredSessions();
}, 5 * 60 * 1000); // Check every 5 minutes

function cleanupExpiredSessions() {
  const now = Date.now();
  
  sessions.forEach((session, sessionId) => {
    if (now - session.lastActivity > SESSION_TIMEOUT) {
      sessions.delete(sessionId);
      logSessionExpired(sessionId);
    }
  });
}
```

### Activity Tracking

```javascript
// Update last activity on each request
app.use((req, res, next) => {
  if (req.session) {
    req.session.lastActivity = Date.now();
  }
  next();
});
```

### Secure Session Invalidation

```javascript
// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  if (req.session) {
    // Destroy session
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      
      // Clear cookie
      res.clearCookie('sessionId');
      
      // Log logout
      logUserLogout(req.user.id);
      
      res.json({ success: true });
    });
  }
});
```

## Security Headers

### Implemented Headers

```javascript
// In useAxios.jsx
headers: {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
}
```

### Header Explanations

#### X-Content-Type-Options: nosniff
- Prevents MIME sniffing
- Browser must respect Content-Type header
- Prevents executing non-executable MIME types

#### X-Frame-Options: SAMEORIGIN
- Prevents clickjacking attacks
- Page can only be framed by same origin
- Protects against UI redressing

#### X-XSS-Protection: 1; mode=block
- Enables XSS filter in browsers
- Blocks page if XSS detected
- Legacy but still useful

#### Referrer-Policy: no-referrer
- Prevents sending referrer information
- Protects user privacy
- Prevents information leakage

#### Permissions-Policy
- Restricts browser features
- Disables geolocation, microphone, camera
- Reduces attack surface

#### Strict-Transport-Security (HSTS)
- Forces HTTPS for 1 year
- Includes subdomains
- Prevents protocol downgrade attacks

### Content Security Policy (CSP)

**Recommended CSP** (add to backend):
```javascript
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://your-api-domain.com; " +
    "frame-ancestors 'none';"
  );
  next();
});
```

## XSS Prevention

### DOMPurify Integration

```javascript
import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content
 */
function sanitizeHTML(html) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u'],
    ALLOWED_ATTR: []
  });
}

// Usage
const userInput = '<script>alert("XSS")</script><p>Safe content</p>';
const safe = sanitizeHTML(userInput);
// Result: '<p>Safe content</p>'
```

### Output Encoding

```javascript
// React automatically escapes output
<div>{userInput}</div>  // Safe - React escapes

// Dangerous - using dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />  // NOT SAFE

// Safe with DOMPurify
<div dangerouslySetInnerHTML={{ __html: sanitizeHTML(userInput) }} />
```

## CSRF Protection

### SameSite Cookie Attribute

```javascript
{
  sameSite: 'strict'  // Prevents CSRF attacks
}
```

### CSRF Token (Backend)

```javascript
const csurf = require('csurf');

// CSRF protection middleware
app.use(csurf({ cookie: true }));

// Send token to client
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Verify token on state-changing requests
app.post('/api/users', (req, res) => {
  // Token automatically verified by middleware
  // ...
});
```

## SQL Injection Prevention

### Parameterized Queries (Backend)

```javascript
// BAD - Vulnerable to SQL injection
const query = `SELECT * FROM users WHERE username = '${username}'`;

// GOOD - Using parameterized query
const query = 'SELECT * FROM users WHERE username = ?';
db.query(query, [username]);
```

### ORM Usage (Backend)

```javascript
// Using Prisma (example)
const user = await prisma.user.findUnique({
  where: { username: username }
});

// Prisma automatically escapes and parameterizes
```

### Frontend Detection

Already implemented in `Gfunc.js` (see Input Validation section).

## Account Security

### Account Blocking

```javascript
export const BloquerUser = async (code, api) => {
  try {
    await axios.put(
      import.meta.env.VITE_BASE_URL + 'users/block',
      { blockCode: code },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_APP_ID
        }
      }
    );
    
    // Show notification
    toast.error('Your account has been blocked due to a security violation.');
    
    // Logout
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace('/login');
  } catch (error) {
    // Handle error
  }
};
```

**Block Reasons**:
- `SQL_INJECTION_DETECTED`
- `XSS_ATTEMPT`
- `BRUTE_FORCE_ATTACK`
- `SUSPICIOUS_ACTIVITY`
- `POLICY_VIOLATION`

### Account States

```
Active → Can login and use system
Inactive → Cannot login
Blocked → Locked due to security/policy violation
Deleted → Soft-deleted, can be restored
```

## Logging & Monitoring

### Security Event Logging

```javascript
// In customLog.jsx
log.error(
  'SQL injection attempt detected',
  'security',           // Log type
  'SQL Injection',      // Action
  220,                  // Severity
  'blockip'            // Additional flag
);
```

**Logged Events**:
- Login attempts (success/failure)
- Account blocks/unblocks
- Password changes
- Permission changes
- SQL injection attempts
- XSS attempts
- Session creation/destruction
- API errors
- Unauthorized access attempts

### Log Monitoring

```javascript
// Backend - Real-time monitoring
const securityEvents = [
  'SQL_INJECTION',
  'XSS_ATTEMPT',
  'BRUTE_FORCE',
  'UNAUTHORIZED_ACCESS'
];

function monitorSecurityEvents() {
  securityEvents.forEach(eventType => {
    const count = getEventCount(eventType, '1h');
    
    if (count > THRESHOLD) {
      sendAlert({
        type: eventType,
        count: count,
        timeframe: '1 hour'
      });
    }
  });
}
```

## Security Best Practices

### For Developers

1. **Never commit secrets** to version control
2. **Always validate input** on both client and server
3. **Use HTTPS** in production
4. **Keep dependencies updated** (`npm audit`, `npm update`)
5. **Follow least privilege** principle
6. **Sanitize output** before rendering
7. **Use security headers**
8. **Log security events**
9. **Test security** regularly
10. **Review code** for security issues

### For Administrators

1. **Regular updates**: Keep system and packages updated
2. **Strong passwords**: Enforce password policies
3. **Monitor logs**: Check for suspicious activity
4. **Regular backups**: Backup data and configurations
5. **Access control**: Review user permissions regularly
6. **Security audits**: Conduct periodic security reviews
7. **Incident response**: Have a response plan
8. **SSL certificates**: Keep certificates up to date
9. **Firewall rules**: Maintain proper firewall configuration
10. **Security training**: Train users on security practices

### For Users

1. **Strong passwords**: Use unique, complex passwords
2. **Logout when done**: Don't leave sessions open
3. **Report suspicious activity**: Notify administrators
4. **Don't share credentials**: Keep login information private
5. **Use secure connections**: Always use HTTPS
6. **Keep software updated**: Update browser and OS
7. **Be cautious**: Watch for phishing attempts
8. **Verify URLs**: Ensure you're on the correct site
9. **Clear cache**: Clear browser data regularly
10. **Review activity**: Check login history

## Security Incident Response

### Incident Response Plan

1. **Detection**: Identify security incident
2. **Containment**: Isolate affected systems
3. **Investigation**: Determine scope and impact
4. **Eradication**: Remove threat
5. **Recovery**: Restore normal operations
6. **Lessons Learned**: Document and improve

### Incident Types

#### Unauthorized Access
- Block affected accounts
- Reset passwords
- Review access logs
- Identify entry point
- Patch vulnerability

#### Data Breach
- Isolate affected data
- Notify affected users
- Document breach
- Report to authorities (if required)
- Implement additional controls

#### DDoS Attack
- Enable rate limiting
- Use CDN/DDoS protection
- Block malicious IPs
- Scale infrastructure
- Contact ISP

## Security Checklist

### Pre-Deployment

- [ ] All dependencies updated
- [ ] Security audit completed
- [ ] Secrets removed from code
- [ ] Environment variables configured
- [ ] HTTPS configured
- [ ] Security headers enabled
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation tested
- [ ] Authentication tested
- [ ] Authorization tested
- [ ] Session management tested
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Monitoring set up
- [ ] Backup configured
- [ ] Incident response plan documented

### Post-Deployment

- [ ] SSL certificate valid
- [ ] Security headers present
- [ ] HTTPS redirect working
- [ ] API authentication working
- [ ] Session timeout working
- [ ] Account blocking working
- [ ] Logs being collected
- [ ] Monitoring alerts configured
- [ ] Backups running
- [ ] Performance acceptable

### Regular Maintenance

- [ ] Review security logs (daily)
- [ ] Check for failed logins (daily)
- [ ] Update dependencies (weekly)
- [ ] Review user permissions (monthly)
- [ ] Security audit (quarterly)
- [ ] Penetration testing (annually)
- [ ] Incident response drill (annually)

---

**Last Updated**: 2024
**Author**: APS Development Team
