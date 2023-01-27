import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const MailSchema = new mongoose.Schema({
  to: {
    type: String,
    required: [true, 'Mail destination is required!']
  },
  type: {
    type: String,
    defalut: 'ses',
    enum: ['ses', 'self']
  },
  code: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  expiredAt: {
    type: Date,
    default: Date.now(),
    expires: '24h'
  }
}, { versionKey: false });

const mailModel = mongoose.model('Mail', MailSchema);

mailModel.createCode = async function (to, type) {
  return await mailModel.create({
    to,
    type,
    code: randomUUID()
  });
};

mailModel.getCode = async function (code) {
  return await mailModel.findOne({ code }, null, { lean: true }).exec();
};

export const MailModel = mailModel
