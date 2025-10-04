const User = require('../models/user');
const Booking = require('../models/booking');

// Render signup form
module.exports.renderSignup = (req, res) => {
    res.render('users/signup');
};

// Handle user registration
module.exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ username, email });
        const registeredUser = await User.register(newUser, password);

        // Log the user in after signup
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Wonderlust!');
            res.redirect('/listings');
        });
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/signup');
    }
};

// Render login form
module.exports.renderLogin = (req, res) => {
    res.render('users/login');
};

// Handle logout
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash('success', 'You are logged out!');
        res.redirect('/listings');
    });
};

// Render profile
module.exports.renderProfile = async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id }).populate('listing');
    const user = await User.findById(req.user._id).populate('wishlist');
    res.render('users/profile', { bookings, wishlist: user.wishlist });
};