import BaseError from './base-error.js';

class UnprocessableError extends BaseError {
  constructor(message) {
    super(message, 422);
  }
}

export default UnprocessableError;