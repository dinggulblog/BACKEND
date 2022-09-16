import { upload } from '../middlewares/multer.js';

import BaseController from './base.js';
import DraftHandler from '../handler/draft.js';

class DraftController extends BaseController {
  constructor() {
    super();
    this._draftHandler = new DraftHandler();
    this._upload = upload;
  }

  get(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this._draftHandler.getDraft(req, payload, this._responseManager.getDefaultResponseHandler(res));
    });
  }

  getAll(req, res, next) {
    next(new Error('Not yet implemented.'));
  }

  create(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this._draftHandler.createDraft(req, payload, this._responseManager.getDefaultResponseHandler(res));
    });
  }

  update(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.#upload(req, res, next, () => {
        this._draftHandler.updateDraft(req, payload, this._responseManager.getDefaultResponseHandler(res));
      });
    });
  }

  delete(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this._draftHandler.deleteDraft(req, payload, this._responseManager.getDefaultResponseHandler(res));
    });
  }

  deleteFile(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this._draftHandler.deleteDraftFile(req, payload, this._responseManager.getDefaultResponseHandler(res));
    })
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

  #upload(req, res, next, callback) {
    this._upload.array('images', 32)(req, res, (error) => {
      return error
        ? next(error)
        : callback();
    });
  }
}

export default DraftController;