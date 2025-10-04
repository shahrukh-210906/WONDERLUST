const express = require('express');
const router = express.Router({ mergeParams: true });
const wrapAsync = require('../utils/wrapAsync');
const methodOverride = require('method-override');
const { isLoggedIn, isReviewAuthor } = require('../middleware.js');
const { reviewSchema } = require('../schema.js');
const reviewsController = require('../controllers/reviews');

router.use(express.urlencoded({ extended: true }));
router.use(express.json());
router.use(methodOverride('_method'));

// Validate review middleware
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error.details[0].message);
    } else {
        next();
    }
};

// Routes
router.post('/', isLoggedIn, validateReview, wrapAsync(reviewsController.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(reviewsController.deleteReview));

module.exports = router;