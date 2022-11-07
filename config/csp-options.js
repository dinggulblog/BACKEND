export const cspOptions = {
  directives: {
    baseUri: ["'self'"],
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", '*.googleapis.com', "'unsafe-inline'"],
    styleSrc: ["'self'", '*.fonts.googleapis.com'],
    fontSrc: ["'self'", '*.googleapis.com'],
    imgSrc: ["'self'"]
  }
};