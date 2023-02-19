import { checkSchema } from 'express-validator';
import { CODE_VALIDATION_SCHEMA } from './schema/mail.js';
import UserSchema from './schema/user.js';

export const findEmailRules = [
  checkSchema(UserSchema.EMAIL_EXIST_VALIDATION_SCHEMA(), ['params'])
];

export const createAccountRules = [
  checkSchema({
    ...UserSchema.EMAIL_VALIDATION_SCHEMA(),
    ...UserSchema.PASSWORD_VALIDATION_SCHEMA(true),
    ...UserSchema.NICKNAME_VALIDATION_SCHEMA()
  }, ['body'])
];

export const updateAccountRules = [
  checkSchema({
    ...UserSchema.PASSWORD_VALIDATION_SCHEMA(false),
    ...UserSchema.NICKNAME_VALIDATION_SCHEMA()
  }, ['body'])
];

export const updateAccountCodeRules = [
  checkSchema({
    ...CODE_VALIDATION_SCHEMA(),
    ...UserSchema.PASSWORD_VALIDATION_SCHEMA(false)
  }, ['body'])
];

export const updateProfileRules = [
  checkSchema(UserSchema.PROFILE_VALIDATION_SCHEMA(), ['body'])
];

export default {
  findEmailRules,
  createAccountRules,
  updateAccountRules,
  updateAccountCodeRules,
  updateProfileRules
};
