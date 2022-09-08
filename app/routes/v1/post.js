import { Router } from 'express';
import { upload } from '../../middlewares/multer.js';
import { validate } from '../../middlewares/validation/validator.js'
import rules from '../../middlewares/validation/post.js'
import PostController from '../../controller/post.js';

const router = Router();
const postController = new PostController();

router.post('/', validate(rules.createPostRules), postController.create);
router.get('/', validate(rules.getPostsRules), postController.getAll);
router.get('/:id', validate(rules.getPostRules), postController.get);
router.put('/:id', validate(rules.updatePostRules),  postController.update);
router.put('/:id/files', validate(rules.getPostRules), upload.array('images'), postController.updateFiles);
router.put('/:id/like', validate(rules.getPostRules), postController.updateLike);
router.delete('/:id', validate(rules.getPostRules), postController.delete);
router.delete('/:id/file', validate(rules.getPostRules), postController.deleteFile);
router.delete('/:id/like', validate(rules.getPostRules), postController.deleteLike);

export { router as postRouter };