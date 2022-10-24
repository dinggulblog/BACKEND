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
  
  create(req, res, next) {
    this._passport.authenticate('secret-key-auth', {
      onVerified: () => {
        this.validate(rules.createAccountRules, req, res, () => {
          this._userHandler.createUserAccount(req, this._responseManager.getDefaultResponseHandler(res));
        });
      },
      onFailure: (error) => {
        this._responseManager.respondWithError(res, error.status ?? 400, error.message);
      }
    })(req, res, next);
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
      this.validate(rules.updateAccountRules, req, res, () => {
        this._userHandler.updateUserAccount(req, payload, this._responseManager.getDefaultResponseHandler(res));
      });
    });
  }

  updateProfile(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.validate(rules.updateProfileRules, req, res, () => {
        this._userHandler.updateUserProfile(req, payload, this._responseManager.getDefaultResponseHandler(res));
      });
    });
  }

  updateProfileAvatar(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.#upload(req, res, () => {
        this._userHandler.updateUserProfileAvatar(req, payload, this._responseManager.getDefaultResponseHandler(res));
      });
    });
  }

  delete(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this._userHandler.deleteUserAccount(req, payload, this._responseManager.getDefaultResponseHandler(res));
    });
  }

  deleteProfileAvatar(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this._userHandler.deleteUserProfileAvatar(req, payload, this._responseManager.getDefaultResponseHandler(res));
    });
  }

  #upload(req, res, callback) {
    this._upload.single('avatar')(req, res, (error) => {
      return error
        ? this._responseManager.respondWithError(res, error.status ?? 403, error.message)
        : callback();
    });
  }
}

export default UserController;