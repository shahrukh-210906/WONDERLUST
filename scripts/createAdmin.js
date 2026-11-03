require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');

async function main() {
    const required = ['ATLASDB_URL', 'ADMIN_USERNAME', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];
    const missing = required.filter(name => !process.env[name]?.trim());
    if (missing.length) throw new Error(`Set these environment variables first: ${missing.join(', ')}`);
    if (process.env.ADMIN_PASSWORD.length < 14) throw new Error('ADMIN_PASSWORD must be at least 14 characters.');
    await mongoose.connect(process.env.ATLASDB_URL);
    const username = process.env.ADMIN_USERNAME.trim();
    const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
    let user = await User.findOne({ $or: [{ username }, { email }] });
    if (user) {
        if (user.username !== username || user.email !== email) throw new Error('The username or email already belongs to a different account.');
        user.role = 'admin';
        await user.save();
        console.log('Existing account promoted to admin.');
    } else {
        user = new User({ username, email, role: 'admin' });
        await User.register(user, process.env.ADMIN_PASSWORD);
        console.log('Admin account created.');
    }
    console.log(`Admin account ready: ${user.username} (${user.email}).`);
}

main().catch(err => {
    console.error(err.message);
    process.exitCode = 1;
}).finally(() => mongoose.disconnect());
