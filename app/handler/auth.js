import jwt from 'jsonwebtoken';
import { createHash } from 'crypto';
import { param, validationResult } from 'express-validator';

import { RevokedTokenModel } from '../model/revoked-token.js';
import AuthManager from '../manager/auth.js'
import BaseAutoBindedClass from '../base/autobind.js';
import NotFoundError from '../error/not-found.js';
import ForbiddenError from '../error/forbidden.js';

class AuthHandler extends BaseAutoBindedClass {
  constructor() {
    super();
    this._jwtTokenHandler = jwt;
    this._authManager = AuthManager;
  }

  issueNewToken(req, user, callback) {
    if (user) {
      const userToken = this._authManager.signToken('jwt-auth', this._provideTokenPayload(user), this._provideTokenOptions());
      callback.onSuccess({
        token: userToken.token,
        nickname: user.nickname
      });
    } else {
      callback.onError(new NotFoundError('User not found'));
    }
  }

  async revokeToken(req, token, callback) {
    try {
      await param('token', 'Invalid token id provided').notEmpty().isAlphanumeric().isLength(64).run(req);
      
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

  _provideTokenPayload(user) {
    return { id: user.id, nickname: user.nickname, scope: 'default' };
  }

  _provideTokenOptions() {
    return {
      expiresIn: '60m',
      audience: process.env.JWT_AUDIENCE,
      issuer: process.env.JWT_ISSUER,
      algorithm: process.env.JWT_ALGORITHM
    };
  }
}

export default AuthHandler;