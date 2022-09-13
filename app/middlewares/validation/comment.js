import { checkSchema, param } from 'express-validator'
import CommentSchema from './schema/comment.js'

const createCommentRules = [
  checkSchema(CommentSchema.POSTID_VALIDATION_SCHEMA(), ['params']),
  checkSchema(CommentSchema.PARENTID_VALIDATION_SCHEMA(), ['params']),
  checkSchema(CommentSchema.COMMENT_VALIDATION_SCHEMA(), ['body'])
];

const getCommentsRules = [
  checkSchema(CommentSchema.POSTID_VALIDATION_SCHEMA(), ['params'])
];

const updateCommentRules = [
  param('id', 'Comment ID is not OID').isMongoId(),
  checkSchema(CommentSchema.POSTID_VALIDATION_SCHEMA(), ['params']),
  checkSchema(CommentSchema.COMMENT_VALIDATION_SCHEMA(), ['body'])
];

const deleteCommentRules = [
  param('id', 'Comment ID is not OID').isMongoId(),
  checkSchema(CommentSchema.POSTID_VALIDATION_SCHEMA(), ['params'])
];

export default {
  createCommentRules,
  getCommentsRules,
  updateCommentRules,
  deleteCommentRules
}