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

  static async handleUserAuth(username, password, done) {
    try {
      const user = await UserModel.findOne({ email: username }).select({ password: 1 });

      if (!user) {
        return done(new NotFoundError('User not found'), false);
      }
      if (!user.comparePassword(password)) {
        return done(new UnauthorizedError('ID does not exist or ID and password do not match'), false);
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }

  static provideOptions() {
    return {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: false,
      session: false
    };
  }

  provideSecretKey() {
    throw new Error('No key is required for this type of auth');
  }
}

export default CredentialsAuthStrategy;