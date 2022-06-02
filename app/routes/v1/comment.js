import { Router } from 'express';
import CommentController from '../../controller/comment.js';

const router = Router();
const commentController = new CommentController();

router.post('/:pid', commentController.create);
router.get('/:pid', commentController.getAll);
router.put('/:pid/:cid', commentController.update);
router.delete('/:pid/:cid', commentController.delete);

export { router as commentRouter };