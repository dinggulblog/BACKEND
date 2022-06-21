import NodeCache from 'node-cache';
import { check, query, checkSchema, validationResult } from 'express-validator';

import { MenuModel } from '../model/menu.js';
import InvalidRequestError from '../error/invalid-request.js';
import NotFoundError from '../error/not-found.js';

class MenuHandler {
  constructor() {
    this._memCache = new NodeCache();
  }

  static get MENU_VALIDATION_SCHEMA() {
    return {
      'title': {
        notEmpty: true,
        isString: true,
        isLength: { options: [{ min: 1, max: 30 }] },
        errorMessage: 'Invalid menu title'
      },
      'subject': {
        optional: { options: { nullable: true } },
        isString: true,
        isLength: { options: [{ min: 1, max: 30 }] },
        errorMessage: 'Invalid menu subject'
      },
      'categories': {
        optional: { options: { nullable: true } },
        isArray: true,
        isLength: { options: [{ min: 1, max: 10 }] },
        errorMessage: 'Invalid menu categories'
      },
      'categories.*': {
        optional: { options: { nullable: true } },
        isString: true,
        isLength: { options: [{ min: 1, max: 30 }] },
        errorMessage: 'Invalid menu category data'
      }
    };
  }

  async createMenu(req, token, callback) {
    try {
      await checkSchema(MenuHandler.MENU_VALIDATION_SCHEMA, ['body']).run(req);
  
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(elem => elem.msg);
        throw new InvalidRequestError('Validation errors: ' + errorMessages.join(' && '));
      }
  
      const newMenu = await MenuModel.create({
        title: req.body.title,
        subject: req.body?.subject
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

      callback.onSuccess(menus);
    } catch (error) {
      callback.onError(error);
    }
  }

  async updateMenu(req, token, callback) {
    try {
      await query('id').optional({ options: { nullable: true } }).isMongoId().run(req);
      await query('title').optional({ options: { nullable: true } }).isString().toLowerCase().run(req);
      await checkSchema(MenuHandler.MENU_VALIDATION_SCHEMA, ['body']).run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(elem => elem.msg);
        throw new InvalidRequestError('Validation errors:' + errorMessages.join(' && '));
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
        const option = MenuHandler.getUpdateOptions(req);
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

  async deleteMenu(req, token, callback) {
    try {
      await query('id').optional({ options: { nullable: true } }).isMongoId().run(req);
      await query('title').optional({ options: { nullable: true } }).isString().toLowerCase().run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(elem => elem.msg);
        throw new InvalidRequestError('Validation errors:' + errorMessages.join(' && '));
      }

      const deletedPost = await PostModel.findOneAndRemove(
        { _id: req.params.id, author: token.id }
      ).lean().exec();
      if (!deletedPost) {
        throw new NotFoundError('Post not found');
      }

      callback.onSuccess(deletedPost);
    } catch (error) {
      callback.onError(error);
    }
  }

  static getUpdateOptions(req) {
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