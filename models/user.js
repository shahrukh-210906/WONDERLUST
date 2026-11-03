const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    wishlist: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Listing'
        }
    ],
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
});
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
