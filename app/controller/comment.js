import passport from 'passport'

import BaseController from './base.js';
import CommentHandler from '../handler/comment.js';

class CommentController extends BaseController {
  constructor() {
    super();
    this._commentHandler = new CommentHandler();
    this._passport = passport;
  }

  create(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this._commentHandler.createComment(req, payload, this._responseManager.getDefaultResponseHandler(res));
    });
  }

  getAll(req, res, next) {
    this._commentHandler.getComments(req, this._responseManager.getDefaultResponseHandler(res));
  }

  update(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this._commentHandler.updateComment(req, payload, this._responseManager.getDefaultResponseHandler(res));
    });
  }

  delete(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this._commentHandler.deleteComment(req, payload, this._responseManager.getDefaultResponseHandler(res));
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

export default CommentController;