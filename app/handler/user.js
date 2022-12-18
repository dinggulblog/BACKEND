import { UserModel } from '../model/user.js';
import { FileModel } from '../model/file.js';
import { getSecuredIPString } from '../util/util.js';
import InvalidRequestError from '../error/invalid-request.js';

class UserHandler {
  constructor() {
  }

  async createUserAccount(req, callback) {
    try {
      await new UserModel({
        email: req.body.email,
        password: req.body.password,
        passwordConfirmation: req.body.passwordConfirmation,
        nickname: req.body.nickname
      }).save(
        { validateBeforeSave: true }
      );

      callback.onSuccess({});
    } catch (error) {
      callback.onError(error);
    }
  }

  async getUserAccount(req, payload, callback) {
    try {
      const user = await UserModel.findOne(
        { _id: payload.userId },
        { roles: 1, email: 1, isActive: 1, lastLoginIP: 1 },
        { lean: true,
          timestamps: false,
          populate: { path: 'roles', select: 'name' } }
        ).exec();

      const profile = await UserModel.findOne(
        { _id: payload.userId },
        { nickname: 1, avatar: 1, isActive: 1, greetings: 1, introduce: 1 },
        { lean: true,
          timestamps: false,
          populate: { path: 'avatar', select: 'serverFileName isActive', match: { isActive: true } } }
        ).exec();

      user.lastLoginIP = getSecuredIPString(user.lastLoginIP);
      user.roles = user.roles.map(role => role.name);
      delete profile.isActive;

      callback.onSuccess({ user, profile });
    } catch (error) {
      callback.onError(error);
    }
  }

  async getUserProfile(req, callback) {
    try {
      const profile = await UserModel.findOne(
        { nickname: req.params.nickname },
        { nickname: 1, avatar: 1, isActive: 1, greetings: 1, introduce: 1 },
        { lean: true,
          timestamps: false,
          populate: { path: 'avatar', select: 'serverFileName isActive', match: { isActive: true } } }
        ).exec();

      callback.onSuccess({ profile });
    } catch (error) {
      callback.onError(error);
    }
  }

  // Do not use 'lean' option!
  async updateUserAccount(req, payload, callback) {
    try {
      const user = await UserModel.findOne({ _id: payload.userId })
        .select('password isActive')
        .exec();

      user.originalPassword = user.password;
      user.password = req.body.newPassword ? req.body.newPassword : user.password;
      for (const key in req.body) user[key] = req.body[key];

      await user.save({ timestamps: false });

      callback.onSuccess({});
    } catch (error) {
      callback.onError(error);
    }
  }

  async updateUserProfile(req, payload, callback) {
    try {
      const { greetings, introduce } = req.body;
      const profile = await UserModel.findOneAndUpdate(
        { _id: payload.userId },
        { $set: { greetings, introduce } },
        { new: true,
          lean: true,
          timestamps: false,
          projection: { greetings: 1, introduce: 1, isActive: 1 } }
      ).exec();

      callback.onSuccess({ profile });
    } catch (error) {
      callback.onError(error);
    }
  }

  async updateUserProfileAvatar(req, payload, callback) {
    try {
      const avatar = await FileModel.createSingleInstance(payload.userId, payload.userId, 'User', req.file);

      if (!avatar) throw new InvalidRequestError('아바타가 업로드되지 않았습니다.');

      const profile = await UserModel.findOneAndUpdate(
        { _id: payload.userId },
        { $set: { avatar: avatar._id } },
        { new: true,
          lean: true,
          timestamps: false,
          projection: { avatar: 1, isActive: 1 },
          populate: { path: 'avatar', select: 'serverFileName isActive', match: { isActive: true } } }
      ).exec();

      callback.onSuccess({ profile });
    } catch (error) {
      callback.onError(error);
    }
  }

  async deleteUserAccount(req, payload, callback) {
    try {
      await UserModel.findOneAndUpdate(
        { _id: payload.userId },
        { $set: { isActive: false } },
        { new: true,
          lean: true,
          timestamps: false }
      ).exec();

      callback.onSuccess({});
    } catch (error) {
      callback.onError(error);
    }
  }

  async deleteUserProfileAvatar(req, payload, callback) {
    try {
      const profile = await UserModel.findOneAndUpdate(
        { _id: payload.userId },
        { $set: { avatar: null } },
        { new: true,
          lean: true,
          timestamps: false,
          projection: { avatar: 1, isActive: 1 } }
      ).exec();

      callback.onSuccess({ profile });
    } catch (error) {
      callback.onError(error);
    }
  }
}

export default UserHandler;
