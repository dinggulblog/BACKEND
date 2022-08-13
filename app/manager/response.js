import { StatusCodes } from 'http-status-codes';

const BasicResponse = {
  success: false,
  message: '',
  data: {}
};

const CookieOption = {
  httpOnly: true,
  signed: process.env.NODE_ENV !== 'develop',
  secure: process.env.NODE_ENV !== 'develop',
  secret: process.env.COOKIE_SECRET,
  expires: new Date(0)
};

class ResponseManager {
  constructor() {

  }

  static get HTTP_STATUS() {
    return StatusCodes;
  }

  static getDefaultResponseHandler(res) {
    return {
      onSuccess: (data, message, code) => {
        this.respondWithSuccess(res, code || this.HTTP_STATUS.OK, data, message);
      },
      onError: (error) => {
        this.respondWithError(res, error.status || this.HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message || 'Unknown error');
      }
    };
  }

  static getDefaultResponseHandlerData(res) {
    return {
      onSuccess: (data, message, code) => {
        this.respondWithSuccess(res, code || this.HTTP_STATUS.OK, data, message);
      },
      onError: (error) => {
        this.respondWithErrorData(res, error.status || this.HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message || 'Unknown error', error.data);
      }
    };
  }

  static getCookieResponseHandler(res) {
    return {
      onSuccess: (cookies, data, message, code) => {
        this.respondWithSuccessCookies(res, code || this.HTTP_STATUS.OK, cookies, data, message);
      },
      onError: (error) => {
        this.respondWithError(res, error.status || this.HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message || 'Unknown error');
      }
    }
  }

  static getResetCookieResponseHandler(res) {
    return {
      onSuccess: (cookies, data, message, code) => {
        this.respondWithResetCookies(res, code || this.HTTP_STATUS.OK, cookies, data, message);
      },
      onError: (error) => {
        this.respondWithError(res, error.status || this.HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message || 'Unknown error');
      }
    }
  }

  static getDefaultResponseHandlerError(res, successCallback) {
    return {
      onSuccess: (data, message, code) => {
        successCallback(data, message, code);
      },
      onError: (error) => {
        this.respondWithError(res, error.status || this.HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message || 'Unknown error');
      }
    };
  }

  static getDefaultResponseHandlerSuccess(res, errorCallback) {
    return {
      onSuccess: (data, message, code) => {
        this.respondWithSuccess(res, code || this.HTTP_STATUS.OK, data, message);
      },
      onError: (error) => {
        errorCallback(error);
      }
    };
  }

  static respondWithSuccess(res, code, data, message = '', links) {
    const response = Object.assign({}, BasicResponse);
    response.success = true;
    response.message = message;
    response.data = data;
    response.links = links;
    res.status(code).json(response);
  }

  static respondWithSuccessCookies(res, code, cookies, data, message = '', links) {
    const response = Object.assign({}, BasicResponse);
    const cookieNames = Object.keys(cookies);
    response.success = true;
    response.message = message;
    response.data = data;
    response.links = links;
    
    cookieNames.forEach(name => res.cookie(name, cookies[name], CookieOption));
    res.status(code).json(response);
  }

  static respondWithResetCookies(res, code, cookies, data, message = '', links) {
    const response = Object.assign({}, BasicResponse);
    const cookieNames = Object.keys(cookies);
    response.success = true;
    response.message = message;
    response.data = data;
    response.links = links;

    cookieNames.forEach(name => res.clearCookie(name, CookieOption));
    res.status(code).json(response);
  }

  static respondWithError(res, errorCode, message = '', links = []) {
    const response = Object.assign({}, BasicResponse);
    response.success = false;
    response.message = message;
    response.links = links;
    res.status(errorCode).json(response);
  }

  static respondWithErrorData(res, errorCode, message = '', data = '', links) {
    const response = Object.assign({}, BasicResponse);
    response.success = false;
    response.message = message;
    response.data = data;
    response.links = links;
    res.status(errorCode).json(response);
  }

  static generateHATEOASLink(link, method, rel) {
    return {
      link: link,
      method: method,
      rel: rel
    }
  }
}

export default ResponseManager;