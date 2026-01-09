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
    // Utility: Split text into spans
    // ========================================

    function splitTextIntoSpans(element, type = 'chars') {
        if (!element) return [];
        const text = element.textContent;
        element.innerHTML = '';

        if (type === 'chars') {
            return [...text].map(char => {
                const span = document.createElement('span');
                span.style.display = 'inline-block';
                span.textContent = char === ' ' ? '\u00A0' : char;
                element.appendChild(span);
                return span;
            });
        } else if (type === 'words') {
            return text.split(' ').map((word, i, arr) => {
                const span = document.createElement('span');
                span.style.display = 'inline-block';
                span.textContent = word;
                element.appendChild(span);
                if (i < arr.length - 1) {
                    element.appendChild(document.createTextNode(' '));
                }
                return span;
            });
        }
        return [];
    }

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
        const heroAccents = document.querySelectorAll('#fb-hero .cs-accent');

        // Animate main title
        if (heroTitle) {
            tl.from(heroTitle, { opacity: 0, y: 60, duration: 1 }, 0);
        }

        // Animate accent text with character reveal
        heroAccents.forEach((accent, i) => {
            const chars = splitTextIntoSpans(accent, 'chars');
            gsap.set(chars, { opacity: 0, y: 20 });
            tl.to(chars, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.03,
                ease: 'power2.out'
            }, 0.3 + (i * 0.2));
        });

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
    // Speed Gallery Header - No animation (handled by CSS)
    // ========================================

    function animateSpeedGalleryHeader() {
        // Animations handled by CSS + Intersection Observer in reviews.js
    }

    // ========================================
    // Proof Section Header - No animation (disabled)
    // ========================================

    function animateProofHeader() {
        // Animations disabled for this section
    }

    // ========================================
    // Reviews Section Header - Highlight animation
    // ========================================

    function animateReviewsHeader() {
        const section = document.querySelector('#reviews-355');
        if (!section) return;

        const topper = section.querySelector('.cs-topper');
        const title = section.querySelector('.cs-title');
        const highlight = section.querySelector('.cs-highlight');
        const text = section.querySelector('.cs-text');

        if (topper) {
            gsap.from(topper, {
                opacity: 0, y: -20, duration: 0.5, ease: 'power2.out',
                scrollTrigger: { trigger: topper, start: 'top 85%', toggleActions: 'play none none none' }
            });
        }

        if (title) {
            gsap.from(title, {
                opacity: 0, y: 40, duration: 0.8, ease: 'power3.out',
                scrollTrigger: { trigger: title, start: 'top 85%', toggleActions: 'play none none none' }
            });
        }

        // Animate the highlight with a special effect
        if (highlight) {
            // Add an animated underline
            highlight.style.position = 'relative';
            const underline = document.createElement('span');
            underline.style.cssText = `
                position: absolute;
                bottom: 0;
                left: 0;
                width: 0%;
                height: 3px;
                background: var(--primaryLight);
                transition: none;
            `;
            highlight.appendChild(underline);

            ScrollTrigger.create({
                trigger: highlight,
                start: 'top 80%',
                onEnter: () => {
                    gsap.to(underline, {
                        width: '100%',
                        duration: 0.8,
                        ease: 'power2.out',
                        delay: 0.3
                    });
                }
            });
        }

        if (text) {
            gsap.from(text, {
                opacity: 0, y: 20, duration: 0.6, ease: 'power2.out',
                scrollTrigger: { trigger: text, start: 'top 85%', toggleActions: 'play none none none' }
            });
        }
    }

    // ========================================
    // Benefits Section - Staggered cards with icons
    // ========================================

    function animateBenefits() {
        const section = document.querySelector('#fb-benefits');
        if (!section) return;

        const topper = section.querySelector('.cs-topper');
        const title = section.querySelector('.cs-title');
        const cards = section.querySelectorAll('.cs-item');

        if (topper) {
            gsap.from(topper, {
                opacity: 0, scale: 0.8, duration: 0.5, ease: 'back.out(1.7)',
                scrollTrigger: { trigger: topper, start: 'top 85%', toggleActions: 'play none none none' }
            });
        }

        if (title) {
            gsap.from(title, {
                opacity: 0, y: 40, duration: 0.8, ease: 'power3.out',
                scrollTrigger: { trigger: title, start: 'top 85%', toggleActions: 'play none none none' }
            });
        }

        // Staggered card reveal with scale
        cards.forEach((card, i) => {
            const icon = card.querySelector('.cs-icon, .cs-item-icon, svg, img');

            gsap.from(card, {
                opacity: 0,
                y: 60,
                scale: 0.9,
                duration: 0.7,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            });

            // Animate icon separately with a bounce
            if (icon) {
                gsap.from(icon, {
                    scale: 0,
                    rotation: -180,
                    duration: 0.6,
                    ease: 'back.out(1.7)',
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    },
                    delay: 0.2
                });
            }
        });
    }

    // ========================================
    // CTA Section - Form slide up
    // ========================================

    function animateCTA() {
        const section = document.querySelector('#fb-cta');
        if (!section) return;

        const topper = section.querySelector('.cs-topper');
        const title = section.querySelector('.cs-title');
        const text = section.querySelector('.cs-text');
        const form = section.querySelector('.cs-form');

        if (topper) {
            gsap.from(topper, {
                opacity: 0, y: -20, duration: 0.5, ease: 'power2.out',
                scrollTrigger: { trigger: topper, start: 'top 85%', toggleActions: 'play none none none' }
            });
        }

        if (title) {
            gsap.from(title, {
                opacity: 0, y: 40, duration: 0.8, ease: 'power3.out',
                scrollTrigger: { trigger: title, start: 'top 85%', toggleActions: 'play none none none' }
            });
        }

        if (text) {
            gsap.from(text, {
                opacity: 0, y: 20, duration: 0.6, ease: 'power2.out',
                scrollTrigger: { trigger: text, start: 'top 85%', toggleActions: 'play none none none' }
            });
        }

        if (form) {
            gsap.from(form, {
                opacity: 0,
                y: 50,
                scale: 0.95,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: { trigger: form, start: 'top 85%', toggleActions: 'play none none none' }
            });

            // Animate form inputs sequentially
            const inputs = form.querySelectorAll('.cs-input, .cs-submit');
            inputs.forEach((input, i) => {
                gsap.from(input, {
                    opacity: 0,
                    x: -20,
                    duration: 0.4,
                    delay: 0.3 + (i * 0.1),
                    ease: 'power2.out',
                    scrollTrigger: { trigger: form, start: 'top 85%', toggleActions: 'play none none none' }
                });
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
        animateReviewsHeader();
        animateBenefits();
        animateCTA();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
