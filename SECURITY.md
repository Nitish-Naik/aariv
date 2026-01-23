# Production Security Configuration Guide

## ⚠️ CRITICAL: Before Deploying to Production

This document outlines the essential security configurations that MUST be completed before deploying Aariv to production.

---

## 1. Environment Variables Setup

### Backend `.env` Configuration

Create a `.env` file in the `backend/` directory with the following variables:

```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# OpenAI API Key
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your-actual-openai-key-here

# Supabase Configuration  
# Get from: https://app.supabase.com/project/_/settings/api
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Google OAuth
# Get from: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Composio Configuration
# Get from: https://app.composio.dev/settings
COMPOSIO_API_KEY=your-composio-api-key
COMPOSIO_EXTERNAL_USER_ID=your-external-user-id
COMPOSIO_CALENDAR_AUTH_CONFIG_ID=your-calendar-auth-config-id
COMPOSIO_GMAIL_AUTH_CONFIG_ID=your-gmail-auth-config-id

# JWT Secrets (GENERATE STRONG RANDOM KEYS!)
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=paste-generated-64-char-hex-string-here
JWT_REFRESH_SECRET=paste-another-generated-64-char-hex-string-here

# CORS Configuration
# Add your production domain(s)
ALLOWED_ORIGINS=https://your-production-domain.com,https://www.your-production-domain.com

# Cron Job Security
CRON_SECRET=generate-strong-random-key-here
```

### Generate JWT Secrets

Run this command to generate secure JWT secrets:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and paste it as your `JWT_SECRET` and `JWT_REFRESH_SECRET` values (generate twice for different keys).

---

## 2. Security Features Implemented

### ✅ Authentication & Authorization
- **JWT-based authentication** with access tokens (24h) and refresh tokens (7d)
- **Authorization middleware** protects all API routes except `/api/auth`
- **Mock login disabled** in production environment
- **Token verification** on every protected API call

### ✅ CORS Protection
- **Whitelist-based CORS** - only allowed origins can access API
- **Credentials support** - allows authenticated requests
- **Pre-flight handling** - proper OPTIONS request support

### ✅ Security Headers (Helmet.js)
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options: DENY (prevent clickjacking)
- X-Content-Type-Options: nosniff
- XSS Protection
- Referrer-Policy: strict-origin-when-cross-origin

### ✅ Request Security
- **Request size limits** - 10MB JSON payload limit
- **Request timeouts** - 30 second timeout on all API calls
- **Authorization headers** - all authenticated requests include Bearer token
- **Automatic token refresh** on expiration (401 response)

### ✅ Secrets Management
- **Environment variables** for all secrets (no hardcoded keys)
- **`.env.example` sanitized** - contains only placeholder values
- **Environment validation** at server startup
- **Production checks** - stricter validation in production mode

### ✅ Rate Limiting
- API-wide rate limiting
- Stricter limits on auth endpoints
- Cost-intensive endpoint protection (OpenAI calls)

---

## 3. Testing & Verification

### Run Dependency Security Audit

```bash
cd backend
npm audit
npm audit fix
```

### Test Authentication Flow

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Test Google Sign-In from the mobile app
3. Verify JWT token is returned
4. Verify protected endpoints require Authorization header
5. Test token expiration handling

### Verify CORS Configuration

Use browser DevTools Network tab to check:
- Requests from allowed origins succeed
- Requests from unauthorized origins are blocked
- `Access-Control-Allow-Origin` header is present

### Check Security Headers

Test your deployed API at: [securityheaders.com](https://securityheaders.com)

Target grade: **A** or higher

---

## 4. Production Deployment Checklist

- [ ] Set `NODE_ENV=production` in production environment
- [ ] Generate strong JWT secrets (64+ characters)
- [ ] Update `ALLOWED_ORIGINS` with production domain(s)
- [ ] Verify all API keys are set in production `.env`
- [ ] Enable HTTPS (required for production)
- [ ] Configure error tracking (e.g., Sentry)
- [ ] Set up monitoring and logging
- [ ] Configure automated backups
- [ ] Test entire authentication flow end-to-end
- [ ] Verify mock login is blocked
- [ ] Run dependency security audit
- [ ] Check security headers score
- [ ] Load test API endpoints
- [ ] Verify rate limiting works correctly

---

## 5. Ongoing Security Maintenance

### Weekly
- Review application logs for security events
- Check for failed authentication attempts
- Monitor rate limit violations

### Monthly
- Run `npm audit` and update vulnerable dependencies
- Review and rotate API keys if necessary
- Check security header configurations

### Quarterly
- Review and  update CORS whitelist
- Audit user permissions and access logs
- Test disaster recovery procedures

---

## 6. Known Limitations & Future Improvements

### To Be Implemented
- [ ] Refresh token endpoint (currently manual sign-in on expiry)
- [ ] Input validation middleware for all endpoints (partial)
- [ ] XSS sanitization on text inputs
- [ ] SQL injection prevention (using parameterized queries)
- [ ] File upload validation (virus scanning)
- [ ] Two-factor authentication (2FA)
- [ ] OAuth scope management
- [ ] Account lockout after failed login attempts

### Recommended
- Set up Web Application Firewall (WAF)
- Implement DDoS protection (e.g., Cloudflare)
- Enable database encryption at rest
- Set up automated security scanning in CI/CD
- Implement audit logging for sensitive operations

---

## 7. Security Incident Response

If you detect a security breach:

1. **Immediately revoke compromised tokens**:
   - Rotate JWT secrets
   - Force all users to re-authenticate
   
2. **Update affected API keys**:
   - OpenAI, Supabase, Composio, Google OAuth
   
3. **Review audit logs**:
   - Check for unauthorized access
   - Identify affected users
   
4. **Notify affected users** if personal data was accessed

5. **Update security configurations** to prevent recurrence

---

## Support

For security concerns, contact: security@aariv.app

**Do not discuss security vulnerabilities in public channels.**
