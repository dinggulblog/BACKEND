import BaseError from './base-error.js';

class ForbiddenError extends BaseError {
  constructor(message) {
    super(message, 403);
  }
}

export default ForbiddenError;