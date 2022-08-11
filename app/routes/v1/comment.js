import { Router } from 'express';
import { validate } from '../../middlewares/validation/validator.js'
import rules from '../../middlewares/validation/comment.js'
import CommentController from '../../controller/comment.js';

const router = Router();
const commentController = new CommentController();

router.post('/:postId/:parentId?', validate(rules.createCommentRules), commentController.create);
router.get('/:postId', validate(rules.getCommentsRules), commentController.getAll);
router.put('/:postId/:id', validate(rules.updateCommentRules), commentController.update);
router.delete('/:postId/:id', validate(rules.deleteCommentRules), commentController.delete);

export { router as commentRouter };