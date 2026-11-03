(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length || reduceMotion || !('IntersectionObserver' in window)) return;

  document.documentElement.classList.add('motion-ready');
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -9% 0px', threshold: 0.08 });

  targets.forEach((target) => {
    const siblings = target.parentElement.querySelectorAll(':scope > [data-reveal]');
    const siblingIndex = Array.prototype.indexOf.call(siblings, target);
    target.style.transitionDelay = `${Math.min(siblingIndex * 90, 270)}ms`;
    observer.observe(target);
  });
})();
