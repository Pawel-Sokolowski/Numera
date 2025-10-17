# Security and GitHub Pages Fixes Summary

This document summarizes the security vulnerabilities that have been addressed and the GitHub Pages configuration improvements made to the Numera application.

## Changes Implemented

### 1. Security Vulnerabilities Fixed in `server/middleware/security.js`

#### a) Replaced Regex-Based Sanitization with XSS Library

- **Issue**: Previous implementation used regex patterns to detect and remove dangerous HTML tags, which could be bypassed by sophisticated XSS attacks.
- **Fix**: Replaced custom regex-based sanitization with the industry-standard `xss` library.
- **Implementation**:
  ```javascript
  // Use xss library for proper HTML sanitization
  return xss(str, {
    whiteList: {}, // Remove all HTML tags
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style'],
  });
  ```
- **Testing**: Validated against common XSS attack vectors including `<script>`, `<iframe>`, `<img onerror>`, and `<svg onload>` tags.

#### b) Fixed Incomplete URL Scheme Checks

- **Issue**: Previous implementation only removed `javascript:` protocol using regex replacement, which could be bypassed.
- **Fix**: Added explicit checks for dangerous URL schemes before XSS sanitization.
- **Implementation**:
  ```javascript
  // Check for dangerous URL schemes
  if (
    str.startsWith('javascript:') ||
    str.startsWith('data:') ||
    str.startsWith('vbscript:') ||
    str.startsWith('file:')
  ) {
    return '';
  }
  ```
- **Protected Schemes**: `javascript:`, `data:`, `vbscript:`, `file:`
- **Testing**: Verified that dangerous URLs are blocked while safe URLs (http/https) are allowed.

#### c) Replaced Bad HTML Filtering Regex

- **Issue**: Regex patterns for HTML filtering were incomplete and could miss edge cases.
- **Fix**: Completely replaced with `xss` library which provides comprehensive HTML sanitization.
- **Benefits**:
  - Handles nested tags correctly
  - Prevents attribute-based attacks
  - Strips inline event handlers
  - Properly escapes special characters

### 2. Rate Limiting for Password Reset Endpoints in `server/routes/auth.js`

#### a) Added Strict Rate Limiting

- **Implementation**: Added `passwordResetLimiter` using express-rate-limit
- **Configuration**:
  - Window: 1 hour (60 minutes)
  - Max requests: 3 per IP per hour
  - Error message: "Too many password reset attempts from this IP, please try again later."

#### b) Added Progressive Delays

- **Implementation**: Added `passwordResetSpeedLimiter` using express-slow-down
- **Configuration**:
  - Window: 15 minutes
  - Delay after: 1 request at full speed
  - Delay formula: `hits * 1000ms` (1 second per request)
  - Maximum delay: 10 seconds
- **Behavior**:
  - 1st request: No delay
  - 2nd request: 1 second delay
  - 3rd request: 2 second delay
  - 4th+ requests: Up to 10 seconds delay

#### c) Password Reset Endpoints

- **POST /forgot-password**: Request password reset with email
  - Prevents email enumeration (always returns success)
  - Protected by both rate limiters
  - TODO: Email sending and token generation
- **POST /reset-password**: Reset password with token
  - Validates token and new password
  - Protected by both rate limiters
  - TODO: Full implementation with token verification

### 3. GitHub Actions CI/CD Workflow Permissions

#### a) Added Default Read-Only Permissions

```yaml
# Set default permissions to read-only for all jobs
permissions:
  contents: read
```

#### b) Job-Specific Permissions

Following the principle of least privilege:

- **lint-and-type-check**: `contents: read` (read-only)
- **test**: `contents: read` (read-only)
- **e2e-tests**: `contents: read`, `actions: write` (for artifact upload)
- **build**: `contents: read`, `actions: write` (for artifact upload)
- **security-audit**: `contents: read` (read-only)

### 4. GitHub Pages Configuration

#### a) Base Path Configuration

- **File**: `vite.config.ts`
- **Configuration**: `base: process.env.VITE_BASE_PATH || '/Numera/'`
- **Static Mode Detection**:
  ```typescript
  const isStaticDeployment =
    process.env.VITE_STATIC_DEPLOY === 'true' ||
    process.env.GITHUB_ACTIONS === 'true' ||
    process.env.VITE_BASE_PATH === '/Numera/';
  ```
- **Benefits**:
  - Automatic detection of GitHub Actions environment
  - Flexible configuration for different deployment targets
  - Runtime exposure of deployment mode

#### b) 404.html for SPA Routing

- **Status**: Already exists and correctly configured
- **Location**: `public/404.html`
- **Purpose**: Redirects all 404s to index.html for client-side routing
- **Configuration**: Uses `pathSegmentsToKeep = 1` for GitHub Pages project sites

#### c) Asset Loading Paths

- **Verification**: Build output confirmed to use `/Numera/` base path
- **Examples**:
  - Manifest: `/Numera/manifest.webmanifest`
  - CSS: `/Numera/assets/index.[hash].css`
  - JS: `/Numera/assets/index.[hash].js`
  - Favicons: `/Numera/favicon-32x32.png`

## Dependencies Added

### 1. xss (v1.0.15)

- **Purpose**: HTML sanitization and XSS protection
- **Usage**: Input sanitization middleware
- **Configuration**: Whitelist mode with all tags stripped

### 2. express-slow-down (v2.0.3)

- **Purpose**: Progressive rate limiting with delays
- **Usage**: Password reset endpoint protection
- **Integration**: Works alongside express-rate-limit

## Testing Performed

### 1. XSS Sanitization Tests

- ✓ Script tag injection blocked
- ✓ Iframe injection blocked
- ✓ Image onerror injection blocked
- ✓ SVG onload injection blocked
- ✓ Normal text preserved
- ✓ HTML tags stripped while preserving content

### 2. URL Scheme Filtering Tests

- ✓ javascript: protocol blocked
- ✓ data: protocol blocked
- ✓ vbscript: protocol blocked
- ✓ file: protocol blocked
- ✓ https: protocol allowed
- ✓ http: protocol allowed

### 3. Build Verification

- ✓ Vite build completes successfully
- ✓ Assets use correct /Numera/ base path
- ✓ No syntax errors in server files
- ✓ Dependencies load correctly

### 4. Server File Validation

- ✓ `server/middleware/security.js` syntax check passed
- ✓ `server/routes/auth.js` syntax check passed
- ✓ All new dependencies import successfully

## Security Impact

### Before

- **XSS Vulnerability**: Regex-based sanitization could be bypassed
- **URL Injection**: Incomplete scheme checking allowed dangerous protocols
- **Brute Force Risk**: No rate limiting on password reset endpoints
- **Workflow Security**: Missing explicit permissions could allow privilege escalation

### After

- **XSS Protection**: Industry-standard library with comprehensive coverage
- **URL Safety**: Multiple dangerous schemes explicitly blocked
- **Rate Limiting**: Both strict limits and progressive delays prevent abuse
- **Workflow Security**: Least privilege principle enforced on all jobs

## Compliance

These changes address:

- ✓ CodeQL security alerts for XSS vulnerabilities
- ✓ CodeQL alerts for incomplete URL validation
- ✓ GitHub security best practices for workflow permissions
- ✓ OWASP recommendations for input sanitization
- ✓ Rate limiting best practices for authentication endpoints

## Future Enhancements

### Password Reset Implementation

The password reset endpoints have been created with proper security measures, but require:

1. Email sending service integration
2. Secure token generation and storage
3. Token expiration mechanism
4. Password reset token table in database

### Additional Security Considerations

1. Consider implementing CAPTCHA for password reset
2. Add security headers testing
3. Implement CSP reporting endpoint
4. Add automated security scanning in CI/CD

## References

- [XSS Library Documentation](https://github.com/leizongmin/js-xss)
- [Express Rate Limit](https://github.com/express-rate-limit/express-rate-limit)
- [Express Slow Down](https://github.com/express-rate-limit/express-slow-down)
- [GitHub Actions Security Hardening](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
