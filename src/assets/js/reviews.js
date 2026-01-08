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

        cards.forEach((card, index) => {
            gsap.set(card, { opacity: 0, y: 40 });

            ScrollTrigger.create({
                trigger: card,
                start: 'top 90%',
                once: true,
                onEnter: () => {
                    gsap.to(card, {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        ease: 'power2.out'
                    });
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
