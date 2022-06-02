import BaseError from './base-error.js';

class NotImplementedError extends BaseError {
  constructor(message) {
    super(message, 501);
  }
}

export default NotImplementedError;