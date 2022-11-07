import { UserModel } from '../model/user.js';
import { FileModel } from '../model/file.js';
import { getSecuredIPString } from '../util/util.js';

class UserHandler {
  constructor() {
  }

  async createUserAccount(req, callback) {
    try {
      await UserModel.create(req.body);

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
      const user = await UserModel.findOne({ nickname: req.params.nickname })
        .select({ roles: 0, updatedAt: 0, expiredAt: 0, lastLoginIp: 0 })
        .populate({ path: 'avatar', select: 'serverFileName isActive', match: { isActive: true } })
        .lean()
        .exec();

      callback.onSuccess({ user });
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
      const user = await UserModel.findOneAndUpdate(
        { _id: payload.sub },
        { $set: { greetings: req.body?.greetings, introduce: req.body?.introduce } },
        { new: true, lean: true, projection: { _id: 0,  greetings: 1, introduce: 1, isActive: 1 } }
      ).exec();

      callback.onSuccess({ user });
    } catch (error) {
      callback.onError(error);
    }
  }

  async updateUserProfileAvatar(req, payload, callback) {
    try {
      const avatar = await FileModel.createNewInstance(payload.sub, payload.sub, 'User', req.file);
      const user = await UserModel.findOneAndUpdate(
        { _id: payload.sub },
        { $set: { avatar: avatar._id } },
        { new: true,
          lean: true,
          projection: { _id: 0, avatar: 1, isActive: 1 },
          populate: { path: 'avatar', select: 'serverFileName isActive', match: { isActive: true } } }
      ).exec();

      callback.onSuccess({ user });
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
      const user = await UserModel.findOneAndUpdate(
        { _id: payload.sub },
        { $set: { avatar: undefined } },
        { new: true, lean: true }
      ).exec();

      callback.onSuccess({ user });
    } catch (error) {
      callback.onError(error);
    }
  }
}

export default UserHandler;