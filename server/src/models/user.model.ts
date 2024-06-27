import { Schema, model } from 'mongoose';

const User = new Schema(
  {
    email: { type: String, default: '', required: [true, 'errors.doesntExists'], unique: true, trim: true },
    password: { type: String, default: '', required: [true, 'errors.doesntExists'], trim: true },
    name: { type: String, default: '', required: [true, 'errors.doesntExists'] },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

User.virtual('id').get(function () {
  return this._id.toHexString();
});

User.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

export default model('User', User);