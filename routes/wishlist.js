const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const { isLoggedInApi } = require('../middleware.js');
const wishlistController = require('../controllers/wishlist');

router.post('/:listingId', isLoggedInApi, wrapAsync(wishlistController.updateWishlist));

module.exports = router;