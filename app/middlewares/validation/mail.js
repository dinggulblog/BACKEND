import { checkSchema } from 'express-validator';
import MailSchema from './schema/mail.js';

const createFormRules = [
  checkSchema({
    ...MailSchema.EMAIL_VALIDATION_SCHEMA(),
    ...MailSchema.FORM_VALIDATION_SCHEMA()
  }, ['body'])
];

const createCodeRules = [
  checkSchema(MailSchema.EMAIL_VALIDATION_SCHEMA(), ['body'])
];

export default {
  createFormRules,
  createCodeRules
};
