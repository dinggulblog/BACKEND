/**
 * Add a rule to req to check if the rule exists in the token during JWT validation.
 * @param {String} role Check if a user has privileges: 'ADMIN' or 'USER'
 * @returns next()
 */
export const verifyRole = (role) => {
  return (req, res, next) => {
    req.role = role;
    next();
  };
};