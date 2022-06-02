import { Router } from 'express';
import UserController from '../../controller/user.js';

const router = Router();
const userController = new UserController();

router.post('/', userController.create);
router.get('/:nickname', userController.get);
router.put('/:nickname', userController.update);
router.delete('/:nickname', userController.delete);

export { router as userRouter };