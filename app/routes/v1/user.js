import { Router } from 'express';
import UserController from '../../controller/user.js';

const router = Router();
const userController = new UserController();

router.post('/', userController.create);
router.get('/me', userController.get);
router.put('/me', userController.update);
router.delete('/me', userController.delete);

export { router as userRouter };