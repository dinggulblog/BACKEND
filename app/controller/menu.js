import BaseController from './base.js';
import MenuHandler from '../handler/menu.js';
import rules from '../middlewares/validation/menu.js';

class MenuController extends BaseController {
  constructor() {
    super();
    this._menuHandler = new MenuHandler();
  }

  get(req, res, next) {
    next(new Error('Not yet implemented.'));
  }

  getAll(req, res, next) {
    this._menuHandler.getMenus(req, this._responseManager.getDefaultResponseHandler(res));
  }

  create(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.validate(rules.createMenuRoles(), req, res, next, () => {
        this._menuHandler.createMenu(req, payload, this._responseManager.getDefaultResponseHandler(res));
      });
    });
  }

  update(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.validate(rules.updateMenuRoles(), req, res, next, () => {
        this._menuHandler.updateMenu(req, payload, this._responseManager.getDefaultResponseHandler(res));
      });
    });
  }

  delete(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.validate(rules.deleteMenuRoles(), req, res, next, () => {
        this._menuHandler.deleteMenu(req, payload, this._responseManager.getDefaultResponseHandler(res));
      });
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
}

export default MenuController;