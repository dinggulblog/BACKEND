import passport from 'passport'

import BaseController from './base.js';
import DraftHandler from '../handler/draft.js';

class DraftController extends BaseController {
  constructor() {
    super();
    this.#draftHandler = new DraftHandler();
    this.#passport = passport;
  }

  create(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.#draftHandler.createDraft(req, payload, this._responseManager.getDefaultResponseHandler(res));
    });
  }

  get(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.#draftHandler.getDraft(req, payload, this._responseManager.getDefaultResponseHandler(res));
    });
  }

  update(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.#draftHandler.updateDraft(req, payload, this._responseManager.getDefaultResponseHandler(res));
    });
  }

  delete(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.#draftHandler.deleteDraft(req, payload, this._responseManager.getDefaultResponseHandler(res));
    });
  }

  deleteFile(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.#draftHandler.deleteDraftFile(req, payload, this._responseManager.getDefaultResponseHandler(res));
    })
  }

  authenticate(req, res, next, callback) {
    this.#passport.authenticate('jwt-auth', {
      onVerified: callback,
      onFailure: (error) => {
        this._responseManager.respondWithError(res, error.status || 401, error.message);
      }
    })(req, res, next);
  }
}

export default DraftController;