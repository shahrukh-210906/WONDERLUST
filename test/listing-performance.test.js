const { test } = require('node:test');
const assert = require('node:assert/strict');
const Listing = require('../models/listing');
const controller = require('../controllers/listings');
const ejs = require('ejs');
const fs = require('node:fs');
const path = require('node:path');

test('category updates preserve filters and render only the results fragment', async () => {
    const original = Listing.find;
    let queryFilter;
    const records = [{ _id: 'sample', title: 'Mountain cabin', price: 1200, location: 'Manali', country: 'India' }];
    Listing.find = filter => {
        queryFilter = filter;
        return { sort(value) { assert.deepEqual(value, { price: 1 }); return this; }, async lean() { return records; } };
    };
    try {
        let fragment;
        await controller.index({ query: { category: ['Cabin', 'Mountain'], sort: 'price_asc', q: 'Manali' }, get: name => name === 'X-Listing-Partial' ? '1' : undefined }, {
            vary(name) { assert.equal(name, 'X-Listing-Partial'); },
            render(view, data) {
                assert.equal(view, 'listings/results');
                fragment = ejs.render(fs.readFileSync(path.join(__dirname, '../views/listings/results.ejs'), 'utf8'), { ...data, currUser: null });
            }
        });
        assert.deepEqual(queryFilter.category, { $in: ['Cabin', 'Mountain'] });
        assert.equal(queryFilter.$or[1].location.$regex, 'Manali');
        assert.match(fragment, /id="stay-results" data-count="1"/);
        assert.match(fragment, /Mountain cabin/);
        assert.doesNotMatch(fragment, /<!DOCTYPE|navbar/);
        const empty = ejs.render(fs.readFileSync(path.join(__dirname, '../views/listings/results.ejs'), 'utf8'), { listings: [], currUser: null });
        assert.match(empty, /No stays match/);
    } finally { Listing.find = original; }
});
