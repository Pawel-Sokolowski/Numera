const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Numera Office Management API',
      version: '1.0.0',
      description: 'Comprehensive office management system API documentation',
      contact: {
        name: 'API Support',
        email: 'support@numera.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Development server',
      },
      {
        url: 'https://api.numera.com/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Client: {
          type: 'object',
          required: ['name', 'nip', 'email', 'phone', 'address', 'city', 'postalCode'],
          properties: {
            id: {
              type: 'string',
              description: 'Client ID',
            },
            name: {
              type: 'string',
              description: 'Client name',
            },
            nip: {
              type: 'string',
              pattern: '^\\d{10}$',
              description: 'Tax identification number (10 digits)',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Client email',
            },
            phone: {
              type: 'string',
              description: 'Client phone number',
            },
            address: {
              type: 'string',
              description: 'Street address',
            },
            city: {
              type: 'string',
              description: 'City',
            },
            postalCode: {
              type: 'string',
              pattern: '^\\d{2}-\\d{3}$',
              description: 'Postal code (XX-XXX format)',
            },
            accountNumber: {
              type: 'string',
              description: 'Bank account number',
            },
            notes: {
              type: 'string',
              description: 'Additional notes',
            },
          },
        },
        User: {
          type: 'object',
          required: ['username', 'email', 'role', 'firstName', 'lastName'],
          properties: {
            id: {
              type: 'string',
              description: 'User ID',
            },
            username: {
              type: 'string',
              description: 'Username',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
            },
            role: {
              type: 'string',
              enum: ['admin', 'accountant', 'user'],
              description: 'User role',
            },
            firstName: {
              type: 'string',
              description: 'First name',
            },
            lastName: {
              type: 'string',
              description: 'Last name',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./server/routes/*.js'], // Path to API routes
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
