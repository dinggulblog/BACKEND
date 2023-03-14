import BaseController from './base.js';
import FileHandler from '../handler/file.js';
import rules from '../middlewares/validation/file.js';
import { uploadS3 } from '../middlewares/multer.js';

class FileController extends BaseController {
  constructor() {
    super();
    this._fileHandler = new FileHandler();
    this._upload = uploadS3;
  }

  create(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.#upload(req, res, () => {
        this.validate(rules.createFileRules, req, res, () => {
          this._fileHandler.createFile(req, payload, this._responseManager.getDefaultResponseHandler(res));
        });
      });
    });
  }

  createMany(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.#uploadArray(req, res, () => {
        this.validate(rules.createFilesRules, req, res, () => {
          this._fileHandler.createFiles(req, payload, this._responseManager.getDefaultResponseHandler(res));
        });
      });
    });
  }

  get(req, res, next) {
    next(new Error('Not yet implemented.'));
  }

  getMany(req, res, next) {
    next(new Error('Not yet implemented.'));
  }

  update(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.#upload(req, res, () => {
        this.validate(rules.updateFileRules, req, res, () => {
          this._fileHandler.updateFile(req, payload, this._responseManager.getDefaultResponseHandler(res));
        });
      });
    });
  }

  updateMany(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.#uploadArray(req, res, () => {
        this.validate(rules.updateFilesRules, req, res, () => {
          this._fileHandler.updateFiles(req, payload, this._responseManager.getDefaultResponseHandler(res));
        });
      });
    });
  }

  delete(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.validate(rules.deleteFileRules, req, res, () => {
        this._fileHandler.deleteFile(req, payload, this._responseManager.getDefaultResponseHandler(res));
      });
    });
  }

  deleteMany(req, res, next) {
    next(new Error('Not yet implemented.'));
  }

  #upload(req, res, callback) {
    this._upload.single('avatar')(req, res, (error) => {
      return error
        ? this._responseManager.respondWithError(res, error.status ?? 433, error.message)
        : callback();
    });
  }

  #uploadArray(req, res, callback) {
    this._upload.array('images', 32)(req, res, (error) => {
      return error
        ? this._responseManager.respondWithError(res, error.status ?? 433, error.message)
        : callback();
    });
  }
}

export default FileController;
