import passport from 'passport'

import BaseController from './base.js';
import MenuHandler from '../handler/menu.js';

class MenuController extends BaseController {
  constructor() {
    super();
    this._menuHandler = new MenuHandler();
    this._passport = passport;
  }

  create(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this._menuHandler.createMenu(req, payload, this._responseManager.getDefaultResponseHandler(res));
    });
  }

  getAll(req, res, next) {
    this._menuHandler.getMenus(req, this._responseManager.getDefaultResponseHandler(res));
  }

  update(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this._menuHandler.updateMenu(req, payload, this._responseManager.getDefaultResponseHandler(res));
    });
  }

  delete(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this._menuHandler.deleteMenu(req, payload, this._responseManager.getDefaultResponseHandler(res));
    });
  }

  authenticate(req, res, next, callback) {
    this._passport.authenticate('jwt-auth', {
      onVerified: callback,
      onFailure: (error) => {
        this._responseManager.respondWithError(res, error.status || 401, error.message);
      }
    })(req, res, next);
  }
}

export default MenuController;