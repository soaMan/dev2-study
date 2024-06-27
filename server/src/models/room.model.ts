import mongoose, { Schema, model } from 'mongoose';
// import User from './user.model';

export const chat = new Schema(
  {
    talker: { type: String },
    message: { type: String },
  }
);
const Room = new Schema(
  // {
  //   owner: { type: String, default: '', required: [true, 'errors.doesntExists'], trim: true },
  //   name: { type: String, default: '', required: [true, 'errors.doesntExists'], trim: false },
  //   participants: { type: String, },
  //   status: { type: String, },
  //   chat: [chat]
  // },
  // {
  //   timestamps: true,
  //   versionKey: false,
  // }

  {
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: 'User', required: [true, 'errors.doesntExists']
    },
    name: { type: String, default: '', required: [true, 'errors.doesntExists'], trim: false },
    participants: { 
      type: mongoose.Schema.ObjectId,
      ref: 'User', 
    },
    status: { type: String, },
    chat: [chat]
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Room.virtual('roomId').get(function () {
//   return this._id.toHexString();
// });

// Room.set('toJSON', {
//   virtuals: true,
//   transform: function (doc, ret) {
//     delete ret._id;
//   },
// });

export default model('Room', Room);


