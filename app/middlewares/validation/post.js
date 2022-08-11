import { checkSchema, query, param } from 'express-validator'
import PostSchema from './schema/post.js'

const createPostRules = [
  checkSchema(PostSchema.POST_VALIDATION_SCHEMA(), ['body'])
];

const getPostsRules = [
  checkSchema(PostSchema.POSTS_PAGINATION_SCHEMA(), ['query'])
];

const getPostsWithFilterRules = [
  checkSchema(PostSchema.POSTS_FILTER_SCHEMA(), ['params', 'query'])
];

const getPostRules = [
  query('id').optional({ options: { nullable: true } }).isMongoId(),
  query('postNum').optional({ options: { nullable: true } }).isNumeric()
];

const updatePostRules = [
  param('id', 'Post ID is not OID').isMongoId(),
  checkSchema(PostSchema.POST_VALIDATION_SCHEMA())
];

const checkPostIdRules = [
  param('id', 'Post ID is not OID').isMongoId()
];

export default {
  createPostRules,
  getPostsRules,
  getPostsWithFilterRules,
  getPostRules,
  updatePostRules,
  checkPostIdRules
}