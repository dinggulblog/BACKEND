// Include dependencies
import { readdirSync, mkdirSync } from 'fs';
import { resolve, join } from 'path';
import { config } from 'dotenv';
import cors from 'cors';
import csurf from 'csurf';
import helmet from 'helmet';
import csp from 'helmet-csp';
import hpp from 'hpp';
import morgan from 'morgan';
import express from 'express';
import useragent from 'express-useragent';
import cookieParser from 'cookie-parser';

import db from './config/db.js';
import routes from './app/routes/index.js';
import authManager from './app/manager/auth.js';
import responseManager from './app/manager/response.js';

// Global variables
global.__dirname = resolve();

// Set config variables in .env
if (process.env.NODE_ENV === 'production') {
  config({ path: join(__dirname, '.env.production')});
}
else if (process.env.NODE_ENV === 'develop') {
  config({ path: join(__dirname, '.env.develop')});
}
else {
  throw new Error('Cannot find process.env.NODE_ENV');
}

// Create an express app
const app = express();

// Connect to DB
db.connect(process.env.MONGO_CONNECT_URL);
db.createDefaultDoc();

// Create an upload directory
try {
  readdirSync('uploads');
} catch (error) {
  console.error('Create missing directory: "uploads"');
  mkdirSync('uploads');
}

// Cors, Loging and Securities
app.use(cors({ origin: 'http://localhost:8080', credentials: true }));

if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
  app.use(helmet());
  app.use(csp({
    directives: {
      baseUri: ["'self'"],
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", '*.fonts.googleapis.com'],
      fontSrc: ["'self'", '*.googleapis.com'],
      imgSrc: ["'self'"]
    }
  }))
  app.use(hpp());
} else {
  app.use(morgan('dev'));
}

// Express Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(join(__dirname, 'public')));
app.use('/uploads', express.static(join(__dirname, 'uploads')));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(useragent.express());

// Setup auth manager
app.use(authManager.providePassport().initialize());

// Setup routes
app.use('/', routes);

// Error handling
app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} router does not exist.`);
  error.status = 410;
  next(error);
})
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV === 'production' ? {} : err;
  responseManager.respondWithError(res, err.status || 410, err.message || "")
})

export default app;