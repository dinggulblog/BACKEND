import passport from 'passport';

import BaseController from './base.js';
import UserHandler from '../handler/user.js';

class UserController extends BaseController {
  constructor() {
    super();
    this._userHandler = new UserHandler();
    this._passport = passport;
  }

  create(req, res) {
    this._passport.authenticate('secret-key-auth', {
      onVerified: () => {
        this._userHandler.createUserAccount(req, this._responseManager.getDefaultResponseHandler(res));
      },
      onFailure: (error) => {
        this._responseManager.respondWithError(res, error.status || 401, error.message);
      }
    })(req, res);
  }

  get(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this._userHandler.getUserAccount(req, payload, this._responseManager.getDefaultResponseHandler(res));
    });
  }

  getProfile(req, res) {
    this._userHandler.getUserProfile(req, this._responseManager.getDefaultResponseHandler(res));
  }

  update(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this._userHandler.updateUserAccount(req, payload, this._responseManager.getDefaultResponseHandler(res));
    });
  }

  updateProfile(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this._userHandler.updateUserProfile(req, payload, this._responseManager.getDefaultResponseHandler(res));
    });
  }

  delete(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this._userHandler.deleteUserAccount(req, payload, this._responseManager.getDefaultResponseHandler(res));
    });
  }

  authenticate(req, res, next, callback) {
    this._passport.authenticate('jwt-auth', {
      onVerified: callback,
      onFailure: (error) => {
        this._responseManager.respondWithError(res, error.status || 401, error.message);
      }
    })(req, res, next);
  }
}

export default UserController;