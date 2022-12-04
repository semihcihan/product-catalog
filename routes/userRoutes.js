const express = require('express');
const {
  checkRequiredPermissions,
  extractUserFromAccessToken,
  checkJwt,
  checkUserRoleWritePermission,
  checkUserStatusWritePermission,
  checkUserCreatePermission,
} = require('../controllers/auth.service');
const permissions = require('../controllers/permissions');

const userController = require('../controllers/userController');

const router = express.Router();

router.post('/reset-password', userController.sendResetPasswordEmail);

router.use(checkJwt);
router.use(extractUserFromAccessToken);

router.post(
  '/',
  checkUserCreatePermission,
  checkUserRoleWritePermission,
  checkUserStatusWritePermission,
  userController.createUser
);

router
  .route('/:id')
  .all(
    checkRequiredPermissions(
      permissions.UPDATE_USER,
      permissions.UPDATE_OWN_USER
    ),
    checkUserRoleWritePermission,
    checkUserStatusWritePermission,
    userController.uploadUserPhoto,
    userController.resizeUserPhoto
  )
  .patch(userController.patchUser)
  .put(userController.putUser);

router.get(
  '/:id',
  checkRequiredPermissions(permissions.READ_USERS, permissions.READ_OWN_USER),
  userController.getUser
);

router.delete(
  '/:id',
  checkRequiredPermissions(
    permissions.DELETE_USER,
    permissions.DELETE_OWN_USER
  ),
  userController.deleteUser
);

router.post(
  '/:id/change-email',
  checkRequiredPermissions(
    permissions.UPDATE_USER_EMAIL,
    permissions.UPDATE_OWN_EMAIL
  ),
  userController.changeEmail
);

router.get(
  '/',
  checkRequiredPermissions(permissions.READ_USERS, permissions.READ_USERS),
  userController.getUsers
);

module.exports = router;
