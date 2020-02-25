const path = require('path');
const express = require('express');
const morgan = require('morgan'); //HTTP request logger middleware for node.js
const rateLimit = require('express-rate-limit'); //Basic rate-limiting middleware for Express. Use to limit repeated requests to public APIs and/or endpoints such as password reset.
const helmet = require('helmet'); //Helmet helps you secure your Express apps by setting various HTTP headers.
const mongoSanitize = require('express-mongo-sanitize'); //middleware which sanitizes user-supplied data to prevent MongoDB Operator Injection.
const xss = require('xss-clean'); //Node.js Connect middleware to sanitize user input coming from POST body, GET queries, and url params. Works with Express, Restify, or any other Connect app.
const hpp = require('hpp'); // middleware to protect against HTTP Parameter Pollution attacks
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Serving static files
//app.use(express.static(`${__dirname}/public`));
//__dirname is the directory of the currently executing module (which is not necessarily the working directory).
//path.join will concatenate __dirname which is the directory name of the current file concatenated with values of some and dir with platform specific separator.
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
//Helmet helps you secure your Express apps by setting various HTTP headers.
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, //60 minutes
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); //Returns middleware that only parses json.Parser Data Fron The Body
app.use(express.urlencoded({ extended: true, limit: '10kb' })); //Returns middleware that only parses urlencoded with the qs module.// Parse Data incoming from a Form
app.use(cookieParser()); //Parser Data from a cookies

// DATA SANITIZATION
// Data sanitization against NoSQL query injection
app.use(mongoSanitize());
// Data sanitization against XSS
app.use(xss()); //Clean any input HTML code

// Prevent parameter pollution
//HPP puts array parameters in req.query and/or req.body aside and just selects the last parameter value. You add the middleware and you are done.
//{{URL}}api/v1/tours?sort=duration&sort=price
app.use(
  //The whitelist option allows to specify parameters that shall not be touched by HPP. Usually specific parameters of a certain route are intentionally used as arrays.
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// TEST MIDDLEWARE
// app.use((req, res, next) => {
//   console.log('Hello from the middleware 👋');
//   next();
// });
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  //console.log(req.cookies);
  next();
});

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
