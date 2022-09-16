import { checkSchema, query } from 'express-validator';
import MenuSchema from './schema/menu.js';

const createMenuRoles = () => [
  checkSchema(MenuSchema.MENU_VALIDATION_SCHEMA(), ['body'])
];

const updateMenuRoles = () => [
  query('id').optional({ options: { nullable: true } }).isMongoId(),
  query('title').optional({ options: { nullable: true } }).toString(),
  checkSchema(MenuSchema.MENU_VALIDATION_SCHEMA(), ['body'])
];

const deleteMenuRoles = () => [
  query('id').optional({ options: { nullable: true } }).isMongoId(),
  query('title').optional({ options: { nullable: true } }).toString()
];

export default {
  createMenuRoles,
  updateMenuRoles,
  deleteMenuRoles
};