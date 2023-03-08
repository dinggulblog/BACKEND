const MENU_VALIDATION_SCHEMA = () => {
  return {
    'main': {
      optional: { options: { nullable: true } },
      trim: true,
      matches: {
        options: [/^[\.|\w|가-힣]{2,20}$/],
        errorMessage: 'Main menu must consist of dots and characters between 2 and 20 in length'
      }
    },
    'sub': {
      optional: { options: { nullable: true } },
      trim: true,
      matches: {
        options: [/^[\.|\w|가-힣]{2,20}$/],
        errorMessage: 'Sub menu must consist of dots and characters between 2 and 20 in length'
      }
    },
    'type': {
      optional: { options: { nullable: true } },
      trim: true,
      isIn: {
        options: [['list', 'card', 'slide']],
        errorMessage: 'Available type words: list, card, slide'
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
        errorMessage: 'Category must consist of dots and characters between 2 and 20 in length'
      }
    }
  };
};

export default { MENU_VALIDATION_SCHEMA };
