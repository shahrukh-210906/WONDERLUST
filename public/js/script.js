// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})();


document.addEventListener('DOMContentLoaded', function() {
    // Logic for closing flash alerts
    var closeButtons = document.querySelectorAll('.alert .btn-close');
    closeButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            var alert = this.closest('.alert');
            if (alert) {
                alert.style.display = 'none';
            }
        });
    });

    // New logic for the Sort By dropdown button text
    const sortBtnText = document.getElementById('sort-btn-text');
    if (sortBtnText) {
        const urlParams = new URLSearchParams(window.location.search);
        const sortValue = urlParams.get('sort');
        
        if (sortValue) {
            const activeSortLink = document.querySelector(`.dropdown-item[data-sort-value="${sortValue}"]`);
            if (activeSortLink) {
                const textContent = activeSortLink.textContent.trim();
                sortBtnText.textContent = textContent;
            }
        }
    }
});

