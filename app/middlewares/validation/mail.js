import { checkSchema } from 'express-validator';
import MailSchema from './schema/mail.js';

export const createMailRules = [
  checkSchema(MailSchema.MAIL_VALIDATION_SCHEMA(), ['body'])
];

export default {
  createMailRules
};
