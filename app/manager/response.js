import { StatusCodes } from 'http-status-codes';
import { cookieOption } from '../../config/cookie-options.js';
import { jwtOptions } from '../../config/jwt-options.js';

const BasicResponse = {
  success: false,
  message: '',
  data: {}
};

class ResponseManager {
  constructor() {
  }

  static get HTTP_STATUS() {
    return StatusCodes;
  }

  static getEndResponseHandler(res) {
    return {
      onSuccess: (data) => {
        res.end(data)
      },
      onError: (error) => {
        res.end(JSON.stringify({ ...BasicResponse, message: error.message }))
      }
    }
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

  static getCookieResponseHandler(res) {
    return {
      onSuccess: (cookies, data, message, code) => {
        this.respondWithCookies(res, code || this.HTTP_STATUS.OK, cookies, data, message);
      },
      onError: (error) => {
        this.respondWithError(res, error.status || this.HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message || 'Unknown error');
      }
    }
  }

  static getCookieResponseHandlerClear(res) {
    return {
      onSuccess: (cookies, data, message, code) => {
        this.respondWithClearCookies(res, code || this.HTTP_STATUS.OK, cookies, data, message);
      },
      onError: (error) => {
        this.respondWithError(res, error.status || this.HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message || 'Unknown error');
      }
    }
  }

  static respondWithSuccess(res, code, data = {}, message = '', links = []) {
    const response = Object.assign({}, BasicResponse);
    response.success = true;
    response.data = data;
    response.message = message;

    response.links = links;
    res.status(code).json(response);
  }

  static respondWithCookies(res, code, cookies, data = {}, message = '', links = []) {
    const response = Object.assign({}, BasicResponse);
    const cookieNames = Object.keys(cookies);

    response.success = true;
    response.data = data;
    response.message = message;
    response.links = links;
    cookieNames.forEach(name => name === 'accessToken'
      ? res.cookie(name, cookies[name], { maxAge: jwtOptions.accessTokenMaxAge, ...cookieOption })
      : res.cookie(name, cookies[name], { maxAge: jwtOptions.refreshTokenMaxAge, ...cookieOption })
    );

    res.status(code).json(response);
  }

  static respondWithClearCookies(res, code, cookies, data = {}, message = '', links = []) {
    const response = Object.assign({}, BasicResponse);
    const cookieNames = Object.keys(cookies);

    response.success = true;
    response.data = data;
    response.message = message;
    response.links = links;
    cookieNames.forEach(name => res.cookie(name, '', { maxAge: 0, ...cookieOption }));

    res.status(code).json(response);
  }

  static respondWithError(res, errorCode, message = '', links = []) {
    const response = Object.assign({}, BasicResponse);
    response.success = false;
    response.message = message;
    response.links = links;

    res.status(errorCode).json(response);
  }

  static respondWithErrorData(res, errorCode, data = {}, message = '', links = []) {
    const response = Object.assign({}, BasicResponse);
    response.success = false;
    response.data = data;
    response.message = message;
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
