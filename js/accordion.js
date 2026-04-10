// Accordion Functionality
document.addEventListener('DOMContentLoaded', () => {
    const accordions = document.querySelectorAll('.accordion');

    accordions.forEach(accordion => {
        const items = accordion.querySelectorAll('.accordion__item');

        items.forEach(item => {
            const header = item.querySelector('.accordion__header');
            const content = item.querySelector('.accordion__content');

            // Initialize: Open first item by default if needed, or close all based on CSS
            // Current request: 'All start collapsed' from updated layouts?
            // Checking layouts.md: "Accordion behavior: One item expanded at a time. All start collapsed." -> Section 3, Section 5 Contact Page.
            // Coren Page Section 3: "Description visible on first/expanded item, hidden on collapsed".
            // Let's implement click handler.

            header.addEventListener('click', () => {
                const isOpen = item.classList.contains('active');

                // Close all other items in this accordion
                items.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        otherItem.querySelector('.accordion__header').setAttribute('aria-expanded', 'false');
                        otherItem.querySelector('.accordion__content').style.maxHeight = null;
                    }
                });

                // Toggle current item
                if (isOpen) {
                    item.classList.remove('active');
                    header.setAttribute('aria-expanded', 'false');
                    content.style.maxHeight = null;
                } else {
                    item.classList.add('active');
                    header.setAttribute('aria-expanded', 'true');
                    content.style.maxHeight = content.scrollHeight + "px";
                }
            });
        });

        // Optional: Open first item on load for visual hierarchy if desired, 
        // but layouts.md suggests "collapsed" initially for Contact, "visible on first" for Coren.
        // Let's open the first item for Coren page specific behavior if needed.
        if (window.location.pathname.includes('coren')) {
             const firstItem = items[0];
             if (firstItem) {
                 firstItem.classList.add('active');
                 firstItem.querySelector('.accordion__header').setAttribute('aria-expanded', 'true');
                 firstItem.querySelector('.accordion__content').style.maxHeight = firstItem.querySelector('.accordion__content').scrollHeight + "px";
             }
        }
    });
});
