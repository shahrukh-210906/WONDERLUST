const Listing = require('../models/listing');
const Booking = require('../models/booking');
const ExpressError = require('../utils/ExpressError');

module.exports.index = async (req, res) => {
    const { sort, q } = req.query;
    let { category } = req.query;
    const allCategories = Listing.schema.path('category').enumValues; // Get all categories from schema

    const filter = {};
    if (category) {
        // Ensure category is an array for consistent querying
        const selectedCategories = Array.isArray(category) ? category : [category];
        if (selectedCategories.length > 0) {
            filter.category = { $in: selectedCategories };
        }
    }

    if (typeof q === 'string' && q.trim()) {
        const searchPattern = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        filter.$or = [
            { title: { $regex: searchPattern, $options: 'i' } },
            { location: { $regex: searchPattern, $options: 'i' } },
            { country: { $regex: searchPattern, $options: 'i' } },
            { description: { $regex: searchPattern, $options: 'i' } }
        ];
        // The featured island is Bali, while demo properties use Ubud as their city.
        if (/^bali$/i.test(q.trim())) filter.$or.push({ country: { $regex: '^Indonesia$', $options: 'i' } });
    }

    let listings;

    if (sort === 'popular') {
        const pipeline = [
            { $match: filter },
            { $addFields: { reviewCount: { $size: "$reviews" } } },
            { $sort: { reviewCount: -1 } },
            { $project: { title: 1, price: 1, image: 1, location: 1, country: 1, category: 1, isDemo: 1 } }
        ];
        listings = await Listing.aggregate(pipeline);
    } else {
        let query = Listing.find(filter, 'title price image location country category isDemo');
        switch (sort) {
            case 'price_asc':
                query = query.sort({ price: 1 });
                break;
            case 'price_desc':
                query = query.sort({ price: -1 });
                break;
            case 'latest':
                query = query.sort({ createdAt: -1 });
                break;
        }
        listings = await query.lean();
    }

    res.vary('X-Listing-Partial');
    res.render(req.get('X-Listing-Partial') === '1' ? 'listings/results' : 'listings/index', {
        listings,
        searchQuery: typeof q === 'string' ? q : '',
        currentSort: typeof sort === 'string' ? sort : '',
        categories: allCategories,
        currentCategories: Array.isArray(category) ? category : (category ? [category] : [])
    });
};

module.exports.importDemoListings = async (req, res) => {
    const { importDemoListings } = require('../scripts/demoListings');
    const added = await importDemoListings(req.user._id);
    req.flash('success', `${added} demo stays imported. Existing listings were left untouched.`);
    res.redirect('/listings');
};

module.exports.renderNewForm = (req, res) => {
    res.render('listings/new');
};

module.exports.createListing = async (req, res) => {
    try {
        const listingData = req.body.listing;

        const newListing = new Listing(listingData);
        newListing.owner = req.user._id;

        // If image uploaded via Cloudinary
        if (req.file) {
            newListing.image = {
                url: req.file.path,      // Cloudinary gives `path`
                filename: req.file.filename
            };
        }

        await newListing.save();
        req.flash('success', 'Listing created successfully!');
        res.redirect(`/listings/${newListing._id}`);
    } catch (err) {
        console.error(err);
        req.flash('error', 'Something went wrong while creating the listing.');
        res.redirect('/listings');
    }
};


module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({ path: 'reviews', populate: { path: 'author', select: 'username' } })
        .populate('owner', 'username');

    if (!listing) {
        req.flash('error', 'Cannot find that listing!');
        return res.redirect('/listings');
    }

    // Fetch bookings for this listing
    const bookings = await Booking.find({ listing: id });

    // Fallback if owner was deleted
    if (!listing.owner) listing.owner = { username: 'Unknown' };

    res.render('listings/show', { listing, bookings });
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash('error', 'Cannot find that listing!');
        return res.redirect('/listings');
    }
    res.render('listings/edit', { listing });
};


// WONDERLUST/controllers/listings.js

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body.listing;

    const updatedListing = await Listing.findByIdAndUpdate(id, updatedData);

    if (req.file) {
        updatedListing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
        await updatedListing.save();
    }

    req.flash('success', 'Listing updated successfully!');
    res.redirect(`/listings/${updatedListing._id}`);
};



module.exports.deleteListing = async (req, res) => {
    try {
        const { id } = req.params;
        await Listing.findByIdAndDelete(id);

        req.flash('success', 'Listing deleted successfully!');
        res.redirect('/listings');
    } catch (err) {
        console.error("Error deleting listing:", err);
        req.flash('error', 'Could not delete listing.');
        res.redirect('/listings');
    }
};

