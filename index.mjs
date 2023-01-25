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

// Cors, Loging and Securities
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(hpp());
} else {
  app.use(cors({ origin: 'http://localhost:8080', credentials: true }));
  app.use(morgan('dev'));
}

// Express Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// Middleware passport initialize
app.use(authManager.providePassport().initialize());

// Setup routes
app.use('/', routes);
app.use(history());

// Static route
app.use(express.static(join(__dirname, 'public')));
app.use('/uploads', express.static(join(__dirname, 'uploads')));

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