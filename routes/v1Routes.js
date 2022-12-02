const express = require('express');

const router = express.Router();

const usersRouter = require('./userRoutes');
const analyticsRouter = require('./analyticsRoutes');

router.use('/users', usersRouter);
router.use('/analytics', analyticsRouter);

module.exports = router;
