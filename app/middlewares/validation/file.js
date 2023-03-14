import { checkSchema, param } from 'express-validator';
import FileSchema from './schema/file.js';

const createFileRules = [
  checkSchema(FileSchema.UPLOAD_VALIDATION_SCHEMA(), ['body'])
];

const createFilesRules = [
  checkSchema(FileSchema.UPLOAD_VALIDATION_SCHEMA(), ['body'])
];

const getFileRules = [
  param('fileId', '파일 ID가 올바르지 않습니다.').isMongoId()
];

const getFilesRules = [
  param('belongingId', '파일이 속해있는 객체의 ID가 올바르지 않습니다.').isMongoId()
];

const updateFileRules = [
  param('fileId', '파일 ID가 올바르지 않습니다.').isMongoId()
];

const updateFilesRules = [
  param('belongingId', '파일이 속해있는 객체의 ID가 올바르지 않습니다.').isMongoId()
];

const deleteFileRules = [
  param('fileId', '파일 ID가 올바르지 않습니다.').isMongoId(),
];

const deleteFilesRules = [
  param('belongingId', '파일이 속해있는 객체의 ID가 올바르지 않습니다.').isMongoId()
];

export default {
  createFileRules,
  createFilesRules,
  getFileRules,
  getFilesRules,
  updateFileRules,
  updateFilesRules,
  deleteFileRules,
  deleteFilesRules
};
