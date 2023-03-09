const MENU_VALIDATION_SCHEMA = () => {
  return {
    'main': {
      optional: { options: { nullable: true } },
      trim: true,
      matches: {
        options: [/^[\.|\w|가-힣]{2,20}$/],
        errorMessage: '메인 메뉴명은 2글자 이상 20글자 이내의 "."(dot), 한글, 영문 및 숫자 조합만 가능합니다.'
      }
    },
    'sub': {
      optional: { options: { nullable: true } },
      trim: true,
      matches: {
        options: [/^[\.|\w|가-힣]{2,20}$/],
        errorMessage: '서브 메뉴명은 2글자 이상 20글자 이내의 "."(dot), 한글, 영문 및 숫자 조합만 가능합니다.'
      }
    },
    'type': {
      optional: { options: { nullable: true } },
      trim: true,
      isIn: {
        options: [['list', 'card', 'slide']],
        errorMessage: '사용 가능한 타입: list, card, slide'
      }
    },
    'categories': {
      toArray: true
    },
    'categories.*': {
      optional: { options: { nullable: true } },
      trim: true,
      matches: {
        options: [/^[\.|\w|가-힣]{1,20}$/],
        errorMessage: '서브 메뉴명은 1글자 이상 20글자 이내의 "."(dot), 한글, 영문 및 숫자 조합만 가능합니다.'
      }
    }
  };
};

export default { MENU_VALIDATION_SCHEMA };
