import './config/global.js';
import './config/env.js';
import './app/util/node-scheduler.js';
import './app/util/toad-scheduler.js';

import { join } from 'path';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import express from 'express';
import cookieParser from 'cookie-parser';
import history from 'connect-history-api-fallback';
import routes from './app/routes/index.js';
import authManager from './app/manager/auth.js';
import { cspOptions } from './config/csp-options.js';

// Create an express app
const app = express();

// Cors, Loging and Securities
if (process.env.NODE_ENV === 'production') {
  app.enable('trust proxy');
  app.use(morgan('combined'));
  // app.use(helmet({ contentSecurityPolicy: false }));
  app.use(helmet.contentSecurityPolicy({ directives: cspOptions }))
  app.use(helmet.crossOriginEmbedderPolicy({ policy: 'credentialless' }));
  app.use(helmet.crossOriginResourcePolicy({ policy: 'same-origin' }));
  app.use(helmet.hsts({ maxAge: 90 * 24 * 60 * 60, includeSubDomains: true, preload: true }));
  app.use(helmet.dnsPrefetchControl());
  app.use(helmet.frameguard());
  app.use(helmet.hidePoweredBy());
  app.use(helmet.ieNoOpen());
  app.use(helmet.noSniff());
  app.use(helmet.originAgentCluster());
  app.use(helmet.permittedCrossDomainPolicies());
  app.use(helmet.referrerPolicy());
  app.use(helmet.xssFilter());
  app.use(hpp({ whitelist: ['menus'] }));
} else {
  app.use(morgan('dev'));
  app.use(cors({ origin: 'http://localhost:8080', credentials: true }));
}

// Express Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// Middleware passport initialize
app.use(authManager.providePassport().initialize());

// Setup routes
app.use('/', routes);
app.use(history());

// Static route
app.use(express.static(join(__dirname, 'public')));

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
  res.status(res.locals.error.status ?? 500).json({ success: false, message: res.locals.message, data: {} });
});

export default app;