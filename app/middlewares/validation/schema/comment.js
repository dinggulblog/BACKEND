import ForbiddenError from '../../../error/forbidden.js';
import { PostModel } from '../../../model/post.js';

const POSTID_VALIDATION_SCHEMA = () => {
  return {
    'postId': {
      custom: {
        options: async (value) => {
          const post = await PostModel.findById(value).select('_id').lean().exec();
          if (!post) return Promise.reject(new ForbiddenError('No posts were found that match that post ID'));
        }
      }
    },
    'parentId': {
      optional: { options: { nullable: true } },
      isMongoId: {
        errorMessage: 'Parent comment ID is not OID'
      },
    },
  };
};

const COMMENT_VALIDATION_SCHEMA = () => {
  return {
    'content': {
      isLength: {
        options: [{ min: 1, max: 1000 }],
        errorMessage: 'Comment content must be between 1 and 1000 chars long'
      }
    },
    'isPublic': {
      customSanitizer: { 
        options: value => value ? Boolean(value) : true
      },
    }
  };
};

export default { 
  POSTID_VALIDATION_SCHEMA,
  COMMENT_VALIDATION_SCHEMA
};