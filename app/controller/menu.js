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
      this.verify(payload.roles, res, () => {
        this.validate(rules.createMenuRules, req, res, () => {
          this._menuHandler.createMenu(req, this._responseManager.getDefaultResponseHandler(res));
        });
      });
    });
  }

  update(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.verify(payload.roles, res, () => {
        this.validate(rules.updateMenuRules, req, res, () => {
          this._menuHandler.updateMenu(req, this._responseManager.getDefaultResponseHandler(res));
        });
      });
    });
  }

  delete(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.verify(payload.roles, res, () => {
        this.validate(rules.deleteMenuRules, req, res, () => {
          this._menuHandler.deleteMenu(req, payload, this._responseManager.getDefaultResponseHandler(res));
        });
      });
    });
  }
}

export default MenuController;
