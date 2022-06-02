import BaseError from './base-error.js';

class NotFoundError extends BaseError {
  constructor(message) {
    super(message, 404);
  }
}

export default NotFoundError;