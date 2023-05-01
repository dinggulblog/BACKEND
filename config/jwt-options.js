export const jwtOptions = {
  algorithms: ['EdDSA'],
  issuer: 'https://dinggul.me',
  audience: 'https://dinggul.me',
  accessTokenMaxAge: 1000 * 60 * 60 * 2,       // 2 hours
  refreshTokenMaxAge: 1000 * 60 * 60 * 24 * 14 // 2 weeks
};
