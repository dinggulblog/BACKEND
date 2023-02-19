import { UserModel } from '../model/user.js';
import { FileModel } from '../model/file.js';
import { MailModel } from '../model/mail.js';
import { sendMail } from '../util/sendmail.js';
import { securedIPString } from '../util/util.js';
import InvalidRequestError from '../error/invalid-request.js';

class UserHandler {
  constructor() {
    this._host = process.env.HOST
  }

  async createAccount(req, callback) {
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

  async getAccount(req, payload, callback) {
    try {
      const user = await UserModel.findOne(
        { _id: payload.userId },
        { roles: 1, avatar: 1, email: 1, nickname: 1, isActive: 1, lastLoginIP: 1 },
        { lean: true,
          timestamps: false,
          populate: [{ path: 'roles' }, { path: 'avatar', select: 'thumbnail', match: { isActive: true } }] }
        ).exec();

      user.lastLoginIP = securedIPString(user.lastLoginIP);
      user.roles = user.roles.map(({ name }) => name);

      callback.onSuccess({ user });
    } catch (error) {
      callback.onError(error);
    }
  }

  async getProfile(req, callback) {
    try {
      const profile = await UserModel.findOne(
        { nickname: req.params.nickname },
        { nickname: 1, avatar: 1, isActive: 1, greetings: 1, introduce: 1 },
        { lean: true,
          timestamps: false,
          populate: { path: 'avatar', select: 'thumbnail', match: { isActive: true } } }
        ).exec();

      callback.onSuccess({ profile });
    } catch (error) {
      callback.onError(error);
    }
  }

  // Do not use 'lean' option!
  async updateAccount(req, payload, callback) {
    try {
      const user = await UserModel.findOne({ _id: payload.userId })
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

  // Do not use 'lean' option!
  async updateAccountUsingCode(req, callback) {
    try {
      const { email, code, newPassword, passwordConfirmation } = req.body;
      const user = await UserModel.findOne({ email })
        .select('password isActive')
        .exec();

      user.code = code;
      user.originalPassword = user.password;
      user.password = newPassword;
      user.newPassword = newPassword;
      user.passwordConfirmation = passwordConfirmation;

      await user.save();

      callback.onSuccess({});
    } catch (error) {
      callback.onError(error);
    }
  }

  async updateProfile(req, payload, callback) {
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

  async updateProfileAvatar(req, payload, callback) {
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
          populate: { path: 'avatar', select: 'thumbnail', match: { isActive: true } } }
      ).exec();

      callback.onSuccess({ profile });
    } catch (error) {
      callback.onError(error);
    }
  }

  async deleteAccount(req, payload, callback) {
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

  async deleteProfileAvatar(req, payload, callback) {
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
