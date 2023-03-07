import BaseController from './base.js';
import MailHandler from '../handler/mail.js';
import rules from '../middlewares/validation/mail.js';

class MailController extends BaseController {
  constructor() {
    super();
    this._mailHandler = new MailHandler();
  }

  get(req, res, next) {
    next(new Error('Not yet implemented.'));
  }

  getAll(req, res, next) {
    next(new Error('Not yet implemented.'));
  }

  create(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.validate(rules.createFormRules, req, res, () => {
        this._mailHandler.createMail(req, this._responseManager.getDefaultResponseHandler(res));
      });
    });
  }

  createCode(req, res, next) {
    this.validate(rules.createCodeRules, req, res, () => {
      this._mailHandler.createCode(req, this._responseManager.getDefaultResponseHandler(res));
    });
  }

  update(req, res, next) {
    next(new Error('Not yet implemented.'));
  }

  delete(req, res, next) {
    next(new Error('Not yet implemented.'));
  }
}

export default MailController;
