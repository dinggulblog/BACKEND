import { readdirSync, mkdirSync } from 'fs';
import { resolve, join } from 'path';
import { config } from 'dotenv';
import { exit } from 'process';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import csurf from 'csurf';
import morgan from 'morgan';
import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import MongoStore from 'connect-mongo';
import history from 'connect-history-api-fallback';

import { connectMongoDB, createDefaultDocuments } from './config/mongo.js';
import { sessionOptions } from './config/session-options.js';
import { cspOptions } from './config/csp-options.js';
import routes from './app/routes/index.js';
import authManager from './app/manager/auth.js';
import responseManager from './app/manager/response.js';

// Global variables
globalThis.__dirname = resolve();

// Set config variables in .env
if (process.env.NODE_ENV === 'production') {
  config({ path: join(__dirname, '.env.production')});
}
else if (process.env.NODE_ENV === 'develop') {
  config({ path: join(__dirname, '.env.develop')});
}
else {
  console.log('.env 파일을 찾을 수 없습니다. 서버를 종료합니다.');
  exit(1);
}

// Create an upload directory
try {
  readdirSync('uploads');
} catch (error) {
  console.error('Create missing directory: "uploads"');
  mkdirSync('uploads');
}

// Connect to MongoDB server
connectMongoDB(process.env.MONGO_CONNECT_URL).then(createDefaultDocuments);

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
app.use(session({ ...sessionOptions, secret: process.env.COOKIE_SECRET, store: MongoStore.create({ mongoUrl: process.env.MONGO_CONNECT_URL, dbName: 'nodejs' }) }));

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