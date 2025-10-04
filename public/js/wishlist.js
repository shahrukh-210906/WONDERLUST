document.addEventListener('DOMContentLoaded', () => {
    const wishlistButtons = document.querySelectorAll('.wishlist-btn');

    wishlistButtons.forEach(button => {
        // Skip buttons that are just links to login
        if (button.tagName === 'A') {
            return;
        }

        button.addEventListener('click', async (event) => {
            event.preventDefault(); // Stop navigation if it's inside an <a> tag
            event.stopPropagation(); // Stop the event from bubbling up to the card link

            const listingId = button.dataset.listingId;
            const icon = button.querySelector('i.fa-heart');

            if (!listingId || !icon) return;

            try {
                const response = await fetch(`/wishlist/${listingId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        const textSpan = button.querySelector('span'); // Get the text span if it exists

                        if (result.added) {
                            icon.classList.remove('fa-regular');
                            icon.classList.add('fa-solid');
                            if (textSpan) { // If there's a text span, update it
                                textSpan.textContent = 'Saved';
                            }
                        } else {
                            icon.classList.remove('fa-solid');
                            icon.classList.add('fa-regular');
                            if (textSpan) { // If there's a text span, update it
                                textSpan.textContent = 'Save';
                            }
                        }
                    } else {
                        alert(result.message || 'Failed to update wishlist.');
                    }
                } else {
                    if (response.status === 401) {
                         alert('Please log in to add items to your wishlist.');
                         window.location.href = '/login';
                    } else {
                        alert('An error occurred. Please try again.');
                        console.error('Server error:', response.statusText);
                    }
                }
            } catch (error) {
                alert('A network error occurred. Please try again.');
                console.error('Network error:', error);
            }
        });
    });
});