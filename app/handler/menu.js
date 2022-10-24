import { MenuModel } from '../model/menu.js';

import InvalidRequestError from '../error/invalid-request.js';
import NotFoundError from '../error/not-found.js';

class MenuHandler {
  constructor() {
  }

  async createMenu(req, callback) {
    try {
      const { main, sub, categories } = req.body;

      const menu = await MenuModel.create({ main, sub, categories });

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
      const { main, sub, categories } = req.body;
      const menu = await MenuModel.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { main, sub }, $addToSet: { categories } },
        { new: true, lean: true }
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

  #getUpdateOptions(req) {
    const option = { $set: {}, $addToSet: {} }
    for (const [key, value] of Object.entries(req.body)) {
      if (typeof value === 'string') {
        option.$set[key] = value
      }
      else if (Array.isArray(value)) {
        option.$addToSet[key] = { $each: value }
      }
    }
    
    return option
  }
}

export default MenuHandler;