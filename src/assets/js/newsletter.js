(function() {
    // Check if current URL matches /blog/{anything}
    const isBlogPost = /^\/blog\/.+/.test(window.location.pathname);
    
    if (!isBlogPost) return; // Exit if not a blog post page
    
    // Check if user has already dismissed or subscribed (using localStorage)
    const popupDismissed = localStorage.getItem('newsletterPopupDismissed');
    if (popupDismissed) return;
    
    const overlay = document.getElementById('newsletter-popup-overlay');
    const closeBtn = document.querySelector('#cta-1612 .cs-close');
    const form = document.querySelector('#cta-1612 .cs-form');
    
    if (!overlay) return;

    // Show popup after delay (e.g., 3 seconds)
    setTimeout(() => {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scroll

        // Track popup view
        if (typeof gtag !== 'undefined') {
            gtag('event', 'newsletter_popup_view', {
                'event_category': 'engagement',
                'event_label': 'blog_popup_shown'
            });
        }
    }, 3000);

    // Close popup function
    function closePopup() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        // Remember dismissal for 7 days
        localStorage.setItem('newsletterPopupDismissed', Date.now());
    }

    // Close button click
    closeBtn.addEventListener('click', closePopup);

    // Click outside to close
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closePopup();
        }
    });

    // ESC key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closePopup();
        }
    });

    // Form submission with GA4 tracking
    form.addEventListener('submit', function(e) {
        // Track the conversion
        if (typeof gtag !== 'undefined') {
            gtag('event', 'newsletter_signup', {
                'event_category': 'engagement',
                'event_label': 'blog_popup_form'
            });
        }
        
        // Close popup after submission (adjust based on your form handling)
        // If using AJAX, call closePopup() in success callback
        localStorage.setItem('newsletterPopupDismissed', 'subscribed');
    });
})();