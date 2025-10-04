const express = require('express');
const router = express.Router();
const methodOverride = require('method-override');
const multer  = require('multer');
const { storage } = require('../cloudConfig.js')
const upload = multer({ storage });
const wrapAsync = require('../utils/wrapAsync');
const { listingSchema } = require('../schema.js');
const { isLoggedIn, isOwner } = require('../middleware.js');
const listingsController = require('../controllers/listings');
const ExpressError = require('../utils/expressError');


router.use(express.json());
router.use(methodOverride('_method'));

// Validation middleware
const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error.details[0].message);
    }
    next();
};

// Routes
router.get('/', wrapAsync(listingsController.index));

router.get('/new', isLoggedIn, listingsController.renderNewForm);

router.post('/',
    isLoggedIn,
    upload.single('image'), // file input should be named 'image' in your form
    validateListing,
    wrapAsync(listingsController.createListing)
);



router.get('/:id', wrapAsync(listingsController.showListing));

router.get('/:id/edit', isLoggedIn, isOwner, wrapAsync(listingsController.renderEditForm));

router.put('/:id',
    isLoggedIn,
    isOwner,
    upload.single('image'),
    validateListing,
    wrapAsync(listingsController.updateListing)
);

router.delete('/:id', isLoggedIn, isOwner, wrapAsync(listingsController.deleteListing));

module.exports = router;