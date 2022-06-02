import mongoose from 'mongoose';

const MenuSchema = new mongoose.Schema({
  owner: {
    type: String,
    enum: ['sol', 'ming', 'guest'],
    required: [true, 'Menu name is required!']
  },
  subject: {
    type: String,
    default: 'default'
  },
  categories: [{
    type: String
  }]
}, { versionKey: false });

export const MenuModel = mongoose.model('Menu', MenuSchema);