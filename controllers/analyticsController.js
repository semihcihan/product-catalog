const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const { logRequest } = require('../utils/analytics');
const AnalyticsLog = require('../models/analyticsLogModel');

exports.getAnalytics = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(AnalyticsLog.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const doc = await features.query;

  logRequest(req, 'analytics.find');

  res.status(200).json({
    status: 'success',
    results: doc.length,
    data: doc,
  });
});
