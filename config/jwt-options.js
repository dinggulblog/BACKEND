export const accessOptions = {
  expiresIn: '120m',
  issuer: 'api@dinggul.me',
  audience: 'api.blog.dinggul.me',
  algorithm: 'RS256'
};

export const refreshOptions = {
  expiresIn: '14days',
  issuer: 'api@dinggul.me',
  audience: 'api.blog.dinggul.me',
  algorithm: 'HS256'
};