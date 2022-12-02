const jwtBearer = require('express-oauth2-jwt-bearer');
const { ManagementClient } = require('auth0');
const axios = require('axios');
const AppError = require('../utils/appError');
const permissions = require('./permissions');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

const permissionsByRole = {
  admin: Object.values(permissions).join(),
  customer: [
    permissions.CREATE_OWN_USER,
    permissions.DELETE_OWN_USER,
    permissions.READ_OWN_USER,
    permissions.UPDATE_OWN_EMAIL,
    permissions.UPDATE_OWN_USER,
  ],
  supplier: [
    permissions.CREATE_OWN_USER,
    permissions.DELETE_OWN_USER,
    permissions.READ_OWN_USER,
    permissions.UPDATE_OWN_EMAIL,
    permissions.UPDATE_OWN_USER,
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
    const permissionToCheck =
      req.user.appId === req.params.id ? ownUserPermission : adminPermission;
    if (!permissionToCheck) {
      return next();
    }

    if (!req.user.role) {
      return next(new AppError('no_role', 401));
    }

    if (!permissionsByRole[req.user.role].includes(permissionToCheck)) {
      return next(new AppError('insufficient_permission', 401));
    }

    next();
  };

exports.checkUserStatusWritePermission = (req, res, next) => {
  if (!req.body.status) {
    return next();
  }

  if (
    !permissionsByRole[req.user.role].includes(permissions.UPDATE_USER_STATUS)
  ) {
    return next(new AppError('insufficient_permission', 401));
  }

  next();
};

exports.checkUserRoleWritePermission = (req, res, next) => {
  if (!req.body.role) {
    return next();
  }

  if (
    !permissionsByRole[req.user.role].includes(permissions.UPDATE_USER_ROLE)
  ) {
    return next(new AppError('insufficient_permission', 401));
  }

  next();
};

exports.checkUserCreatePermission = (req, res, next) => {
  if (!req.user) {
    next(new AppError('insufficient_permission', 401));
  }

  if (
    (!req.user.appId && !req.body.auth0Id) ||
    (req.user.role &&
      permissionsByRole[req.user.role].includes(permissions.CREATE_USER))
  ) {
    return next();
  }

  next(new AppError('insufficient_permission', 401));
};

exports.getUserFromAuthWithAppId = async (appId) => {
  const params = {
    search_engine: 'v3',
    q: `app_metadata.appUserId:${appId}`,
    per_page: 1,
    page: 0,
  };

  const users = await management.getUsers(params);
  if (users && users.length !== 0) {
    return users[0];
  }

  return undefined;
};

exports.deleteUser = (auth0Id) => {
  management.deleteUser({ id: auth0Id });
};

const TOKEN_APP_META_DATA_KEY = 'custom/app_metadata';

exports.extractUserFromAccessToken = catchAsync(async (req, res, next) => {
  req.user = req.auth ? req.auth.payload : {};
  if (req.user[TOKEN_APP_META_DATA_KEY]) {
    req.user.appId = req.user[TOKEN_APP_META_DATA_KEY].appUserId;
  }
  if (req.user.appId) {
    const user = await User.findById(req.user.appId);
    if (!user) {
      return next(new AppError('No document found with that ID', 404));
    }
    req.user = { ...req.user, ...user.toJSON() };

    if (req.user.status !== 'active') {
      return next(new AppError('User not found', 404));
    }
  }
  next();
});

exports.checkJwt = jwtBearer.auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
});
