const USER_VALIDATION_SCHEMA = () => {
  return {
    'email': {
      trim: true,
      isEmail: true,
      normalizeEmail: true,
      errorMessage: 'Invalid email format'
    },
    'password': {
      trim: true,
      isLength: {
        options: [{ min: 4, max: 30 }],
        errorMessage: 'Password must be between 4 and 30 chars long'
      }
    },
    'passwordConfirmation': {
      trim: true
    },
    'nickname': {
      trim: true,
      isString: true,
      isLength: { 
        options: [{ min: 2, max: 15 }],
        errorMessage: 'Nickname must be between 2 and 15 chars long'
      },
    }
  };
};

const USER_UPDATE_VALIDATION_SCHEMA = () => {
  return {
    'currentPassword': {
      trim: true
    },
    'newPassword': {
      trim: true,
      isLength: {
        options: [{ min: 4, max: 30 }],
        errorMessage: 'Password must be between 4 and 30 chars long'
      }
    },
    'passwordConfirmation': {
      trim: true
    },
    'nickname': {
      trim: true,
      isString: true,
      isLength: { 
        options: [{ min: 2, max: 15 }],
        errorMessage: 'nickname must be between 2 and 15 chars long'
      },
    }
  };
};

export default { 
  USER_VALIDATION_SCHEMA,
  USER_UPDATE_VALIDATION_SCHEMA
};