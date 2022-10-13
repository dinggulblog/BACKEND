import passport from 'passport';

import { validator } from '../middlewares/validation/validator.js';
import { verify } from '../middlewares/verify.js';
import BaseAutoBindedClass from '../base/autobind.js';
import ResponseManager from '../manager/response.js';

class BaseController extends BaseAutoBindedClass {
  constructor() {
    super();
    if (new.target === BaseController) throw new TypeError('Cannot construct BaseController instances directly');
    this._responseManager = ResponseManager;
    this._passport = passport;
    this._validate = validator;
    this._verify = verify;
  }

  get(req, res) {

  }

  create(req, res) {

  }

  update(req, res) {

  }

  delete(req, res) {

  }

  authenticate(req, res, next, callback) {
    this._passport.authenticate('jwt-auth', {
      onVerified: callback,
      onFailure: (error) => this._responseManager.respondWithError(res, error.status ?? 419, error.message)
    })(req, res, next);
  }
  
  verify(roles, res, callback) {
    this._verify(roles, 'ADMIN', (error) => {
      return error
        ? this._responseManager.respondWithError(res, error.status ?? 403, error.message)
        : callback();
    });
  }

  validate(rules, req, res, callback) {
    this._validate(rules, req, (error) => {
      return error
        ? this._responseManager.respondWithError(res, error.status ?? 422, error.message)
        : callback();
    });
  }
}

export default BaseController;