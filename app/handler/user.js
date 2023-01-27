import { UserModel } from '../model/user.js';
import { FileModel } from '../model/file.js';
import { MailModel } from '../model/mail.js';
import { sendMail } from '../middlewares/sendmail.js';
import { getSecuredIPString } from '../util/util.js';
import InvalidRequestError from '../error/invalid-request.js';

class UserHandler {
  constructor() {
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

  async createAccountLink(req, callback) {
    try {
      const { email } = req.params;
      const { code } = await MailModel.createCode(email, 'ses');

      await sendMail({
        to: email,
        subject: `[딩굴] 비밀번호 수정 링크입니다.`,
        body: `<a href="http://localhost:8080/home"><img src="https://dinggul.me/uploads/logo.png" style="display: block; width: 280px; margin: 0 auto;"/></a>
        <div style="max-width: 100%; width: 400px; margin: 0 auto; padding: 1rem; text-align: justify; background: #f8f9fa; border: 1px solid #dee2e6; box-sizing: border-box; border-radius: 4px; color: #868e96; margin-top: 0.5rem; box-sizing: border-box;">
          <b style="black">안녕하세요! </b>비밀번호 수정을 계속하시려면 하단의 링크를 클릭하세요. 만약에 실수로 요청하셨거나, 본인이 요청하지 않았다면, 이 메일을 무시하세요.
        </div>
        <a href="http://localhost:8080/auth/pwd-reset?code=${code}" style="text-decoration: none; width: 400px; text-align:center; display:block; margin: 0 auto; margin-top: 1rem; background: #845ef7; padding-top: 1rem; color: white; font-size: 1.25rem; padding-bottom: 1rem; font-weight: 600; border-radius: 4px;">계속하기</a>

        <div style="text-align: center; margin-top: 1rem; color: #868e96; font-size: 0.85rem;">
          <div>위 버튼을 클릭하시거나, 다음 링크를 열으세요:<br/>
            <a style="color: #b197fc;" href="http://localhost:8080/auth/pwd-reset?code=${code}">
              http://localhost:8080/auth/pwd-reset?code=${code}
            </a>
          </div><br/><div>이 링크는 24시간동안 유효합니다. </div>
        </div>`,
      })

      callback.onSuccess({});
    } catch (error) {
      callback.onError(error);
    }
  }

  async getAccount(req, payload, callback) {
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
          populate: { path: 'avatar', select: 'thumbnail', match: { isActive: true } } }
        ).exec();

      user.lastLoginIP = getSecuredIPString(user.lastLoginIP);
      user.roles = user.roles.map(role => role.name);
      delete profile.isActive;

      callback.onSuccess({ user, profile });
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
