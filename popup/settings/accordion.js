// Improved accordion functionality
document.addEventListener('DOMContentLoaded', function() {
    const accordionButtons = document.querySelectorAll('[data-accordion-target]');
    
    accordionButtons.forEach(button => {
        const targetId = button.getAttribute('data-accordion-target');
        const targetContent = document.getElementById(targetId);
        const chevron = button.querySelector('.fa-chevron-down');
        
        // Function to update max-height based on content
        const updateMaxHeight = () => {
            if (targetContent.classList.contains('accordion-open')) {
                targetContent.style.maxHeight = targetContent.scrollHeight + 'px';
            }
        };
        
        // Initialize all accordions as open
        targetContent.style.maxHeight = targetContent.scrollHeight + 'px';
        targetContent.classList.add('accordion-open');
        chevron.style.transform = 'rotate(180deg)';
        setTimeout(updateMaxHeight, 100);
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const isOpen = targetContent.classList.contains('accordion-open');
            
            if (isOpen) {
                // Close accordion
                targetContent.style.maxHeight = '0px';
                targetContent.classList.remove('accordion-open');
                chevron.style.transform = 'rotate(0deg)';
            } else {
                // Open accordion
                targetContent.style.maxHeight = targetContent.scrollHeight + 'px';
                targetContent.classList.add('accordion-open');
                chevron.style.transform = 'rotate(180deg)';
                setTimeout(updateMaxHeight, 100);
            }
        });

        
        // Update max-height when content changes (e.g., when inputs change)
        const observer = new MutationObserver(updateMaxHeight);
        observer.observe(targetContent, { childList: true, subtree: true, attributes: true });
        
        // Also update on window resize
        window.addEventListener('resize', updateMaxHeight);
    });
});

