import { Router } from 'express';
import OpenAIController from '../../controller/openai.js';

const router = Router();
const openaiController = new OpenAIController();

router.route('/completions')
  .post(openaiController.createCompletion);

export { router as openaiRouter };
