import ResponseManager from '../manager/response.js';
import BaseAutoBindedClass from '../base/autobind.js';

class BaseController extends BaseAutoBindedClass {
  constructor() {
    super();
    if (new.target === BaseController) {
      throw new TypeError('Cannot construct BaseController instances directly');
    }
    this._responseManager = ResponseManager;
  }

  create(req, res) {

  }

  getAll(req, res) {

  }

  get(req, res) {

  }

  update(req, res) {

  }

  delete(req, res) {

  }

  authenticate(req, res, callback) {

  }
}

export default BaseController;