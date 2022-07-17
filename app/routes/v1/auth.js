import { Router } from 'express';
import AuthController from '../../controller/auth.js';

const router = Router();
const authController = new AuthController();

router.post('/', authController.create);
router.post('/refresh', authController.refresh);
router.delete('/me', authController.remove);

export { router as authRouter };