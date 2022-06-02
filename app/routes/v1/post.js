import { Router } from 'express';
import PostController from '../../controller/post.js';

const router = Router();
const postController = new PostController();

router.post('/', postController.create);
router.get('/', postController.getAll);
router.get('/:id', postController.get);
router.put('/:id', postController.update);
router.delete('/:id', postController.delete);

export { router as postRouter };