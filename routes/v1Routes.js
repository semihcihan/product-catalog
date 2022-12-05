const express = require('express');

const router = express.Router();

const auth0Router = require('./auth0Routes');
const usersRouter = require('./userRoutes');
const analyticsRouter = require('./analyticsRoutes');

router.use(auth0Router);
router.use('/users', usersRouter);
router.use('/analytics', analyticsRouter);

module.exports = router;
