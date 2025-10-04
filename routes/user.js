const express = require('express');
const router = express.Router();
const passport = require('passport');
const wrapAsync = require('../utils/wrapAsync');
const { saveRedirectUrl } = require('../middleware.js');
const usersController = require('../controllers/users');

// Signup routes
router.get('/signup', usersController.renderSignup);
router.post('/signup', wrapAsync(usersController.signup));

// Login routes
router.get('/login', usersController.renderLogin);

router.post(
    '/login',
    saveRedirectUrl,
    passport.authenticate('local', {
        failureRedirect: '/login',
        failureFlash: true
    }),
    (req, res) => {
        req.flash('success', 'Logged in successfully');
        const redirectUrl = res.locals.redirectUrl || '/listings';
        delete req.session.redirectUrl; // clear after use
        res.redirect(redirectUrl);
    }
);

// Logout route
router.get('/logout', usersController.logout);

// Profile route
router.get('/profile', wrapAsync(usersController.renderProfile));

module.exports = router;