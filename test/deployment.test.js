const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { Readable, Writable } = require('node:stream');

for (const key of ['ATLASDB_URL', 'SECRET', 'CLOUD_NAME', 'CLOUD_API_KEY', 'CLOUD_API_SECRET']) {
  process.env[key] = 'test-value';
}
process.env.NODE_ENV = 'test';
const session = require('express-session');
require('connect-mongo').create = () => new session.MemoryStore();
const mongoose = require('mongoose');
const app = require('../app');
let server;
let base;
before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise(resolve => server.close(resolve)));

test('public pages render and profile requires login', async () => {
  for (const path of ['/', '/login', '/signup']) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200);
    assert.match(await response.text(), /<!DOCTYPE html>/i);
  }
  const response = await fetch(base + '/profile', { redirect: 'manual' });
  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), '/login');
});
test('health reflects database readiness and unknown pages return 404', async () => {
  assert.equal((await fetch(base + '/health')).status, 503);
  const response = await fetch(base + '/missing-page');
  assert.equal(response.status, 404);
  assert.match(await response.text(), /Page not found/);
});
test('static booking script contains executable JavaScript', async () => {
  const response = await fetch(base + '/js/show.js');
  const script = await response.text();
  assert.equal(response.status, 200);
  assert.ok(!script.includes('<%'));
  new Function(script);
});
test('listing without an image renders a fallback and permits seeded image sources', async () => {
  const Listing = require('../models/listing');
  const original = Listing.find;
  Listing.find = () => ({ lean: async () => [{
    _id: 'test-listing', title: 'Photo missing', price: 100,
    location: 'London', country: 'England'
  }] });
  try {
    const response = await fetch(base + '/listings');
    assert.equal(response.status, 200);
    assert.match(await response.text(), /src="\/images\/listing-placeholder.svg"/);
    assert.match(response.headers.get('content-security-policy'), /https:\/\/plus.unsplash.com/);
    assert.equal((await fetch(base + '/images/listing-placeholder.svg')).status, 200);
    const partial = await fetch(base + '/listings?category=Cabin', { headers: { 'X-Listing-Partial': '1' } });
    const fragment = await partial.text();
    assert.equal(partial.status, 200);
    assert.match(fragment, /id="stay-results"/);
    assert.match(fragment, /Photo missing/);
    assert.doesNotMatch(fragment, /<!DOCTYPE html>|navbar/);
    assert.match(partial.headers.get('vary'), /X-Listing-Partial/);
  } finally {
    Listing.find = original;
  }
});
test('Cloudinary storage preserves upload metadata and forwards errors', async () => {
  const { cloudinary, storage } = require('../cloudConfig');
  const original = cloudinary.uploader.upload_stream;
  try {
    cloudinary.uploader.upload_stream = (options, callback) => {
      assert.deepEqual(options.allowed_formats, ['png', 'jpg', 'jpeg']);
      return new Writable({
        write(chunk, encoding, done) { done(); },
        final(done) {
          callback(null, { secure_url: 'https://example.com/image.jpg', public_id: 'image', bytes: 3 });
          done();
        }
      });
    };
    const result = await new Promise((resolve, reject) => storage._handleFile({}, {
      stream: Readable.from(['abc'])
    }, (err, value) => err ? reject(err) : resolve(value)));
    assert.equal(result.filename, 'image');
    assert.equal(result.size, 3);
    cloudinary.uploader.upload_stream = () => { throw new Error('upload failed'); };
    await assert.rejects(new Promise((resolve, reject) => storage._handleFile({}, {
      stream: Readable.from(['abc'])
    }, (err, value) => err ? reject(err) : resolve(value))), /upload failed/);
  } finally {
    cloudinary.uploader.upload_stream = original;
  }
});
