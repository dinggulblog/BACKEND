import BaseError from './base-error.js';

class JwtError extends BaseError {
  constructor(message) {
    super(message, 419);
  }
}

export default JwtError;