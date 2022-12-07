import { Router } from 'express';
import MenuController from '../../controller/menu.js';

const router = Router();
const menuController = new MenuController();

router.route('/')
  .get(menuController.getAll)
  .post(menuController.create);

router.route('/:id')
  .put(menuController.update)
  .delete(menuController.delete);

export { router as menuRouter };
