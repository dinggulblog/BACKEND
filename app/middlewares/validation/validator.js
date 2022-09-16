import { validationResult } from 'express-validator';
import UnprocessableError from '../../error/unprocessable.js';

export const validator = (schemas) => {
  return async (req, res, next) => {
    await Promise.all(schemas.map(schema => schema.run(req)));
    
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const errorMessages = errors.array().map(err => err.msg);
    return next(new UnprocessableError('Validation errors: ' + errorMessages.join(' & ')));
  };
};
