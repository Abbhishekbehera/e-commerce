import { apiError } from "../utils/apiError.js";

// Validation schemas for payment operations
const paymentValidationSchemas = {
  createPaymentIntent: {
    orderId: { required: true, type: 'string' },
    amount: { required: true, type: 'number', min: 1 },
    userId: { required: true, type: 'string' }
  },
  confirmPayment: {
    paymentIntentId: { required: true, type: 'string' }
  },
  refundPayment: {
    orderId: { required: true, type: 'string' },
    refundAmount: { required: false, type: 'number', min: 1 }
  }
};

// Validate single field
const validateField = (value, fieldName, fieldSchema) => {
  if (fieldSchema.required && (value === undefined || value === null || value === '')) {
    throw new apiError(`${fieldName} is required`, 400);
  }

  if (!fieldSchema.required && (value === undefined || value === null)) {
    return;
  }

  if (fieldSchema.type === 'number' && typeof value !== 'number') {
    throw new apiError(`${fieldName} must be a number`, 400);
  }

  if (fieldSchema.type === 'string' && typeof value !== 'string') {
    throw new apiError(`${fieldName} must be a string`, 400);
  }

  if (fieldSchema.min && value < fieldSchema.min) {
    throw new apiError(`${fieldName} must be at least ${fieldSchema.min}`, 400);
  }

  if (fieldSchema.max && value > fieldSchema.max) {
    throw new apiError(`${fieldName} must not exceed ${fieldSchema.max}`, 400);
  }
};

// Validate payment request
const validatePaymentRequest = (schemaName) => {
  return (req, res, next) => {
    try {
      const schema = paymentValidationSchemas[schemaName];

      if (!schema) {
        return next(new apiError(`Validation schema '${schemaName}' not found`, 500));
      }

      for (const [fieldName, fieldSchema] of Object.entries(schema)) {
        validateField(req.body[fieldName], fieldName, fieldSchema);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export { validatePaymentRequest, paymentValidationSchemas }
