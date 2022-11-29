const express = require('express');
const jwtBearer = require('express-oauth2-jwt-bearer');

const userController = require('../controllers/userController');

const router = express.Router();

// Authorization middleware. When used, the Access Token must
// exist and be verified against the Auth0 JSON Web Key Set.
const checkJwt = jwtBearer.auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
});

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

router.get('/', checkJwt, userController.getUsers);
router.post('/', checkJwt, userController.createUser);
router.get('/:id', checkJwt, userController.getUser);
router.patch('/:id', checkJwt, userController.updateUser);
router.put('/:id', checkJwt, userController.updateUser);
router.delete('/:id', checkJwt, userController.deleteUser);
router.post(
  '/:id/change-password',
  checkJwt,
  userController.sendResetPasswordEmail
);
router.post('/:id/change-email', checkJwt, userController.changeEmail);

// Protect all routes after this middleware
// router.use(authController.protect);

// router.put('/:id', userController.updateUser);
// router.patch('/updateMyPassword', authController.updatePassword);
// router.get('/:id', userController.getMe, userController.getUser);
// router.patch(
//   '/:id',
//   userController.uploadUserPhoto,
//   userController.resizeUserPhoto,
//   userController.patchUser
// );
// router.delete('/:id', userController.deleteUser);

// router.use(authController.restrictTo('admin'));

// router
//   .route('/')
//   .get(userController.getAllUsers)
//   .post(userController.createUser);

// router
//   .route('/:id')
//   .get(userController.getUser)
//   .patch(userController.patchUser)
//   .put(userController.updateUser)
//   .delete(userController.deleteUser);

module.exports = router;
