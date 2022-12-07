const mongoose = require('mongoose');

const analyticsLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: [true, 'Action name is required!'],
    },
    requestUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    payload: {
      type: Object,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

analyticsLogSchema.pre('save', function (next) {
  if (!this.payload) {
    return next();
  }
  if (this.payload.body && this.payload.body.password) {
    this.payload.body.password = '***';
  }
  if (this.payload.params && this.payload.params.password) {
    this.payload.params.password = '***';
  }

  next();
});

const AnalyticsLog = mongoose.model('AnalyticsLog', analyticsLogSchema);

module.exports = AnalyticsLog;
