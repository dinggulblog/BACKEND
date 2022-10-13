import { Router } from 'express';
import DraftController from '../../controller/draft.js';

const router = Router();
const draftController = new DraftController();

router.route('/')
  .get(draftController.get)
  .post(draftController.create);

router.route('/:id')
  .put(draftController.update)
  .delete(draftController.delete);

router.delete('/:id/file', draftController.deleteFile);

export { router as draftRouter };