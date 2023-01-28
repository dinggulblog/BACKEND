import { MailModel } from '../model/mail.js';
import { sendMail } from '../middlewares/sendmail.js';

class MailHandler {
  constructor() {
  }

  async createMail(req, callback) {
    try {
      const { email, subject, content } = req.body;

      await sendMail({
        to: process.env.HOST_MAIL,
        subject: `문의: ${subject}`,
        body: `<div>보낸 사람: ${email}</div><br/><br/><div>${content}</div>`,
      });

      await MailModel.create({
        to: email,
        type: 'self',
        subject,
        content
       });

      callback.onSuccess({});
    } catch (error) {
      callback.onError(error);
    }
  }
}

export default MailHandler;
