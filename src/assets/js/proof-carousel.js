/**
 * Proof Section - Simple Autoplay Carousel
 * Works on all screen sizes
 */

(function() {
    // Wait for DOM to be ready
    function init() {
        if (typeof gsap === 'undefined') {
            console.warn('GSAP not loaded');
            return;
        }

        const carousel = document.querySelector('#fb-proof .cs-featured-carousel');
        if (!carousel) {
            console.warn('Carousel container not found');
            return;
        }

        const slides = Array.from(carousel.querySelectorAll('.cs-picture-featured'));
        const dots = Array.from(carousel.querySelectorAll('.cs-dot'));

        if (slides.length <= 1) {
            console.warn('Not enough slides for carousel');
            return;
        }

        let currentIndex = 0;
        let autoplayInterval;
        const autoplayDelay = 4000;

        // Initialize: first slide visible, others hidden
        slides.forEach((slide, i) => {
            gsap.set(slide, {
                opacity: i === 0 ? 1 : 0,
                zIndex: i === 0 ? 2 : 1,
                x: 0
            });
        });

        // Update dot active state
        function updateDots(index) {
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        }

        function goToSlide(index) {
            if (index === currentIndex) return;

            const currentSlide = slides[currentIndex];
            const targetSlide = slides[index];

            // Fade out current
            gsap.to(currentSlide, {
                opacity: 0,
                duration: 0.6,
                ease: 'power2.inOut',
                onComplete: () => gsap.set(currentSlide, { zIndex: 1 })
            });

            // Fade in next
            gsap.set(targetSlide, { zIndex: 2 });
            gsap.to(targetSlide, {
                opacity: 1,
                duration: 0.6,
                ease: 'power2.inOut'
            });

            currentIndex = index;
            updateDots(index);
        }

        function nextSlide() {
            const next = (currentIndex + 1) % slides.length;
            goToSlide(next);
        }

        // Dot click handlers
        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                goToSlide(i);
                restartAutoplay();
            });
        });

        function restartAutoplay() {
            clearInterval(autoplayInterval);
            autoplayInterval = setInterval(nextSlide, autoplayDelay);
        }

        // Start autoplay
        autoplayInterval = setInterval(nextSlide, autoplayDelay);

        // Pause on hover (desktop)
        carousel.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
        carousel.addEventListener('mouseleave', restartAutoplay);

        // Pause when tab not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                clearInterval(autoplayInterval);
            } else {
                restartAutoplay();
            }
        });
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
