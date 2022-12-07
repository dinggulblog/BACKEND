import { checkSchema, param } from 'express-validator';
import MenuSchema from './schema/menu.js';

const createMenuRules = [
  checkSchema(MenuSchema.MENU_VALIDATION_SCHEMA(), ['body'])
];

const updateMenuRules = [
  param('id').isMongoId(),
  checkSchema(MenuSchema.MENU_VALIDATION_SCHEMA(), ['body'])
];

const deleteMenuRules = [
  param('id').isMongoId(),
];

export default {
  createMenuRules,
  updateMenuRules,
  deleteMenuRules
};
