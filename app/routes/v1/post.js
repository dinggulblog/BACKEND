import { Router } from 'express';
import { validate } from '../../middlewares/validation/validator.js'
import rules from '../../middlewares/validation/post.js'
import PostController from '../../controller/post.js';

const router = Router();
const postController = new PostController();

router.post('/', validate(rules.createPostRules), postController.create);
router.get('/', validate(rules.getPostsRules), postController.getAll);
router.get('/post', validate(rules.getPostRules), postController.get);
router.put('/:id', validate(rules.updatePostRules), postController.update);
router.put('/like/:id', validate(rules.checkPostIdRules), postController.updateLike);
router.delete('/:id', validate(rules.checkPostIdRules), postController.delete);
router.delete('/like/:id', validate(rules.checkPostIdRules), postController.deleteLike);

export { router as postRouter };