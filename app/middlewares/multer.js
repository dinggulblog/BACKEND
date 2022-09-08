import multer from 'multer';
import { join, extname, basename } from 'path'

const availableMimetype = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, done) => {
      done(null, join(__dirname, 'uploads'));
    },
    filename: (req, file, done) => {
      const ext = extname(file.originalname);
      done(null, basename(file.originalname, ext) + Date.now() + ext);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, done) => {
    return availableMimetype.includes(file.mimetype)
      ? done(null, true)
      : done(new Error('Unsupported file format'), false);
  }
});