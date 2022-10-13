import { Router } from 'express';
import PostController from '../../controller/post.js';

const router = Router();
const postController = new PostController();

router.route('/')
  .get(postController.getAll)
  .post(postController.create);

router.route('/:id')
  .get(postController.get)
  .put(postController.update)
  .delete(postController.delete);

router.route('/:id/like')
  .put(postController.updateLike)
  .delete(postController.deleteLike);

router.delete('/:id/file', postController.deleteFile);

export { router as postRouter };