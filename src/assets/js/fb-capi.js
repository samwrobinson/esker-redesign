// Populates hidden fields on lead forms (forms marked data-fb-lead) so the
// server-side Conversions API function can match the conversion to the visitor.
// - _fbp  : Meta browser cookie (set by the pixel, if present on the site)
// - _fbc  : Meta click cookie, or derived from the ?fbclid= URL param (ad clicks)
// - ua    : user agent
// - page_url : the page the form was submitted on
(function () {
    function getCookie(name) {
        var match = document.cookie.match('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)');
        return match ? decodeURIComponent(match[1]) : '';
    }

    function getFbc() {
        var cookie = getCookie('_fbc');
        if (cookie) return cookie;
        var m = window.location.search.match(/[?&]fbclid=([^&]+)/);
        if (m) return 'fb.1.' + Date.now() + '.' + decodeURIComponent(m[1]);
        return '';
    }

    function setField(form, name, value) {
        var input = form.querySelector('input[name="' + name + '"]');
        if (input) input.value = value || '';
    }

    var forms = document.querySelectorAll('form[data-fb-lead]');
    Array.prototype.forEach.call(forms, function (form) {
        form.addEventListener('submit', function () {
            setField(form, 'fbp', getCookie('_fbp'));
            setField(form, 'fbc', getFbc());
            setField(form, 'ua', navigator.userAgent);
            setField(form, 'page_url', window.location.href);
        });
    });
})();
