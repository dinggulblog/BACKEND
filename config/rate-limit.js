import RateLimit from 'express-rate-limit';
import ResponseManager from '../app/manager/response.js';

export const RateLimiter = new RateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler(req, res) {
    ResponseManager.respondWithError(res, this.statusCode || 429, this.message);
  }
})