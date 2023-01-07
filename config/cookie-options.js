export const cookieOption = (time) => {
  return {
    httpOnly: true,
    maxAge: time,
    domain: 'dinggul.me',
    signed: process.env.NODE_ENV !== 'develop',
    secure: process.env.NODE_ENV !== 'develop',
    proxy: process.env.NODE_ENV !== 'develop'
  };
};
