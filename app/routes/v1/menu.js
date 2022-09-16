import { Router } from 'express';
import { verifyRole } from '../../middlewares/verify.js';
import MenuController from '../../controller/menu.js';

const router = Router();
const menuController = new MenuController();

router.route('/')
  .get(menuController.getAll)
  .post(verifyRole('ADMIN'), menuController.create)
  .put(verifyRole('ADMIN'), menuController.update)
  .delete(verifyRole('ADMIN'), menuController.delete);

export { router as menuRouter };