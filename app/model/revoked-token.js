import mongoose from 'mongoose';

const RevokedTokenSchema = new mongoose.Schema({
  uuid: {
    type: String,
    required: true
  }
}, { versionKey: false });

export const RevokedTokenModel = mongoose.model('RevokedToken', RevokedTokenSchema);