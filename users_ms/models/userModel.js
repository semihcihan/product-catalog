const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: [true, 'Please tell us your first name!'],
    },
    lastName: {
      type: String,
      trim: true,
      required: [true, 'Please tell us your last name!'],
    },
    gender: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      validate: {
        validator: function (v) {
          return validator.isMobilePhone(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    username: {
      type: String,
      unique: true,
      trim: true,
      required: [true, 'Please select a username!'],
      minLength: [3, 'Too short for a username'],
      maxLength: [30, 'Too long for a username'],
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
        country: String,
        city: String,
        state: String,
        address: String,
        postalCode: String,
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
