import { Router } from 'express';
import { upload } from '../../middlewares/multer.js';
import { validate } from '../../middlewares/validation/validator.js'
import rules from '../../middlewares/validation/draft.js'
import DraftController from '../../controller/draft.js';

const router = Router();
const draftController = new DraftController();

router.post('/', draftController.create);
router.get('/:id', draftController.get);
router.put('/:id', upload.array('images'), draftController.update);
router.delete('/:id', draftController.delete);
router.delete('/:id/file', draftController.deleteFile);

export { router as draftRouter };