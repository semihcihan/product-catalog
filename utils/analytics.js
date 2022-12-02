const EventEmitter = require('events');
const AnalyticsLog = require('../models/analyticsLogModel');
const logger = require('./logger');

const eventEmitter = new EventEmitter();

eventEmitter.on('log_analytics_event', async (req, action) => {
  try {
    const payload = {
      body: req.body,
      ip: req.ip,
      params: req.params,
      path: req.path,
      query: req.query,
      originalUrl: req.originalUrl,
      method: req.method,
    };
    await AnalyticsLog.create({
      action: action,
      payload,
      requestUser: req.user ? req.user.appId : undefined,
    });
  } catch (e) {
    logger.error(e);
  }
});

exports.logRequest = (req, action) => {
  eventEmitter.emit('log_analytics_event', req, action);
};
