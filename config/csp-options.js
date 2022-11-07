export const cspOptions = {
  'base-uri': ["'self'"],
  'default-src': ["'self'", "'http://localhost:8080'"],
  'script-src': ["'self'", '*.googleapis.com', "'unsafe-inline'"],
  'style-src': ["'self'", '*.googleapis.com', '*.fonts.googleapis.com'],
  'font-src': ["'self'", '*.googleapis.com', '*.fonts.googleapis.com'],
  'img-src': ["'self'", process.env.AWS_S3_IMAGE_URL]
};