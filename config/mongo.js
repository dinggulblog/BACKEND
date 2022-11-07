import mongoose from 'mongoose';
import { RoleModel } from '../app/model/role.js';
import { MenuModel } from '../app/model/menu.js';

export const connectMongoDB = async (url) => {
  if (process.env.NODE_ENV !== 'production') {
    mongoose.set('debug', true);
  }

  try {
    await mongoose.connect(url, { dbName: 'nodejs' });
    console.log('\x1b[33m%s\x1b[0m', 'Successfully connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection ERROR: ' + error.message);
  }
}

export const createDefaultDocuments = async () => {
  const roles = ['USER', 'MODERATOR', 'ADMIN'];
  const menus = { 
    'sol': [
      { sub: 'dev', categories: ['기타', 'Javascript', 'Vue.js', 'CSS'] },
      { sub: 'daily', categories: ['기타', '일상', '햄찌', '게임'] },
      { sub: 'album', categories: ['기타', '햄찌', '맛집', '여행'] }
    ],
    'ming': [
      { sub: 'dev', categories: ['기타', 'Javascript', 'Node.js', 'MongoDB'] },
      { sub: 'daily', categories: ['기타', '일상', '햄찌', '게임'] },
      { sub: 'album', categories: ['기타', '햄찌', '게임', '여행'] }
    ],
    'guest': [
      { sub: 'guest book' }
    ]
  };

  try {
    if (!await RoleModel.estimatedDocumentCount()) {
      await Promise.all(
        roles.map(async name => await new RoleModel({ name }).save())
      );
    }
    if (!await MenuModel.estimatedDocumentCount()) {
      await Promise.all(
        Object.keys(menus).map(main => menus[main].map(async ({ sub, categories }) => await new MenuModel({ main, sub, categories }).save())).flat()
      );
    }
  } catch (error) {
    console.error('MongoDB initiation ERROR: ' + error);
  }
}