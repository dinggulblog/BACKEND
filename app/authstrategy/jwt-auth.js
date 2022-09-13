import { jwtVerify, decodeJwt, importSPKI } from 'jose';
import { Strategy } from 'passport-strategy';

import BaseAuthStrategy from './base-auth.js';
import InvalidRequestError from '../error/invalid-request.js';
import UnauthorizedError from '../error/unauthorized.js';
import JwtError from '../error/jwt-error.js';
import ForbiddenError from '../error/forbidden.js';

class JwtAuthStrategy extends BaseAuthStrategy {
  constructor(options, verify) {
    super();
    this._options = options;
    // this._customVerifier = verify;
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
    const { accessToken, refreshToken } = this._extractJwtToken(req);
    const importedPublicKey = await importSPKI(this._publicKey, 'EdDSA');

    // JWT authentication needs at least one token
    if (!accessToken && !refreshToken) {
      return callback.onFailure(new InvalidRequestError('토큰이 존재하지 않습니다.'));
    }

    // Logout -> return verified callback 
    if (req.originalUrl === '/v1/auth' && req.method === 'DELETE') {
      const payload = decodeJwt(accessToken || refreshToken);
      return callback.onVerified(accessToken || refreshToken, payload);
    }

    // Access token verified -> return callback
    if (accessToken) {
      try {
        const { payload } = await jwtVerify(accessToken, importedPublicKey, this._jwtOptions);

        // If need to verify roles in payload
        if (req.role) {
          const { data: { roles } } = payload;
          return Array.isArray(roles) && roles.includes(req.role)
            ? callback.onVerified(accessToken, payload)
            : callback.onFailure(new ForbiddenError('권한이 있는 사용자만 접근할 수 있습니다.'));
        }
        
        return callback.onVerified(accessToken, payload);
      } catch (error) {
        // refresh token exists but not the refresh url -> return 401 error (re-request to refresh url)
        return callback.onFailure(new UnauthorizedError('토큰이 만료되어 토큰 재발급이 필요합니다.'));
      }
    } 

    if (refreshToken) {
      // Refresh token verified at refresh url -> Re-issue the access token and refresh token
      if (req.url === '/refresh') {
        try {
          const { payload } = await jwtVerify(refreshToken, importedPublicKey, this._jwtOptions);
          return callback.onVerified(refreshToken, payload);
        } catch (error) {
          // If refresh token expired -> return 419 error (Force logout)
          return callback.onFailure(new JwtError('토큰이 만료되어 재 로그인이 필요합니다.'));
        }
      }
      else {
        // refresh token exists but not the refresh url -> return 401 error (Need to re-request with refresh url)
        return callback.onFailure(new UnauthorizedError('엑세스 토큰을 먼저 발급받아야 합니다.'));
      }
    }

    // !!Never come to here!!
    return callback.onFailure(new InvalidRequestError('잘못된 요청'));
  }

  provideSecretKey() {
    return this._privateKey;
  }

  provideOptions() {
    return this._options;
  }
}

export default JwtAuthStrategy;