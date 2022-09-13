import { PostModel } from '../../../model/post.js';
import { CommentModel } from '../../../model/comment.js';

const POSTID_VALIDATION_SCHEMA = () => {
  return {
    'postId': {
      custom: {
        options: async (value) => {
          const post = await PostModel.findById(value, { isActive: 1 }, { lean: true }).exec();
          return post?._id;
        }
      }
    }
  };
};

const PARENTID_VALIDATION_SCHEMA = () => {
  return {
    'parentId': {
      custom: {
        options: async (value) => {
          if (!value) return true;
          const comment = await CommentModel.findById(value, { isActive: 1 }, { lean: true }).exec();
          if (!comment || !comment.isActive) Promise.reject('존재하지 않거나 비활성화된 댓글입니다.');
          else return comment._id;
        }
      }
    }
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
  PARENTID_VALIDATION_SCHEMA,
  COMMENT_VALIDATION_SCHEMA
};