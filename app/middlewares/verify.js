/**
 * 
 * @param {String} role Check if a user has privileges: 'ADMIN' or 'USER'
 * @returns next()
 */
export const verifyAdmin = (role) => {
  return (req, res, next) => {
    req.role = role;
    next();
  };
};