document.addEventListener('DOMContentLoaded', () => {
    // This helper function needs to be available in the client-side scope
    const buildQueryString = (newParams) => {
        const url = new URL(window.location);
        const params = url.searchParams;

        // Set the new sort parameter
        if (newParams.sort) {
            params.set('sort', newParams.sort);
        }

        // Rebuild the full URL
        return `${url.pathname}?${params.toString()}`;
    };

    // Update sort links to preserve category filters
    const sortLinks = document.querySelectorAll('.dropdown-menu a[data-sort-value], .offcanvas-filter-list a[href*="?sort="]');
    sortLinks.forEach(link => {
        const sortVal = link.getAttribute('data-sort-value');
        if (sortVal) {
            link.href = buildQueryString({ sort: sortVal });
        }
    });

    // Update the button text for the currently active sort
    const sortBtnText = document.getElementById('sort-btn-text');
    if (sortBtnText) {
        const urlParams = new URLSearchParams(window.location.search);
        const sortValue = urlParams.get('sort');
        if (sortValue) {
            const activeSortLink = document.querySelector(`.dropdown-item[data-sort-value="${sortValue}"]`);
            if (activeSortLink) {
                sortBtnText.textContent = activeSortLink.textContent.trim();
            }
        }
    }
});