const Listing = require("./models/listing");
const Review = require("./models/review");
const Booking = require("./models/booking");

// Middleware to check if user is logged in
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // Save the original URL to session
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You need to log in to add listings");
        return res.redirect('/login');
    }
    next();
};

// Middleware to check if user is logged in for API requests
module.exports.isLoggedInApi = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, message: 'You must be logged in to perform this action.' });
    }
    next();
};

// Middleware to save redirect URL into locals
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};


module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash('error', 'Cannot find that listing!');
        return res.redirect('/listings');
    }
    if (!listing.owner.equals(req.user._id)) {
        req.flash('error', 'You are not the owner!');
        return res.redirect(`/listings/${id}`);
    }
    // Attach the listing to req object for further use if needed
    req.listing = listing;
    next();
};


module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params; // id = listingId
    const review = await Review.findById(reviewId);
    if (!review) {
        req.flash('error', 'Cannot find that review!');
        return res.redirect(`/listings/${id}`);
    }
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You are not the author of this review!');
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.isBookingOwner = async (req, res, next) => {
    const { id, bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
        req.flash('error', 'Cannot find that booking!');
        return res.redirect(`/listings/${id}`);
    }
    if (!booking.user.equals(req.user._id)) {
        req.flash('error', 'You are not the owner of this booking!');
        return res.redirect(`/listings/${id}`);
    }
    next();
};