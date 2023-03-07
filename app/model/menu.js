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

const menuModel = mongoose.model('Menu', MenuSchema);

MenuSchema.post('findOneAndUpdate', async function (doc, next) {
  try {
    const query = this.getUpdate();

    if (query.$set?.main && (query.$set.main !== doc.main)) {
      await menuModel.updateMany(
        { main: doc.main },
        { $set: { main: query.$set.main } },
        { lean: true }
      ).exec()
    }

    next();
  } catch (error) {
    next(error);
  }
});

export const MenuModel = menuModel;
