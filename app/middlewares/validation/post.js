import { checkSchema, check, param } from 'express-validator'
import PostSchema from './schema/post.js'

const createPostRules = [
  checkSchema(PostSchema.POST_VALIDATION_SCHEMA(), ['body'])
];

const getPostsRules = [
  checkSchema(PostSchema.POSTS_PAGINATION_SCHEMA(), ['query'])
];

const getPostRules = [
  param('id', 'Post ID is not OID').isMongoId()
];

const updatePostRules = [
  param('id', 'Post ID is not OID').isMongoId(),
  checkSchema(PostSchema.POST_VALIDATION_SCHEMA(), ['body'])
];

export default {
  createPostRules,
  getPostsRules,
  getPostRules,
  updatePostRules
}