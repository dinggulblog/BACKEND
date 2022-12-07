const MENU_VALIDATION_SCHEMA = () => {
  return {
    'main': {
      trim: true,
      matches: {
        options: [/^[\.|\w|가-힣]{2,20}$/],
        errorMessage: 'Main menu must consist of dots and characters between 2 and 20 in length'
      }
    },
    'sub': {
      trim: true,
      matches: {
        options: [/^[\.|\w|가-힣]{2,20}$/],
        errorMessage: 'Sub menu must consist of dots and characters between 2 and 20 in length'
      }
    },
    'type': {
      trim: true,
      isIn: {
        options: [['list', 'card', 'slide']],
        errorMessage: 'Available type words: list, card, slide'
      },
      optional: { options: { nullable: true } },
    },
    'categories': {
      toArray: true
    },
    'categories.*': {
      trim: true,
      matches: {
        options: [/^[\.|\w|가-힣]{1,20}$/],
        errorMessage: 'Category must consist of dots and characters between 2 and 20 in length'
      },
      optional: { options: { nullable: true } }
    }
  };
};

export default { MENU_VALIDATION_SCHEMA };
