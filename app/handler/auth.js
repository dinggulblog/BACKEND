import { UserModel } from '../model/user.js';
import { jwtOptions } from '../../config/jwt-options.js';
import AuthManager from '../manager/auth.js';
import JwtError from '../error/jwt-error.js';
import ForbiddenError from '../error/forbidden.js';

class AuthHandler {
  constructor() {
    this._authManager = AuthManager;
  }

  async issueNewToken(req, user, callback) {
    if (user) {
      try {
        const { token: accessToken } = await this._authManager.signToken('jwt-auth', this._provideAccessTokenPayload(user));
        const { token: refreshToken } = await this._authManager.signToken('jwt-auth', this._provideRefreshTokenPayload(user));

        callback.onSuccess({ accessToken, refreshToken })
      } catch (error) {
        callback.onError(error);
      }
    } else {
      callback.onError(new ForbiddenError('유저를 찾을 수 없습니다.'));
    }
  }

  async issueRenewedToken(req, payload, callback) {
    if (payload) {
      try {
        const user = await UserModel.findOne(
          { _id: payload.userId },
          { roles: 1, isActive: 1 },
          { lean: true,
            populate: { path: 'roles', select: { name: 1 } } }
        ).exec();

        const { token: accessToken } = await this._authManager.signToken('jwt-auth', this._provideAccessTokenPayload(user));
        const { token: refreshToken } = await this._authManager.signToken('jwt-auth', this._provideRefreshTokenPayload(user));

        callback.onSuccess({ accessToken, refreshToken });
      } catch (error) {
        callback.onError(error);
      }
    } else {
      callback.onError(new JwtError('토큰이 삭제되거나 기간이 만료되었습니다. 다시 로그인 해 주세요.'));
    }
  }

  revokeToken(req, callback) {
    try {
      callback.onSuccess({ accessToken: null, refreshToken: null }, {}, '정상적으로 로그아웃 처리되었습니다.');
    } catch (error) {
      callback.onError(error);
    }
  }

  _provideAccessTokenPayload(user) {
    return {
      userId: user._id,
      sub: 'accessToken',
      iss: jwtOptions.issuer,
      aud: jwtOptions.audience,
      exp: Math.floor(Date.now() / 1000) + (3600 * 2), // 2 hours
      nbf: Math.floor(Date.now() / 1000),
      roles: [...user.roles].map(role => role.name)
    };
  }

  _provideRefreshTokenPayload(user) {
    return {
      userId: user._id,
      sub: 'refreshToken',
      iss: jwtOptions.issuer,
      aud: jwtOptions.audience,
      exp: Math.floor(Date.now() / 1000) + (86400 * 14), // 14 days
      nbf: Math.floor(Date.now() / 1000)
    };
  }
}

export default AuthHandler;
