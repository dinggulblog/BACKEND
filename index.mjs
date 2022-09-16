import { readdirSync, mkdirSync, accessSync, unlinkSync, constants } from 'fs';
import { resolve, join } from 'path';
import { config } from 'dotenv';
import { exit } from 'process';
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
  console.log('.env 파일을 찾을 수 없습니다. 서버를 종료합니다.');
  exit(1);
}

// Connect to DB
try {
  await db.connect(process.env.MONGO_CONNECT_URL);
  await db.createDefaultDoc();
} catch (error) {
  console.error(error);
  exit(1);
}

// Create an upload directory
try {
  readdirSync('uploads');
} catch (error) {
  console.error('Create missing directory: "uploads"');
  mkdirSync('uploads');
}

// Create an express app
const app = express();

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

// Handling a non-existent route
app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} router does not exist.`);
  error.status = 410;
  next(error);
});

// Error handling
app.use((err, req, res, next) => {
  console.log(err)
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV === 'production' ? {} : err;

  // Deleting files when an error occurs after file uploaded
  if (req.file) {
    const filePath = join(__dirname, 'uploads', req.file.filename);
    accessSync(filePath, constants.F_OK);
    unlinkSync(filePath);
  }
  else if (req.files && req.files.length) {
    req.files.forEach(file => {
      const filePath = join(__dirname, 'uploads', file.filename);
      accessSync(filePath, constants.F_OK);
      unlinkSync(filePath);
    })
  }

  responseManager.respondWithError(res, res.locals.error.status || 500, res.locals.message || '')
});

export default app;