require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');
const { importDemoListings } = require('./demoListings');

async function main() {
    if (!process.env.ATLASDB_URL || !process.env.ADMIN_EMAIL) throw new Error('Set ATLASDB_URL and ADMIN_EMAIL first.');
    await mongoose.connect(process.env.ATLASDB_URL);
    const admin = await User.findOne({ email: process.env.ADMIN_EMAIL.trim().toLowerCase(), role: 'admin' });
    if (!admin) throw new Error('No matching admin account. Run npm run admin:create first.');
    const added = await importDemoListings(admin._id);
    const total = await mongoose.model('Listing').countDocuments({ isDemo: true, owner: admin._id });
    console.log(`${added} new demo stays added; ${total} demo stays now belong to ${admin.username}.`);
}

main().catch(err => {
    console.error(err.message);
    process.exitCode = 1;
}).finally(() => mongoose.disconnect());
