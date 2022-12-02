const express = require('express');
const {
  checkScope,
  extractUserFromAccessToken,
  checkJwt,
} = require('../controllers/auth.service');
const auth0Scopes = require('../controllers/auth0Scopes');

const userController = require('../controllers/userController');

const router = express.Router();

router.post('/reset-password', userController.sendResetPasswordEmail);

router.use(checkJwt);
router.use(extractUserFromAccessToken);

router.post(
  '/',
  checkScope(auth0Scopes.CREATE_USER, auth0Scopes.CREATE_OWN_USER),
  userController.createUser
);
router.get(
  '/:id',
  checkScope(auth0Scopes.READ_USERS, auth0Scopes.READ_OWN_USER),
  userController.getUser
);
router.patch(
  '/:id',
  checkScope(auth0Scopes.UPDATE_USERS, auth0Scopes.UPDATE_OWN_USER),
  userController.updateUser
);
router.put(
  '/:id',
  checkScope(auth0Scopes.UPDATE_USERS, auth0Scopes.UPDATE_OWN_USER),
  userController.updateUser
);
router.delete(
  '/:id',
  checkScope(auth0Scopes.DELETE_USER, auth0Scopes.DELETE_OWN_USER),
  userController.deleteUser
);
router.post(
  '/:id/change-email',
  checkScope(auth0Scopes.UPDATE_USER_EMAIL, auth0Scopes.UPDATE_OWN_EMAIL),
  userController.changeEmail
);
router.get(
  '/',
  checkScope(auth0Scopes.READ_USERS, auth0Scopes.READ_USERS),
  userController.getUsers
);

module.exports = router;
