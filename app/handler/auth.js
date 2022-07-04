import { v1 } from 'uuid'
import NodeCache from 'node-cache'

import { UserModel } from '../model/user.js';
import { jwtOptions } from '../../config/jwt-options.js';
import AuthManager from '../manager/auth.js'
import BaseAutoBindedClass from '../base/autobind.js';
import NotFoundError from '../error/not-found.js';


class AuthHandler extends BaseAutoBindedClass {
  constructor() {
    super();
    this._authManager = AuthManager;
    this._nodeCache = new NodeCache({ stdTTL: 86400 * 7 });
  }

  async issueNewToken(req, user, callback) {
    if (user) {
      try {
        const UUIDV1 = v1();
        // this._nodeCache.flushAll(); // test

        const { token: accessToken } = await this._authManager.signToken('jwt-auth', this._provideAccessTokenPayload(user, UUIDV1));
        const { token: refreshToken } = await this._authManager.signToken('jwt-auth', this._provideRefreshTokenPayload(UUIDV1));

        this._nodeCache.set(UUIDV1, user._id);

        callback.onSuccess({ refreshToken }, { accessToken });
      } catch (error) {
        callback.onError(new Error('Cannot sign with JWT'));
      }
    } else {
      callback.onError(new NotFoundError('User not found'));
    }
  }

  async issueRenewedToken(req, payload, callback) {
    try {
      const UUIDV1 = v1();

      const userId = this._nodeCache.get(payload.jti);
      const user = await UserModel.findById(userId).populate('roles').lean().exec();

      const { token: accessToken } = await this._authManager.signToken('jwt-auth', this._provideAccessTokenPayload(user, UUIDV1));
      const { token: refreshToken } = await this._authManager.signToken('jwt-auth', this._provideRefreshTokenPayload(UUIDV1));

      this._nodeCache.del(payload.jti);
      this._nodeCache.set(UUIDV1, user._id);
      
      callback.onSuccess({ refreshToken }, { accessToken });
    } catch (error) {
      error.message = 'Cannot sign tokens with revoked one'
      callback.onError(error);
    }
  }

  async revokeToken(req, payload, callback) {
    try {
      this._nodeCache.del(payload.jti);

      callback.onSuccess({ refreshToken: '' }, '', 'Token has been successfully revoked');
    } catch (error) {
      callback.onError(error);
    }
  }

  _provideAccessTokenPayload(user, uuid) {
    return {
      sub: user._id,
      iss: jwtOptions.issuer,
      aud: jwtOptions.audience,
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      nbf: Math.floor(Date.now() / 1000),
      jti: uuid,
      data: {
        nickname: user.nickname,
        roles: user.roles.map(role => role.name)
      }
    };
  }

  _provideRefreshTokenPayload(uuid) {
    return {
      iss: jwtOptions.issuer,
      aud: jwtOptions.audience,
      exp: Math.floor(Date.now() / 1000) + (86400 * 7), // 1 weeks
      nbf: Math.floor(Date.now() / 1000),
      jti: uuid
    };
  }
}

export default AuthHandler;