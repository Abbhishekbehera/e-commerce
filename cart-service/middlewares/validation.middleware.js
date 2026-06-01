import { apiError } from "../utils/apiError.js";

// Validation schemas for cart operations
const cartValidationSchemas = {
  addToCart: {
    productId: { required: true, type: 'string' },
    quantity: { required: true, type: 'number', min: 1 }
  },
  removeFromCart: {
    productId: { required: true, type: 'string' }
  },
  updateCartItem: {
    productId: { required: true, type: 'string' },
    quantity: { required: true, type: 'number', min: 1 }
  }
};

// Validate single field
const validateField = (value, fieldName, fieldSchema) => {
  if (fieldSchema.required && (value === undefined || value === null)) {
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

// Validate cart request
const validateCartRequest = (schemaName) => {
  return (req, res, next) => {
    try {
      const schema = cartValidationSchemas[schemaName];

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

export { validateCartRequest, cartValidationSchemas }
