const express = require('express');
const morgan = require('morgan'); //HTTP request logger middleware for node.js

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

app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  next();
});

// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   next();
// });

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
