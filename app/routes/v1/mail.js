import { Router } from 'express';
import MailController from '../../controller/mail.js';

const router = Router();
const mailController = new MailController();

router.route('/')
  .post(mailController.create);

router.route('/:email/code')
  .post(mailController.createCode);

export { router as mailRouter };
