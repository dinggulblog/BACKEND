import BaseError from './base-error.js';

class InvalidRequestError extends BaseError {
  constructor(message) {
    super(message, 400);
  }
}

export default InvalidRequestError;