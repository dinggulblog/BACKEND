import passport from 'passport';
import { SignJWT, importPKCS8 } from 'jose';
import { ExtractJwt } from 'passport-jwt';
import { readFileSync } from 'fs';

import { RevokedTokenModel } from '../model/revoked-token.js';
import { JwtTokenModel } from '../model/jwt-token.js';
import { jwtOptions } from '../../config/jwt-options.js';
import BaseAutoBindedClass from '../base/autobind.js';
import CredentialsAuth from '../authstrategy/credentials.js';
import JwtAuthStrategy from '../authstrategy/jwt-auth.js';
import SecretKeyAuth from '../authstrategy/secret-key.js';
import ForbiddenError from '../error/forbidden.js';

class AuthManager extends BaseAutoBindedClass {
  constructor() {
    super();
    this._passport = passport;
    this._strategies = [];

    this._setStrategies();
    this._setPassportStrategies();
  }

  _setStrategies() {
    this._strategies.push(new CredentialsAuth());
    this._strategies.push(new JwtAuthStrategy(this._provideJwtOptions(), this._verifyRevokedToken));
    this._strategies.push(new SecretKeyAuth({ secretKey: this._provideSecretKey() }));
  }

  async _verifyRevokedToken(token, payload, callback) {
    try {
      const revokedToken = await RevokedTokenModel.findOne({ token })

      revokedToken
        ? callback.onFailure(new ForbiddenError('Refresh token has been revoked'))
        : callback.onVerified(token, payload);
    } catch (error) {
      callback.onFailure(error);
    }
  }

  extractAccessToken(req) {
    return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
  }

  extractRefreshToken(req) {
    return req.session?.refreshToken;
  }

  _provideJwtOptions() {
    const options = {};
    options.extractAccessToken = this.extractAccessToken;
    options.extractRefreshToken = this.extractRefreshToken;
    options.privateKey = this._provideJwtPrivateKey();
    options.publicKey = this._provideJwtPublicKey();
    options.issuer = jwtOptions.issuer;
    options.audience = jwtOptions.audience;
    return options;
  }

  _provideJwtPublicKey() {
    return readFileSync('config/secret/eddsa-public.pem', 'utf8').trim();
  }

  _provideJwtPrivateKey() {
    return readFileSync('config/secret/eddsa-private.pem', 'utf8').trim();
  }

  _provideSecretKey() {
    return readFileSync('config/secret/secret.key', 'utf8').trim();
  }

  providePassport() {
    return this._passport;
  }

  getSecretKeyForStrategy(name) {
    for (const strategy of this._strategies) {
      if (strategy && strategy.name === name) {
        return strategy.provideSecretKey();
      }
    }
  }

  _setPassportStrategies() {
    this._strategies.forEach((strategy) => {
      this._passport.use(strategy);
    });
  }

  async signToken(strategyName, payload) {
    const key = this.getSecretKeyForStrategy(strategyName);
    const importedPrivateKey = await importPKCS8(key, 'EdDSA');

    switch (strategyName) {
      case 'jwt-auth':
        return new JwtTokenModel(await new SignJWT(payload).setProtectedHeader({ alg: 'EdDSA' }).sign(importedPrivateKey));
      default:
        throw new TypeError('Cannot sign token for the ' + strategyName + ' strategy');
    }
  }
}

export default new AuthManager();