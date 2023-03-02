import { checkSchema, param } from 'express-validator';
import PostSchema from './schema/post.js';

const createPostRules = [
  checkSchema(PostSchema.POST_VALIDATION_SCHEMA(), ['body'])
];

const getPostsRules = [
  checkSchema(PostSchema.POSTS_PAGINATION_SCHEMA(), ['query'])
];

const getPostRules = [
  param('id', '게시물 ID가 올바르지 않습니다.').isMongoId()
];

const updatePostRules = [
  param('id', '게시물 ID가 올바르지 않습니다.').isMongoId(),
  checkSchema(PostSchema.POST_VALIDATION_SCHEMA(), ['body'])
];

export default {
  createPostRules,
  getPostsRules,
  getPostRules,
  updatePostRules
};
