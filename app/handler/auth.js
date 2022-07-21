import { v1 } from 'uuid'
import NodeCache from 'node-cache'

import { UserModel } from '../model/user.js';
import { jwtOptions } from '../../config/jwt-options.js';
import AuthManager from '../manager/auth.js'
import BaseAutoBindedClass from '../base/autobind.js';
import JwtError from '../error/jwt-error.js'
import ServerError from '../error/server-error.js';
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

        const { token: accessToken } = await this._authManager.signToken('jwt-auth', this._provideAccessTokenPayload(user, UUIDV1));
        const { token: refreshToken } = await this._authManager.signToken('jwt-auth', this._provideRefreshTokenPayload(UUIDV1));

        this._nodeCache.set(UUIDV1, user._id);
        console.log('Remaining cache: ', this._nodeCache.keys());

        callback.onSuccess({ refreshToken }, { accessToken });
      } catch (error) {
        callback.onError(new ServerError('Internal server error: Cannot sign with JWT'));
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
      callback.onError(new JwtError('Invalid refresh token(already deleted).'));
    }
  }

  revokeToken(req, payload, callback) {
    this._nodeCache.del(payload.jti);
    callback.onSuccess({ refreshToken: '' }, '', 'Token has been successfully revoked');
  }

  _provideAccessTokenPayload(user, uuid) {
    return {
      sub: user._id,
      iss: jwtOptions.issuer,
      aud: jwtOptions.audience,
      exp: Math.floor(Date.now() / 1000) + (60 * 60), // 60 min
      nbf: Math.floor(Date.now() / 1000),
      jti: uuid,
      data: {
        nickname: user.nickname,
        roles: user.roles?.map(role => role.name)
      }
    };
  }

  _provideRefreshTokenPayload(uuid) {
    return {
      iss: jwtOptions.issuer,
      aud: jwtOptions.audience,
      exp: Math.floor(Date.now() / 1000) + (86400 * 7), // 7 days
      nbf: Math.floor(Date.now() / 1000),
      jti: uuid
    };
  }
}

export default AuthHandler;