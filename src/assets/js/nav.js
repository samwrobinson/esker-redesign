// add classes for mobile navigation toggling
var CSbody = document.querySelector("body");
const CSnavbarMenu = document.querySelector("#cs-navigation");
const CShamburgerMenu = document.querySelector("#cs-navigation .cs-toggle");

// tertiary nav toggle code
const tertiaryDrop = Array.from(document.querySelectorAll('#cs-navigation .cs-drop3-main'));

for (const item of tertiaryDrop) {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        item.classList.toggle('drop3-active');
    });
}                               

CShamburgerMenu.addEventListener('click', function() {
    CShamburgerMenu.classList.toggle("cs-active");
    CSnavbarMenu.classList.toggle("cs-active");
    CSbody.classList.toggle("cs-open");
    // run the function to check the aria-expanded value
    ariaExpanded();
});

// checks the value of aria expanded on the cs-ul and changes it accordingly whether it is expanded or not 
function ariaExpanded() {
    const csUL = document.querySelector('#cs-expanded');
    const csExpanded = csUL.getAttribute('aria-expanded');

    if (csExpanded === 'false') {
        csUL.setAttribute('aria-expanded', 'true');
    } else {
        csUL.setAttribute('aria-expanded', 'false');
    }
}

    // This script adds a class to the body after scrolling 100px
// and we used these body.scroll styles to create some on scroll 
// animations with the navbar

document.addEventListener('scroll', (e) => { 
    const scroll = document.documentElement.scrollTop;
    if(scroll >= 100){
document.querySelector('body').classList.add('scroll')
    } else {
    document.querySelector('body').classList.remove('scroll')
    }
});


// mobile nav toggle code
const dropDowns = Array.from(document.querySelectorAll('#cs-navigation .cs-dropdown'));
    for (const item of dropDowns) {
        const onClick = () => {
        item.classList.toggle('cs-active')
    }
    item.addEventListener('click', onClick)
    }
                            
// Only apply the scroll animation on mobile
let observer;

function handleResize() {
    if (window.innerWidth < 768) {
        // Initialize observer if we're on mobile and it doesn't exist yet
        if (!observer) {
            observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('scroll-visible');
                    } else {
                        entry.target.classList.remove('scroll-visible');
                    }
                });
            }, {
                threshold: 0.99
            });

            // Observe all project items
            document.querySelectorAll('#projects-604 .cs-item').forEach((item) => {
                observer.observe(item);
            });
        }
    } else {
        // If we're on desktop, disconnect the observer if it exists
        if (observer) {
            observer.disconnect();
            observer = null;
            // Remove the scroll-visible class from all items
            document.querySelectorAll('#projects-604 .cs-item').forEach((item) => {
                item.classList.remove('scroll-visible');
            });
        }
    }
}

// Run on page load
document.addEventListener('DOMContentLoaded', handleResize);

// Run on window resize
window.addEventListener('resize', handleResize);

const leftOption = document.querySelector("#pricing-1262 #cs-option1-1262");
        const rightOption = document.querySelector("#pricing-1262 #cs-option2-1262");
        const toggle = document.querySelector("#pricing-1262 .cs-toggle");
        const cardGroup = Array.from(document.querySelectorAll('#pricing-1262 .cs-ul-wrapper'))
        // when you click the middle toggle
        toggle.addEventListener('click', (e) => { 
            for (const item of cardGroup) {
                item.classList.toggle("cs-active");
            }
            toggle.classList.toggle("active");
        });       
        // when you click the left button option
        leftOption.addEventListener('click', (e) => { 
            for (const item of cardGroup) {
                item.classList.remove("cs-active");
            }
            toggle.classList.remove("active");
        });    
        // when you click the right button option
        rightOption.addEventListener('click', (e) => { 
            for (const item of cardGroup) {
                item.classList.add("cs-active");
            }
            toggle.classList.add("active");
        });
