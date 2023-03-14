import { join, extname, basename } from 'path';
import S3 from 'aws-sdk/clients/s3.js';
import multer from 'multer';
import multerS3 from 'multer-s3';
import ForbiddenError from '../error/forbidden.js';

const availableMimetype = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

const s3 = new S3({
  region: 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

export const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, done) => {
      done(null, join(__dirname, 'uploads'));
    },
    filename: (req, file, done) => {
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
      : done(new ForbiddenError('지원하지 않는 파일 형식입니다.\n지원 파일 포맷: [jpg, jpeg, png, webp, gif]'), false);
  }
});

export const uploadS3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'dinggul-bucket',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, done) => {
      const foldername = req.baseUrl.includes('users') ? 'avatar' : 'post';
      const ext = extname(file.originalname);
      done(null, `${foldername}/${Date.now()}-${basename(file.originalname, ext)}${ext}`);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, done) => {
    availableMimetype.includes(file.mimetype)
      ? done(null, true)
      : done(new ForbiddenError('지원하지 않는 파일 형식입니다.\n지원 파일 포맷: [jpg, jpeg, png, webp, gif]'), false);
  }
});

export const deleteS3 = (key) => {
  s3.deleteObject({
    Bucket: 'dinggul-bucket',
    Key: key
  }, (err, data) => {
    if (err) throw err;
    console.log('Delete files: ', data);
  });
};
