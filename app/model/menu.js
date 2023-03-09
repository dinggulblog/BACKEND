import mongoose from 'mongoose';

const MenuSchema = new mongoose.Schema({
  main: {
    type: String,
    required: [true, 'Main menu is required!'],
    lowercase: true
  },
  sub: {
    type: String,
    required: [true, 'Sub menu is required!'],
    lowercase: true
  },
  type: {
    type: String,
    defalut: 'list',
    enum: ['list', 'card', 'slide']
  },
  categories: {
    type: [String],
    default: ['기타']
  }
});

export const MenuModel = mongoose.model('Menu', MenuSchema);
