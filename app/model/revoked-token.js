import mongoose from 'mongoose';

const RevokedTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

export const RevokedTokenModel = mongoose.model('RevokedToken', RevokedTokenSchema);