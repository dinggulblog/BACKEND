import { cookieOption } from './cookie-options.js';

export const sessionOptions = {
  name: 'DINGGUL.SID',
  path: '/',
  resave: false,
  saveUninitialized: true,
  cookie: cookieOption(14 * 24 * 60 * 60 * 1000)
};