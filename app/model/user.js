import { genSaltSync, hashSync, compareSync } from 'bcrypt';
import mongoose from 'mongoose';

import { RoleModel } from './role.js';
import { PostModel } from './post.js';
import { FileModel } from './file.js';
import ForbiddenError from '../error/forbidden.js';

const UserSchema = new mongoose.Schema({
  avatar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File'
  },
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  }],
  email: {
    type: String,
    required: [true, 'Email is required!'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Password is required!'],
    select: false
  },
  salt: {
    type: String,
    select: false
  },
  nickname: {
    type: String,
    required: [true, 'Nickname is required!'],
    unique: true
  },
  greetings: {
    type: String
  },
  introduce: {
    type: String
  },
  lastLoginIP: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiredAt: {
    type: Date,
    default: undefined,
    expires: 0
  }
}, {
  toObject: {
    virtuals: true
  },
  timestamps: {
    currentTime: (time = Date.now()) => new Date(time).getTime() - new Date(time).getTimezoneOffset() * 60 * 1000
  },
  versionKey: false
});

UserSchema.virtual('id')
  .get(function () { return this._id });

UserSchema.virtual('passwordConfirmation')
  .get(function(){ return this._passwordConfirmation; })
  .set(function(value){ this._passwordConfirmation=value; });

UserSchema.virtual('originalPassword')
  .get(function() { return this._originalPassword })
  .set(function(value) { this._originalPassword = value });

UserSchema.virtual('currentPassword')
  .get(function() { return this._currentPassword })
  .set(function(value) { this._currentPassword = value });

UserSchema.virtual('newPassword')
  .get(function() { return this._newPassword })
  .set(function(value) { this._newPassword = value });

UserSchema.methods.comparePassword = function (password) {
  return compareSync(password, this.password);
};

const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d!@#$%^&*]{4,30}$/;
UserSchema.path('password').validate(function (value) {
  if (this.isNew) {
    if (!this.passwordConfirmation) {
      this.invalidate('passwordConfirmation', 'Password confirmation is required!');
    }
    if (!passwordRegex.test(this.password)) {
      this.invalidate('password', 'Password REGEX Error');
    }
    else if (this.password !== this.passwordConfirmation) {
      this.invalidate('password', 'Password confirmation does not matched!');
    }
  }

  if (!this.isNew) {
    if (!this.currentPassword) {
      this.invalidate('currentPassword', 'Current password is required!');
    }
    else if (!compareSync(this.currentPassword, this.originalPassword)) {
      this.invalidate('newPassword', 'Current password does not matched with original Password!');
    }
    if (this.newPassword && !passwordRegex.test(this.newPassword)) {
      this.invalidate('newPassword', 'Password REGEX Error');
    }
    else if (this.newPassword !== this.passwordConfirmation) {
      this.invalidate('passwordConfirmation', 'Password confirmation does not matched!');
    }
  }
});

UserSchema.pre('save', async function (next) {
  // 신규 가입 -> 'USER' role 추가
  if (this.isNew) {
    const userRole = await RoleModel.findOne({ name: 'USER' }, { _id: 1 }, { lean: true }).exec();
    this.roles.push(userRole._id) ;
  }

  // 패스워드 수정 시 salt 및 해시 재생성
  if (!this.isModified('password')) next();
  else {
    const salt = genSaltSync(12);
    const hashed = hashSync(this.password, salt);
    this.salt = salt;
    this.password = hashed;
    next();
  }
});

// 유저 정보 조회 시 훅
UserSchema.post('findOne', function (doc, next) {
  if (!doc) {
    next(new ForbiddenError('존재하지 않는 유저입니다.'));
  }
  else if (!doc.isActive) {
    next(new ForbiddenError('본 계정은 비활성화 상태입니다. 관리자에게 문의하세요.'));
  }
  else {
    next();
  }
});

UserSchema.post('findOneAndUpate', async function (doc, next) {
  try {
    const query = this.getUpdate();

    // 계정이 활성화 상태인 경우
    if (doc.isActive) next();

    // 계정이 비활성화 상태이거나 비활성화 된 경우
    else {

      // 계정이 비활성화 상태이고 활성화를 변경하는 것이 아닌 경우
      if (!query.$set || !Object.keys(query.$set).includes('isActive')) next(new ForbiddenError('본 계정은 비활성화 상태입니다. 관리자에게 문의하세요.'));

      // 계정이 비활성화 되는 경우 -> 계정 명의로 된 게시물 및 파일 모두 비활성화
      else if (query.$set?.isActive === false) {
        await PostModel.updateMany(
          { author: doc._id },
          { $set: { isActive: false } },
          { lean: true }
        ).exec();

        await FileModel.updateMany(
          { uploader: doc._id },
          { $set: { isActive: false } },
          { lean: true }
        ).exec();

        next();
      }

      else {
        next();
      }
    }
  } catch (error) {
    next(error);
  }
});

export const UserModel = mongoose.model('User', UserSchema);
