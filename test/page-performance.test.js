const { test } = require('node:test');
const assert = require('node:assert/strict');
const imageUrl = require('../utils/imageUrl');

test('image variants preserve external sources and compress supported providers', () => {
    const unsplash = new URL(imageUrl('https://images.unsplash.com/photo-demo?w=2400&q=90', 400));
    assert.equal(unsplash.searchParams.get('w'), '400');
    assert.equal(unsplash.searchParams.get('q'), '70');
    assert.match(imageUrl('https://res.cloudinary.com/demo/image/upload/v123/photo.jpg', 800), /upload\/f_auto,q_auto,w_800,c_limit\/v123\/photo.jpg/);
    assert.equal(imageUrl('/images/local.jpg'), '/images/local.jpg');
    assert.equal(imageUrl('https://example.com/image.jpg'), 'https://example.com/image.jpg');
    assert.equal(imageUrl(), '/images/listing-placeholder.svg');
});

test('anonymous browsing does not create sessions and assets can be cached', async () => {
    for (const name of ['ATLASDB_URL', 'SECRET', 'CLOUD_NAME', 'CLOUD_API_KEY', 'CLOUD_API_SECRET']) process.env[name] = 'test-value';
    process.env.NODE_ENV = 'test';
    const session = require('express-session');
    require('connect-mongo').create = () => new session.MemoryStore();
    const app = require('../app');
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    try {
        for (const page of ['/', '/login', '/signup']) {
            const response = await fetch(base + page);
            assert.equal(response.status, 200);
            assert.equal(response.headers.get('set-cookie'), null, `${page} creates an unnecessary session`);
            await response.text();
        }
        const asset = await fetch(base + '/css/style.css');
        assert.match(asset.headers.get('cache-control'), /max-age=300/);
    } finally { await new Promise(resolve => server.close(resolve)); }
});
