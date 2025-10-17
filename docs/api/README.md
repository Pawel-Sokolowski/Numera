# API Documentation

## Overview

The Numera API provides RESTful endpoints for managing office operations including clients, invoices, users, calendar events, and documents.

## Authentication

All API endpoints (except `/auth/login`) require JWT authentication.

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "secure_password"
}
```

Response:

```json
{
  "user": {
    "id": "1",
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

## Using Swagger UI

Start the server and navigate to `http://localhost:3001/api-docs` to access interactive API documentation.

## Endpoints

### Clients

- `GET /api/clients` - List all clients
- `GET /api/clients/:id` - Get client by ID
- `POST /api/clients` - Create new client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Invoices

- `GET /api/invoices` - List all invoices
- `GET /api/invoices/:id` - Get invoice by ID
- `POST /api/invoices` - Create new invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice

### Users (Admin only)

- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Calendar

- `GET /api/calendar/events` - List calendar events
- `POST /api/calendar/events` - Create event
- `PUT /api/calendar/events/:id` - Update event
- `DELETE /api/calendar/events/:id` - Delete event

### Documents

- `GET /api/documents` - List documents
- `POST /api/documents` - Upload document
- `GET /api/documents/:id` - Download document
- `DELETE /api/documents/:id` - Delete document

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

- Authentication endpoints: 5 requests per 15 minutes
- General API endpoints: 100 requests per 15 minutes
- Strict endpoints (admin): 20 requests per 15 minutes

## WebSocket Events

Real-time updates via WebSocket connection on `/socket.io`

### Chat Events

- `chat:message` - New chat message
- `chat:typing` - User typing indicator

### Calendar Events

- `calendar:update` - Calendar event update

Connect with JWT token:

```javascript
const socket = io('http://localhost:3001', {
  auth: {
    token: 'your-jwt-token',
  },
});
```

## Examples

See `/docs/api/examples/` for detailed usage examples in various programming languages.
