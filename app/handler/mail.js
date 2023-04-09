import { MailModel } from '../model/mail.js';
import { sendMail } from '../library/sendmail.js';

class MailHandler {
  constructor() {
    this._host = process.env.HOST;
    this._hostMail = process.env.HOST_MAIL;
  }

  async createMail(req, callback) {
    try {
      const { email, subject, content } = req.body;

      const mail = await MailModel.create({
        to: email,
        subject: `문의: ${subject}`,
        content
      });

      await sendMail({
        to: this._hostMail,
        subject: mail.subject,
        body: this.#generateInquiryForm(mail.to, mail.content)
      });

      callback.onSuccess({});
    } catch (error) {
      callback.onError(error);
    }
  }

  async createCode(req, callback) {
    try {
      const { email } = req.body;

      const mail = await MailModel.createCode(email);

      await sendMail({
        to: mail.to,
        subject: mail.subject,
        body: this.#generateAccountForm(mail.code)
      });

      callback.onSuccess({});
    } catch (error) {
      callback.onError(error);
    }
  }

  #generateAccountForm (code) {
    return `
      <a href="${this._host}/home">
        <img src="https://dinggul.me/uploads/logo.png" style="display: block; width: 280px; margin: 0 auto;"/>
      </a>
      <div style="max-width: 100%; width: 400px; margin: 0 auto; padding: 1rem; text-align: justify; background: #f8f9fa; border: 1px solid #dee2e6; box-sizing: border-box; border-radius: 4px; color: #868e96; margin-top: 0.5rem; box-sizing: border-box;">
        <b style="black">안녕하세요!</b> 비밀번호 수정을 계속하시려면 하단의 링크를 클릭하세요. 만약에 실수로 요청하셨거나, 본인이 요청하지 않았다면, 이 메일을 무시하세요.
      </div>
      <a href="${this._host}/auth/pwd-reset?code=${code}" style="text-decoration: none; width: 400px; text-align:center; display:block; margin: 0 auto; margin-top: 1rem; background: #845ef7; padding-top: 1rem; color: white; font-size: 1.25rem; padding-bottom: 1rem; font-weight: 600; border-radius: 4px;">계속하기</a>
      <div style="text-align: center; margin-top: 1rem; color: #868e96; font-size: 0.85rem;">
        <div>위 버튼을 클릭하시거나, 다음 링크를 열으세요:<br/>
          <a style="color: #b197fc;" href="${this._host}/auth/pwd-reset?code=${code}">
            ${this._host}/auth/pwd-reset?code=${code}
          </a>
        </div><br/><div>이 링크는 1시간동안 유효합니다.</div>
      </div>
    `;
  }

  #generateInquiryForm (from, content) {
    return `
      <div>보낸 사람: ${from}</div><br/><br/><div>${content}</div>
    `;
  }
}

export default MailHandler;
