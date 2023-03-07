import { checkSchema, param } from 'express-validator';
import CommentSchema from './schema/comment.js';

const createCommentRules = [
  checkSchema(CommentSchema.POSTID_VALIDATION_SCHEMA(), ['params']),
  checkSchema({
    ...CommentSchema.PARENTID_VALIDATION_SCHEMA(),
    ...CommentSchema.COMMENT_VALIDATION_SCHEMA()
  }, ['body'])
];

const getCommentsRules = [
  checkSchema(CommentSchema.POSTID_VALIDATION_SCHEMA(), ['params'])
];

const updateCommentRules = [
  param('id', '댓글 ID가 올바르지 않습니다.').isMongoId(),
  checkSchema(CommentSchema.POSTID_VALIDATION_SCHEMA(), ['params']),
  checkSchema(CommentSchema.COMMENT_VALIDATION_SCHEMA(), ['body'])
];

const deleteCommentRules = [
  param('id', '댓글 ID가 올바르지 않습니다.').isMongoId(),
  checkSchema(CommentSchema.POSTID_VALIDATION_SCHEMA(), ['params'])
];

export default {
  createCommentRules,
  getCommentsRules,
  updateCommentRules,
  deleteCommentRules
};
