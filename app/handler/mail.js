import { MailModel } from '../model/mail.js';
import { sendMail } from '../middlewares/sendmail.js';

class MailHandler {
  constructor() {
  }

  async createMail(req, callback) {
    try {
      const { email, subject, content } = req.body;

      await MailModel.create({ to: process.env.HOST_MAIL });

      await sendMail({
        to: process.env.HOST_MAIL,
        subject: subject,
        body: content,
        from: email
      });

      callback.onSuccess({});
    } catch (error) {
      callback.onError(error);
    }
  }
}

export default MailHandler;
