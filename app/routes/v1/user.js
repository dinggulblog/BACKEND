import { Router } from 'express';
import { upload } from '../../middlewares/multer.js';
import { validate } from '../../middlewares/validation/validator.js'
import rules from '../../middlewares/validation/user.js'
import UserController from '../../controller/user.js';

const router = Router();
const userController = new UserController();

router.post('/account', validate(rules.createAccountRules), userController.create);
router.get('/account', userController.get);
router.put('/account', validate(rules.updateAccountRules), userController.update);
router.delete('/account', userController.delete);

router.get('/profile/:nickname', userController.getProfile);
router.put('/profile', upload.single('avatar'), userController.updateProfile);

export { router as userRouter };