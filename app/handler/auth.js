import { v1 } from 'uuid'

import { UserModel } from '../model/user.js';
import { RevokedTokenModel } from '../model/revoked-token.js';
import { jwtOptions } from '../../config/jwt-options.js';
import AuthManager from '../manager/auth.js'
import BaseAutoBindedClass from '../base/autobind.js';
import ForbiddenError from '../error/forbidden.js';
import NotFoundError from '../error/not-found.js';


class AuthHandler extends BaseAutoBindedClass {
  constructor() {
    super();
    this._authManager = AuthManager;
  }

  async issueNewToken(req, user, callback) {
    if (user) {
      try {
        const UUIDV1 = v1();
        const newUser = await UserModel.findByIdAndUpdate(
          { _id: user._id },
          { $push: { tokens: { uuid: UUIDV1, device: req.useragent.isMobile ? 'mobile' : 'pc' } } },
          { new: true }
        ).populate('roles').lean().exec();

        const { token: accessToken } = await this._authManager.signToken('jwt-auth', this._provideAccessTokenPayload(newUser, UUIDV1));
        const { token: refreshToken } = await this._authManager.signToken('jwt-auth', this._provideRefreshTokenPayload(UUIDV1));

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
      const user = await UserModel.findOneAndUpdate(
        { 'tokens.uuid': payload.jti },
        { $set: { 'tokens.$.uuid': UUIDV1 } },
        { new: true }
      ).populate('roles').lean().exec();

      if (!user) {
        return callback.onError(new ForbiddenError('Token is already revoked'));
      }

      const { token: accessToken } = await this._authManager.signToken('jwt-auth', this._provideAccessTokenPayload(user, UUIDV1));
      const { token: refreshToken } = await this._authManager.signToken('jwt-auth', this._provideRefreshTokenPayload(UUIDV1));

      await RevokedTokenModel.findOneAndUpdate(
        { uuid: payload.jti },
        { $set: { uuid: payload.jti } },
        { upsert: true }
      ).lean().exec();
      
      callback.onSuccess({ refreshToken }, { accessToken });
    } catch (error) {
      callback.onError(error);
    }
  }

  async revokeToken(req, payload, callback) {
    try {
      await UserModel.findOneAndUpdate(
        { 'tokens.uuid': payload.jti },
        { $pull: { tokens: { uuid: payload.jti } } }
      ).lean().exec();

      await RevokedTokenModel.findOneAndUpdate(
        { uuid: payload.jti },
        { $set: { uuid: payload.jti } },
        { upsert: true }
      ).lean().exec();
      
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
        roles: user.roles
      }
    };
  }

  _provideRefreshTokenPayload(uuid) {
    return {
      iss: jwtOptions.issuer,
      aud: jwtOptions.audience,
      exp: Math.floor(Date.now() / 1000) + (86400 * 14), // 2 weeks
      nbf: Math.floor(Date.now() / 1000),
      jti: uuid
    };
  }
}

export default AuthHandler;