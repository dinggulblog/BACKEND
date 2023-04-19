import { resolve } from 'path';
import { ObjectId } from '../app/library/mongo.js';

// Global variables
globalThis.__dirname = resolve();
globalThis.ObjectId = ObjectId;
