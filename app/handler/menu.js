import { MenuModel } from '../model/menu.js';

class MenuHandler {
  constructor() {
  }

  async createMenu(req, callback) {
    try {
      const { main, sub, type, categories } = req.body;

      const menu = await MenuModel.create({ main, sub, type, categories });

      callback.onSuccess({ menu });
    } catch (error) {
      callback.onError(error);
    }
  }

  async getMenus(req, callback) {
    try {
      const menus = await MenuModel.find({}).lean().exec();

      callback.onSuccess({ menus });
    } catch (error) {
      callback.onError(error);
    }
  }

  async updateMenu(req, payload, callback) {
    try {
      const { main, sub, type, categories } = req.body;
      const menu = await MenuModel.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { main, sub, type }, $addToSet: { categories } },
        { lean: true }
      ).exec();

      callback.onSuccess({ menu });
    } catch (error) {
      callback.onError(error);
    }
  }

  async deleteMenu(req, payload, callback) {
    try {
      const menu = await MenuModel.findOneAndDelete(
        { _id: req.params.id },
        { lean: true, projection: { _id: 1 } }
      ).exec();

      callback.onSuccess({ menu });
    } catch (error) {
      callback.onError(error);
    }
  }
}

export default MenuHandler;
