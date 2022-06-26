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
    const { accessToken, refreshToken } = this._extractJwtToken(req);

    if (!accessToken) {
      return callback.onFailure(new Error('No access token provided'));
    }

    try {
      const accessTokenDecoded = jwt.verify(accessToken, this._publicKey, this._jwtOptions);

      // Verified only the access token
      if (!refreshToken) {
        return callback.onVerified(accessToken, accessTokenDecoded);
      }
      
      jwt.verify(refreshToken, this._privateKey, this._jwtOptions);

      // If access token and refresh token exist together, delegate the flow control to custom verifier
      this._customVerifier
        ? this._customVerifier(refreshToken, accessTokenDecoded, callback)
        : callback.onFailure(new Error('No custom verifier exists'));
    } catch (error) {
      callback.onFailure(error);
    }
  }

  provideSecretKey() {
    return this._privateKey;
  }

  provideOptions() {
    return this._options;
  }
}

export default JwtAuthStrategy;