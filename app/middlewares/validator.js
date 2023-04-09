import { validationResult } from 'express-validator';
import UnprocessableError from '../error/unprocessable.js';

/**
 * Express validator with callback
 * @param {Array} schemas Array of validator
 * @param {Object} request Request object to be validated
 * @param {Function} done Callback function
 * @returns Execute callback with null or error params
 */
export const validator = async (schemas = [], request, done) => {
  await Promise.all(schemas.map(schema => schema.run(request)));
  const errors = validationResult(request);
  const errorMessages = errors.array().map(err => err.msg);

  return errors.isEmpty()
    ? done(null)
    : done(new UnprocessableError(errorMessages.join(' & ')));
}
