import { Router } from 'express';
import UserController from '../../controller/user.js';

const router = Router();
const userController = new UserController();

router.route('/account')
  .get(userController.get)
  .post(userController.create)
  .put(userController.update)
  .delete(userController.delete);

router.route('/account/:email/reset')
  .post(userController.createResetLink)
  .put(userController.updateUsingCode);

router.route('/profile/:nickname')
  .get(userController.getProfile)
  .put(userController.updateProfile);

router.route('/profile/:nickname/avatar')
  .put(userController.updateProfileAvatar)
  .delete(userController.deleteProfileAvatar);

export { router as userRouter };
