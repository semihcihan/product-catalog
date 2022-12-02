const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
// const hpp = require('hpp');
const cors = require('cors');
const globalErrorHandler = require('./controllers/errorController');

const v1Router = require('./routes/v1Routes');
const auth0Router = require('./routes/auth0Routes');

const AppError = require('./utils/appError');

const app = express();

app.enable('trust proxy');

app.use(cors());
app.use(helmet());
app.options('*', cors());
if (process.env.NODE_ENV === 'development') {
  app.use(logger('dev'));
}
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use(mongoSanitize());

app.use(auth0Router);
app.use('/api/v1', v1Router);

app.use(xss());

/* app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
); */

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// error handler
app.use(globalErrorHandler);

module.exports = app;
