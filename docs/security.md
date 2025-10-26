# 🔒 Security Documentation

## Table of Contents

- [Overview](#overview)
- [Security Architecture](#security-architecture)
- [Authentication Security](#authentication-security)
- [Input Validation & Sanitization](#input-validation--sanitization)
- [Data Protection](#data-protection)
- [Transport Security](#transport-security)
- [Session Management](#session-management)
- [Security Headers](#security-headers)
- [Logging & Monitoring](#logging--monitoring)
- [Best Practices](#best-practices)
- [Security Checklist](#security-checklist)
- [Incident Response](#incident-response)

---

## Overview

The APS News Dashboard implements enterprise-grade security measures at every layer of the application. This document outlines the security features, best practices, and guidelines for maintaining a secure application.

### Security Principles

1. **Defense in Depth**: Multiple layers of security controls
2. **Least Privilege**: Minimum access rights for users
3. **Zero Trust**: Verify everything, trust nothing
4. **Security by Design**: Security built into architecture
5. **Continuous Monitoring**: Ongoing security assessment

---

## Security Architecture

### Multi-Layer Security Model

```
┌─────────────────────────────────────────────────────────┐
│                   Layer 1: User Input                    │
│  ✓ Input Validation                                      │
│  ✓ SQL Injection Detection                               │
│  ✓ XSS Prevention                                        │
│  ✓ HTML Sanitization                                     │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│              Layer 2: Application Logic                  │
│  ✓ Authentication & Authorization                        │
│  ✓ Session Management                                    │
│  ✓ CSRF Protection                                       │
│  ✓ Rate Limiting                                         │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│               Layer 3: Data Protection                   │
│  ✓ Encryption at Rest (AES-256)                         │
│  ✓ Encrypted Storage                                     │
│  ✓ Secure Data Transmission                              │
│  ✓ No Sensitive Data in URLs                             │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│              Layer 4: Transport Security                 │
│  ✓ HTTPS/TLS Encryption                                  │
│  ✓ Security Headers                                      │
│  ✓ Cookie Security                                       │
│  ✓ CORS Configuration                                    │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│            Layer 5: Logging & Monitoring                 │
│  ✓ Security Event Logging                                │
│  ✓ Audit Trails                                          │
│  ✓ Anomaly Detection                                     │
│  ✓ Incident Response                                     │
└─────────────────────────────────────────────────────────┘
```

---

## Authentication Security

### Password Security

#### Password Requirements

```javascript
// Enforced in frontend and backend
const PASSWORD_RULES = {
  minLength: 6,
  maxLength: 20,
  requireNumbers: true,
  requireSpecialChars: false,  // Optional
  preventCommonPasswords: true
};
```

#### Password Storage

**Backend (Not in this repo):**
- Hashed using bcrypt with salt rounds: 12
- Never stored in plain text
- Password history maintained to prevent reuse

**Frontend:**
- Passwords never stored (even temporarily)
- Cleared from memory after authentication
- Not logged or sent to analytics

### Authentication Flow Security

```javascript
// Login security checks
handleLogin(credentials) {
  // 1. Input validation
  if (!validateInput(credentials)) {
    return error("Invalid input");
  }
  
  // 2. SQL injection detection
  if (detectSQLInjection(credentials.username) || 
      detectSQLInjection(credentials.password)) {
    logSecurityEvent("SQL_INJECTION_ATTEMPT");
    blockUser();
    return error("Invalid credentials");
  }
  
  // 3. Length validation
  if (credentials.password.length < 6 || 
      credentials.password.length > 20) {
    return error("Invalid credentials");
  }
  
  // 4. Rate limiting check (backend)
  // 5. Authenticate (backend)
  // 6. Create secure session (backend)
  // 7. Set HTTP-only cookie (backend)
}
```

### Multi-Factor Authentication (MFA)

**Status**: Not currently implemented  
**Recommendation**: Implement for admin accounts

**Proposed Implementation:**
- TOTP (Time-based One-Time Password)
- SMS verification backup
- Recovery codes
- Remember device option

---

## Input Validation & Sanitization

### SQL Injection Prevention

#### Detection Function

```javascript
/**
 * Detects SQL injection patterns
 * @security Critical security function
 */
export const detectSQLInjection = (input) => {
  if (typeof input !== "string" || !input.trim()) return false;

  const sqlInjectionPatterns = [
    // SQL keywords with context
    /\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|EXEC|LIMIT)\b.*\b(FROM|TABLE|DATABASE|INTO|VALUES|SET)\b/i,
    
    // Malicious comparisons
    /('|")\s*(OR|AND)\s*('|")?\s*=\s*('|")/i,
    
    // Table manipulation
    /;\s*(DROP|TRUNCATE|ALTER)\s+\w+/i,
    
    // SQL comments
    /--[^\n]*$/m,
    /\/\*[\s\S]*?\*\//m
  ];

  return sqlInjectionPatterns.some(pattern => pattern.test(input));
};
```

#### Usage

```javascript
// Before any database operation
if (detectSQLInjection(userInput)) {
  log.error("SQL injection attempt detected", {
    input: userInput,
    user: currentUser,
    ip: ipAddress
  });
  blockUser();
  return;
}
```

### XSS Prevention

#### HTML Sanitization

```javascript
import DOMPurify from 'dompurify';

// Sanitize HTML content
const sanitizedHTML = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em'],
  ALLOWED_ATTR: []
});
```

#### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline';
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;">
```

### Email Validation

```javascript
/**
 * Validates email format
 * @param {string} email - Email address to validate
 * @returns {boolean}
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
```

### Phone Validation

```javascript
/**
 * Validates phone number (10 digits)
 * @param {string} phone - Phone number
 * @returns {boolean}
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
};
```

---

## Data Protection

### Encryption

#### AES Encryption for LocalStorage

```javascript
import CryptoJS from 'crypto-js';

// Encryption
const encrypted = CryptoJS.AES.encrypt(
  data,
  secretKey
).toString();
localStorage.setItem(key, encrypted);

// Decryption
const decrypted = CryptoJS.AES.decrypt(
  encryptedData,
  secretKey
).toString(CryptoJS.enc.Utf8);
```

#### Encrypted Data Storage

**Encrypted in LocalStorage:**
- Authentication status (`isLogged`)
- Username
- Language preference
- Session tokens

**Never Stored:**
- Passwords
- Credit card information
- Personal identification numbers
- Medical information

### Secure URL Parameters

```javascript
/**
 * Encrypts URL parameters
 */
export const encryptURLParam = (data, secretKey) => {
  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    secretKey
  );
  return encodeURIComponent(encrypted.toString());
};

/**
 * Decrypts URL parameters
 */
export const useDecryptedUrl = (key, secretKey) => {
  const decrypted = CryptoJS.AES.decrypt(
    decodeURIComponent(key),
    secretKey
  );
  return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
};
```

---

## Transport Security

### HTTPS/TLS

**Production Requirements:**
- TLS 1.2 or higher
- Strong cipher suites only
- Valid SSL certificate
- HSTS enabled

**Certificate Management:**
```bash
# Renew certificates before expiration
certbot renew --dry-run

# Check certificate expiration
openssl x509 -in cert.pem -noout -dates
```

### Security Headers

#### Strict-Transport-Security (HSTS)

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

Forces HTTPS for 1 year, including subdomains.

#### X-Content-Type-Options

```http
X-Content-Type-Options: nosniff
```

Prevents MIME type sniffing.

#### X-Frame-Options

```http
X-Frame-Options: SAMEORIGIN
```

Prevents clickjacking attacks.

#### Referrer-Policy

```http
Referrer-Policy: no-referrer
```

Controls referrer information sent with requests.

#### Permissions-Policy

```http
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

Restricts browser features.

---

## Session Management

### Session Security

#### HTTP-Only Cookies

```javascript
// Backend sets HTTP-only cookie
res.cookie('sessionId', sessionId, {
  httpOnly: true,      // Not accessible via JavaScript
  secure: true,        // Only sent over HTTPS
  sameSite: 'strict',  // CSRF protection
  maxAge: 86400000     // 24 hours
});
```

#### Session Configuration

```javascript
const SESSION_CONFIG = {
  secret: process.env.SESSION_SECRET,
  name: 'sessionId',
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000  // 24 hours
  },
  resave: false,
  saveUninitialized: false
};
```

### Session Validation

```javascript
// Validate session on each request
function validateSession(req, res, next) {
  const session = req.session;
  
  // Check if session exists
  if (!session || !session.userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
      logout: true
    });
  }
  
  // Check session expiration
  if (Date.now() > session.expiresAt) {
    req.session.destroy();
    return res.status(401).json({
      success: false,
      message: "Session expired",
      logout: true
    });
  }
  
  // Update last activity
  session.lastActivity = Date.now();
  next();
}
```

### Concurrent Session Handling

```javascript
// Detect existing session
if (userHasActiveSession) {
  return {
    success: true,
    hasSession: true,
    sessionId: existingSessionId,
    message: "Active session exists"
  };
}

// User can choose to:
// 1. Close existing session and login
// 2. Cancel login attempt
```

---

## Security Headers

### Implementation in useAxios

```javascript
headers: {
  // API authentication
  "x-api-key": import.meta.env.VITE_APP_ID,
  
  // Security headers
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "geolocation=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  
  // Content type
  "Content-Type": "application/json"
}
```

### Nginx Configuration

```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

# CSP Header
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;" always;
```

---

## Logging & Monitoring

### Security Event Logging

#### Log Types

1. **Authentication Events**
   - Login attempts (success/failure)
   - Logout events
   - Password changes
   - Session creations/destructions

2. **Authorization Events**
   - Access denied events
   - Permission changes
   - Role modifications

3. **Security Violations**
   - SQL injection attempts
   - XSS attempts
   - CSRF attempts
   - Rate limit violations
   - Suspicious patterns

#### Log Structure

```javascript
{
  timestamp: "2024-10-26T10:30:00Z",
  level: "ERROR",
  type: "SECURITY_VIOLATION",
  event: "SQL_INJECTION_ATTEMPT",
  user: {
    id: "123",
    username: "john.doe",
    ip: "192.168.1.100"
  },
  details: {
    input: "[sanitized]",
    endpoint: "/api/users",
    action: "USER_BLOCKED"
  }
}
```

### Custom Logger

```javascript
// src/Log/costumLog.jsx
const log = {
  error: (message, category, title, code, action) => {
    console.error({
      timestamp: new Date().toISOString(),
      level: "ERROR",
      category,
      title,
      code,
      message,
      action
    });
    
    // Send to backend logging service
    sendToLogService({
      level: "ERROR",
      category,
      message
    });
  }
};
```

### Monitoring Metrics

**Key Security Metrics:**
- Failed login attempts per IP
- SQL injection attempts
- XSS attempts
- Rate limit violations
- Unusual access patterns
- Session anomalies

---

## Best Practices

### For Developers

#### 1. Input Validation

```javascript
// ✅ GOOD: Validate before use
if (!validateEmail(email)) {
  return error("Invalid email");
}
if (detectSQLInjection(input)) {
  logSecurityEvent("SQL_INJECTION");
  return error("Invalid input");
}

// ❌ BAD: Use input directly
database.query(`SELECT * FROM users WHERE email='${email}'`);
```

#### 2. Error Handling

```javascript
// ✅ GOOD: Generic error message to user
catch (error) {
  log.error(error);  // Log detailed error
  return "An error occurred. Please try again.";
}

// ❌ BAD: Expose system details
catch (error) {
  return error.message;  // May expose DB structure, paths, etc.
}
```

#### 3. Sensitive Data

```javascript
// ✅ GOOD: Encrypt sensitive data
const encrypted = CryptoJS.AES.encrypt(data, secretKey);
localStorage.setItem(key, encrypted);

// ❌ BAD: Store in plain text
localStorage.setItem('password', password);
```

#### 4. API Keys & Secrets

```javascript
// ✅ GOOD: Use environment variables
const apiKey = import.meta.env.VITE_APP_ID;

// ❌ BAD: Hardcode secrets
const apiKey = "abc123xyz789";
```

### For Administrators

#### 1. Regular Security Audits

- Review security logs weekly
- Check for suspicious patterns
- Update dependencies regularly
- Scan for vulnerabilities

#### 2. Access Control

- Follow principle of least privilege
- Regular permission reviews
- Revoke unused accounts
- Monitor admin activities

#### 3. Incident Response Plan

- Document security incidents
- Have response procedures ready
- Maintain contact list
- Regular drills

---

## Security Checklist

### Development Phase

- [ ] All user inputs validated
- [ ] SQL injection protection implemented
- [ ] XSS prevention in place
- [ ] Sensitive data encrypted
- [ ] No hardcoded secrets
- [ ] Error messages are generic
- [ ] Security headers configured
- [ ] Authentication tested
- [ ] Authorization tested
- [ ] Logging implemented

### Pre-Production

- [ ] Security audit completed
- [ ] Penetration testing done
- [ ] Dependencies updated
- [ ] Vulnerability scan passed
- [ ] HTTPS configured
- [ ] Security headers verified
- [ ] Rate limiting tested
- [ ] Session management verified
- [ ] Backup procedures tested
- [ ] Incident response plan ready

### Production

- [ ] HTTPS enabled and enforced
- [ ] Strong SSL certificate installed
- [ ] Security headers active
- [ ] Logging and monitoring active
- [ ] Regular backups scheduled
- [ ] Access controls verified
- [ ] Firewall configured
- [ ] Rate limiting active
- [ ] DDoS protection enabled
- [ ] Regular security updates

---

## Incident Response

### Security Incident Types

1. **Data Breach**
2. **Unauthorized Access**
3. **DoS/DDoS Attack**
4. **Malware/Ransomware**
5. **Social Engineering**

### Response Procedure

#### 1. Detection & Analysis
- Identify the incident
- Assess severity
- Document details
- Preserve evidence

#### 2. Containment
- Isolate affected systems
- Block malicious IPs
- Revoke compromised credentials
- Prevent further damage

#### 3. Eradication
- Remove malicious code
- Close vulnerabilities
- Update security measures
- Verify system integrity

#### 4. Recovery
- Restore from backups
- Verify system functionality
- Monitor for recurrence
- Gradual system restoration

#### 5. Post-Incident
- Document lessons learned
- Update security measures
- Train staff
- Improve processes

### Contact Information

**Security Team:**
- Email: security@aps.dz
- Emergency: [Internal Phone]
- On-Call: [Internal Pager]

---

## Security Resources

### Tools & Libraries

- **DOMPurify**: HTML sanitization
- **CryptoJS**: Encryption library
- **Helmet**: Security headers (backend)
- **bcrypt**: Password hashing (backend)
- **express-rate-limit**: Rate limiting (backend)

### References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [CWE Top 25](https://cwe.mitre.org/top25/)

---

## Updates & Maintenance

### Regular Security Tasks

**Daily:**
- Monitor security logs
- Check failed login attempts
- Review unusual activity

**Weekly:**
- Review security incidents
- Update blacklists
- Check certificate expiration

**Monthly:**
- Security audit
- Dependency updates
- Vulnerability scanning
- Access review

**Quarterly:**
- Penetration testing
- Security training
- Policy review
- Disaster recovery drill

---

**Document Version**: 1.0  
**Last Updated**: October 2024  
**Next Review**: January 2025  
**Maintained By**: APS Security Team
