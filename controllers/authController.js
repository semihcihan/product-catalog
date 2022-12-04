const { logRequest } = require('../utils/analytics');
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

exports.sendResetPasswordEmail = catchAsync(async (req, res, next) => {
  await sendResetPasswordEmail(req.body.email);
  logRequest(req, 'user.reset_password_email');
  res.status(200).json({
    status: 'success',
  });
});
