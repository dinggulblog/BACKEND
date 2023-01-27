import { checkSchema } from 'express-validator';
import UserSchema from './schema/user.js';

const getAccountRules = [
  checkSchema(UserSchema.EMAIL_VALIDATION_SCHEMA(), ['params'])
];

const createAccountRules = [
  checkSchema(UserSchema.ACCOUNT_VALIDATION_SCHEMA(), ['body'])
];

const updateAccountRules = [
  checkSchema(UserSchema.ACCOUNT_UPDATE_VALIDATION_SCHEMA(), ['body'])
];

const updateAccountCodeRules = [
  checkSchema(UserSchema.EMAIL_CODE_VALIDATION_SCHEMA(), ['body'])
];

const updateProfileRules = [
  checkSchema(UserSchema.PROFILE_UPDATE_VALIDATION_SCHEMA(), ['body'])
];

export default {
  getAccountRules,
  createAccountRules,
  updateAccountRules,
  updateAccountCodeRules,
  updateProfileRules
};
