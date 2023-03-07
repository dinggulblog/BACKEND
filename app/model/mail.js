import mongoose from 'mongoose';
import { sendMail } from '../util/sendmail.js';
import { randomString } from '../util/util.js';

const inquiryForm = (from, content) => `
  <div>보낸 사람: ${from}</div><br/><br/><div>${content}</div>
`

const accountForm = (code) => `
  <a href="${process.env.HOST}/home">
    <img src="https://dinggul.me/uploads/logo.png" style="display: block; width: 280px; margin: 0 auto;"/>
  </a>
  <div style="max-width: 100%; width: 400px; margin: 0 auto; padding: 1rem; text-align: justify; background: #f8f9fa; border: 1px solid #dee2e6; box-sizing: border-box; border-radius: 4px; color: #868e96; margin-top: 0.5rem; box-sizing: border-box;">
    <b style="black">안녕하세요!</b> 비밀번호 수정을 계속하시려면 하단의 링크를 클릭하세요. 만약에 실수로 요청하셨거나, 본인이 요청하지 않았다면, 이 메일을 무시하세요.
  </div>
  <a href="${process.env.HOST}/auth/pwd-reset?code=${code}" style="text-decoration: none; width: 400px; text-align:center; display:block; margin: 0 auto; margin-top: 1rem; background: #845ef7; padding-top: 1rem; color: white; font-size: 1.25rem; padding-bottom: 1rem; font-weight: 600; border-radius: 4px;">계속하기</a>
  <div style="text-align: center; margin-top: 1rem; color: #868e96; font-size: 0.85rem;">
    <div>위 버튼을 클릭하시거나, 다음 링크를 열으세요:<br/>
      <a style="color: #b197fc;" href="${process.env.HOST}/auth/pwd-reset?code=${code}">
        ${process.env.HOST}/auth/pwd-reset?code=${code}
      </a>
    </div><br/><div>이 링크는 1시간동안 유효합니다.</div>
  </div>
`

const MailSchema = new mongoose.Schema({
  to: {
    type: String,
    required: [true, 'Mail destination is required!']
  },
  type: {
    type: String,
    defalut: 'self',
    enum: ['self', 'temp']
  },
  code: {
    type: String
  },
  subject: {
    type: String
  },
  content: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  expiredAt: {
    type: Date,
    default: undefined,
    expires: 0
  }
}, {
  toObject: { virtuals: true },
  versionKey: false
});

MailSchema.post('save', async function (doc, next) {
  try {
    const to = this.type === 'self' ? process.env.HOST_MAIL : this.to;
    const body = this.type === 'self' ? inquiryForm(this.to, this.content) : accountForm(this.code);

    await sendMail({
      to,
      subject: this.subject,
      body
    });

    next();
  } catch (error) {
    next(error);
  }
});

const mailModel = mongoose.model('Mail', MailSchema);

mailModel.createCode = async function (to, type) {
  return await mailModel.create({
    to,
    type,
    subject: `[딩굴] 비밀번호 수정 링크입니다.`,
    code: randomString(12),
    expiredAt: Date.now() + 3600
  });
};

mailModel.getCode = async function (code) {
  return await mailModel.findOne({ code }, null, { lean: true }).exec();
};

export const MailModel = mailModel;
