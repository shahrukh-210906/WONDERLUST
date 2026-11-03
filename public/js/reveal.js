(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion || !('IntersectionObserver' in window)) return;

  const candidates = document.querySelectorAll(
    '.hero-content, .search-wrap, .section-heading, .destination-card, .how-layout, .host, .page-heading, .browse-search, .filter-container, .card-container, .listing-top, .reservation-card, .profile-header, .profile-tabs, .booking-card, .wishlist-item-card, .auth-shell, .hosting-form, .site-footer'
  );
  if (!candidates.length) return;

  document.documentElement.classList.add('motion-ready');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -48px 0px', threshold: 0.08 });

  candidates.forEach((element) => {
    element.setAttribute('data-reveal', '');
    observer.observe(element);
  });

  // Bootstrap reveals tab content after the first observation pass.
  document.addEventListener('shown.bs.tab', (event) => {
    const pane = document.querySelector(event.target.getAttribute('data-bs-target'));
    pane?.querySelectorAll('.booking-card, .wishlist-item-card').forEach((element) => {
      element.classList.add('is-visible');
      observer.unobserve(element);
    });
  });
})();
