import BaseController from './base.js';
import rules from '../middlewares/validation/post.js';
import { PostHandler } from '../handler/post.js';
import { uploadS3 } from '../middlewares/multer.js';

class PostController extends BaseController {
  constructor() {
    super();
    this._postHandler = new PostHandler();
    this._upload = uploadS3;
  }

  create(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.verify(payload.roles, res, () => {
        this.validate(rules.createPostRules, req, res, () => {
          this._postHandler.createPost(req, payload, this._responseManager.getDefaultResponseHandler(res));
        });
      });
    });
  }

  get(req, res, next) {
    this._passport.authenticate('jwt-auth', {
      onVerified: (token, payload) => {
        this.validate(rules.getPostRules, req, res, () => {
          this._postHandler.getPost(req, payload, this._responseManager.getDefaultResponseHandlerError(res, ((data, message, code) => {
            const hateoasLinks = this.#getPostHATEOASLink(req.baseUrl, data?.post?.linkedPosts);
            this._responseManager.respondWithSuccess(res, code || this._responseManager.HTTP_STATUS.OK, data, message, hateoasLinks);
          })));
        });
      },
      onFailure: (error) => {
        this.validate(rules.getPostRules, req, res, () => {
          this._postHandler.getPost(req, null, this._responseManager.getDefaultResponseHandlerError(res, ((data, message, code) => {
            const hateoasLinks = this.#getPostHATEOASLink(req.baseUrl, data?.post?.linkedPosts);
            this._responseManager.respondWithSuccess(res, code || this._responseManager.HTTP_STATUS.OK, data, message, hateoasLinks);
          })));
        });
      }
    })(req, res, next);
  }

  getMany(req, res, next) {
    this._passport.authenticate('jwt-auth', {
      onVerified: (token, payload) => {
        this.validate(rules.getPostsRules, req, res, () => {
          this._postHandler.getPosts(req, payload, this._responseManager.getDefaultResponseHandler(res));
        });
      },
      onFailure: (error) => {
        this.validate(rules.getPostsRules, req, res, () => {
          this._postHandler.getPosts(req, null, this._responseManager.getDefaultResponseHandler(res));
        });
      }
    })(req, res, next);
  }

  getCounts(req, res, next) {
    this._postHandler.getCounts(req, this._responseManager.getDefaultResponseHandler(res));
  }

  update(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.verify(payload.roles, res, () => {
        this.#upload(req, res, () => {
          this.validate(rules.updatePostRules, req, res, () => {
            this._postHandler.updatePost(req, payload, this._responseManager.getDefaultResponseHandler(res));
          });
        });
      });
    });
  }

  updateLike(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.validate(rules.getPostRules, req, res, () => {
        this._postHandler.updatePostLike(req, payload, this._responseManager.getDefaultResponseHandler(res));
      });
    });
  }

  delete(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.verify(payload.roles, res, () => {
        this.validate(rules.getPostRules, req, res, () => {
          this._postHandler.deletePost(req, payload, this._responseManager.getDefaultResponseHandler(res));
        });
      });
    });
  }

  deleteLike(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.validate(rules.getPostRules, req, res, () => {
        this._postHandler.deletePostLike(req, payload, this._responseManager.getDefaultResponseHandler(res));
      });
    });
  }

  deleteFile(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.verify(payload.roles, res, () => {
        this.validate(rules.getPostRules, req, res, () => {
          this._postHandler.deletePostFile(req, payload, this._responseManager.getDefaultResponseHandler(res));
        });
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

  #getPostHATEOASLink(url, linkedPosts = []) {
    return linkedPosts.map(({ _id, rel }) => this._responseManager.generateHATEOASLink(url + `/${_id}`, 'GET', rel))
  }
}

export default PostController;
