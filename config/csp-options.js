export const cspOptions = {
  'base-uri': ["'self'", "'https://dinggul.me'"],
  'default-src': ["'self'", "'http://localhost:8080'"],
  'script-src': ["'self'", "'http://localhost:8080'", '*.googleapis.com', "'unsafe-inline'"],
  'style-src': ["'self'", "'http://localhost:8080'", '*.googleapis.com', '*.fonts.googleapis.com'],
  'font-src': ["'self'", "'http://localhost:8080'", '*.googleapis.com', '*.fonts.googleapis.com'],
  'img-src': ["'self'",  "'https://dinggul.me/uploads'", process.env.AWS_S3_IMAGE_URL]
};