import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Open Node Backend Platform (ONBP) API",
      version: "0.1.0",
      description: `
## ONBP REST API Documentation

The Open Node Backend Platform provides a modular, production-ready backend ecosystem.

### Authentication
All protected endpoints require a Bearer token in the \`Authorization\` header.

### Response Format
Every response follows the standard ONBP envelope:
\`\`\`json
{
  "success": true,
  "message": "Operation completed",
  "data": {},
  "meta": {}
}
\`\`\`

### Error Format
\`\`\`json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable error message"
}
\`\`\`
      `,
      contact: {
        name: "ONBP Team",
      },
      license: {
        name: "MIT",
      },
    },
    servers: [
      {
        url: "/api/v1",
        description: "ONBP API v1",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "BetterAuth session token",
        },
      },
      schemas: {
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Operation completed successfully" },
            data: { type: "object" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: { type: "string", example: "NOT_FOUND" },
            message: { type: "string", example: "Resource not found" },
          },
        },
        PaginationMeta: {
          type: "object",
          properties: {
            limit: { type: "integer", example: 20 },
            offset: { type: "integer", example: 0 },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            firstName: { type: "string", example: "John" },
            lastName: { type: "string", example: "Doe" },
            username: { type: "string", example: "johndoe" },
            email: { type: "string", format: "email", example: "john@example.com" },
            isActive: { type: "boolean", example: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Role: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Administrator" },
            slug: { type: "string", example: "admin" },
            description: { type: "string", example: "Full platform access" },
            isActive: { type: "boolean", example: true },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Permission: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Read Users" },
            slug: { type: "string", example: "users:read" },
            resource: { type: "string", example: "users" },
            action: {
              type: "string",
              enum: ["create", "read", "update", "delete", "manage"],
            },
            description: { type: "string" },
            isActive: { type: "boolean", example: true },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        AuditLog: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid", nullable: true },
            action: { type: "string", example: "user.created" },
            resource: { type: "string", example: "users" },
            resourceId: { type: "string", nullable: true },
            ipAddress: { type: "string", nullable: true },
            metadata: { type: "object", nullable: true },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        HealthStatus: {
          type: "object",
          properties: {
            status: { type: "string", enum: ["ok", "degraded", "down"], example: "ok" },
            version: { type: "string", example: "0.1.0" },
            uptime: { type: "number", example: 3600 },
            timestamp: { type: "string", format: "date-time" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: "Health", description: "Platform health and diagnostics" },
      { name: "Users", description: "User management" },
      { name: "Roles", description: "Role management (RBAC)" },
      { name: "Permissions", description: "Permission management (RBAC)" },
      { name: "Audit", description: "Audit log access" },
      { name: "Settings", description: "Application settings" },
    ],
  },
  apis: [], // We use programmatic definitions below, not JSDoc scanning
};

export const swaggerSpec = swaggerJsdoc(options);

// Inline path definitions for all core endpoints
(swaggerSpec as Record<string, unknown>).paths = {
  "/health": {
    get: {
      tags: ["Health"],
      summary: "Platform health check",
      security: [],
      responses: {
        200: {
          description: "Platform is healthy",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/HealthStatus" },
            },
          },
        },
      },
    },
  },
  "/users": {
    get: {
      tags: ["Users"],
      summary: "List all users",
      parameters: [
        { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
        { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
      ],
      responses: {
        200: {
          description: "Users list",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/SuccessResponse" },
                  { properties: { data: { type: "array", items: { $ref: "#/components/schemas/User" } } } },
                ],
              },
            },
          },
        },
      },
    },
    post: {
      tags: ["Users"],
      summary: "Create a new user",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["firstName", "lastName", "username", "email", "authUserId"],
              properties: {
                firstName: { type: "string" },
                lastName: { type: "string" },
                username: { type: "string" },
                email: { type: "string", format: "email" },
                authUserId: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "User created" },
        409: { description: "Conflict — email or username already exists" },
      },
    },
  },
  "/users/{id}": {
    get: {
      tags: ["Users"],
      summary: "Get user by ID",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: {
        200: { description: "User found" },
        404: { description: "User not found" },
      },
    },
    put: {
      tags: ["Users"],
      summary: "Update user",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: {
        200: { description: "User updated" },
        404: { description: "User not found" },
      },
    },
    delete: {
      tags: ["Users"],
      summary: "Soft-delete user",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: {
        204: { description: "User deleted" },
        404: { description: "User not found" },
      },
    },
  },
  "/roles": {
    get: { tags: ["Roles"], summary: "List all roles", responses: { 200: { description: "Roles list" } } },
    post: { tags: ["Roles"], summary: "Create a role", responses: { 201: { description: "Role created" } } },
  },
  "/roles/{id}": {
    get: { tags: ["Roles"], summary: "Get role by ID", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Role" }, 404: { description: "Not found" } } },
    put: { tags: ["Roles"], summary: "Update role", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Updated" } } },
    delete: { tags: ["Roles"], summary: "Delete role", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 204: { description: "Deleted" } } },
  },
  "/permissions": {
    get: { tags: ["Permissions"], summary: "List permissions", responses: { 200: { description: "Permissions" } } },
    post: { tags: ["Permissions"], summary: "Create permission", responses: { 201: { description: "Created" } } },
  },
  "/permissions/{id}": {
    get: { tags: ["Permissions"], summary: "Get permission", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Permission" } } },
    put: { tags: ["Permissions"], summary: "Update permission", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Updated" } } },
    delete: { tags: ["Permissions"], summary: "Delete permission", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 204: { description: "Deleted" } } },
  },
  "/audit": {
    get: { tags: ["Audit"], summary: "List all audit logs", parameters: [{ name: "limit", in: "query", schema: { type: "integer" } }, { name: "offset", in: "query", schema: { type: "integer" } }], responses: { 200: { description: "Audit logs" } } },
  },
  "/audit/user/{userId}": {
    get: { tags: ["Audit"], summary: "Get audit logs for user", parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "User audit logs" } } },
  },
  "/settings": {
    get: { tags: ["Settings"], summary: "List settings", parameters: [{ name: "group", in: "query", schema: { type: "string" } }], responses: { 200: { description: "Settings" } } },
    put: { tags: ["Settings"], summary: "Upsert a setting", responses: { 200: { description: "Saved" } } },
  },
  "/settings/{key}": {
    get: { tags: ["Settings"], summary: "Get setting by key", parameters: [{ name: "key", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Setting" } } },
    delete: { tags: ["Settings"], summary: "Delete setting", parameters: [{ name: "key", in: "path", required: true, schema: { type: "string" } }], responses: { 204: { description: "Deleted" } } },
  },
};
