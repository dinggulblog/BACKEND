import { Router } from 'express';
import FileController from '../../controller/file.js';

const router = Router();
const fileController = new FileController();

router.route('/')
  .post(fileController.create);

router.route('/:fileId')
  .get(fileController.get)
  .put(fileController.update)
  .delete(fileController.delete);

router.route('/many')
  .post(fileController.createMany);

router.route('/many/:belongingId')
  .get(fileController.getMany)
  .put(fileController.updateMany)
  .delete(fileController.deleteMany);

export { router as fileRouter };
