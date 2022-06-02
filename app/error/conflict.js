import BaseError from './base-error.js';

class ConflictError extends BaseError {
  constructor(message) {
    super(message, 409);
  }
}

export default ConflictError;