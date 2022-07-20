import { Router } from 'express';
import PostController from '../../controller/post.js';

const router = Router();
const postController = new PostController();

router.post('/', postController.create);
router.get('/', postController.getAll);
router.get('/post', postController.get);
router.put('/:id', postController.update);
router.put('/:id', postController.updateLikes);
router.delete('/:id', postController.delete);
router.delete('/:id', postController.deleteLikes);

export { router as postRouter };