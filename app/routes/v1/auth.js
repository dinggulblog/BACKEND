import { Router } from 'express';
import AuthController from '../../controller/auth.js';

const router = Router();
const authController = new AuthController();

router.post('/', authController.create);
router.delete('/:token', authController.remove);

export { router as authRouter };