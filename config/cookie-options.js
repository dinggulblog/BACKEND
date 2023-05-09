export const cookieOption = {
  httpOnly: true,
  signed: process.env.NODE_ENV === 'production',
  secure: process.env.NODE_ENV === 'production',
  proxy: process.env.NODE_ENV === 'production'
};
