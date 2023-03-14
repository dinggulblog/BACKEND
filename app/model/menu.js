import mongoose from 'mongoose';

const MenuSchema = new mongoose.Schema({
  main: {
    type: String,
    required: [true, '메뉴 생성 시 메인명은 필수입니다.'],
    lowercase: true
  },
  sub: {
    type: String,
    required: [true, '메뉴 생성 시 서브명은 필수입니다.'],
    lowercase: true
  },
  type: {
    type: String,
    default: 'list',
    lowercase: true,
    enum: {
      values: ['list', 'card', 'slide'],
      message: '사용 가능한 메뉴 타입: ["List", "Card", "Slide"]'
    }
  },
  categories: {
    type: [String],
    default: ['기타']
  }
});

MenuSchema.index({ main: 1, sub: 1 }, { unique: true })

export const MenuModel = mongoose.model('Menu', MenuSchema);
