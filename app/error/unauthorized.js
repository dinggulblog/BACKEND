import BaseError from './base-error.js';

class UnauthorizedError extends BaseError {
  constructor(message) {
    super(message, 401);
  }
}

export default UnauthorizedError;