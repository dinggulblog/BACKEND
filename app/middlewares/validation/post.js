import { checkSchema, check, query, param } from 'express-validator'
import PostSchema from './schema/post.js'

const createPostRules = [
  checkSchema(PostSchema.POST_VALIDATION_SCHEMA(), ['body'])
];

const getPostsRules = [
  checkSchema(PostSchema.POSTS_PAGINATION_SCHEMA(), ['query'])
];

const getPostRules = [
  query('id').optional({ options: { nullable: true } }).isMongoId(),
  query('postNum').optional({ options: { nullable: true } }).isNumeric()
];

const updatePostRules = [
  checkSchema(PostSchema.POST_UPDATE_VALIDATION_SCHEMA(), ['body', 'params'])
];

const checkPostIdRules = [
  param('id', 'Post ID is not OID').isMongoId()
];

export default {
  createPostRules,
  getPostsRules,
  getPostRules,
  updatePostRules,
  checkPostIdRules
}