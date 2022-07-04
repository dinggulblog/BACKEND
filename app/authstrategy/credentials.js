import { Strategy as LocalAuthStrategy } from 'passport-local';

import { UserModel } from '../model/user.js';
import NotFoundError from '../error/not-found.js';
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
      
      if (!user) {
        return done(new NotFoundError('User not found'), false);
      }
      if (!user.comparePassword(password)) {
        return done(new UnauthorizedError('ID and password do not match'), false);
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