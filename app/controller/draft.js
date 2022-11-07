import BaseController from './base.js';
import DraftHandler from '../handler/draft.js';
import { upload } from '../middlewares/multer.js';

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
      this.verify(payload.roles, res, () => {
        this._draftHandler.createDraft(req, payload, this._responseManager.getDefaultResponseHandler(res));
      });
    });
  }

  update(req, res, next) {
    
    this.authenticate(req, res, next, (token, payload) => {
      this.verify(payload.roles, res, () => {
        this.#upload(req, res, () => {
          this._draftHandler.updateDraft(req, payload, this._responseManager.getDefaultResponseHandler(res));
        });
      });
    });
  }

  delete(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.verify(payload.roles, res, () => {
        this._draftHandler.deleteDraft(req, payload, this._responseManager.getDefaultResponseHandler(res));
      });
    });
  }

  deleteFile(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.verify(payload.roles, res, () => {
        this._draftHandler.deleteDraftFile(req, payload, this._responseManager.getDefaultResponseHandler(res));
      });
    });
  }

  #upload(req, res, callback) {
    this._upload.array('images', 32)(req, res, (error) => {
      return error
        ? this._responseManager.respondWithError(res, error.status ?? 400, error.message)
        : callback();
    });
  }
}

export default DraftController;