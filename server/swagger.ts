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
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            role: { 
              type: 'string', 
              enum: ['super-admin', 'entrepreneur', 'collaborator', 'customer'],
              example: 'entrepreneur'
            },
            avatar: { type: 'string', nullable: true, example: 'https://example.com/avatar.jpg' },
            entrepreneurId: { type: 'integer', nullable: true, example: 2 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateUser: {
          type: 'object',
          required: ['name', 'email', 'password', 'role'],
          properties: {
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', minLength: 6, example: 'securePassword123' },
            role: { 
              type: 'string', 
              enum: ['super-admin', 'entrepreneur', 'collaborator', 'customer'],
              example: 'entrepreneur'
            },
            avatar: { type: 'string', example: 'https://example.com/avatar.jpg' },
            entrepreneurId: { type: 'integer', nullable: true, example: 2 }
          }
        },
        PaymentGateway: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Asaas Payment Gateway' },
            type: { 
              type: 'string', 
              enum: ['asaas', 'mercado_pago', 'pagseguro'],
              example: 'asaas'
            },
            apiUrl: { type: 'string', example: 'https://www.asaas.com/api/v3' },
            publicKey: { type: 'string', example: 'pub_abc123456789' },
            token: { type: 'string', example: '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5...' },
            email: { type: 'string', nullable: true, example: 'payment@business.com' },
            isActive: { type: 'boolean', example: true },
            createdBy: { type: 'integer', nullable: true, example: 1 },
            entrepreneurId: { type: 'integer', example: 2 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CreatePaymentGateway: {
          type: 'object',
          required: ['name', 'type', 'apiUrl', 'publicKey', 'token'],
          properties: {
            name: { type: 'string', example: 'Asaas Payment Gateway' },
            type: { 
              type: 'string', 
              enum: ['asaas', 'mercado_pago', 'pagseguro'],
              example: 'asaas'
            },
            apiUrl: { type: 'string', example: 'https://www.asaas.com/api/v3' },
            publicKey: { type: 'string', example: 'pub_abc123456789' },
            token: { type: 'string', example: '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5...' },
            email: { type: 'string', example: 'payment@business.com' },
            isActive: { type: 'boolean', default: true }
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
            instanceNumber: { type: 'string', example: 'wa_instance_123' },
            apiUrl: { type: 'string', example: 'https://api.whatsapp.com/instance/123' },
            isActive: { type: 'boolean', example: true },
            entrepreneurId: { type: 'integer', example: 1 },
            createdBy: { type: 'integer', example: 1 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateWhatsappInstance: {
          type: 'object',
          required: ['name', 'instanceNumber', 'apiUrl'],
          properties: {
            name: { type: 'string', example: 'Business WhatsApp' },
            instanceNumber: { type: 'string', example: 'wa_instance_123' },
            apiUrl: { type: 'string', example: 'https://api.whatsapp.com/instance/123' },
            isActive: { type: 'boolean', default: true }
          }
        },
        PriceTable: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Premium Business Plan', maxLength: 255 },
            subtitle: { type: 'string', nullable: true, example: 'Perfect for growing businesses', maxLength: 500 },
            advantages: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['Unlimited users', '24/7 support', 'Advanced analytics', 'Custom integrations']
            },
            oldPrice3x: { type: 'string', nullable: true, example: '49.99' },
            currentPrice3x: { type: 'string', example: '39.99' },
            oldPrice12x: { type: 'string', nullable: true, example: '149.99' },
            currentPrice12x: { type: 'string', example: '119.99' },
            months: { type: 'integer', default: 3, example: 3 },
            image1: { type: 'string', nullable: true, example: 'https://example.com/plan-image1.jpg', maxLength: 500 },
            image2: { type: 'string', nullable: true, example: 'https://example.com/plan-image2.jpg', maxLength: 500 },
            buyLink: { type: 'string', example: 'https://checkout.example.com/premium', maxLength: 500 },
            isActive: { type: 'boolean', default: true, example: true },
            displayOrder: { type: 'integer', default: 0, example: 1 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CreatePriceTable: {
          type: 'object',
          required: ['title', 'currentPrice3x', 'currentPrice12x', 'buyLink'],
          properties: {
            title: { type: 'string', example: 'Premium Business Plan', maxLength: 255 },
            subtitle: { type: 'string', example: 'Perfect for growing businesses', maxLength: 500 },
            advantages: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['Unlimited users', '24/7 support', 'Advanced analytics']
            },
            oldPrice3x: { type: 'string', example: '49.99' },
            currentPrice3x: { type: 'string', example: '39.99' },
            oldPrice12x: { type: 'string', example: '149.99' },
            currentPrice12x: { type: 'string', example: '119.99' },
            months: { type: 'integer', default: 3, example: 3 },
            image1: { type: 'string', example: 'https://example.com/plan-image1.jpg', maxLength: 500 },
            image2: { type: 'string', example: 'https://example.com/plan-image2.jpg', maxLength: 500 },
            buyLink: { type: 'string', example: 'https://checkout.example.com/premium', maxLength: 500 },
            isActive: { type: 'boolean', default: true },
            displayOrder: { type: 'integer', default: 0, example: 1 }
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
              enum: ['3x', '12x'],
              example: '12x'
            },
            amount: { 
              type: 'string', 
              pattern: '^\\d+\\.\\d{2}$',
              example: '119.99'
            },
            payHash: { type: 'string', nullable: true, example: 'hash_abc123456' },
            payStatus: { 
              type: 'string', 
              enum: ['pending', 'paid', 'failed', 'expired'],
              default: 'pending',
              example: 'paid'
            },
            payDate: { type: 'string', format: 'date-time', nullable: true },
            payLink: { type: 'string', nullable: true, example: 'https://payment.example.com/pay/123' },
            payExpiration: { type: 'string', format: 'date-time', nullable: true },
            planExpirationDate: { type: 'string', format: 'date-time', nullable: true },
            isActive: { type: 'boolean', default: true, example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateCustomerPlan: {
          type: 'object',
          required: ['customerId', 'priceTableId', 'planType', 'amount'],
          properties: {
            customerId: { type: 'integer', example: 1 },
            priceTableId: { type: 'integer', example: 1 },
            planType: { 
              type: 'string', 
              enum: ['3x', '12x'],
              example: '12x'
            },
            amount: { 
              type: 'string', 
              pattern: '^\\d+\\.\\d{2}$',
              example: '119.99'
            },
            payHash: { type: 'string', example: 'hash_abc123456' },
            payStatus: { 
              type: 'string', 
              enum: ['pending', 'paid', 'failed', 'expired'],
              default: 'pending'
            },
            payDate: { type: 'string', format: 'date-time' },
            payLink: { type: 'string', example: 'https://payment.example.com/pay/123' },
            payExpiration: { type: 'string', format: 'date-time' },
            planExpirationDate: { type: 'string', format: 'date-time' },
            isActive: { type: 'boolean', default: true }
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
            name: { type: 'string', example: 'John Customer' },
            email: { type: 'string', example: 'john@example.com' },
            phone: { type: 'string', nullable: true, example: '+1234567890' },
            category: { 
              type: 'string', 
              enum: ['technical', 'billing', 'feature', 'bug', 'general'],
              example: 'billing'
            },
            message: { type: 'string', example: 'I am having trouble with my payment method...' },
            status: { 
              type: 'string', 
              enum: ['open', 'in_progress', 'resolved', 'closed'],
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
          required: ['name', 'email', 'subject', 'category', 'message'],
          properties: {
            name: { type: 'string', example: 'John Customer' },
            email: { type: 'string', example: 'john@example.com' },
            phone: { type: 'string', example: '+1234567890' },
            subject: { type: 'string', example: 'Payment Issue' },
            category: { 
              type: 'string', 
              enum: ['technical', 'billing', 'feature', 'bug', 'general'],
              example: 'billing'
            },
            priority: { 
              type: 'string', 
              enum: ['low', 'medium', 'high', 'urgent'],
              default: 'medium'
            },
            message: { type: 'string', example: 'I am having trouble with my payment method and need assistance.' }
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
            entrepreneurId: { type: 'integer', example: 2 },
            category: { type: 'string', example: 'Software Subscription' },
            description: { type: 'string', example: 'Monthly payment for CRM software' },
            date: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' },
            type: { 
              type: 'string', 
              enum: ['receives', 'expenses'],
              example: 'expenses'
            },
            amount: { 
              type: 'string', 
              pattern: '^\\d+\\.\\d{2}$',
              example: '299.99'
            }
          }
        },
        RefreshToken: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            token: { type: 'string', example: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0' },
            userId: { type: 'integer', example: 1 },
            expiresAt: { type: 'string', format: 'date-time' },
            isRevoked: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' },
            revokedAt: { type: 'string', format: 'date-time', nullable: true }
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
            accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            refreshToken: { type: 'string', example: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0' },
            expiresIn: { type: 'string', example: '15m' },
            user: { $ref: '#/components/schemas/User' }
          }
        },
        RefreshTokenRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string', example: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0' }
          }
        },
        RefreshTokenResponse: {
          type: 'object',
          properties: {
            accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            refreshToken: { type: 'string', example: 'b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0a1' },
            expiresIn: { type: 'string', example: '15m' }
          }
        },
        LogoutRequest: {
          type: 'object',
          properties: {
            refreshToken: { type: 'string', example: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0' },
            logoutFromAllDevices: { type: 'boolean', default: false }
          }
        },
        LogoutResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Logout successful' }
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