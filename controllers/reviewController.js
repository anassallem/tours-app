const Review = require('./../models/reviewModel');
const Booking = require('./../models/bookingModel');
const Tour = require('./../models/tourModel');
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');
exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.restrictToReviewTour = async (req, res, next) => {
  console.log('req', req.body.user);

  //Find All Bookings
  // const bookings = await Booking.find({ user: req.body.user });
  //OR
  const booking = await Booking.findOne({
    user: req.body.user,
    tour: req.body.tour,
    paid: true
  });
  console.log(booking);

  if (!booking) {
    return next(
      new AppError(
        'users can only review a tour that they have actually booked',
        403
      )
    );
  }
  // console.log('bookings', bookings);

  // 2) Find tours with the returned IDs
  // const tourIDs = bookings.map(el => el.tour);
  //const tours = await Tour.find({ _id: { $in: tourIDs } });
  // console.log('tourIDs', tourIDs);
  // if (!tourIDs.includes(req.body.tour)) {
  //   return next(
  //     new AppError(
  //       'users can only review a tour that they have actually booked',
  //       403
  //     )
  //   );
  // }

  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);

// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   // Adding A Nested Get EndPoint
//   let filter = {};
//   if (req.params.tourId) filter = { tour: req.params.tourId };

//   const reviews = await Review.find(filter);

//   res.status(200).json({
//     status: 'success',
//     results: reviews.length,
//     data: {
//       reviews
//     }
//   });
// });

// exports.createReview = catchAsync(async (req, res, next) => {
//   //Allow Nested Routes
//   if (!req.body.tour) req.body.tour = req.params.tourId;
//   if (!req.body.user) req.body.user = req.user.id;

//   const newReview = await Review.create(req.body);

//   res.status(201).json({
//     status: 'success',
//     data: {
//       review: newReview
//     }
//   });
// });
