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
    this.validate(rules.getCommentsRules(), req, res, next, () => {
      this._commentHandler.getComments(req, this._responseManager.getDefaultResponseHandler(res));
    });
  }

  create(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.#upload(req, res, next, () => {
        this.validate(rules.createCommentRules(), req, res, next, () => {
          this._commentHandler.createComment(req, payload, this._responseManager.getDefaultResponseHandler(res));
        });
      });
    });
  }

  update(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.#upload(req, res, next, () => {
        this.validate(rules.updateCommentRules(), req, res, next, () => {
          this._commentHandler.updateComment(req, payload, this._responseManager.getDefaultResponseHandler(res));
        });
      });
    });
  }

  delete(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.validate(rules.deleteCommentRules(), req, res, next, () => {
        this._commentHandler.deleteComment(req, payload, this._responseManager.getDefaultResponseHandler(res));
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

  #upload(req, res, next, callback) {
    this._upload.single('image')(req, res, (error) => {
      return error
        ? next(error)
        : callback();
    });
  }
}

export default CommentController;