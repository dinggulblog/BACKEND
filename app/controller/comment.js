import BaseController from './base.js';
import CommentHandler from '../handler/comment.js';
import rules from '../middlewares/validation/comment.js';

class CommentController extends BaseController {
  constructor() {
    super();
    this._commentHandler = new CommentHandler();
  }

  create(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.validate(rules.createCommentRules, req, res, () => {
        this._commentHandler.createComment(req, payload, this._responseManager.getDefaultResponseHandler(res));
      });
    });
  }

  get(req, res, next) {
    next(new Error('Not yet implemented.'));
  }

  getAll(req, res, next) {
    this.validate(rules.getCommentsRules, req, res, () => {
      this._commentHandler.getComments(req, this._responseManager.getDefaultResponseHandler(res));
    });
  }

  update(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.validate(rules.updateCommentRules, req, res, () => {
        this._commentHandler.updateComment(req, payload, this._responseManager.getDefaultResponseHandler(res));
      });
    });
  }

  delete(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.validate(rules.deleteCommentRules, req, res, () => {
        this._commentHandler.deleteComment(req, payload, this._responseManager.getDefaultResponseHandler(res));
      });
    });
  }
}

export default CommentController;
