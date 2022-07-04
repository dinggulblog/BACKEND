import { jwtVerify, importSPKI } from 'jose';
import { Strategy } from 'passport-strategy';

import BaseAuthStrategy from './base-auth.js';
import UnauthorizedError from '../error/unauthorized.js';

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
  }

  async authenticate(req, callback) {
    try {
      const { accessToken, refreshToken } = this._extractJwtToken(req);
      const importedPublicKey = await importSPKI(this._publicKey, 'EdDSA');

      // JWT authentication needs at least one token
      if (!accessToken && !refreshToken) {
        return callback.onFailure(new UnauthorizedError('No token provided'));
      }

      // If refresh token is still valid -> Re-issue the access token and refresh token
      if (!accessToken && refreshToken) {
        const { payload } = await jwtVerify(refreshToken, importedPublicKey, this._jwtOptions);

        // If custom verifier exist, delegate the flow control to custom verifier
        this._customVerifier
          ? this._customVerifier(refreshToken, payload, callback)
          : callback.onVerified(refreshToken, payload);
      }
      else {
        const { payload } = await jwtVerify(accessToken, importedPublicKey, this._jwtOptions);
        callback.onVerified(accessToken, payload);
      }
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