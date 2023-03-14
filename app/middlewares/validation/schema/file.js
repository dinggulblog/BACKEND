const MODELS = ['user', 'post', 'draft'];

const UPLOAD_VALIDATION_SCHEMA = () => {
  return {
    'id': {
      isMongoId: {
        bail: true,
        errorMessage: '파일이 속할 객체의 ID가 올바르지 않습니다.'
      }
    },
    'model': {
      isString: true,
      toLowerCase: true,
      isIn: MODELS,
      customSanitizer: {
        options: model => model.charAt(0).toUpperCase() + model.slice(1)
      }
    }
  };
};

export default {
  UPLOAD_VALIDATION_SCHEMA
};
