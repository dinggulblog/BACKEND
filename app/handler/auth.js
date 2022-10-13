import { UserModel } from '../model/user.js';
import { jwtOptions } from '../../config/jwt-options.js';
import AuthManager from '../manager/auth.js';
import JwtError from '../error/jwt-error.js';
import ServerError from '../error/server-error.js';
import ForbiddenError from '../error/forbidden.js';

class AuthHandler {
  constructor() {
    this._authManager = AuthManager;
  }

  async issueNewToken(req, user, callback) {
    if (user) {
      try {
        const { token: accessToken } = await this._authManager.signToken('jwt-auth', this._provideAccessTokenPayload(user));
        const { token: refreshToken } = await this._authManager.signToken('jwt-auth', this._provideRefreshTokenPayload());

        req.session.refreshToken = refreshToken;
        req.session.uid = user._id;

        callback.onSuccess({ accessToken });
      } catch (error) {
        callback.onError(new ServerError('Internal server error: Cannot sign with JWT'));
      }
    } else {
      callback.onError(new ForbiddenError('유저를 찾을 수 없습니다.'));
    }
  }

  async issueRenewedToken(req, payload, callback) {
    try {
      const user = await UserModel.findOne(
        { _id: req.session.uid },
        { roles: 1, isActive: 1 },
        { lean: true,
          populate: { path: 'roles', select: { name: 1 } } }
      ).exec();

      const { token: accessToken } = await this._authManager.signToken('jwt-auth', this._provideAccessTokenPayload(user));
      const { token: refreshToken } = await this._authManager.signToken('jwt-auth', this._provideRefreshTokenPayload());

      req.session.refreshToken = refreshToken;

      callback.onSuccess({ accessToken });
    } catch (error) {
      callback.onError(new JwtError('세션 정보가 삭제되거나 만료되어 정보를 갱신할 수 없습니다. 다시 로그인 해 주세요.'));
    }
  }

  revokeToken(req, payload, callback) {
    req.session.destroy();
    callback.onSuccess({}, 'Token has been successfully revoked');
  }

  _provideAccessTokenPayload(user) {
    return {
      sub: user._id,
      iss: jwtOptions.issuer,
      aud: jwtOptions.audience,
      exp: Math.floor(Date.now() / 1000) + (60 * 60), // 60 min
      nbf: Math.floor(Date.now() / 1000),
      roles: [...user.roles].map(role => role.name)
    };
  }

  _provideRefreshTokenPayload() {
    return {
      iss: jwtOptions.issuer,
      aud: jwtOptions.audience,
      exp: Math.floor(Date.now() / 1000) + (86400 * 14), // 14 days
      nbf: Math.floor(Date.now() / 1000)
    };
  }
}

export default AuthHandler;