import { jwtVerify, importSPKI } from 'jose';
import { Strategy } from 'passport-strategy';

import BaseAuthStrategy from './base-auth.js';
import UnauthorizedError from '../error/unauthorized.js';
import JwtError from '../error/jwt-error.js';

class JwtAuthStrategy extends BaseAuthStrategy {
  constructor(options, verify) {
    super();
    this._options = options;
    this._initStrategy();
    // this._customVerifier = verify;
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

    this._extractToken = options.extractToken;
    if (!this._extractToken) {
      throw new TypeError('JwtAuthStrategy requires a function to parse jwt from request cookies');
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
    const ecPublicKey = await importSPKI(this._publicKey, this._jwtOptions.algorithms[0]);
    const refreshToken = this._extractToken('refreshToken', req);
    const accessToken = this._extractToken('accessToken', req);

    if (!refreshToken) {
      return callback.onFailure(new JwtError('토큰이 존재하지 않습니다.'));
    }

    if (req.originalUrl === '/v1/auth' && req.method === 'PUT') {
      try {
        const { payload } = await jwtVerify(refreshToken, ecPublicKey, this._jwtOptions);
        return callback.onVerified(refreshToken, payload);
      } catch (error) {
        return callback.onFailure(new JwtError('토큰이 만료되어 재 로그인이 필요합니다.'));
      }
    }

    try {
      const { payload } = await jwtVerify(accessToken, ecPublicKey, this._jwtOptions);
      return callback.onVerified(accessToken, payload);
    } catch (error) {
      return callback.onFailure(new UnauthorizedError('엑세스 토큰 재발급이 필요합니다.'));
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
