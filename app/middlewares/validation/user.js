import { checkSchema } from 'express-validator';
import UserSchema from './schema/user.js';

const createAccountRules = () => [
  checkSchema(UserSchema.USER_ACCOUNT_VALIDATION_SCHEMA(), ['body'])
];

const updateAccountRules = () => [
  checkSchema(UserSchema.USER_ACCOUNT_UPDATE_VALIDATION_SCHEMA(), ['body'])
];

const updateProfileRules = () => [
  checkSchema(UserSchema.USER_PROFILE_UPDATE_VALIDATION_SCHEMA(), ['body'])
];

export default {
  createAccountRules,
  updateAccountRules,
  updateProfileRules
};
