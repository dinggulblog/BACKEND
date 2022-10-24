import mongoose from 'mongoose';

const MenuSchema = new mongoose.Schema({
  main: {
    type: String,
    required: [true, 'Main menu is required!'],
    trim: true
  },
  sub: {
    type: String,
    default: 'default',
    trim: true
  },
  categories: {
    type: [String],
    default: ['전체', '기타'],
    trim: true
  }
});

export const MenuModel = mongoose.model('Menu', MenuSchema);