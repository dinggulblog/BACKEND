import { Router } from 'express';
import AuthController from '../../controller/auth.js';

const router = Router();
const authController = new AuthController();

router.route('/')
  .post(authController.create)
  .put(authController.update)
  .delete(authController.delete);

export { router as authRouter };
