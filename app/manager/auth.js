import jwt from 'jsonwebtoken';
import passport from 'passport';
import { ExtractJwt } from 'passport-jwt';
import { readFileSync } from 'fs';

import { JwtTokenModel } from '../model/jwt-token.js';
import { RevokedTokenModel } from '../model/revoked-token.js';
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
    this._jwtTokenHandler = jwt;
    this._setStrategies();
    this._setPassportStrategies();
  }

  // Init JWT strategy
  _setStrategies() {
    const jwtAuth = new JwtAuthStrategy(this._provideJwtOptions(), this._verifyRevokedToken);
    const secretKeyAuth = new SecretKeyAuth({ secretKey: this._provideSecretKey() });
    this._strategies.push(jwtAuth);
    this._strategies.push(new CredentialsAuth());
    this._strategies.push(secretKeyAuth);
  }

  // Custom verifier
  async _verifyRevokedToken(token, payload, callback) {
    const revokedTokens = await RevokedTokenModel.find({ token: token });
    revokedTokens.length
      ? callback.onFailure(new ForbiddenError('Token has been revoked'))
      : callback.onVerified(token, payload);
  }

  extractJwtToken(req) {
    return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
  }

  _provideJwtOptions() {
    const jwtOptions = {};
    jwtOptions.extractJwtToken = this.extractJwtToken;
    jwtOptions.privateKey = this._provideJwtPrivateKey();
    jwtOptions.publicKey = this._provideJwtPublicKey();
    jwtOptions.issuer = process.env.JWT_ISSUER;
    jwtOptions.audience = process.env.JWT_AUDIENCE;
    return jwtOptions;
  }

  _provideJwtPublicKey() {
    return readFileSync('config/secret/jwt-key.pub', 'utf8').trim();
  }

  _provideJwtPrivateKey() {
    return readFileSync('config/secret/jwt-key.pem', 'utf8').trim();
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

  signToken(strategyName, payload, options) {
    const key = this.getSecretKeyForStrategy(strategyName);
    switch (strategyName) {
      case 'jwt-auth':
        return new JwtTokenModel(this._jwtTokenHandler.sign(payload, key, options));
      default:
        throw new TypeError('Cannot sign token for the ' + strategyName + ' strategy');
    }
  }
}

export default new AuthManager();