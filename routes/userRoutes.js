const express = require('express');
const jwtBearer = require('express-oauth2-jwt-bearer');
const { checkScope } = require('../controllers/auth.service');
const auth0Scopes = require('../controllers/auth0Scopes');

const userController = require('../controllers/userController');

const router = express.Router();

// Authorization middleware. When used, the Access Token must
// exist and be verified against the Auth0 JSON Web Key Set.
const checkJwt = jwtBearer.auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
});

router.post('/reset-password', userController.sendResetPasswordEmail);

router.use(checkJwt);
router.use(userController.extractUserFromAccessToken);

// // This route doesn't need authentication
// router.get('/api/public', (req, res) => {
//   res.json({
//     message:
//       "Hello from a public endpoint! You don't need to be authenticated to see this.",
//   });
// });

// // This route needs authentication
// router.get('/api/private', checkJwt, (req, res) => {
//   res.json({
//     message:
//       'Hello from a private endpoint! You need to be authenticated to see this.',
//   });
// });

// const checkScopes = jwtBearer.requiredScopes('read:messages');

// router.get('/api/private-scoped', checkJwt, checkScopes, (req, res) => {
//   res.json({
//     message:
//       'Hello from a private endpoint! You need to be authenticated and have a scope of read:messages to see this.',
//   });
// });

// router.use('/users', auth(config));

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
