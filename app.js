const express = require('express');
const morgan = require('morgan'); //HTTP request logger middleware for node.js

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1) MIDDLEWARES
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json()); //Returns middleware that only parses json.

app.use(express.static(`${__dirname}/public`)); //Serving Static Files.

// app.use((req, res, next) => {
//   console.log('Hello from the middleware 👋');
//   next();
// });

// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   next();
// });

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
