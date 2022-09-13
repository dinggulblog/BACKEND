import { UserModel } from '../model/user.js';
import { RoleModel } from '../model/role.js';
import { FileModel } from '../model/file.js';

class UserHandler {
  constructor() {
  }

  async createUserAccount(req, callback) {
    try {
      req.body.roles = await RoleModel.find({ name: 'USER' }).select('_id');

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

      const IP = user.lastLoginIP.split('.');
      user.lastLoginIP = IP.shift() + '.' + IP.shift() + '.' + '***.***';
      user.id = user._id;
      user.avatar = user.avatar?.serverFileName || 'default.png';
      user.roles = user.roles.map(role => role.name);
      
      callback.onSuccess({ user });
    } catch (error) {
      callback.onError(error);
    }
  }

  async getUserProfile(req, callback) {
    try {
      const user = await UserModel.findOne({ nickname: req.params.nickname })
        .select({ _id: 0, roles: 0, createdAt: 0, updatedAt: 0, lastLoginIP: 0 })
        .populate({ path: 'avatar', select: 'serverFileName isActive', match: { isActive: true } })
        .lean()
        .exec();

      user.avatar = user.avatar?.serverFileName || 'default.png';

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
      const avatar = req.file ? await FileModel.createNewInstance(payload.sub, payload.sub, 'user', req.file) : undefined;

      const user = await UserModel.findOneAndUpdate(
        { _id: payload.sub },
        { $set: {
          avatar: avatar?._id ?? req.body?.avatar,
          greetings: req.body.greetings,
          introduce: req.body.introduce
        } },
        { new: false,
          lean: true,
          projection: { avatar: 1, greetings: 1, introduce: 1, isActive: 1 },
          populate: { path: 'avatar', select: 'serverFileName isActive', match: { isActive: true } } }
      ).exec();
      
      if (avatar && user.avatar._id !== avatar._id) {
        await FileModel.findOneAndDelete({ _id: user.avatar._id }, { lean: true }).exec();
      }

      user.avatar = avatar?.serverFileName ?? user.avatar?.serverFileName;
      user.greetings = req.body?.greetings;
      user.introduce = req.body?.introduce;
      delete user._id;

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
}

export default UserHandler;