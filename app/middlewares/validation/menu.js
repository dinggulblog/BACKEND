import { checkSchema, query } from 'express-validator';
import MenuSchema from './schema/menu.js';

const createMenuRules = [
  checkSchema(MenuSchema.MENU_VALIDATION_SCHEMA(), ['body'])
];

const updateMenuRules = [
  query('id').optional({ options: { nullable: true } }).isMongoId(),
  query('title').optional({ options: { nullable: true } }).toString(),
  checkSchema(MenuSchema.MENU_VALIDATION_SCHEMA(), ['body'])
];

const deleteMenuRules = [
  query('id').optional({ options: { nullable: true } }).isMongoId(),
  query('title').optional({ options: { nullable: true } }).toString()
];

export default {
  createMenuRules,
  updateMenuRules,
  deleteMenuRules
};