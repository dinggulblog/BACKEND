const MENU_VALIDATION_SCHEMA = () => {
  return {
    'main': {
      trim: true,
      toString: true,
      isLength: {
        options: [{ min: 1, max: 30 }],
        errorMessage: 'Menu title must be between 1 and 30 chars long'
      },
    },
    'sub': {
      trim: true,
      toString: true,
      isLength: {
        options: [{ min: 1, max: 30 }],
        errorMessage: 'Menu subject must be between 1 and 30 chars long'
      },
      optional: { options: { nullable: true } }
    },
    'categories': {
      toArray: true
    },
    'categories.*': {
      toString: true,
      isLength: {
        options: [{ min: 1, max: 30 }],
        errorMessage: 'Menu category must be between 1 and 30 chars long'
      },
      optional: { options: { nullable: true } }
    }
  };
};

export default { MENU_VALIDATION_SCHEMA };
