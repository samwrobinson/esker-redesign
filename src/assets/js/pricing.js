// Pricing page segmented control.
// The buttons (.cs-seg-btn[data-target]) switch which package panel
// (.cs-panel[data-panel]) is visible. CSS shows only the panel with .active,
// so this just moves the .active class onto the clicked button + its panel.
(function () {
    const seg = document.querySelector('#pricing-1262 .cs-seg');
    if (!seg) return;

    const buttons = Array.from(seg.querySelectorAll('.cs-seg-btn'));
    const panels = Array.from(document.querySelectorAll('#pricing-1262 .cs-panel'));

    function activate(target) {
        buttons.forEach((btn) => {
            const on = btn.dataset.target === target;
            btn.classList.toggle('active', on);
            btn.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        panels.forEach((panel) => {
            panel.classList.toggle('active', panel.dataset.panel === target);
        });
    }

    buttons.forEach((btn) => {
        btn.addEventListener('click', () => activate(btn.dataset.target));
    });
})();
