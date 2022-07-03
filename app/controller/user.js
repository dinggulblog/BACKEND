import passport from 'passport';

import BaseController from './base.js';
import UserHandler from '../handler/user.js';

class UserController extends BaseController {
  constructor() {
    super();
    this._authHandler = new UserHandler();
    this._passport = passport;
  }

  create(req, res) {
    this.authenticate(req, res, () => {
      this._authHandler.createUser(req, this._responseManager.getDefaultResponseHandler(res));
    });
  }

  get(req, res, next) {
    this._passport.authenticate('jwt-auth', {
      onVerified: (token, payload) => {
        this._authHandler.getUserInfo(req, payload, this._responseManager.getDefaultResponseHandler(res));
      },
      onFailure: (error) => {
        this._responseManager.respondWithError(res, error.status || 401, error.message);
      }
    })(req, res, next);
  }

  update(req, res, next) {
    this._passport.authenticate('jwt-auth', {
      onVerified: (token, payload) => {
        this._authHandler.updateUser(req, payload, this._responseManager.getDefaultResponseHandler(res));
      },
      onFailure: (error) => {
        this._responseManager.respondWithError(res, error.status || 401, error.message);
      }
    })(req, res, next);
  }

  authenticate(req, res, callback) {
    this._passport.authenticate('secret-key-auth', {
      onVerified: callback,
      onFailure: (error) => {
        this._responseManager.respondWithError(res, error.status || 401, error.message);
      }
    })(req, res);
  }
}

export default UserController;