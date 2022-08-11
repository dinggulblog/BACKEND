import passport from 'passport';

import BaseController from './base.js';
import AuthHandler from '../handler/auth.js';

class AuthController extends BaseController {
  constructor() {
    super();
    this._authHandler = new AuthHandler();
    this._passport = passport;
  }

  // Request token by credentials
  create(req, res, next) {
    this.authenticate(req, res, next, (user) => {
      this._authHandler.issueNewToken(req, user, this._responseManager.getCookieResponseHandler(res));
    });
  }

  // Request new token by jwt auth
  update(req, res, next) {
    this._passport.authenticate('jwt-auth', {
      onVerified: (token, payload) => {
        this._authHandler.issueRenewedToken(req, payload, this._responseManager.getCookieResponseHandler(res));
      },
      onFailure: (error) => {
        this._responseManager.respondWithError(res, error.status || 401, error.message);
      }
    })(req, res, next);
  }

  // Revoke Token (Logout)
  delete(req, res, next) {
    this._passport.authenticate('jwt-auth', {
      onVerified: (token, payload) => {
        this._authHandler.revokeToken(req, payload, this._responseManager.getResetCookieResponseHandler(res));
      },
      onFailure: (error) => {
        this._responseManager.respondWithError(res, error.status || 401, error.message);
      }
    })(req, res, next);
  }

  authenticate(req, res, next, callback) {
    this._passport.authenticate('credentials-auth', (error, user) => {
      error
        ? this._responseManager.respondWithError(res, error.status || 401, error.message || "")
        : callback(user);
    })(req, res, next);
  }
}

export default AuthController;