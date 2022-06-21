import { Router } from 'express';
import UserController from '../../controller/user.js';

const router = Router();
const userController = new UserController();

router.post('/', userController.create);
router.get('/:id', userController.get);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete);

export { router as userRouter };