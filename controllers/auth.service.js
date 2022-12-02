const jwtBearer = require('express-oauth2-jwt-bearer');
const { ManagementClient } = require('auth0');
const axios = require('axios');
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

exports.updateAuth0UserMetaData = async (auth0Id, appMetadata) =>
  await management.updateUser(
    { id: auth0Id },
    { app_metadata: { ...appMetadata } }
  );

exports.updateAuth0UserRole = async (auth0Id, role) => {
  const roles = await management.getRoles();
  const auth0Role = roles.find((r) => r.name === role);
  if (!auth0Role) {
    throw new AppError('No role found with this name', 404);
  }

  await management.assignRolestoUser({ id: auth0Id }, { roles: auth0Role.id });
};

exports.changeEmail = async (auth0Id, email) => {
  await management.updateUser(
    { id: auth0Id },
    { email: email, email_verified: false, verify_email: true }
  );
};

exports.sendResetPasswordEmail = async (email) => {
  //TODO: use management API
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

exports.checkRequiredPermissions =
  (adminPermission, ownUserPermission) => (req, res, next) => {
    const scopeToCheck =
      req.user.appId === req.params.id ? ownUserPermission : adminPermission;
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

    next();
  };

exports.checkUserStatusWritePermission = (req, res, next) => {
  if (!req.body.status) {
    return next();
  }

  const scopeToCheck = auth0Scopes.UPDATE_USER_STATUS;
  if (
    !req.user.roles.some((role) => scopesByRole[role].includes(scopeToCheck))
  ) {
    return next(new AppError('insufficient_scope', 401));
  }

  next();
};

exports.checkUserRoleWritePermission = (req, res, next) => {
  if (!req.body.role) {
    return next();
  }

  const scopeToCheck = auth0Scopes.UPDATE_USER_ROLE;
  if (
    !req.user.roles.some((role) => scopesByRole[role].includes(scopeToCheck))
  ) {
    return next(new AppError('insufficient_scope', 401));
  }

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

const TOKEN_APP_META_DATA_KEY = 'custom/app_metadata';
const TOKEN_ROLES_KEY = 'custom/roles';

exports.extractUserFromAccessToken = (req, res, next) => {
  req.user = req.auth ? req.auth.payload : {};
  req.user.appId = req.user[TOKEN_APP_META_DATA_KEY].appUserId;
  req.user.status = req.user[TOKEN_APP_META_DATA_KEY].status;
  req.user.roles = req.user[TOKEN_ROLES_KEY];
  next();
};

exports.checkJwt = jwtBearer.auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
});
