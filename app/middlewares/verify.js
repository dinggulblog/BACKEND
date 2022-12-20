import ForbiddenError from '../error/forbidden.js';

/**
 * Middleware function to verify an authority included in payload
 * @param {Array} roles Payload array containing roles
 * @param {String} authority A Permission want to check
 * @param {Function} done Callback function
 * @returns execute callback with null or error params
 */
export const verify = (roles, authority, done) => {
  return Array.isArray(roles) && roles.includes(authority)
    ? done(null)
    : done(new ForbiddenError('해당 요청에 대한 권한이 없습니다.'));
}
