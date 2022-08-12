import NodeCache from 'node-cache';
import { join } from 'path';
import { accessSync, constants, unlinkSync } from 'fs'

import { UserModel } from '../model/user.js';
import { RoleModel } from '../model/role.js';
import { FileModel } from '../model/file.js';

class UserHandler {
  constructor() {
    this._memCache = new NodeCache();
  }

  async createUserAccount(req, callback) {
    try {
      const roles = this._memCache.get('default_roles');

      if (!roles) {
        req.body.roles = await RoleModel.find({ name: 'USER' }).select('_id');
        this._memCache.set('default_roles', req.body.roles, 86400);
      }
      else {
        req.body.roles = roles;
      }

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
      user.id = user._id;
      user.avatar = join(__dirname, 'uploads', user.avatar?.serverFileName || 'default.png');
      user.roles = user.roles.map(role => role.name);
      user.lastLoginIP = IP.shift() + '.' + IP.shift() + '.' + '***.***';
      
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

      user.avatar = join(__dirname, 'uploads', user.avatar?.serverFileName || 'default.png');

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
      const avatar = req.file ? await FileModel.createNewInstance(req.file, payload.sub) : undefined;
      const user = await UserModel.findOneAndUpdate(
        { _id: payload.sub },
        { $set: {
          avatar: avatar,
          greetings: req.body.greetings,
          introduce: req.body.introduce
        } },
        { new: false,
          lean: true,
          projection: { avatar: 1, greetings: 1, introduce: 1, isActive: 1 },
          populate: { path: 'avatar', select: 'serverFileName isActive', match: { isActive: true } } }
      ).exec();
      
      if (avatar && user.avatar) {
        const oldAvatar = await FileModel.findByIdAndRemove(user.avatar).select('serverFileName').lean().exec();
        if (oldAvatar) {
          const filePath = join(__dirname, 'uploads', oldAvatar.serverFileName);
          accessSync(filePath, constants.F_OK)
          unlinkSync(filePath)
        }
      }

      user.avatar = avatar ? join(__dirname, 'uploads', avatar.serverFileName) : undefined;
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
      await UserModel.findByIdAndUpdate(
        payload.sub,
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