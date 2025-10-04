const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        url: String,
        filename: String
    },
    location: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    category: {
        type: String,
        enum: ['Beach', 'City', 'Mountain', 'Cabin', 'Historic', 'Treehouse', 'Ski', 'Luxury', 'Island', 'Villa', 'Cottage', 'Safari'],
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, { timestamps: true });

listingSchema.post('findOneAndDelete', async function(listing) {
    if(listing){
        await mongoose.model('Review').deleteMany({
            _id: { $in: listing.reviews }
        });
    }
});

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;