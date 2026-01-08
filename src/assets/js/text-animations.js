/**
 * Text Animations
 * Hero animations on page load, scroll animations for other sections
 */

(function() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('GSAP or ScrollTrigger not loaded');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // ========================================
    // Hero Section (page load animations)
    // ========================================

    function animateHero() {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        const heroTitle = document.querySelector('#fb-hero .cs-title');
        const heroSubtitle = document.querySelector('#fb-hero h2');
        const heroText = document.querySelector('#fb-hero .cs-text');
        const heroForm = document.querySelector('#fb-hero .cs-form');
        const videoWrapper = document.querySelector('#fb-hero .cs-video-wrapper');

        if (heroTitle) {
            tl.from(heroTitle, { opacity: 0, y: 60, duration: 1 }, 0);
        }
        if (videoWrapper) {
            tl.from(videoWrapper, { opacity: 0, scale: 0.95, y: 30, duration: 1 }, 0.3);
        }
        if (heroSubtitle) {
            tl.from(heroSubtitle, { opacity: 0, y: 30, duration: 0.8 }, 0.5);
        }
        if (heroText) {
            tl.from(heroText, { opacity: 0, y: 20, duration: 0.8 }, 0.7);
        }
        if (heroForm) {
            tl.from(heroForm, { opacity: 0, y: 30, duration: 0.8 }, 0.9);
        }
    }

    // ========================================
    // Trust Stats Counter
    // ========================================

    function animateStats() {
        const statNumbers = document.querySelectorAll('#fb-trust .cs-number');

        statNumbers.forEach(stat => {
            const text = stat.textContent.trim();

            // Detect prefix ($) and suffix (+, %)
            const hasPrefix = text.startsWith('$');
            const prefix = hasPrefix ? '$' : '';
            const hasPlus = text.includes('+');
            const hasPercent = text.includes('%');
            const suffix = hasPlus ? '+' : (hasPercent ? '%' : '');

            // Extract number
            const number = parseFloat(text.replace(/[^0-9.]/g, ''));
            const hasDecimal = text.includes('.') && !Number.isInteger(number);

            if (isNaN(number)) return;

            stat.textContent = prefix + '0' + suffix;
            const counter = { value: 0 };

            gsap.to(counter, {
                value: number,
                duration: 2,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: stat,
                    start: 'top 80%',
                    once: true
                },
                onUpdate: () => {
                    if (hasDecimal) {
                        stat.textContent = prefix + counter.value.toFixed(1) + suffix;
                    } else {
                        stat.textContent = prefix + Math.round(counter.value) + suffix;
                    }
                }
            });
        });
    }

    // ========================================
    // SBS-1640 Section
    // ========================================

    function animateSBS() {
        const section = document.querySelector('#sbs-1640');
        if (!section) return;

        const title = section.querySelector('.cs-title');
        const title2 = section.querySelector('.cs-title-2');
        const texts = section.querySelectorAll('.cs-text');
        const button = section.querySelector('.cs-button-solid');
        const picture = section.querySelector('.cs-picture');

        if (title) {
            gsap.from(title, {
                opacity: 0, y: 50, duration: 0.8, ease: 'power2.out',
                scrollTrigger: { trigger: title, start: 'top 70%', toggleActions: 'play none none none' }
            });
        }

        if (title2) {
            gsap.from(title2, {
                opacity: 0, y: 50, duration: 0.8, ease: 'power2.out',
                scrollTrigger: { trigger: title2, start: 'top 70%', toggleActions: 'play none none none' }
            });
        }

        texts.forEach((text, i) => {
            gsap.from(text, {
                opacity: 0, y: 30, duration: 0.6, delay: i * 0.1, ease: 'power2.out',
                scrollTrigger: { trigger: text, start: 'top 75%', toggleActions: 'play none none none' }
            });
        });

        if (button) {
            gsap.from(button, {
                opacity: 0, y: 20, duration: 0.5, ease: 'power2.out',
                scrollTrigger: { trigger: button, start: 'top 80%', toggleActions: 'play none none none' }
            });
        }

        if (picture) {
            gsap.from(picture, {
                opacity: 0, scale: 0.95, duration: 0.8, ease: 'power2.out',
                scrollTrigger: { trigger: picture, start: 'top 70%', toggleActions: 'play none none none' }
            });
        }
    }

    // ========================================
    // Speed Gallery Header
    // ========================================

    function animateSpeedGalleryHeader() {
        const section = document.querySelector('#speed-gallery');
        if (!section) return;

        const topper = section.querySelector('.cs-topper');
        const title = section.querySelector('.cs-title');

        if (topper) {
            gsap.from(topper, {
                opacity: 0, x: -30, duration: 0.6, ease: 'power2.out',
                scrollTrigger: { trigger: topper, start: 'top 75%', toggleActions: 'play none none none' }
            });
        }

        if (title) {
            gsap.from(title, {
                opacity: 0, y: 40, duration: 0.8, ease: 'power2.out',
                scrollTrigger: { trigger: title, start: 'top 75%', toggleActions: 'play none none none' }
            });
        }
    }

    // ========================================
    // Proof Section Header
    // ========================================

    function animateProofHeader() {
        const section = document.querySelector('#fb-proof');
        if (!section) return;

        const content = section.querySelector('.cs-content');
        if (!content) return;

        const topper = content.querySelector('.cs-topper');
        const title = content.querySelector('.cs-title');

        if (topper) {
            gsap.from(topper, {
                opacity: 0, x: -30, duration: 0.6, ease: 'power2.out',
                scrollTrigger: { trigger: topper, start: 'top 75%', toggleActions: 'play none none none' }
            });
        }

        if (title) {
            gsap.from(title, {
                opacity: 0, y: 40, duration: 0.8, ease: 'power2.out',
                scrollTrigger: { trigger: title, start: 'top 75%', toggleActions: 'play none none none' }
            });
        }
    }

    // ========================================
    // Benefits Section
    // ========================================

    function animateBenefits() {
        const section = document.querySelector('#fb-benefits');
        if (!section) return;

        const topper = section.querySelector('.cs-topper');
        const title = section.querySelector('.cs-title');
        const cards = section.querySelectorAll('.cs-item');

        if (topper) {
            gsap.from(topper, {
                opacity: 0, x: -30, duration: 0.6, ease: 'power2.out',
                scrollTrigger: { trigger: topper, start: 'top 75%', toggleActions: 'play none none none' }
            });
        }

        if (title) {
            gsap.from(title, {
                opacity: 0, y: 40, duration: 0.8, ease: 'power2.out',
                scrollTrigger: { trigger: title, start: 'top 75%', toggleActions: 'play none none none' }
            });
        }

        cards.forEach((card) => {
            gsap.from(card, {
                opacity: 0, y: 40, duration: 0.6, ease: 'power2.out',
                scrollTrigger: { trigger: card, start: 'top 80%', toggleActions: 'play none none none' }
            });
        });
    }

    // ========================================
    // CTA Section
    // ========================================

    function animateCTA() {
        const section = document.querySelector('#fb-cta');
        if (!section) return;

        const topper = section.querySelector('.cs-topper');
        const title = section.querySelector('.cs-title');
        const form = section.querySelector('.cs-form');

        if (topper) {
            gsap.from(topper, {
                opacity: 0, x: -30, duration: 0.6, ease: 'power2.out',
                scrollTrigger: { trigger: topper, start: 'top 75%', toggleActions: 'play none none none' }
            });
        }

        if (title) {
            gsap.from(title, {
                opacity: 0, y: 40, duration: 0.8, ease: 'power2.out',
                scrollTrigger: { trigger: title, start: 'top 75%', toggleActions: 'play none none none' }
            });
        }

        if (form) {
            gsap.from(form, {
                opacity: 0, y: 30, duration: 0.8, ease: 'power2.out',
                scrollTrigger: { trigger: form, start: 'top 75%', toggleActions: 'play none none none' }
            });
        }
    }

    // ========================================
    // Initialize
    // ========================================

    function init() {
        animateHero();
        animateStats();
        animateSBS();
        animateSpeedGalleryHeader();
        animateProofHeader();
        animateBenefits();
        animateCTA();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
