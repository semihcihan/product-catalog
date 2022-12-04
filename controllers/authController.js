const { validationResult } = require('express-validator');
const validator = require('express-validator');
const { logRequest } = require('../utils/analytics');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { sendResetPasswordEmail } = require('./auth.service');

exports.login = (req, res, next) => {
  res.oidc.login({ returnTo: '/profile' });
  logRequest(req, 'user.login');
};

exports.profile = (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.oidc.user,
      access_token: req.oidc.accessToken.access_token,
      id_token: req.oidc.idToken,
    },
  });

  logRequest(req, 'user.profile');
};

exports.validateResetPasswordEmail = validator
  .body('email', 'Please send a valid e-mail')
  .bail()
  .isEmail();

exports.sendResetPasswordEmail = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Email is not valid', 400));
  }

  await sendResetPasswordEmail(req.body.email);
  logRequest(req, 'user.reset_password_email');
  res.status(200).json({
    status: 'success',
  });
});
