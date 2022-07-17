import NodeCache from 'node-cache';
import { checkSchema, validationResult } from 'express-validator';

import { UserModel } from '../model/user.js';
import { RoleModel } from '../model/role.js';
import NotFoundError from '../error/not-found.js';
import InvalidRequestError from '../error/invalid-request.js';

class UserHandler {
  constructor() {
    this._memCache = new NodeCache();
  }

  static get USER_VALIDATION_SCHEMA() {
    return {
      'email': {
        trim: true,
        notEmpty: true,
        isEmail: true,
        normalizeEmail: true,
        errorMessage: 'Invalid email provided'
      },
      'password': {
        trim: true,
        notEmpty: true,
        isLength: {
          options: [{ min: 4, max: 30 }],
          errorMessage: 'Password must be between 4 and 30 chars long'
        },
        errorMessage: 'Invalid password provided'
      },
      'passwordConfirmation': {
        trim: true,
        notEmpty: true,
        errorMessage: 'Invalid confirm password provided'
      },
      'nickname': {
        trim: true,
        notEmpty: true,
        isString: true,
        toString: true,
        isLength: {
          options: [{ min: 2, max: 15 }],
          errorMessage: 'nickname must be between 2 and 15 chars long'
        },
        errorMessage: 'Invalid nickname provided'
      }
    };
  }

  static get USER_UPDATE_VALIDATION_SCHEMA() {
    return {
      'currentPassword': {
        trim: true,
        notEmpty: true,
        errorMessage: 'Invalid confirm password provided'
      },
      'newPassword': {
        trim: true,
        notEmpty: true,
        isLength: {
          options: [{ min: 4, max: 30 }],
          errorMessage: 'Password must be between 4 and 30 chars long'
        },
        errorMessage: 'Invalid password provided'
      },
      'passwordConfirmation': {
        trim: true,
        notEmpty: true,
        errorMessage: 'Invalid confirm password provided'
      },
      'nickname': {
        trim: true,
        notEmpty: true,
        isAlphanumeric: true,
        isLength: {
          options: [{ min: 2, max: 15 }],
          errorMessage: 'nickname must be between 2 and 15 chars long'
        },
        errorMessage: 'Invalid nickname provided'
      }
    }
  }

  async createUser(req, callback) {
    try {
      await checkSchema(UserHandler.USER_VALIDATION_SCHEMA, ['body']).run(req);
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(elem => elem.msg);
        throw new InvalidRequestError('Validation errors: ' + errorMessages.join(' && '));
      }
      
      const roles = this._memCache.get('default_roles');
      if (!roles) {
        req.body.roles = await RoleModel.find({ name: 'USER' }).select('_id');
        this._memCache.set('default_roles', req.body.roles, 86400);
      } else {
        req.body.roles = roles;
      }

      await UserModel.create(req.body);

      callback.onSuccess({});
    } catch (error) {
      callback.onError(error);
    }
  }

  async getUserInfo(req, payload, callback) {
    try {
      const user = await UserModel.findOne({ _id: payload.sub })
        .select({ _id: 0, tokens: 0 })
        .populate('roles')
        .lean()
        .exec();
      if (!user) {
        throw new NotFoundError('The requested user could not be found.');
      }

      user.roles = user.roles.map(role => role.name)
      callback.onSuccess(user);
    } catch (error) {
      callback.onError(error);
    }
  }

  async updateUser(req, payload, callback) {
    try {
      await checkSchema(UserHandler.USER_UPDATE_VALIDATION_SCHEMA, ['body']).run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(elem => elem.msg);
        throw new InvalidRequestError('Validation errors: ' + errorMessages.join(' && '));
      }
      
      const user = await UserModel.findOne({ _id: payload.sub }).select('password').exec();
      if (!user) {
        throw new NotFoundError('The requested user could not be found.');
      }
      
      // Update user object
      user.originalPassword = user.password;
      user.password = req.body.newPassword ? req.body.newPassword : user.password;
      for (const key in req.body) user[key] = req.body[key];
      
      await user.save();

      callback.onSuccess({});
    } catch (error) {
      callback.onError(error);
    }
  }

  async deleteUser(req, payload, callback) {
    try {
      const user = await UserModel.findByIdAndUpdate(
        payload.sub,
        { $set: { isActive: false } },
        { new: true }
      ).lean().exec();
      
      if (!user) {
        throw new NotFoundError('The requested user could not be found.');
      }

      callback.onSuccess({});
    } catch (error) {
      callback.onError(error);
    }
  }
}

export default UserHandler;