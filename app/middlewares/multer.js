import multer from 'multer';
import { join, extname, basename } from 'path';
import ForbiddenError from '../error/forbidden.js';

const availableMimetype = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

export const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, done) => {
      done(null, join(__dirname, 'uploads'));
    },
    filename: (req, file, done) => {
      file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8')
      const ext = extname(file.originalname);
      done(null, Date.now() + '-' + basename(file.originalname, ext) + ext);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, done) => {
    availableMimetype.includes(file.mimetype)
      ? done(null, true)
      : done(new ForbiddenError('지원하지 않는 파일 형식입니다.\n지원 파일 포맷: [jpg, jpeg, png, webp]'), false);
  }
});
