const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please tell us your first name!'],
    },
    lastName: {
      type: String,
      required: [true, 'Please tell us your last name!'],
    },
    gender: {
      type: String,
    },
    phone: {
      type: String,
    },
    username: {
      type: String,
      unique: true,
      required: [true, 'Please select a username!'],
    },
    birthDate: {
      type: Date,
    },
    avatar: {
      type: String,
      default: 'default.jpg',
    },
    role: {
      type: String,
      enum: ['admin', 'customer', 'supplier'],
      default: 'customer',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active',
    },
    addresses: [
      {
        address: String,
        city: String,
        postalCode: String,
        state: String,
        primary: Boolean,
        label: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
