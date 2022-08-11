const MENU_VALIDATION_SCHEMA = () => {
  return {
    'title': {
      trim: true,
      toString: true,
      isLength: { 
        options: [{ min: 1, max: 30 }],
        errorMessage: 'Menu title must be between 1 and 30 chars long'
      },
    },
    'subject': {
      optional: { options: { nullable: true } },
      trim: true,
      toString: true,
      isLength: { 
        options: [{ min: 1, max: 30 }],
        errorMessage: 'Menu subject must be between 1 and 30 chars long'
      },
    },
    'categories': {
      toArray: true
    },
    'categories.*': {
      optional: { options: { nullable: true } },
      toString: true,
      isLength: { 
        options: [{ min: 1, max: 30 }],
        errorMessage: 'Menu category must be between 1 and 30 chars long'
      }
    }
  };
};

export default { MENU_VALIDATION_SCHEMA };