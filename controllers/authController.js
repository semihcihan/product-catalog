const { logRequest } = require('../utils/analytics');

exports.login = (req, res, next) => {
  res.oidc.login({ returnTo: '/profile' });
  logRequest(req, 'user.login');
};

exports.profile = (req, res, next) => {
  res.send({
    user: req.oidc.user,
    access_token: req.oidc.accessToken.access_token,
    id_token: req.oidc.idToken,
  });
  logRequest(req, 'user.profile');
};
