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

  // Do not use Model 'lean' option!
  static async handleUserAuth(req, username, password, done) {
    try {
      const lastLoginIP = req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress?.split(':').pop();

      const user = await UserModel.findOneAndUpdate(
        { email: username },
        { $set: { lastLoginIP } },
        { projection: { roles: 1, password: 1, isActive: 1 },
          populate: { path: 'roles', select: { name: 1 } } }
        ).exec();
      
      return !user.comparePassword(password)
        ? done(new UnauthorizedError('아이디와 비밀번호가 일치하지 않습니다.'), false)
        : done(null, user);
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