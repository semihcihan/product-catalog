const express = require('express');
const {
  checkRequiredPermissions,
  extractUserFromAccessToken,
  checkJwt,
  checkUserRoleWritePermission,
  checkUserStatusWritePermission,
} = require('../controllers/auth.service');
const auth0Scopes = require('../controllers/auth0Scopes');

const userController = require('../controllers/userController');

const router = express.Router();

router.post('/reset-password', userController.sendResetPasswordEmail);

router.use(checkJwt);
router.use(extractUserFromAccessToken);

router.post(
  '/',
  checkRequiredPermissions(
    auth0Scopes.CREATE_USER,
    auth0Scopes.CREATE_OWN_USER
  ),
  checkUserRoleWritePermission,
  checkUserStatusWritePermission,
  userController.createUser
);

router.patch(
  '/:id',
  checkRequiredPermissions(
    auth0Scopes.UPDATE_USER,
    auth0Scopes.UPDATE_OWN_USER
  ),
  checkUserRoleWritePermission,
  checkUserStatusWritePermission,
  userController.patchUser
);

router.put(
  '/:id',
  checkRequiredPermissions(
    auth0Scopes.UPDATE_USER,
    auth0Scopes.UPDATE_OWN_USER
  ),
  checkUserRoleWritePermission,
  checkUserStatusWritePermission,
  userController.putUser
);

router.get(
  '/:id',
  checkRequiredPermissions(auth0Scopes.READ_USERS, auth0Scopes.READ_OWN_USER),
  userController.getUser
);

router.delete(
  '/:id',
  checkRequiredPermissions(
    auth0Scopes.DELETE_USER,
    auth0Scopes.DELETE_OWN_USER
  ),
  userController.deleteUser
);

router.post(
  '/:id/change-email',
  checkRequiredPermissions(
    auth0Scopes.UPDATE_USER_EMAIL,
    auth0Scopes.UPDATE_OWN_EMAIL
  ),
  userController.changeEmail
);

router.get(
  '/',
  checkRequiredPermissions(auth0Scopes.READ_USERS, auth0Scopes.READ_USERS),
  userController.getUsers
);

module.exports = router;
