import { upload } from '../middlewares/multer.js';
import rules from '../middlewares/validation/user.js';

import BaseController from './base.js';
import UserHandler from '../handler/user.js';

class UserController extends BaseController {
  constructor() {
    super();
    this._userHandler = new UserHandler();
    this._upload = upload;
  }

  get(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this._userHandler.getUserAccount(req, payload, this._responseManager.getDefaultResponseHandler(res));
    });
  }

  getProfile(req, res) {
    this._userHandler.getUserProfile(req, this._responseManager.getDefaultResponseHandler(res));
  }

  create(req, res, next) {
    this._passport.authenticate('secret-key-auth', {
      onVerified: () => {
        this.validate(rules.createAccountRules(), req, res, next, () => {
          this._userHandler.createUserAccount(req, this._responseManager.getDefaultResponseHandler(res));
        });
      },
      onFailure: (error) => {
        this._responseManager.respondWithError(res, error.status || 401, error.message);
      }
    })(req, res, next);
  }

  update(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.validate(rules.updateAccountRules(), req, res, next, () => {
        this._userHandler.updateUserAccount(req, payload, this._responseManager.getDefaultResponseHandler(res));
      });
    });
  }

  updateProfile(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.#upload(req, res, next, () => {
        this.validate(rules.updateProfileRules(), req, res, next, () => {
          this._userHandler.updateUserProfile(req, payload, this._responseManager.getDefaultResponseHandler(res));
        });
      });
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
      onFailure: (error) => next(error)
    })(req, res, next);
  }

  validate(rules = [], req, res, next, callback) {
    this._validate(rules)(req, res, (error) => {
      return error
        ? next(error)
        : callback();
    });
  }

  #upload(req, res, next, callback) {
    this._upload.single('avatar')(req, res, (error) => {
      return error
        ? next(error)
        : callback();
    });
  }
}

export default UserController;