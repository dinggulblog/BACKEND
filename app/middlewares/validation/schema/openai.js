const models = ['text-davinci-003', 'text-davinci-002'];

const COMPLETION_VALIDATION_SCHEMA = () => {
  return {
    'prompt': {
      trim: true,
      isLength: {
        options: [{ min: 5, max: 150 }],
        errorMessage: '입력에 필요한 텍스트는 최소 5자 이상, 최대 150자입니다.'
      }
    },
    'model': {
      optional: { options: { nullable: true } },
      custom: {
        options: model => models.includes(model)
      }
    },
    'max_tokens': {
      optional: { options: { nullable: true } },
      toInt: true,
      isInt: {
        options: [{ min: 1, max: 2048 }],
        errorMessage: 'max_tokens 값은 0보다 크고 2048보다 작거나 같은 정수만 가능합니다.'
      }
    },
    'temperature': {
      optional: { options: { nullable: true } },
      toFloat: true,
      isFloat: {
        options: [{ min: 0, max: 1 }],
        errorMessage: 'temperature 값은 0과 1사이의 숫자만 가능합니다.'
      }
    },
    'top_p': {
      optional: { options: { nullable: true } },
      toFloat: true,
      isFloat: {
        options: [{ min: 0, max: 1 }],
        errorMessage: 'top_p 값은 0과 1사이의 숫자만 가능합니다.'
      }
    }
  };
};

export default { COMPLETION_VALIDATION_SCHEMA };
