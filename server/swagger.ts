import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Business Management System API',
      version: '1.0.0',
      description: 'A comprehensive multi-tenant SaaS platform API for business management with role-based authentication',
      contact: {
        name: 'API Support',
        email: 'support@businessmgmt.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            role: { 
              type: 'string', 
              enum: ['super-admin', 'entrepreneur', 'collaborator', 'customer'],
              example: 'entrepreneur'
            },
            entrepreneurId: { type: 'integer', nullable: true, example: 1 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateUser: {
          type: 'object',
          required: ['name', 'email', 'role'],
          properties: {
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            role: { 
              type: 'string', 
              enum: ['super-admin', 'entrepreneur', 'collaborator', 'customer'],
              example: 'entrepreneur'
            },
            entrepreneurId: { type: 'integer', nullable: true, example: 1 }
          }
        },
        PaymentGateway: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Stripe Gateway' },
            type: { type: 'string', example: 'stripe' },
            isActive: { type: 'boolean', example: true },
            config: { type: 'object', example: { apiKey: 'sk_test_...' } },
            entrepreneurId: { type: 'integer', example: 1 },
            createdBy: { type: 'integer', example: 1 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CreatePaymentGateway: {
          type: 'object',
          required: ['name', 'type', 'config'],
          properties: {
            name: { type: 'string', example: 'Stripe Gateway' },
            type: { type: 'string', example: 'stripe' },
            isActive: { type: 'boolean', default: true },
            config: { type: 'object', example: { apiKey: 'sk_test_...' } }
          }
        },
        Collaborator: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Jane Smith' },
            email: { type: 'string', example: 'jane@example.com' },
            role: { type: 'string', example: 'developer' },
            department: { type: 'string', nullable: true, example: 'Engineering' },
            phone: { type: 'string', nullable: true, example: '+1234567890' },
            skills: { type: 'string', nullable: true, example: 'React, Node.js' },
            hireDate: { type: 'string', format: 'date', nullable: true },
            isActive: { type: 'boolean', example: true },
            entrepreneurId: { type: 'integer', example: 1 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateCollaborator: {
          type: 'object',
          required: ['name', 'email', 'role'],
          properties: {
            name: { type: 'string', example: 'Jane Smith' },
            email: { type: 'string', example: 'jane@example.com' },
            role: { type: 'string', example: 'developer' },
            department: { type: 'string', example: 'Engineering' },
            phone: { type: 'string', example: '+1234567890' },
            skills: { type: 'string', example: 'React, Node.js' },
            hireDate: { type: 'string', format: 'date' },
            isActive: { type: 'boolean', default: true }
          }
        },
        WhatsappInstance: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Business WhatsApp' },
            instanceId: { type: 'string', example: 'wa_instance_123' },
            accessToken: { type: 'string', example: 'token_abc123' },
            webhookUrl: { type: 'string', nullable: true, example: 'https://api.example.com/webhook' },
            isActive: { type: 'boolean', example: true },
            entrepreneurId: { type: 'integer', example: 1 },
            createdBy: { type: 'integer', example: 1 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateWhatsappInstance: {
          type: 'object',
          required: ['name', 'instanceId', 'accessToken'],
          properties: {
            name: { type: 'string', example: 'Business WhatsApp' },
            instanceId: { type: 'string', example: 'wa_instance_123' },
            accessToken: { type: 'string', example: 'token_abc123' },
            webhookUrl: { type: 'string', example: 'https://api.example.com/webhook' },
            isActive: { type: 'boolean', default: true }
          }
        },
        PriceTable: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Basic Plan' },
            subtitle: { type: 'string', example: 'Perfect for small businesses' },
            currentPrice3x: { type: 'string', example: '29.99' },
            currentPrice12x: { type: 'string', example: '99.99' },
            months: { type: 'integer', example: 12 },
            features: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['Feature 1', 'Feature 2', 'Feature 3']
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CreatePriceTable: {
          type: 'object',
          required: ['title', 'currentPrice3x', 'currentPrice12x', 'months'],
          properties: {
            title: { type: 'string', example: 'Basic Plan' },
            subtitle: { type: 'string', example: 'Perfect for small businesses' },
            currentPrice3x: { type: 'string', example: '29.99' },
            currentPrice12x: { type: 'string', example: '99.99' },
            months: { type: 'integer', example: 12 },
            features: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['Feature 1', 'Feature 2', 'Feature 3']
            }
          }
        },
        CustomerPlan: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            customerId: { type: 'integer', example: 1 },
            priceTableId: { type: 'integer', example: 1 },
            planType: { 
              type: 'string', 
              enum: ['monthly_3x', 'annual_12x'],
              example: 'annual_12x'
            },
            amount: { type: 'string', example: '99.99' },
            status: { 
              type: 'string', 
              enum: ['active', 'inactive', 'cancelled'],
              example: 'active'
            },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateCustomerPlan: {
          type: 'object',
          required: ['customerId', 'priceTableId', 'planType'],
          properties: {
            customerId: { type: 'integer', example: 1 },
            priceTableId: { type: 'integer', example: 1 },
            planType: { 
              type: 'string', 
              enum: ['monthly_3x', 'annual_12x'],
              example: 'annual_12x'
            },
            status: { 
              type: 'string', 
              enum: ['active', 'inactive', 'cancelled'],
              default: 'active'
            },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' }
          }
        },
        SupportTicket: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            ticketId: { type: 'string', example: 'TICKET-001' },
            subject: { type: 'string', example: 'Payment Issue' },
            description: { type: 'string', example: 'Unable to process payment' },
            priority: { 
              type: 'string', 
              enum: ['low', 'medium', 'high', 'urgent'],
              example: 'high'
            },
            status: { 
              type: 'string', 
              enum: ['open', 'in-progress', 'resolved', 'closed'],
              example: 'open'
            },
            customerId: { type: 'integer', example: 1 },
            assignedTo: { type: 'integer', nullable: true, example: 2 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateSupportTicket: {
          type: 'object',
          required: ['subject', 'description', 'priority', 'customerId'],
          properties: {
            subject: { type: 'string', example: 'Payment Issue' },
            description: { type: 'string', example: 'Unable to process payment' },
            priority: { 
              type: 'string', 
              enum: ['low', 'medium', 'high', 'urgent'],
              example: 'high'
            },
            customerId: { type: 'integer', example: 1 },
            assignedTo: { type: 'integer', example: 2 }
          }
        },
        Accounting: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            entrepreneurId: { type: 'integer', example: 1 },
            category: { type: 'string', example: 'Sales Revenue' },
            description: { type: 'string', example: 'Monthly subscription payment' },
            date: { type: 'string', format: 'date-time' },
            type: { 
              type: 'string', 
              enum: ['receives', 'expenses'],
              example: 'receives'
            },
            amount: { type: 'string', example: '1299.99' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateAccounting: {
          type: 'object',
          required: ['entrepreneurId', 'category', 'description', 'date', 'type', 'amount'],
          properties: {
            entrepreneurId: { type: 'integer', example: 1 },
            category: { type: 'string', example: 'Sales Revenue' },
            description: { type: 'string', example: 'Monthly subscription payment' },
            date: { type: 'string', format: 'date-time' },
            type: { 
              type: 'string', 
              enum: ['receives', 'expenses'],
              example: 'receives'
            },
            amount: { type: 'string', example: '1299.99' }
          }
        },
        AuthRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', example: 'user@example.com' },
            password: { type: 'string', example: 'password123' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user: { $ref: '#/components/schemas/User' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Error message' },
            details: { type: 'string', example: 'Detailed error information' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      { name: 'Authentication', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management endpoints' },
      { name: 'Payment Gateways', description: 'Payment gateway management' },
      { name: 'Collaborators', description: 'Collaborator management' },
      { name: 'WhatsApp Instances', description: 'WhatsApp instance management' },
      { name: 'Price Tables', description: 'Price table management' },
      { name: 'Customer Plans', description: 'Customer plan management' },
      { name: 'Support Tickets', description: 'Support ticket management' },
      { name: 'Accounting', description: 'Financial accounting management' }
    ]
  },
  apis: ['./server/routes.ts', './server/auth.ts'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Business Management API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true
    }
  }));
  
  // Serve swagger.json
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
}

export { specs };