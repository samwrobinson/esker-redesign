/**
 * Reviews - Simple Fade In Animation
 * Uses Intersection Observer + CSS transitions (no GSAP required)
 */

(function() {
    function init() {
        const cards = document.querySelectorAll('#reviews-355 .cs-item');

        if (cards.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        // Wait for next frame to ensure layout is complete
        // Then observe all cards - observer will immediately fire for any already in viewport
        setTimeout(() => {
            cards.forEach(card => observer.observe(card));
        }, 100);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
