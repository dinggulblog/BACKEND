import mongoose from 'mongoose';

const MenuSchema = new mongoose.Schema({
  main: {
    type: String,
    required: [true, 'Main menu is required!']
  },
  sub: {
    type: String,
    required: [true, 'Sub menu is required!']
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

MenuSchema.index({ main: 1, sub: 1 }, { unique: true });

export const MenuModel = mongoose.model('Menu', MenuSchema);
