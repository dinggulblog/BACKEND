import { Router } from 'express';
import { indexRouter } from './v1/index.js';

const router = Router();

// API of v1
router.use('/v1', indexRouter);

export default router;
