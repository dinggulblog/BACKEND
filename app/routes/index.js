import { Router } from 'express';
import { indexRouter } from './v1/index.js';

const router = Router();

// API of v1
router.use('/v1', indexRouter);

// API to get XSRF Token
router.get('/xsrf-token', (req, res, next) => res.status(200).json({ success: false, message: '', data: { xsrfToken: res.locals.csrf } }));

export default router;
