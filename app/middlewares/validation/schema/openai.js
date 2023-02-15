const parameters = ['model', 'stream', 'max_tokens', 'temperature', 'top_p']
const models = ['text-davinci-003', 'text-davinci-002']

const COMPLETION_VALIDATION_SCHEMA = () => {
  return {
    'prompt': {
      trim: true,
      isLength: {
        options: [{ min: 5, max: 150 }],
        errorMessage: '입력에 필요한 텍스트는 최소 5자 이상, 최대 150자입니다.'
      }
    },
    'parameters': {
      toObject: true
    },
    'parameters.model': {
      custom: {
        options: model => models.includes(model)
      }
    },
    'parameters.stream': {
      customSanitizer: {
        options: stream => typeof stream === 'string' || typeof stream === 'boolean' ? Boolean(stream) : false
      }
    },
    'parameters.max_tokens': {
      toInt: true,
      isInt: {
        options: [{ min: 1, max: 5 }],
        errorMessage: '파라미터 n값은 1보다 크고 5보다 작아야 합니다.'
      }
    }
  };
};

export default { COMPLETION_VALIDATION_SCHEMA };
