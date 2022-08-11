import passport from 'passport'

import BaseController from './base.js';
import PostHandler from '../handler/post.js';

class PostController extends BaseController {
  constructor() {
    super();
    this._postHandler = new PostHandler();
    this._passport = passport;
  }

  create(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this._postHandler.createPost(req, payload, this._responseManager.getDefaultResponseHandler(res));
    });
  }

  getAll(req, res) {
    this._postHandler.getPosts(req, this._responseManager.getDefaultResponseHandler(res));
  }

  getAllWithFiler(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this._postHandler.getPostsWithFilter(req, payload, this._responseManager.getDefaultResponseHandler(res));
    });
  }

  get(req, res) {
    this._postHandler.getPost(req, this._responseManager.getDefaultResponseHandlerError(res, ((data, message, code) => {
      // const hateosLinks = [this._responseManager.generateHATEOASLink(req.baseUrl + '/:id', 'GET', 'single')];
      this._responseManager.respondWithSuccess(res, code || this._responseManager.HTTP_STATUS.OK, data, message);
    })));
  }

  update(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this._postHandler.updatePost(req, payload, this._responseManager.getDefaultResponseHandler(res));
    });
  }

  updateLike(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this._postHandler.updatePostLike(req, payload, this._responseManager.getDefaultResponseHandler(res));
    });
  }

  delete(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this._postHandler.deletePost(req, payload, this._responseManager.getDefaultResponseHandler(res));
    });
  }

  deleteLike(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this._postHandler.deletePostLike(req, payload, this._responseManager.getDefaultResponseHandler(res));
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

export default PostController;