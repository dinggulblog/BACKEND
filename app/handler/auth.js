import { createHash } from 'crypto';
import { param, validationResult } from 'express-validator';

import { UserModel } from '../model/user.js';
import { RevokedTokenModel } from '../model/revoked-token.js';
import { accessOptions, refreshOptions } from '../../config/jwt-options.js';
import AuthManager from '../manager/auth.js'
import BaseAutoBindedClass from '../base/autobind.js';
import NotFoundError from '../error/not-found.js';
import ForbiddenError from '../error/forbidden.js';

class AuthHandler extends BaseAutoBindedClass {
  constructor() {
    super();
    this._authManager = AuthManager;
  }

  async issueNewToken(req, user, callback) {
    if (user) {
      const ip = AuthHandler.getUserIp(req);
      const { token: accessToken } = this._authManager.signToken('jwt-auth', this._provideAccessTokenPayload(user, ip), this._provideAccessTokenOptions());
      const { token: refreshToken } = this._authManager.signToken('jwt-auth', this._provideRefreshTokenPayload(ip), this._provideRefreshTokenOptions());

      await UserModel.findOneAndUpdate(
        { _id: user._id },
        { $set: { token: refreshToken } }
      ).lean().exec();

      callback.onSuccess({ refreshToken }, { accessToken });
    } else {
      callback.onError(new NotFoundError('User not found'));
    }
  }

  async issueRenewedToken(req, refreshToken, user, callback) {
    if (user) {
      const ip = AuthHandler.getUserIp(req);
      const { token: accessToken } = this._authManager.signToken('jwt-auth', this._provideAccessTokenPayload(user, ip), this._provideAccessTokenOptions());

      callback.onSuccess({ refreshToken }, { accessToken });
    } else {
      callback.onError(new NotFoundError('User not found'));
    }
  }

  async revokeToken(req, token, callback) {
    try {
      await param('token').isAlphanumeric().run(req);
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(elem => elem.msg);
        throw new ForbiddenError('Invalid token id :' + errorMessages.join(' && '));
      }
      
      if (this._compareHashedToken(token, req.params.token)) {
        await RevokedTokenModel.create({ token: token });
        callback.onSuccess('Token has been successfully revoked');
      } else {
        throw new ForbiddenError('Invalid credentials');
      }
    } catch (error) {
      callback.onError(error);
    }
  }

  _hashToken(token) {
    return createHash('sha256').update(token).digest('hex');
  }

  _compareHashedToken(token, hashed) {
    return this._hashToken(token) === hashed;
  }

  _provideAccessTokenPayload(user, ip) {
    return {
      id: user.id,
      nickname: user.nickname,
      roles: user.roles,
      ip: ip,
      scope: 'access'
    };
  }

  _provideRefreshTokenPayload(ip) {
    return {
      ip: ip,
      scope: 'refresh'
    };
  }

  _provideAccessTokenOptions() {
    return accessOptions;
  }

  _provideRefreshTokenOptions() {
    return refreshOptions;
  }

  static getUserIp(req) {
    return req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress;
  }
}

export default AuthHandler;