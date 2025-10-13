/**
 * Security Configuration
 * 
 * Centralized security settings and configurations for the application.
 * Includes CSP policies, CORS settings, and other security-related constants.
 */

export const securityConfig = {
  // Content Security Policy
  csp: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.example.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      workerSrc: ["'self'", "blob:"],
      manifestSrc: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      upgradeInsecureRequests: true
    }
  },

  // CORS Configuration
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? [process.env.REACT_APP_API_URL || 'https://yourdomain.com'] 
      : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With',
      'Accept',
      'Origin'
    ],
    exposedHeaders: ['Content-Length', 'X-Request-ID'],
    maxAge: 86400 // 24 hours
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: any) => {
      // Skip rate limiting for health checks
      return req.path === '/api/health';
    }
  },

  // Authentication
  auth: {
    jwtSecret: process.env.JWT_SECRET || (() => {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET must be set in production');
      }
      return 'demo-secret-key-for-development-only';
    })(),
    tokenExpiration: '24h',
    refreshTokenExpiration: '7d',
    passwordMinLength: 8,
    passwordMaxLength: 128,
    maxLoginAttempts: 5,
    lockoutTime: 15 * 60 * 1000, // 15 minutes
    requireStrongPasswords: true
  },

  // Input Validation
  validation: {
    maxStringLength: 1000,
    maxTextLength: 5000,
    maxArrayLength: 100,
    maxObjectDepth: 10,
    allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxImageSize: 5 * 1024 * 1024, // 5MB
    maxPdfSize: 10 * 1024 * 1024 // 10MB
  },

  // Database Security
  database: {
    maxConnections: 20,
    connectionTimeout: 2000,
    idleTimeout: 30000,
    queryTimeout: 30000,
    enableSSL: process.env.NODE_ENV === 'production',
    logQueries: process.env.NODE_ENV === 'development'
  },

  // File Upload Security
  fileUpload: {
    maxFiles: 10,
    maxSize: 50 * 1024 * 1024, // 50MB total
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif'
    ],
    scanForMalware: true,
    quarantinePath: '/quarantine'
  },

  // Session Security
  session: {
    secret: process.env.SESSION_SECRET || 'your-session-secret-here',
    name: 'sessionId',
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'strict' as const
    },
    resave: false,
    saveUninitialized: false,
    rolling: true
  },

  // API Security
  api: {
    version: 'v1',
    prefix: '/api',
    enableApiKeyAuth: false,
    apiKeyHeader: 'X-API-Key',
    enableRequestLogging: true,
    enableResponseTime: true,
    enableCompression: true,
    enableETag: true
  },

  // Logging
  logging: {
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    format: process.env.NODE_ENV === 'production' ? 'json' : 'combined',
    enableConsole: true,
    enableFile: process.env.NODE_ENV === 'production',
    logFile: 'logs/app.log',
    maxLogFiles: 5,
    maxLogSize: '10MB',
    enableAuditLog: true,
    auditLogFile: 'logs/audit.log'
  },

  // Error Handling
  errorHandling: {
    showStackTrace: process.env.NODE_ENV === 'development',
    logErrors: true,
    reportErrors: process.env.NODE_ENV === 'production',
    enableErrorPages: true,
    customErrorPages: true
  },

  // Security Headers
  headers: {
    enableHelmet: true,
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: {
      camera: [],
      microphone: [],
      geolocation: [],
      payment: []
    }
  },

  // Monitoring and Alerting
  monitoring: {
    enableMetrics: true,
    enableHealthChecks: true,
    healthCheckInterval: 30000, // 30 seconds
    enableUptimeMonitoring: true,
    alertOnErrorRate: 0.05, // 5% error rate
    alertOnResponseTime: 5000, // 5 seconds
    enableSecurityAlerts: true
  }
};

// Environment-specific overrides
if (process.env.NODE_ENV === 'development') {
  securityConfig.cors.origin = ['http://localhost:3000', 'http://localhost:3001'];
  securityConfig.auth.jwtSecret = 'demo-secret-key-for-development-only';
  securityConfig.headers.hsts = false;
  securityConfig.session.cookie.secure = false;
}

if (process.env.NODE_ENV === 'test') {
  securityConfig.rateLimit.max = 1000; // More lenient for tests
  securityConfig.auth.maxLoginAttempts = 10;
  securityConfig.validation.maxFileSize = 100 * 1024 * 1024; // 100MB for tests
}

export default securityConfig;
