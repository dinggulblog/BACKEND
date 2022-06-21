import { Router } from 'express';
import MenuController from '../../controller/menu.js';

const router = Router();
const menuController = new MenuController();

router.post('/', menuController.create)
router.get('/', menuController.getAll);
router.put('/', menuController.update);
router.delete('/', menuController.delete);

export { router as menuRouter };