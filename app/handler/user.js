import NodeCache from 'node-cache';
import { check, param, checkSchema, validationResult } from 'express-validator';

import { UserModel } from '../model/user.js';
import { RoleModel } from '../model/role.js';
import UnauthorizedError from '../error/unauthorized.js';
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
        isEmail: { errorMessage: 'Invalid email format' },
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
        isAlphanumeric: true,
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
      
      const roles = this._memCache.get('default_roles')
      if (!roles) {
        req.body.roles = await RoleModel.find({ name: 'USER' }).select('_id');
        this._memCache.set('default_roles', req.body.roles, 86400);
      } else {
        req.body.roles = roles;
      }

      const { nickname } = await UserModel.create(req.body);
      callback.onSuccess({ nickname });
    } catch (error) {
      callback.onError(error);
    }
  }

  async getUserInfo(req, token, callback) {
    try {
      await check('id')
        .notEmpty().withMessage('There are no token in header')
        .isMongoId().withMessage('Invalid token')
        .run(token);
      await param('nickname')
        .notEmpty().withMessage('There are no params in request')
        .isAlphanumeric().withMessage('Invalid nickname')
        .run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(elem => elem.msg);
        throw new InvalidRequestError('Validation errors: ' + errorMessages.join(' && '));
      }

      const user = await UserModel.findOne({ 
        _id: token.id,
        nickname: req.params.nickname
      }).populate('roles').select('-_id').lean().exec();
      if (!user) {
        throw new UnauthorizedError('Authorization errors');
      }
      
      callback.onSuccess(user);
    } catch (error) {
      callback.onError(error);
    }
  }

  async updateUser(req, token, callback) {
    try {
      await check('id')
        .notEmpty().withMessage('There are no token in header')
        .isMongoId().withMessage('Invalid token')
        .run(token);
      await param('nickname')
        .notEmpty().withMessage('There are no params in request')
        .isAlphanumeric().withMessage('Invalid nickname')
        .run(req);
      await checkSchema(UserHandler.USER_UPDATE_VALIDATION_SCHEMA, ['body']).run(req);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(elem => elem.msg);
        throw new InvalidRequestError('Validation errors: ' + errorMessages.join(' && '));
      }
      
      const user = await UserModel.findOne({ 
        _id: token.id,
        nickname: req.params.nickname
      }).select('password').exec();
      if (!user) {
        throw new UnauthorizedError('Authorization errors');
      }
      
      // Update user object
      user.originalPassword = user.password;
      user.password = req.body.newPassword ? req.body.newPassword : user.password;
      for (const key in req.body) user[key] = req.body[key];
      
      const { nickname } = await user.save();

      callback.onSuccess({ nickname });
    } catch (error) {
      callback.onError(error);
    }
  }
}

export default UserHandler;