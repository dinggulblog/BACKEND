import sanitizeHtml from 'sanitize-html';
import { PostModel } from '../../../model/post.js';
import { CommentModel } from '../../../model/comment.js';

const POSTID_VALIDATION_SCHEMA = () => {
  return {
    'postId': {
      custom: {
        options: async (id) => {
          const post = await PostModel.findById(id, { isActive: 1 }, { lean: true }).exec();
          return !post || !post.isActive ? Promise.reject('존재하지 않는 게시글입니다.') : true;
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
          const comment = await CommentModel.findOne({ _id: value, isActive: true }, { isActive: 1 }, { lean: true }).exec();
          return !comment ? Promise.reject('존재하지 않거나 비활성화된 댓글입니다.') : true;
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
      },
      customSanitizer: {
        options: content => sanitizeHtml(content, {
          exclusiveFilter: (frame) => frame.tag === 'script'
        })
      }
    },
    'isPublic': {
      toBoolean: true
    }
  };
};

export default {
  POSTID_VALIDATION_SCHEMA,
  PARENTID_VALIDATION_SCHEMA,
  COMMENT_VALIDATION_SCHEMA
};
