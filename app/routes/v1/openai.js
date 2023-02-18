import { Router } from 'express';
import OpenAIController from '../../controller/openai.js';

const router = Router();
const openaiController = new OpenAIController();

router.post('/stream/completions', openaiController.createCompletion);

export { router as openaiRouter };
