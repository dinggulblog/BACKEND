import jwt from 'jsonwebtoken';
import { Strategy } from 'passport-strategy';

import BaseAuthStrategy from './base-auth.js';

class JwtAuthStrategy extends BaseAuthStrategy {
  constructor(options, verify) {
    super();
    this._options = options;
    this._customVerifier = verify;
    this._initStrategy();
  }

  get name() {
    return 'jwt-auth';
  }

  _initStrategy() {
    Strategy.call(this);
    const options = this.provideOptions();

    if (!options) {
      throw new TypeError('JwtAuthStrategy requires options');
    }

    this._privateKey = options.privateKey;
    if (!this._privateKey) {
      throw new TypeError('JwtAuthStrategy requires a private key');
    }
    this._publicKey = options.publicKey;
    if (!this._publicKey) {
      throw new TypeError('JwtAuthStrategy requires a public key');
    }

    this._extractJwtToken = options.extractJwtToken;
    if (!this._extractJwtToken) {
      throw new TypeError('JwtAuthStrategy requires a function to parse jwt from requests');
    }

    this._jwtOptions = {};

    if (options.issuer) {
      this._jwtOptions.issuer = options.issuer;
    }

    if (options.audience) {
      this._jwtOptions.audience = options.audience;
    }

    if (options.algorithms) {
      this._jwtOptions.algorithms = options.algorithms;
    }

    if (options.ignoreExpiration != null) {
      this._jwtOptions.ignoreExpiration = options.ignoreExpiration;
    }
  }

  authenticate(req, callback) {
    const token = this._extractJwtToken(req);

    if (!token) {
      return callback.onFailure(new Error('No auth token provided'));
    }

    // Verify the JWT
    JwtAuthStrategy._verifyDefault(token, this._publicKey, this._jwtOptions, (jwt_error, payload) => {
      if (jwt_error) {
        return callback.onFailure(jwt_error);
      } else {
        try {
          // If custom verifier was set then delegate the flow control
          this._customVerifier
            ? this._customVerifier(token, payload, callback)
            : callback.onVerified(token, payload);

        } catch (error) {
          callback.onFailure(error);
        }
      }
    });
  }

  provideSecretKey() {
    return this._privateKey;
  }

  provideOptions() {
    return this._options;
  }

  static _verifyDefault(token, publicKey, options, callback) {
    return jwt.verify(token, publicKey, options, callback);
  }
}

export default JwtAuthStrategy;