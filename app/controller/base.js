import passport from 'passport';

import { validator } from '../middlewares/validator.js';
import { verify } from '../middlewares/verify.js';
import BaseAutoBindedClass from '../base/autobind.js';
import ResponseManager from '../manager/response.js';

class BaseController extends BaseAutoBindedClass {
  constructor() {
    super();
    if (new.target === BaseController) throw new TypeError('Cannot construct BaseController instances directly');
    this._responseManager = ResponseManager;
    this._passport = passport;
  }

  // CRUD methods
  create(req, res) {

  }

  get(req, res) {

  }

  update(req, res) {

  }

  delete(req, res) {

  }

  /**
   * Base: JWT authentication
   * If you need to use a different passport authentication(ex-credentials-auth), override it in your controller
   * @param {Request} req
   * @param {Response} res
   * @param {Function} next
   * @param {Function} callback
   */
  authenticate(req, res, next, callback) {
    this._passport.authenticate('jwt-auth', {
      onVerified: callback,
      onFailure: (error) => this._responseManager.respondWithError(res, error.status ?? 419, error.message)
    })(req, res, next);
  }

  /**
   * A method that verifies permission to access the database in the JWT payload
   * @param {Array} roles An array with roles in JWT payload
   * @param {Response} res
   * @param {Function} callback
   */
  verify(roles, res, callback) {
    verify(roles, 'ADMIN', (error) => {
      return error
        ? this._responseManager.respondWithError(res, error.status ?? 403, error.message)
        : callback();
    });
  }

  /**
   * A method that validate the request format using Express-validator
   * @param {Array} rules An array with schemas
   * @param {Request} req
   * @param {Response} res
   * @param {Function} callback
   */
  validate(rules, req, res, callback) {
    validator(rules, req, (error) => {
      return error
        ? this._responseManager.respondWithError(res, error.status ?? 422, error.message)
        : callback();
    });
  }
}

export default BaseController;
