const express = require('express');
const router = express.Router({ mergeParams: true });
const wrapAsync = require('../utils/wrapAsync');
const { isLoggedIn, isBookingOwner } = require('../middleware.js');
const bookingsController = require('../controllers/bookings');

// Create a new booking
router.post('/', isLoggedIn, wrapAsync(bookingsController.createBooking));

// Delete a booking
router.delete('/:bookingId', isLoggedIn, isBookingOwner, wrapAsync(bookingsController.deleteBooking));

module.exports = router;