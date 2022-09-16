import { upload } from '../middlewares/multer.js';
import rules from '../middlewares/validation/post.js';

import BaseController from './base.js';
import PostHandler from '../handler/post.js';

class PostController extends BaseController {
  constructor() {
    super();
    this._postHandler = new PostHandler();
    this._upload = upload;
  }

  get(req, res, next) {
    this.validate(rules.getPostRules(), req, res, next, () => {
      this._postHandler.getPost(req, this._responseManager.getDefaultResponseHandler(res));
    });
  }

  getAll(req, res, next) {
    this.validate(rules.getPostsRules(), req, res, next, () => {
      this._postHandler.getPosts(req, this._responseManager.getDefaultResponseHandler(res));
    });
  }

  create(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.validate(rules.createPostRules(), req, res, next, () => {
        this._postHandler.createPost(req, payload, this._responseManager.getDefaultResponseHandler(res));
      });
    });
  }

  update(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.#upload(req, res, next, () => {
        this.validate(rules.updatePostRules(), req, res, next, () => {
          this._postHandler.updatePost(req, payload, this._responseManager.getDefaultResponseHandler(res));
        });
      });
    });
  }

  updateLike(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.validate(rules.getPostRules(), req, res, next, () => {
        this._postHandler.updatePostLike(req, payload, this._responseManager.getDefaultResponseHandler(res));
      });
    });
  }

  delete(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.validate(rules.getPostRules(), req, res, next, () => {
        this._postHandler.deletePost(req, payload, this._responseManager.getDefaultResponseHandler(res));
      });
    });
  }

  deleteLike(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.validate(rules.getPostRules(), req, res, next, () => {
        this._postHandler.deletePostLike(req, payload, this._responseManager.getDefaultResponseHandler(res));
      });
    });
  }

  deleteFile(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.validate(rules.getPostRules(), req, res, next, () => {
        this._postHandler.deletePostFile(req, payload, this._responseManager.getDefaultResponseHandler(res));
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
    this._upload.array('images', 32)(req, res, (error) => {
      return error
        ? next(error)
        : callback();
    });
  }
}

export default PostController;