import jwt from 'jsonwebtoken';
import passport from 'passport';
import { ExtractJwt } from 'passport-jwt';
import { readFileSync } from 'fs';

import { UserModel } from '../model/user.js';
import { JwtTokenModel } from '../model/jwt-token.js';
import { RevokedTokenModel } from '../model/revoked-token.js';
import { accessOptions } from '../../config/jwt-options.js';
import BaseAutoBindedClass from '../base/autobind.js';
import CredentialsAuth from '../authstrategy/credentials.js';
import JwtAuthStrategy from '../authstrategy/jwt-auth.js';
import SecretKeyAuth from '../authstrategy/secret-key.js';
import ForbiddenError from '../error/forbidden.js';

class AuthManager extends BaseAutoBindedClass {
  constructor() {
    super();
    this._jwt = jwt;
    this._passport = passport;

    this._strategies = [];
    this._setStrategies();
    this._setPassportStrategies();
  }

  // Init JWT strategy
  _setStrategies() {
    this._strategies.push(new CredentialsAuth());
    this._strategies.push(new JwtAuthStrategy(this._provideJwtOptions(), this._verifyRevokedToken));
    this._strategies.push(new SecretKeyAuth({ secretKey: this._provideSecretKey() }));
  }

  // Custom verifier
  async _verifyRevokedToken(refreshToken, payload, callback) {
    try {
      const revokedTokens = await RevokedTokenModel.find({ token: refreshToken });

      // If the token has been revoked, removes it from the user model and sends a failure response
      if (revokedTokens.length) {
        await UserModel.findOneAndUpdate(
          { token: refreshToken },
          { $set: { token: '' } }
        ).lean().exec();
        return callback.onFailure(new ForbiddenError('Token has been revoked'));
      }
  
      const user = await UserModel.findOne({ token: refreshToken }).lean().exec();
  
      user._id === payload.id
        ? callback.onVerified(refreshToken, user)
        : callback.onFailure(new ForbiddenError('Access and refresh tokens do not matched'));
    } catch (error) {
      callback.onFailure(error);
    }
  }

  extractJwtToken(req) {
    return {
      accessToken: ExtractJwt.fromAuthHeaderAsBearerToken()(req),
      refreshToken: req.params?.token
    }
  }

  _provideJwtOptions() {
    const jwtOptions = {};
    jwtOptions.extractJwtToken = this.extractJwtToken;
    jwtOptions.privateKey = this._provideJwtPrivateKey();
    jwtOptions.publicKey = this._provideJwtPublicKey();
    jwtOptions.issuer = accessOptions.issuer;
    jwtOptions.audience = accessOptions.audience;
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
        return new JwtTokenModel(this._jwt.sign(payload, key, options));
      default:
        throw new TypeError('Cannot sign token for the ' + strategyName + ' strategy');
    }
  }
}

export default new AuthManager();