import { Router } from 'express';
import { upload } from '../../middlewares/multer.js';
import { validate } from '../../middlewares/validation/validator.js';

import rules from '../../middlewares/validation/comment.js'
import CommentController from '../../controller/comment.js';

const router = Router();
const commentController = new CommentController();

router.post('/:postId/:parentId?', validate(rules.createCommentRules), upload.single('image'), commentController.create);
router.get('/:postId', validate(rules.getCommentsRules), commentController.getAll);
router.put('/:postId/:id', validate(rules.updateCommentRules), upload.single('image'), commentController.update);
router.delete('/:postId/:id', validate(rules.deleteCommentRules), commentController.delete);

export { router as commentRouter };