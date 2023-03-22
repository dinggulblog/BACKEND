import './global.js';
import './env.js';
import './app/util/node-scheduler.js';
import './app/util/toad-scheduler.js';

import { join } from 'path';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import csurf from 'csurf';
import morgan from 'morgan';
import express from 'express';
import cookieParser from 'cookie-parser';
import history from 'connect-history-api-fallback';
import routes from './app/routes/index.js';
import authManager from './app/manager/auth.js';
import responseManager from './app/manager/response.js';

// Create an express app
const app = express();

// Set headers
app.set('etag', false);
app.enable('trust proxy');
app.disable('x-powered-by');

// Cors, Loging and Securities
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(hpp({ whitelist: ['menus'] }));
  app.use(cors({ origin: 'https://dinggul.me', credentials: true }));
} else {
  app.use(morgan('dev'));
  app.use(cors({ origin: 'http://localhost:8080', credentials: true }));
}

// Express Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(csurf({ cookie: { secure: process.env.NODE_ENV === 'production' } }));
app.use((req, res, next) => {
  // res.set('Cache-Control', 'no-cache, no-store, must-revalidate, proxy-revalidate');
  res.cookie('XSRF-TOKEN', req.csrfToken(), { secure: process.env.NODE_ENV === 'production' });
  res.locals.csrf = req.csrfToken();
  next();
});

// Middleware passport initialize
app.use(authManager.providePassport().initialize());

// Setup routes
app.use('/', routes);
app.use('/xsrf-token', (req, res, next) => responseManager.respondWithSuccess(res, 200, { xsrfToken: res.locals.csrf }));
app.use(history());

// Static route
app.use(express.static(join(__dirname, 'public')));
app.use('/uploads', express.static(join(__dirname, 'uploads'))); // will be deprecated

// Handling a non-existent route
app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} router does not exist.`);
  error.status = 410;
  next(error);
});

// Error handling
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV === 'production' ? {} : err;
  responseManager.respondWithError(res, res.locals.error.status ?? 500, res.locals.message)
});

export default app;