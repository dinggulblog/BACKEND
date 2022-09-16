import { Router } from 'express';
import { verifyRole } from '../../middlewares/verify.js';
import PostController from '../../controller/post.js';

const router = Router();
const postController = new PostController();

router.route('/')
  .get(postController.getAll)
  .post(verifyRole('ADMIN'), postController.create);

router.route('/:id')
  .get(postController.get)
  .put(verifyRole('ADMIN'), postController.update)
  .delete(verifyRole('ADMIN'), postController.delete);

router.route('/:id/like')
  .put(verifyRole('USER'), postController.updateLike)
  .delete(verifyRole('USER'), postController.deleteLike);

router.delete('/:id/file', verifyRole('ADMIN'), postController.deleteFile);

export { router as postRouter };