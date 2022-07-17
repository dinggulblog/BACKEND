import { Strategy as LocalAuthStrategy } from 'passport-local';

import { UserModel } from '../model/user.js';
import UnauthorizedError from '../error/unauthorized.js';

class CredentialsAuthStrategy extends LocalAuthStrategy {
  constructor() {
    super(CredentialsAuthStrategy.provideOptions(), CredentialsAuthStrategy.handleUserAuth);
  }

  get name() {
    return 'credentials-auth';
  }

  static async handleUserAuth(req, username, password, done) {
    try {
      const lastLoginIP = req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress;
      const user = await UserModel.findOneAndUpdate({ email: username }, { $set: { lastLoginIP } })
        .select({ _id: 1, roles:1, password: 1, nickname:1 })
        .populate('roles')
        .exec();
      
      if (!user || !user.comparePassword(password)) {
        return done(new UnauthorizedError('아이디가 존재하지 않거나, 아이디와 비밀번호가 일치하지 않습니다.'), false);
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
  
  provideSecretKey() {
    throw new Error('No key is required for this type of auth');
  }

  static provideOptions() {
    return {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
      session: false
    };
  }
}

export default CredentialsAuthStrategy;