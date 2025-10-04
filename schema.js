const joi = require('joi');

const listingSchema = joi.object({
    listing: joi.object({
        title: joi.string().required(),
        description: joi.string().required().min(10),
        country: joi.string().required(),
        location: joi.string().required(),
        price: joi.number().required().min(0),
        image: joi.string().allow("", null),
        category: joi.string().required()
    }).required()
});

const reviewSchema = joi.object({
    review: joi.object({
        rating: joi.number().required().min(1).max(5),
        comment: joi.string().required().min(5)
    }).required()
});

module.exports = { listingSchema, reviewSchema };