import { Router } from 'express';
import { authRouter } from './auth.js';
import { userRouter } from './user.js';
import { menuRouter } from './menu.js';
import { postRouter } from './post.js';
import { draftRouter } from './draft.js';
import { commentRouter } from './comment.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/menus', menuRouter);
router.use('/posts', postRouter);
router.use('/drafts', draftRouter);
router.use('/comments', commentRouter);

export { router as indexRouter };