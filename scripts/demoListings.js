const Listing = require('../models/listing');
const User = require('../models/user');

async function importDemoListings(ownerId) {
    const owner = await User.findById(ownerId);
    if (!owner || owner.role !== 'admin') throw new Error('An existing admin account is required to import demo listings.');
    const data = require('./demoListings.data');
    let created = 0;
    for (const record of data) {
        const result = await Listing.updateOne(
            { demoKey: record.demoKey },
            { $setOnInsert: { ...record, owner: owner._id } },
            { upsert: true, runValidators: true }
        );
        if (result.upsertedCount) created += 1;
    }
    return created;
}

module.exports = { importDemoListings };
