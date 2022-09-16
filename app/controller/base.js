import passport from 'passport';
import { validator } from '../middlewares/validation/validator.js';

import ResponseManager from '../manager/response.js';
import BaseAutoBindedClass from '../base/autobind.js';

class BaseController extends BaseAutoBindedClass {
  constructor() {
    super();
    if (new.target === BaseController) {
      throw new TypeError('Cannot construct BaseController instances directly');
    }
    this._responseManager = ResponseManager;
    this._passport = passport;
    this._validate = validator;
  }

  get(req, res) {

  }

  getAll(req, res) {

  }

  create(req, res) {

  }

  update(req, res) {

  }

  delete(req, res) {

  }

  authenticate(req, res, callback) {

  }

  validate(rules, req, res, callback) {

  }
}

export default BaseController;