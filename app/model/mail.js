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
    default: undefined,
    expires: 0
  }
}, { versionKey: false });

MailSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });

const mailModel = mongoose.model('Mail', MailSchema);

mailModel.createCode = async function (to, type) {
  return await mailModel.create({
    to,
    type,
    code: randomUUID(),
    expiredAt: Date.now() + 3600 * 24
  });
};

mailModel.getCode = async function (code) {
  return await mailModel.findOne({ code }, null, { lean: true }).exec();
};

export const MailModel = mailModel
