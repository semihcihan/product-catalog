const express = require('express');
const {
  checkRequiredPermissions,
  extractUserFromAccessToken,
  checkJwt,
} = require('../controllers/auth.service');
const auth0Scopes = require('../controllers/auth0Scopes');

const analyticsController = require('../controllers/analyticsController');

const router = express.Router();

router.use(checkJwt);
router.use(extractUserFromAccessToken);

router.get(
  '/',
  checkRequiredPermissions(
    auth0Scopes.READ_USER_ACTIVITY,
    auth0Scopes.READ_USER_ACTIVITY
  ),
  analyticsController.getAnalytics
);

module.exports = router;