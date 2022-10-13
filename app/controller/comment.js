import { upload } from '../middlewares/multer.js';
import rules from '../middlewares/validation/comment.js';

import BaseController from './base.js';
import CommentHandler from '../handler/comment.js';

class CommentController extends BaseController {
  constructor() {
    super();
    this._commentHandler = new CommentHandler();
    this._upload = upload;
  }

  get(req, res, next) {
    next(new Error('Not yet implemented.'));
  }

  getAll(req, res, next) {
    this.validate(rules.getCommentsRules, req, res, next, () => {
      this._commentHandler.getComments(req, this._responseManager.getDefaultResponseHandler(res));
    });
  }

  create(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.#upload(req, res, next, () => {
        this.validate(rules.createCommentRules, req, res, next, () => {
          this._commentHandler.createComment(req, payload, this._responseManager.getDefaultResponseHandler(res));
        });
      });
    });
  }

  update(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.#upload(req, res, next, () => {
        this.validate(rules.updateCommentRules, req, res, next, () => {
          this._commentHandler.updateComment(req, payload, this._responseManager.getDefaultResponseHandler(res));
        });
      });
    });
  }

  delete(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.validate(rules.deleteCommentRules, req, res, next, () => {
        this._commentHandler.deleteComment(req, payload, this._responseManager.getDefaultResponseHandler(res));
      });
    });
  }

  #upload(req, res, next, callback) {
    this._upload.single('image')(req, res, (error) => {
      return error
        ? this._responseManager.respondWithError(res, error.status ?? 400, error.message)
        : callback();
    });
  }
}

export default CommentController;