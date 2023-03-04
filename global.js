import { resolve } from 'path';
import { ObjectId } from './config/mongo.js';

// Global variables
globalThis.__dirname = resolve();
globalThis.ObjectId = ObjectId;
globalThis.accessTokenMaxAge = 1000 * 60 * 60* 2; // 2 hours
globalThis.refreshTokenMaxAge = 1000 * 60 * 60 * 24 * 14; // 2 weeks
