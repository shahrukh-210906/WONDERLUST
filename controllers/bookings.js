const Booking = require('../models/booking');
const Listing = require('../models/listing');

module.exports.createBooking = async (req, res) => {
    const { id } = req.params;
    const { checkIn, checkOut, guests } = req.body;

    const listing = await Listing.findById(id);

    // Check for booking conflicts
    const existingBooking = await Booking.findOne({
        listing: id,
        $or: [
            { checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } }
        ]
    });

    if (existingBooking) {
        req.flash('error', 'Sorry, those dates are already booked.');
        return res.redirect(`/listings/${id}`);
    }

    const newBooking = new Booking({
        listing: id,
        user: req.user._id,
        checkIn,
        checkOut,
        guests
    });

    await newBooking.save();

    req.flash('success', 'Booking successful!');
    res.redirect(`/listings/${id}`);
};

module.exports.deleteBooking = async (req, res) => {
    const { id, bookingId } = req.params;
    await Booking.findByIdAndDelete(bookingId);
    req.flash('success', 'Booking canceled successfully!');
    res.redirect(`/listings/${id}`);
};