// Include dependencies
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import csp from 'helmet-csp';
import hpp from 'hpp';
import express from 'express';

// Set config variables in .env
import { config } from 'dotenv';
import { readdirSync, mkdirSync } from 'fs';

import db from './config/db.js';
import routes from './app/routes/index.js';
import authManager from './app/manager/auth.js';

const __dirname = path.resolve();

// .env config
if (process.env.NODE_ENV === 'production') {
  config({ path: path.join(__dirname, '.env.production')});
} else if (process.env.NODE_ENV === 'develop') {
  config({ path: path.join(__dirname, '.env.develop')});
} else {
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

// Cors policy
app.use(cors({ credentials: true }));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));

// Logging
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

// Setup auth manager
app.use(authManager.providePassport().initialize());

// Setup routes
app.use('/', routes);

export default app;
