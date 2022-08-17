import { Router } from 'express';
import { upload } from '../../middlewares/multer.js';
import { validate } from '../../middlewares/validation/validator.js'
import rules from '../../middlewares/validation/draft.js'
import DraftController from '../../controller/draft.js';

const router = Router();
const draftController = new DraftController();

router.post('/', validate(), draftController.create);
router.get('/:id', validate(), draftController.get);
router.put('/:id', validate(), upload.array('images'), draftController.update);
router.delete('/:id', validate(), draftController.delete);
router.delete('/:id/file', validate(), draftController.deleteFile);

export { router as draftRouter };