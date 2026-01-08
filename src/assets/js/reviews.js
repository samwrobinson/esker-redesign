/**
 * Reviews - Simple Fade In Animation
 */

(function() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('GSAP or ScrollTrigger not loaded');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Wait for DOM to be ready
    function init() {
        const cards = document.querySelectorAll('#reviews-355 .cs-item');

        if (cards.length === 0) {
            console.warn('No review cards found');
            return;
        }

        cards.forEach((card) => {
            gsap.from(card, {
                opacity: 0,
                y: 40,
                duration: 0.6,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
