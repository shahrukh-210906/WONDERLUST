const mongoose = require('mongoose');
const initData = require('./data');
const Listing = require('../models/listing');

main().then(() => {
    console.log("Connected to MongoDB");
}).catch(err => console.log(err));


async function main(){
    mongoose.connect('mongodb://localhost:27017/wonderlustDB');
}

const initDB = async () => {
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);
    console.log("Database initialized with sample data");
}
initDB();