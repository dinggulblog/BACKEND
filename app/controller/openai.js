import BaseController from './base.js';
import OpenAIHandler from '../handler/openai.js';
import rules from '../middlewares/validation/openai.js';

class OpenAIController extends BaseController {
  constructor() {
    super();
    this._openAIHandler = new OpenAIHandler();
  }

  createCompletion(req, res, next) {
    this.authenticate(req, res, next, (token, payload) => {
      this.verify(payload.roles, res, () => {
        this.validate(rules.createCompletionRules, req, res, () => {
          this._openAIHandler.createCompletion(req, res, payload, this._responseManager.getEndResponseHandler(res));
        });
      });
    });
  }
}

export default OpenAIController;
