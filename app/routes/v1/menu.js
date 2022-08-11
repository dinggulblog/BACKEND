import { Router } from 'express';
import { validate } from '../../middlewares/validation/validator.js'
import rules from '../../middlewares/validation/menu.js'
import MenuController from '../../controller/menu.js';

const router = Router();
const menuController = new MenuController();

router.post('/', validate(rules.createMenuRoles), menuController.create)
router.get('/', menuController.getAll);
router.put('/', validate(rules.updateMenuRoles), menuController.update);
router.delete('/', validate(rules.deleteMenuRoles), menuController.delete);

export { router as menuRouter };