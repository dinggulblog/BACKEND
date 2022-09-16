import { Router } from 'express';
import { verifyRole } from '../../middlewares/verify.js';
import CommentController from '../../controller/comment.js';

const router = Router();
const commentController = new CommentController();

router.get('/:postId', commentController.getAll);
router.post('/:postId/:parentId?', verifyRole('USER'), commentController.create);
router.put('/:postId/:id', verifyRole('USER'), commentController.update);
router.delete('/:postId/:id', verifyRole('USER'), commentController.delete);

export { router as commentRouter };