import { Router } from 'express';
import CommentController from '../../controller/comment.js';

const router = Router();
const commentController = new CommentController();

router.get('/:postId', commentController.getAll);
router.post('/:postId', commentController.create);
router.put('/:postId/:id', commentController.update);
router.delete('/:postId/:id', commentController.delete);

export { router as commentRouter };
