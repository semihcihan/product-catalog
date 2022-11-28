const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
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
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
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
    type: Boolean,
    default: true,
    select: false,
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
});

userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
