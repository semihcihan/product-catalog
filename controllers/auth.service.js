const { ManagementClient } = require('auth0');
const axios = require('axios');
const jwtBearer = require('express-oauth2-jwt-bearer');
const AppError = require('../utils/appError');
const auth0Scopes = require('./auth0Scopes');

const scopesByRole = {
  admin: Object.values(auth0Scopes).join(),
  customer: [
    auth0Scopes.CREATE_OWN_USER,
    auth0Scopes.DELETE_OWN_USER,
    auth0Scopes.READ_OWN_USER,
    auth0Scopes.UPDATE_OWN_EMAIL,
    auth0Scopes.UPDATE_OWN_USER,
  ],
  supplier: [
    auth0Scopes.CREATE_OWN_USER,
    auth0Scopes.DELETE_OWN_USER,
    auth0Scopes.READ_OWN_USER,
    auth0Scopes.UPDATE_OWN_EMAIL,
    auth0Scopes.UPDATE_OWN_USER,
  ],
};

const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  scope:
    'read:users update:users create:users create:users_app_metadata delete:users delete:users_app_metadata update:users_app_metadata',
});

exports.updateAuth0User = async (auth0Id, appMetadata) =>
  await management.updateUser(
    { id: auth0Id },
    { app_metadata: { ...appMetadata } }
  );

exports.changeEmail = async (auth0Id, email) => {
  await management.updateUser(
    { id: auth0Id },
    { email: email, email_verified: false, verify_email: true }
  );
};

exports.sendResetPasswordEmail = async (email) => {
  const options = {
    method: 'POST',
    url: `https://${process.env.AUTH0_DOMAIN}/dbconnections/change_password`,
    headers: { 'content-type': 'application/json' },
    data: {
      client_id: process.env.AUTH0_CLIENT_ID,
      email: email,
      connection: 'Username-Password-Authentication',
    },
  };

  return await axios.post(options.url, options.data);
};

exports.checkScope = (adminScope, ownScope) => (req, res, next) => {
  const scopeToCheck = req.user.appId === req.params.id ? ownScope : adminScope;
  console.log('roles', req.user.roles);
  if (!scopeToCheck) {
    return next();
  }

  if (!req.user.roles) {
    return next(new AppError('no_role', 401));
  }

  if (
    !req.user.roles.some((role) => scopesByRole[role].includes(scopeToCheck))
  ) {
    return next(new AppError('insufficient_scope', 401));
  }
  console.log('---oook');

  next();
};

exports.getUserFromAuthWithAppId = (appId) => {
  const params = {
    search_engine: 'v3',
    q: `app_metadata.appUserId:${appId}`,
    per_page: 1,
    page: 0,
  };

  return management.getUsers(params);
};
