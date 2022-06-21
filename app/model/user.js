import mongoose from 'mongoose';
import { genSaltSync, hashSync, compareSync } from 'bcrypt';

const UserSchema = new mongoose.Schema({
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  }],
  email: {
    type: String,
    required: [true, 'Email is required!'],
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Email format is incorrect'],
    trim: true,
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
  isActive: {
    type: Boolean,
    default: true
  }
}, { toObject: { virtuals: true }, timestamps: true, versionKey: false });

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

UserSchema.pre('save', function (next) {
  if (!this.isModified('password')) next();
  else {
    const salt = genSaltSync(12);
    const hashed = hashSync(this.password, salt);
    this.salt = salt;
    this.password = hashed;
    next()
  }
});

UserSchema.methods.comparePassword = function (password) {
  return compareSync(password, this.password);
};

export const UserModel = mongoose.model('User', UserSchema);