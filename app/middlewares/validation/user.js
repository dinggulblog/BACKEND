import { checkSchema } from 'express-validator';
import { CODE_VALIDATION_SCHEMA } from './schema/mail.js';
import UserSchema from './schema/user.js';

export const getEmailRules = [
  checkSchema(UserSchema.EMAIL_EXIST_VALIDATION_SCHEMA(), ['params'])
];

const createAccountRules = [
  checkSchema({
    ...UserSchema.EMAIL_VALIDATION_SCHEMA(),
    ...UserSchema.PASSWORD_VALIDATION_SCHEMA(true),
    ...UserSchema.NICKNAME_VALIDATION_SCHEMA()
  }, ['body'])
];

const updateAccountRules = [
  checkSchema({
    ...UserSchema.PASSWORD_VALIDATION_SCHEMA(false),
    ...UserSchema.NICKNAME_VALIDATION_SCHEMA()
  }, ['body'])
];

const updateAccountCodeRules = [
  checkSchema({
    ...CODE_VALIDATION_SCHEMA(),
    ...UserSchema.PASSWORD_VALIDATION_SCHEMA(false)
  }, ['body'])
];

const updateAccountsRules = [
  checkSchema(UserSchema.ACCOUNTS_VALIDATION_SCHEMA(), ['body'])
];

const updateProfileRules = [
  checkSchema(UserSchema.PROFILE_VALIDATION_SCHEMA(), ['body'])
];

export default {
  getEmailRules,
  createAccountRules,
  updateAccountRules,
  updateAccountCodeRules,
  updateAccountsRules,
  updateProfileRules
};
