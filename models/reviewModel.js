// review / rating / createdAt / ref to tour / ref to user
const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

//Preventing Duplicate Reviews
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

//Populating Reviews
reviewSchema.pre(/^find/, function(next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name'
  // }).populate({
  //   path: 'user',
  //   select: 'name photo'
  // });
  //Just Keep the reference of data and not populate
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});

//statics are the methods defined on the Model. methods are defined on the document (instance).
//Statics are pretty much the same as methods but allow for defining functions that exist directly on your Model.
reviewSchema.statics.calcAverageRatings = async function(tourId) {
  //(this) points to the model
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  //console.log(stats);
  // Persist stats in this tour document
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

// call this middleware each time that a new review is created
//We should not use pre because the current review is not really in the collection just Yet
reviewSchema.post('save', function() {
  // this points to current review
  //Review.calcAverageRatings(this.tour); But Review is not defined so we use this:constructor
  this.constructor.calcAverageRatings(this.tour);
  // next(); the post middleware does not get access to next
});

// QUERY MIDDLEWARE
// // findByIdAndUpdate
// // findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne(); // we use this.r to passing the data from the pre middleware to the post middleware
  // console.log(this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  // await this.findOne(); does NOT work here, query has already executed
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
