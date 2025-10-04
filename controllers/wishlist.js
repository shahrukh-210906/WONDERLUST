const User = require('../models/user');
const Listing = require('../models/listing');

module.exports.updateWishlist = async (req, res) => {
    try {
        const { listingId } = req.params;
        const userId = req.user._id;

        const user = await User.findById(userId);
        const listing = await Listing.findById(listingId);

        if (!listing) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        // Check if the listing is already in the wishlist
        const isWishlisted = user.wishlist.some(item => item.equals(listingId));

        let added;

        if (isWishlisted) {
            // Remove from wishlist using $pull
            await User.findByIdAndUpdate(userId, { $pull: { wishlist: listingId } });
            added = false;
        } else {
            // Add to wishlist using $addToSet to prevent duplicates
            await User.findByIdAndUpdate(userId, { $addToSet: { wishlist: listingId } });
            added = true;
        }

        res.json({ success: true, added: added });
    } catch (error) {
        console.error('Error updating wishlist:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};