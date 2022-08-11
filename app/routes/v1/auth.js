import { Router } from 'express';
import AuthController from '../../controller/auth.js';

const router = Router();
const authController = new AuthController();

router.post('/', authController.create);
router.post('/refresh', authController.update);
router.delete('/', authController.delete);

export { router as authRouter };