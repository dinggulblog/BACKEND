export const cspOptions = {
  'base-uri': ["/", "http:"],
  'default-src': ["'self'", ],
  'script-src': ["'self'", "*.googleapis.com", "'unsafe-inline'"],
  'style-src': ["'self'", "*.googleapis.com", "'unsafe-inline'"],
  'font-src': ["'self'", "*.googleapis.com"],
  'img-src': ["'self'", "data:", process.env.AWS_S3_IMAGE_URL]
};