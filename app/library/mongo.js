import mongoose from 'mongoose';
import { RoleModel } from '../model/role.js';
import { MenuModel } from '../model/menu.js';
import { UserModel } from '../model/user.js';

export const ObjectId = mongoose.Types.ObjectId;

export const connectMongoDB = async (url) => {
  if (process.env.NODE_ENV !== 'production') {
    mongoose.set('debug', true);
  }

  try {
    mongoose.set('strictQuery', true);
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
      { sub: 'dev', type: 'list', categories: ['기타', 'Javascript', 'Vue.js', 'CSS'] },
      { sub: 'daily', type: 'list', categories: ['기타', '일상', '햄찌', '게임'] },
      { sub: 'album', type: 'card', categories: ['기타', '햄찌', '맛집', '여행'] }
    ],
    'ming': [
      { sub: 'dev', type: 'list', categories: ['기타', 'Javascript', 'Node.js', 'MongoDB'] },
      { sub: 'daily', type: 'list', categories: ['기타', '일상', '햄찌', '게임'] },
      { sub: 'album', type: 'card', categories: ['기타', '햄찌', '게임', '여행'] }
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
        Object.keys(menus).map(main => menus[main].map(async ({ sub, type, categories }) => await new MenuModel({ main, sub, type, categories }).save())).flat()
      );
    }
    if (!await UserModel.estimatedDocumentCount()) {
      const adminRole = await RoleModel.findOne({ name: 'ADMIN' }, { _id: 1 }, { lean: true }).exec();
      await UserModel.create({
        roles: adminRole._id,
        email: 'test0001@test.com',
        nickname: 'test0001',
        password: 'test0001',
        passwordConfirmation: 'test0001'
      });
    }
  } catch (error) {
    console.error('MongoDB initiation ERROR: ' + error);
  }
}
