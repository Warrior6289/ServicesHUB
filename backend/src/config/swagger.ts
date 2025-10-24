import swaggerJSDoc from 'swagger-jsdoc';
import { config } from './env';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Services Hub API',
      version: '1.0.0',
      description: 'A comprehensive marketplace platform connecting service providers with customers',
      contact: {
        name: 'Services Hub Team',
        email: 'support@serviceshub.com',
        url: 'https://serviceshub.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: config.app.url,
        description: 'Development server'
      },
      {
        url: 'https://api.serviceshub.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for authentication'
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for admin operations'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'role'],
          properties: {
            _id: {
              type: 'string',
              description: 'User ID',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              description: 'User full name',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john@example.com'
            },
            role: {
              type: 'string',
              enum: ['buyer', 'seller', 'admin'],
              description: 'User role',
              example: 'buyer'
            },
            phone: {
              type: 'string',
              description: 'User phone number',
              example: '+1234567890'
            },
            avatar: {
              type: 'string',
              description: 'User avatar URL',
              example: 'https://example.com/avatar.jpg'
            },
            status: {
              type: 'string',
              enum: ['active', 'blocked', 'pending'],
              description: 'User account status',
              example: 'active'
            },
            emailVerified: {
              type: 'boolean',
              description: 'Email verification status',
              example: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation date',
              example: '2023-01-01T00:00:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date',
              example: '2023-01-01T00:00:00.000Z'
            }
          }
        },
        ServiceRequest: {
          type: 'object',
          required: ['buyerId', 'category', 'description', 'price', 'location'],
          properties: {
            _id: {
              type: 'string',
              description: 'Service request ID',
              example: '507f1f77bcf86cd799439011'
            },
            buyerId: {
              type: 'string',
              description: 'Buyer user ID',
              example: '507f1f77bcf86cd799439011'
            },
            sellerId: {
              type: 'string',
              description: 'Seller user ID (if accepted)',
              example: '507f1f77bcf86cd799439012'
            },
            category: {
              type: 'string',
              description: 'Service category',
              example: 'Plumbing'
            },
            type: {
              type: 'string',
              enum: ['instant', 'scheduled'],
              description: 'Request type',
              example: 'instant'
            },
            description: {
              type: 'string',
              description: 'Service description',
              example: 'Fix leaky faucet in kitchen'
            },
            price: {
              type: 'number',
              minimum: 1,
              maximum: 10000,
              description: 'Service price in USD',
              example: 150
            },
            location: {
              type: 'object',
              required: ['address', 'coordinates'],
              properties: {
                address: {
                  type: 'string',
                  description: 'Service location address',
                  example: '123 Main St, New York, NY 10001'
                },
                coordinates: {
                  type: 'array',
                  items: {
                    type: 'number'
                  },
                  minItems: 2,
                  maxItems: 2,
                  description: 'GPS coordinates [longitude, latitude]',
                  example: [-74.006, 40.7128]
                }
              }
            },
            status: {
              type: 'string',
              enum: ['pending', 'price_boosted', 'accepted', 'in_progress', 'completed', 'cancelled', 'expired'],
              description: 'Request status',
              example: 'pending'
            },
            broadcastRadius: {
              type: 'number',
              minimum: 1,
              maximum: 100,
              description: 'Broadcast radius in kilometers (instant requests only)',
              example: 10
            },
            scheduledDate: {
              type: 'string',
              format: 'date-time',
              description: 'Scheduled service date (scheduled requests only)',
              example: '2023-12-25T14:00:00.000Z'
            },
            scheduledTime: {
              type: 'string',
              pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
              description: 'Scheduled service time (scheduled requests only)',
              example: '14:00'
            },
            expiresAt: {
              type: 'string',
              format: 'date-time',
              description: 'Request expiration date (instant requests only)',
              example: '2023-01-02T00:00:00.000Z'
            },
            priceHistory: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  price: {
                    type: 'number',
                    description: 'Price at this point'
                  },
                  boostedBy: {
                    type: 'string',
                    description: 'User ID who boosted the price'
                  },
                  boostedAt: {
                    type: 'string',
                    format: 'date-time',
                    description: 'When the price was boosted'
                  }
                }
              },
              description: 'Price change history'
            },
            acceptedAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the request was accepted',
              example: '2023-01-01T12:00:00.000Z'
            },
            completedAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the service was completed',
              example: '2023-01-01T16:00:00.000Z'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Request creation date',
              example: '2023-01-01T00:00:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date',
              example: '2023-01-01T00:00:00.000Z'
            }
          }
        },
        SellerProfile: {
          type: 'object',
          required: ['userId', 'bio', 'location', 'serviceCategories', 'yearsOfExperience'],
          properties: {
            _id: {
              type: 'string',
              description: 'Seller profile ID',
              example: '507f1f77bcf86cd799439011'
            },
            userId: {
              type: 'string',
              description: 'Associated user ID',
              example: '507f1f77bcf86cd799439011'
            },
            bio: {
              type: 'string',
              description: 'Seller biography',
              example: 'Professional plumber with 10+ years of experience'
            },
            location: {
              type: 'object',
              required: ['address', 'coordinates'],
              properties: {
                address: {
                  type: 'string',
                  description: 'Service area address',
                  example: '123 Main St, New York, NY 10001'
                },
                coordinates: {
                  type: 'array',
                  items: {
                    type: 'number'
                  },
                  minItems: 2,
                  maxItems: 2,
                  description: 'GPS coordinates [longitude, latitude]',
                  example: [-74.006, 40.7128]
                }
              }
            },
            serviceCategories: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Service categories offered',
              example: ['Plumbing', 'HVAC']
            },
            yearsOfExperience: {
              type: 'number',
              minimum: 0,
              maximum: 50,
              description: 'Years of experience',
              example: 10
            },
            certifications: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Professional certifications',
              example: ['Licensed Plumber', 'Certified Pipe Fitter']
            },
            profilePicture: {
              type: 'string',
              description: 'Profile picture URL',
              example: 'https://example.com/profile.jpg'
            },
            portfolio: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Portfolio image URLs',
              example: ['https://example.com/work1.jpg', 'https://example.com/work2.jpg']
            },
            rating: {
              type: 'number',
              minimum: 0,
              maximum: 5,
              description: 'Average rating',
              example: 4.8
            },
            reviewsCount: {
              type: 'number',
              minimum: 0,
              description: 'Number of reviews',
              example: 45
            },
            availability: {
              type: 'boolean',
              description: 'Current availability status',
              example: true
            },
            isApproved: {
              type: 'boolean',
              description: 'Admin approval status',
              example: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Profile creation date',
              example: '2023-01-01T00:00:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date',
              example: '2023-01-01T00:00:00.000Z'
            }
          }
        },
        Transaction: {
          type: 'object',
          required: ['buyerId', 'sellerId', 'serviceRequestId', 'amount', 'status'],
          properties: {
            _id: {
              type: 'string',
              description: 'Transaction ID',
              example: '507f1f77bcf86cd799439011'
            },
            buyerId: {
              type: 'string',
              description: 'Buyer user ID',
              example: '507f1f77bcf86cd799439011'
            },
            sellerId: {
              type: 'string',
              description: 'Seller user ID',
              example: '507f1f77bcf86cd799439012'
            },
            serviceRequestId: {
              type: 'string',
              description: 'Associated service request ID',
              example: '507f1f77bcf86cd799439013'
            },
            amount: {
              type: 'number',
              minimum: 0.01,
              description: 'Transaction amount in USD',
              example: 150.00
            },
            status: {
              type: 'string',
              enum: ['pending', 'completed', 'failed', 'refunded'],
              description: 'Transaction status',
              example: 'completed'
            },
            paymentMethod: {
              type: 'string',
              enum: ['credit_card', 'debit_card', 'paypal', 'stripe'],
              description: 'Payment method used',
              example: 'credit_card'
            },
            transactionId: {
              type: 'string',
              description: 'External payment processor transaction ID',
              example: 'txn_123456789'
            },
            stripePaymentIntentId: {
              type: 'string',
              description: 'Stripe payment intent ID',
              example: 'pi_123456789'
            },
            completedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Transaction completion date',
              example: '2023-01-01T16:00:00.000Z'
            },
            failedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Transaction failure date',
              example: '2023-01-01T16:00:00.000Z'
            },
            failureReason: {
              type: 'string',
              description: 'Reason for transaction failure',
              example: 'Insufficient funds'
            },
            refundedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Transaction refund date',
              example: '2023-01-01T16:00:00.000Z'
            },
            refundReason: {
              type: 'string',
              description: 'Reason for refund',
              example: 'Customer requested refund'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Transaction creation date',
              example: '2023-01-01T00:00:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date',
              example: '2023-01-01T00:00:00.000Z'
            }
          }
        },
        Error: {
          type: 'object',
          required: ['success', 'message'],
          properties: {
            success: {
              type: 'boolean',
              description: 'Request success status',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message',
              example: 'Validation error'
            },
            code: {
              type: 'string',
              description: 'Error code',
              example: 'VALIDATION_ERROR'
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    description: 'Field name'
                  },
                  message: {
                    type: 'string',
                    description: 'Field-specific error message'
                  }
                }
              },
              description: 'Detailed error information'
            },
            error: {
              type: 'string',
              description: 'Technical error details (development only)',
              example: 'Cast to ObjectId failed for value "invalid" at path "_id"'
            }
          }
        },
        Success: {
          type: 'object',
          required: ['success', 'message'],
          properties: {
            success: {
              type: 'boolean',
              description: 'Request success status',
              example: true
            },
            message: {
              type: 'string',
              description: 'Success message',
              example: 'Operation completed successfully'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'number',
              minimum: 1,
              description: 'Current page number',
              example: 1
            },
            limit: {
              type: 'number',
              minimum: 1,
              maximum: 100,
              description: 'Items per page',
              example: 10
            },
            total: {
              type: 'number',
              minimum: 0,
              description: 'Total number of items',
              example: 50
            },
            pages: {
              type: 'number',
              minimum: 0,
              description: 'Total number of pages',
              example: 5
            },
            hasNext: {
              type: 'boolean',
              description: 'Whether there is a next page',
              example: true
            },
            hasPrev: {
              type: 'boolean',
              description: 'Whether there is a previous page',
              example: false
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/models/*.ts'
  ]
};

export const specs = swaggerJSDoc(options);

export const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Services Hub API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true
  }
};