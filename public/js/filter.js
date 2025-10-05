document.addEventListener('DOMContentLoaded', () => {
    const filterItems = document.querySelectorAll('.filter-item, .offcanvas-filter-item');

    filterItems.forEach(item => {
        item.addEventListener('click', function(event) {
            event.preventDefault();

            const category = this.dataset.category;
            const url = new URL(window.location);
            let categories = url.searchParams.getAll('category');

            if (category === 'All') {
                url.searchParams.delete('category');
            } else {
                const index = categories.indexOf(category);
                if (index > -1) {
                    // If the category is already selected, remove it
                    categories.splice(index, 1);
                } else {
                    // Otherwise, add it to the selection
                    categories.push(category);
                }

                // Clear all existing category params and then add the updated ones
                url.searchParams.delete('category');
                if (categories.length > 0) {
                    categories.forEach(cat => url.searchParams.append('category', cat));
                }
            }
            window.location.href = url.toString();
        });
    });
});