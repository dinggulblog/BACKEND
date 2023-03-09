import mongoose from 'mongoose';
import { randomString } from '../util/util.js';

const MailSchema = new mongoose.Schema({
  to: {
    type: String,
    required: [true, '메일의 목적지가 정상적으로 입력되지 않았습니다.'],
    lowercase: true
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

const mailModel = mongoose.model('Mail', MailSchema);

mailModel.createCode = async function (to) {
  return await mailModel.create({
    to,
    type: 'temp',
    subject: `[딩굴] 비밀번호 수정 링크입니다.`,
    code: randomString(12),
    expiredAt: Date.now() + 3600
  });
};

mailModel.getCode = async function (code) {
  return await mailModel.findOne({ code }, null, { lean: true }).exec();
};

export const MailModel = mailModel;
