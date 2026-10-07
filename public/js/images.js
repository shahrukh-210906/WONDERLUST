(() => {
    const fallback = '/images/listing-placeholder.svg';
    const replaceBrokenImage = (image) => {
        if (!(image instanceof HTMLImageElement) || image.dataset.fallbackApplied) return;
        image.dataset.fallbackApplied = 'true';
        image.src = fallback;
    };
    // Capture resource errors, which do not bubble, including lazy-loaded images.
    document.addEventListener('error', event => replaceBrokenImage(event.target), true);
    document.querySelectorAll('img').forEach(image => {
        if (image.complete && image.naturalWidth === 0) replaceBrokenImage(image);
    });
})();
