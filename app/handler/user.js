import { UserModel } from '../model/user.js';
import { FileModel } from '../model/file.js';
import { getSecuredIPString } from '../util/util.js';

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
      const user = await UserModel.findOne({ _id: payload.sub })
        .populate({ path: 'avatar', select: 'serverFileName isActive', match: { isActive: true } })
        .populate({ path: 'roles', select: 'name' })
        .lean()
        .exec();

      // user.lastLoginIP = getSecuredIPString(user.lastLoginIP);

      callback.onSuccess({ user });
    } catch (error) {
      callback.onError(error);
    }
  }

  async getUserProfile(req, callback) {
    try {
      const profile = await UserModel.findOne({ nickname: req.params.nickname })
        .select({ email: 1, nickname: 1, avatar: 1, isActive: 1, greetings: 1, introduce: 1 })
        .populate({ path: 'avatar', select: 'serverFileName isActive', match: { isActive: true } })
        .lean()
        .exec();

      callback.onSuccess({ profile });
    } catch (error) {
      callback.onError(error);
    }
  }

  // Do not use 'lean' option!
  async updateUserAccount(req, payload, callback) {
    try {
      const user = await UserModel.findOne({ _id: payload.sub })
        .select('password isActive')
        .exec();

      user.originalPassword = user.password;
      user.password = req.body.newPassword ? req.body.newPassword : user.password;
      for (const key in req.body) user[key] = req.body[key];

      await user.save();

      callback.onSuccess({});
    } catch (error) {
      callback.onError(error);
    }
  }

  async updateUserProfile(req, payload, callback) {
    try {
      const { greetings, introduce } = req.body;
      const profile = await UserModel.findOneAndUpdate(
        { _id: payload.sub },
        { $set: { greetings, introduce } },
        { new: true,
          lean: true,
          projection: { greetings: 1, introduce: 1, isActive: 1 } }
      ).exec();

      callback.onSuccess({ profile });
    } catch (error) {
      callback.onError(error);
    }
  }

  async updateUserProfileAvatar(req, payload, callback) {
    try {
      const avatar = await FileModel.createSingleInstance(payload.sub, payload.sub, 'User', req.file);
      const profile = await UserModel.findOneAndUpdate(
        { _id: payload.sub },
        { $set: { avatar: avatar._id } },
        { new: true,
          lean: true,
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
        { _id: payload.sub },
        { $set: { isActive: false } },
        { new: true, lean: true }
      ).exec();

      callback.onSuccess({});
    } catch (error) {
      callback.onError(error);
    }
  }

  async deleteUserProfileAvatar(req, payload, callback) {
    try {
      const profile = await UserModel.findOneAndUpdate(
        { _id: payload.sub },
        { $set: { avatar: null } },
        { new: true,
          lean: true,
          projection: { avatar: 1, isActive: 1 } }
      ).exec();

      callback.onSuccess({ profile });
    } catch (error) {
      callback.onError(error);
    }
  }
}

export default UserHandler;
