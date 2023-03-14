import { Router } from 'express';
import { authRouter } from './auth.js';
import { mailRouter } from './mail.js';
import { menuRouter } from './menu.js';
import { fileRouter } from './file.js';
import { userRouter } from './user.js';
import { postRouter } from './post.js';
import { draftRouter } from './draft.js';
import { openaiRouter } from './openai.js';
import { commentRouter } from './comment.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/mails', mailRouter);
router.use('/menus', menuRouter);
router.use('/files', fileRouter);
router.use('/users', userRouter);
router.use('/posts', postRouter);
router.use('/drafts', draftRouter);
router.use('/openai', openaiRouter);
router.use('/comments', commentRouter);

export { router as indexRouter };
