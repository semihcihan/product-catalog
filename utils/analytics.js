const EventEmitter = require('events');
const AnalyticsLog = require('../models/analyticsLogModel');

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
    console.log(e);
  }
});

eventEmitter.on('log_analytics_error', async (req, error) => {
  try {
    const data = {
      body: req.body,
      ip: req.ip,
      params: req.params,
      path: req.path,
      query: req.query,
      originalUrl: req.originalUrl,
      method: req.method,
      error,
    };

    await AnalyticsLog.create({
      action: 'error',
      payload: data,
      requestUser: req.user ? req.user.appId : undefined,
    });
  } catch (e) {
    console.log(e);
  }
});

exports.logRequest = (req, action) => {
  eventEmitter.emit('log_analytics_event', req, action);
};

exports.logError = (req, error) => {
  eventEmitter.emit('log_analytics_error', req, error);
};
