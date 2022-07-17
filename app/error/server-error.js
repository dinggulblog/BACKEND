import BaseError from './base-error.js';

class ServerError extends BaseError {
  constructor(message) {
    super(message, 500);
  }
}

export default ServerError;