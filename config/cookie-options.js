export const cookieOption = {
  httpOnly: true,
  signed: process.env.NODE_ENV !== 'develop',
  secure: process.env.NODE_ENV !== 'develop',
  proxy: process.env.NODE_ENV !== 'develop'
};
