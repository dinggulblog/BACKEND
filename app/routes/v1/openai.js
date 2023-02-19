import { Router } from 'express';
import OpenAIController from '../../controller/openai.js';

const router = Router();
const openaiController = new OpenAIController();

router.get('/stream/completions', openaiController.createCompletion);

export { router as openaiRouter };
