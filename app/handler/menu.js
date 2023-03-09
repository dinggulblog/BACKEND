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

  async updateMenu(req, callback) {
    try {
      const { main, sub, type, categories } = req.body;
      const menu = await MenuModel.findOne({ _id: req.params.id }, null, { lean: true }).exec();

      if (main && main !== menu.main) {
        await MenuModel.updateMany(
          { main: menu.main },
          { $set: { main } },
          { lean: true }
        ).exec();
      }
      else {
        await MenuModel.updateOne(
          { _id: req.params.id },
          { $set: { main, sub, type, categories } },
          { lean: true }
        ).exec();
      }

      callback.onSuccess({});
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
