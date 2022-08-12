import NodeCache from 'node-cache';

import { MenuModel } from '../model/menu.js';
import InvalidRequestError from '../error/invalid-request.js';
import NotFoundError from '../error/not-found.js';
import ForbiddenError from '../error/forbidden.js';

class MenuHandler {
  constructor() {
    this._memCache = new NodeCache();
  }

  async createMenu(req, payload, callback) {
    try {
      if (!MenuHandler.#checkRoleAsAdmin(payload)) {
        throw new ForbiddenError('해당 요청에 대한 권한이 없습니다.');
      }
  
      const newMenu = await MenuModel.create({
        title: req.body.title,
        subject: req.body?.subject,
        categories: req.body?.categories
      })

      this._memCache.del('menus');

      callback.onSuccess(newMenu);
    } catch (error) {
      callback.onError(error);
    }
  }

  async getMenus(req, callback) {
    try {
      let menus = this._memCache.get('menus');

      if (!menus) {
        menus = await MenuModel.find({}).lean().exec();
        this._memCache.set('menus', menus, 86400);
      }

      callback.onSuccess({ menus });
    } catch (error) {
      callback.onError(error);
    }
  }

  async updateMenu(req, payload, callback) {
    try {
      if (!MenuHandler.#checkRoleAsAdmin(payload)) {
        throw new ForbiddenError('해당 요청에 대한 권한이 없습니다.');
      }

      if (req.query.title && !req.query.id) {
        // Change only the title of all menu documents
        const writeResult = await MenuModel.updateMany(
          { title: req.query.title },
          { $set: { title: req.body.title } },
          { upsert: false, runValidators: true }
        ).lean().exec();

        if (!writeResult.acknowledged || !writeResult.matchedCount) {
          throw new NotFoundError('Cannot find the requested menu title');
        }
      }
      else if (req.query.id && !req.query.title) {
        const option = MenuHandler.#getUpdateOptions(req);
        const writeResult = await MenuModel.updateOne(
          { _id: req.query.id },
          option,
          { upsert: false, runValidators: true }
        ).lean().exec();

        if (!writeResult.acknowledged || !writeResult.matchedCount) {
          throw new NotFoundError('Cannot find the requested menu ID');
        }
      }
      else {
        throw new InvalidRequestError('Invalid query parameters');
      }

      this._memCache.del('menus');
      return await this.getMenus(req, callback);
    } catch (error) {
      callback.onError(error);
    }
  }

  async deleteMenu(req, payload, callback) {
    try {
      if (!MenuHandler.#checkRoleAsAdmin(payload)) {
        throw new ForbiddenError('해당 요청에 대한 권한이 없습니다.');
      }

      if (req.query.title && !req.query.id) {
        // Change only the title of all menu documents
        const writeResult = await MenuModel.deleteMany({ title: req.query.title }).lean().exec();

        if (!writeResult.acknowledged || !writeResult.matchedCount) {
          throw new NotFoundError('Cannot find the requested menu title');
        }
      }
      else if (req.query.id && !req.query.title) {
        const writeResult = await MenuModel.deleteOne({ _id: req.query.id }).lean().exec();

        if (!writeResult.acknowledged || !writeResult.matchedCount) {
          throw new NotFoundError('Cannot find the requested menu ID');
        }
      }
      else {
        throw new InvalidRequestError('Invalid query parameters');
      }

      this._memCache.del('menus');
      return await this.getMenus(req, callback);
    } catch (error) {
      callback.onError(error);
    }
  }

  static #getUpdateOptions(req) {
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

  static #checkRoleAsAdmin(payload) {
    const { data: { roles } } = payload;
    return Array.isArray(roles) ? roles.includes('ADMIN') : false;
  }
}

export default MenuHandler;