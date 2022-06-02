import BaseAuthStrategy from './base-auth.js';
import InvalidRequestError from '../error/invalid-request.js';
import UnauthorizedError from '../error/unauthorized.js';

class SecretKeyAuthStrategy extends BaseAuthStrategy {
  constructor(options) {
    super();
    this._options = options;
    this._initStrategy();
  }

  get name() {
    return 'secret-key-auth';
  }

  _initStrategy() {

  }

  authenticate(req, callback) {
    const secretKey = SecretKeyAuthStrategy._extractKeyFromHeader(req);
    if (!secretKey) {
      return callback.onFailure(new InvalidRequestError('No auth key provided'));
    }
    if (this._verifyCredentials(secretKey)) {
      return callback.onVerified();
    } else {
      return callback.onFailure(new UnauthorizedError('Invalid auth key'));
    }
  }

  provideSecretKey() {
    return this._options.secretKey;
  }

  provideOptions() {
    return this._options;
  }

  static get AUTH_HEADER() {
    return 'Authorization';
  }

  static _extractKeyFromHeader(req) {
    return req.headers[SecretKeyAuthStrategy.AUTH_HEADER.toLowerCase()];
  }

  _verifyCredentials(key) {
    return key === this.provideSecretKey();
  }
}

export default SecretKeyAuthStrategy;