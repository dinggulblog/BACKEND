import { Passport as BasePassport } from 'passport';

class BaseAuthStrategy extends BasePassport {
  constructor() {
    super();
  }

  get name() {
    throw new Error('Not Implemented');
  }

  _initStrategy() {
    throw new Error('Not Implemented');
  }

  authenticate(req) {
    throw new Error('Not Implemented');
  }

  authenticate(req, options) {
    throw new Error('Not Implemented');
  }

  provideSecretKey() {
    throw new Error('Not Implemented');
  }

  provideOptions() {
    throw new Error('Not Implemented');
  }  
}

export default BaseAuthStrategy;