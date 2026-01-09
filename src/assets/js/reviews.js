/**
 * Scroll Animations - Simple Fade In
 * Uses Intersection Observer + CSS transitions (no GSAP required)
 */

(function() {
    function init() {
        // Review cards
        const reviewCards = document.querySelectorAll('#reviews-355 .cs-item');

        // Speed gallery text
        const speedGalleryText = document.querySelectorAll('#speed-gallery .cs-topper, #speed-gallery .cs-title');

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

        // Wait for layout to complete
        setTimeout(() => {
            reviewCards.forEach(card => observer.observe(card));
            speedGalleryText.forEach(el => observer.observe(el));
        }, 100);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
