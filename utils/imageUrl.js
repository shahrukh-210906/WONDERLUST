// Request appropriately sized, compressed variants from existing image providers.
module.exports = function imageUrl(source, width = 800) {
    if (!source) return '/images/listing-placeholder.svg';
    try {
        const url = new URL(source);
        if (['images.unsplash.com', 'plus.unsplash.com'].includes(url.hostname)) {
            url.searchParams.set('auto', 'format');
            url.searchParams.set('fit', 'crop');
            url.searchParams.set('w', String(width));
            url.searchParams.set('q', '70');
            return url.href;
        }
        if (url.hostname === 'res.cloudinary.com' && url.pathname.includes('/image/upload/')) {
            url.pathname = url.pathname.replace('/image/upload/', `/image/upload/f_auto,q_auto,w_${width},c_limit/`);
            return url.href;
        }
    } catch { /* Local paths and unknown providers keep their original URL. */ }
    return source;
};
