export const cspOptions = {
  directives: {
    baseUri: ["'self'"],
    defaultSrc: ["'self'", "'http://localhost:8080'"],
    scriptSrc: ["'self'", '*.googleapis.com', "'unsafe-inline'"],
    styleSrc: ["'self'", '*.googleapis.com', '*.fonts.googleapis.com'],
    fontSrc: ["'self'", '*.googleapis.com', '*.fonts.googleapis.com'],
    imgSrc: ["'self'"]
  }
};