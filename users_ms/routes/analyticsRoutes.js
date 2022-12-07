const express = require('express');
const {
  checkRequiredPermissions,
  extractUserFromAccessToken,
  checkJwt,
} = require('../controllers/auth.service');
const permissions = require('../controllers/permissions');

const analyticsController = require('../controllers/analyticsController');

const router = express.Router();

router.use(checkJwt);
router.use(extractUserFromAccessToken);

router.get(
  '/',
  checkRequiredPermissions(
    permissions.READ_USER_ACTIVITY,
    permissions.READ_USER_ACTIVITY
  ),
  analyticsController.getAnalytics
);

module.exports = router;
