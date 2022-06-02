import mongoose from 'mongoose';

const RoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Role name is required!'],
  }
}, { versionKey: false });

export const RoleModel = mongoose.model('Role', RoleSchema);