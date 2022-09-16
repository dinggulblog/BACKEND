import { Router } from 'express';
import { verifyRole } from '../../middlewares/verify.js';
import DraftController from '../../controller/draft.js';

const router = Router();
const draftController = new DraftController();

router.route('/')
  .get(verifyRole('ADMIN'), draftController.get)
  .post(verifyRole('ADMIN'), draftController.create);

router.route('/:id')
  .put(verifyRole('ADMIN'), draftController.update)
  .delete(verifyRole('ADMIN'), draftController.delete);

router.delete('/:id/file', verifyRole('ADMIN'), draftController.deleteFile);

export { router as draftRouter };