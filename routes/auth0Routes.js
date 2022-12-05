const express = require('express');
const { auth, requiresAuth } = require('express-openid-connect');
const authController = require('../controllers/authController');

const router = express.Router();

const authConfig = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.OPENID_SECRET,
  baseURL: `${process.env.AUTH0_BASE_URL}/api/v${process.env.API_VERSION_NUMBER}/`,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  authorizationParams: {
    response_type: 'code', // This requires you to provide a client secret
    audience: process.env.AUTH0_AUDIENCE,
    scope: process.env.AUTH0_SCOPE,
  },
  routes: {
    login: false,
    postLogoutRedirect: '/login',
  },
};

router.use(auth(authConfig));

router.post(
  '/reset-password',
  authController.validateResetPasswordEmail,
  authController.sendResetPasswordEmail
);

router.use('/login', authController.login);
router.use('/profile', requiresAuth(), authController.profile);

module.exports = router;
