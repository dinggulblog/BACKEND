import { MailModel } from '../model/mail.js';

class MailHandler {
  constructor() {
  }

  async createMail(req, callback) {
    try {
      const { email, subject, content } = req.body;

      await MailModel.create({
        to: email,
        type: 'self',
        subject: `문의: ${subject}`,
        content
       });

      callback.onSuccess({});
    } catch (error) {
      callback.onError(error);
    }
  }

  async createCode(req, callback) {
    try {
      const { email } = req.params;

      await MailModel.createCode(email, 'temp');

      callback.onSuccess({});
    } catch (error) {
      callback.onError(error);
    }
  }
}

export default MailHandler;
