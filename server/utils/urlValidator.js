// URL Validation Utility - Secure alternative to validator.isURL
// Used to validate URLs with proper security checks

/**
 * Validates a URL string with proper security checks.
 * This is a secure alternative that addresses CVE issues in validator.isURL
 *
 * @param {string} url - The URL to validate
 * @param {object} options - Validation options
 * @returns {boolean} - True if valid URL, false otherwise
 */
function isValidURL(url, options = {}) {
  if (typeof url !== 'string') {
    return false;
  }

  // Reject obvious malicious patterns
  if (
    url.includes('<') ||
    url.includes('>') ||
    url.includes('javascript:') ||
    url.includes('data:')
  ) {
    return false;
  }

  try {
    const urlObj = new URL(url);

    // Check protocol
    const allowedProtocols = options.protocols || ['http:', 'https:'];
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return false;
    }

    // Check hostname
    if (!urlObj.hostname || urlObj.hostname.length === 0) {
      return false;
    }

    // Reject localhost/private IPs in production (if option set)
    if (options.requirePublic) {
      const privatePatterns = [
        /^localhost$/i,
        /^127\./,
        /^10\./,
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
        /^192\.168\./,
      ];

      if (privatePatterns.some((pattern) => pattern.test(urlObj.hostname))) {
        return false;
      }
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Sanitizes a URL by removing potentially dangerous components
 *
 * @param {string} url - The URL to sanitize
 * @returns {string} - Sanitized URL
 */
function sanitizeURL(url) {
  if (typeof url !== 'string') {
    return '';
  }

  try {
    const urlObj = new URL(url);

    // Only allow http/https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return '';
    }

    // Remove credentials
    urlObj.username = '';
    urlObj.password = '';

    return urlObj.toString();
  } catch (error) {
    return '';
  }
}

module.exports = {
  isValidURL,
  sanitizeURL,
};
