const express = require('express');
const { auth, requiresAuth } = require('express-openid-connect');
const authController = require('../controllers/authController');

const router = express.Router();

const authConfig = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.OPENID_SECRET,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  authorizationParams: {
    response_type: 'code', // This requires you to provide a client secret
    audience: process.env.AUTH0_AUDIENCE,
    scope: process.env.AUTH0_SCOPE,
  },
  routes: {
    // Override the default login route to use your own login route as shown below
    login: false,
    // Pass a custom path to redirect users to a different
    // path after logout.
  },
};

router.use(auth(authConfig));

router.use('/login', authController.login);
router.use('/profile', requiresAuth(), authController.profile);

module.exports = router;
