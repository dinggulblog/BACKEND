import BaseController from './base.js';
import UserHandler from '../handler/user.js';
import rules from '../middlewares/validation/user.js';
import { upload, uploadS3 } from '../middlewares/multer.js';

class UserController extends BaseController {
  constructor() {
    super();
    this._userHandler = new UserHandler();
    this._upload = process.env.NODE_ENV === 'develop' ? upload : uploadS3;
  }

  create(req, res, next) {
    this._passport.authenticate('secret-key-auth', {
      onVerified: () => {
        this.validate(rules.createAccountRules, req, res, () => {
          this._userHandler.createAccount(req, this._responseManager.getDefaultResponseHandler(res));
        });
      },
      onFailure: (error) => {
        this._responseManager.respondWithError(res, error.status ?? 400, error.message);
      }
    })(req, res, next);
  }

  createResetLink(req, res, next) {
    this.validate(rules.getAccountRules, req, res, () => {
      this._userHandler.createAccountLink(req, this._responseManager.getDefaultResponseHandler(res));
    });
  }

  get(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this._userHandler.getAccount(req, payload, this._responseManager.getDefaultResponseHandler(res));
    });
  }

  getProfile(req, res) {
    this._userHandler.getProfile(req, this._responseManager.getDefaultResponseHandler(res));
  }

  update(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.validate(rules.updateAccountRules, req, res, () => {
        this._userHandler.updateAccount(req, payload, this._responseManager.getDefaultResponseHandler(res));
      });
    });
  }

  updateUsingCode(req, res) {
    this.validate(rules.updateAccountCodeRules, req, res, () => {
      this._userHandler.updateAccountUsingCode(req, this._responseManager.getDefaultResponseHandler(res));
    });
  }

  updateProfile(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.validate(rules.updateProfileRules, req, res, () => {
        this._userHandler.updateProfile(req, payload, this._responseManager.getDefaultResponseHandler(res));
      });
    });
  }

  updateProfileAvatar(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.#upload(req, res, () => {
        this._userHandler.updateProfileAvatar(req, payload, this._responseManager.getDefaultResponseHandler(res));
      });
    });
  }

  delete(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this._userHandler.deleteAccount(req, payload, this._responseManager.getDefaultResponseHandler(res));
    });
  }

  deleteProfileAvatar(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this._userHandler.deleteProfileAvatar(req, payload, this._responseManager.getDefaultResponseHandler(res));
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
