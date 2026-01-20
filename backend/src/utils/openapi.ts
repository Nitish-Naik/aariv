/**
 * OpenAPI/Swagger documentation generator
 * Export this as API documentation
 */

export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Aariv Backend API',
    version: '1.0.0',
    description: 'AI-powered assistant API with multi-platform integration',
    contact: {
      name: 'Aariv Support',
      url: 'https://aariv.app',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Development server',
    },
    {
      url: 'https://api.aariv.app/api',
      description: 'Production server',
    },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Health check',
        operationId: 'getHealth',
        responses: {
          '200': {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    timestamp: { type: 'string', format: 'date-time' },
                    service: { type: 'string', example: 'aariv-backend' },
                    uptime: { type: 'number' },
                    environment: { type: 'string', enum: ['development', 'production'] },
                    checks: {
                      type: 'object',
                      properties: {
                        openai: { type: 'boolean' },
                        composio: { type: 'boolean' },
                        supabase: { type: 'boolean' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/auth/google': {
      post: {
        tags: ['Authentication'],
        summary: 'Google OAuth login',
        operationId: 'googleLogin',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['idToken'],
                properties: {
                  idToken: { type: 'string', description: 'Google ID token' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { type: 'object' },
                    token: { type: 'string' },
                  },
                },
              },
            },
          },
          '400': { description: 'Invalid credentials' },
        },
      },
    },
    '/integrations': {
      get: {
        tags: ['Integrations'],
        summary: 'List user integrations',
        operationId: 'listIntegrations',
        parameters: [
          {
            name: 'userId',
            in: 'query',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'List of integrations',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    integrations: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          appName: { type: 'string' },
                          status: { type: 'string' },
                          connectedAt: { type: 'string', format: 'date-time' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/chat': {
      post: {
        tags: ['Chat'],
        summary: 'Send chat message',
        operationId: 'sendChatMessage',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'message'],
                properties: {
                  userId: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Chat response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    response: { type: 'string' },
                    actions: { type: 'array' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

export function setupOpenApiDocs(app: any) {
  // Mount OpenAPI spec
  app.get('/api/openapi.json', (req: any, res: any) => {
    res.json(openApiSpec);
  });

  // Mount Swagger UI if swagger-ui-express is installed
  try {
    const swaggerUi = require('swagger-ui-express');
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
    console.log('📚 Swagger UI available at /api/docs');
  } catch (e) {
    console.log('⚠️  Swagger UI not installed. Run: npm install swagger-ui-express');
  }
}
