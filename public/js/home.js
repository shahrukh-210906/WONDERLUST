(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const moodImage = document.getElementById('experience-stage-image');
  const moodLabel = document.getElementById('experience-stage-label');
  const moodLinks = document.querySelectorAll('.experience-mood');
  if (moodImage && moodLabel && moodLinks.length) {
    moodLinks.forEach((link) => {
      const activate = () => {
        const image = link.dataset.image;
        if (!image || moodImage.src === image) return;

        moodLinks.forEach((item) => item.classList.toggle('active', item === link));
        moodImage.classList.add('is-changing');
        const nextImage = new Image();
        nextImage.onload = () => {
          moodImage.src = image;
          moodImage.alt = link.dataset.alt || '';
          moodLabel.textContent = link.dataset.label || '';
          requestAnimationFrame(() => moodImage.classList.remove('is-changing'));
        };
        nextImage.onerror = () => moodImage.classList.remove('is-changing');
        nextImage.src = image;
      };

      link.addEventListener('mouseenter', activate);
      link.addEventListener('focus', activate);
      link.addEventListener('click', (event) => {
        if (event.detail === 0) activate();
      });
    });
  }

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
