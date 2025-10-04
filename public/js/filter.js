document.addEventListener('DOMContentLoaded', () => {
    const filterItems = document.querySelectorAll('.filter-item, .offcanvas-filter-item');

    filterItems.forEach(item => {
        item.addEventListener('click', function(event) {
            event.preventDefault(); 
            
            const category = this.dataset.category;
            const url = new URL(window.location);
            const categories = url.searchParams.getAll('category');

            if (category === 'All') {
                url.searchParams.delete('category');
            } else {
                const index = categories.indexOf(category);
                if (index > -1) {
                    categories.splice(index, 1);
                } else {
                    categories.push(category);
                }

                url.searchParams.delete('category');
                if (categories.length > 0) {
                    categories.forEach(cat => url.searchParams.append('category', cat));
                }
            }
            window.location.href = url.toString();
        });
    });
});