document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('light-mode');
        const icon = themeToggle.querySelector('i');
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
    });

    // Horizontal Scroll for Project Cards
    const projectsContainer = document.querySelector('.projects-container');
    const projectsTrack = document.querySelector('.projects-track');

    if (projectsContainer && projectsTrack) {
        let isDragging = false;
        let startX;
        let scrollLeft;
        let animationId;
        let scrollSpeed = 1; // Adjust speed as needed
        let isHovering = false;

        // Mouse down event for dragging
        projectsContainer.addEventListener('mousedown', (e) => {
            isDragging = true;
            projectsContainer.classList.add('dragging');
            startX = e.pageX - projectsContainer.offsetLeft;
            scrollLeft = projectsContainer.scrollLeft;
            cancelAnimationFrame(animationId); // Stop auto-scroll when dragging
        });

        // Mouse leave event
        projectsContainer.addEventListener('mouseleave', () => {
            isDragging = false;
            projectsContainer.classList.remove('dragging');
            if (!isHovering) startAutoScroll();
        });

        // Mouse up event
        projectsContainer.addEventListener('mouseup', () => {
            isDragging = false;
            projectsContainer.classList.remove('dragging');
            startAutoScroll();
        });

        // Mouse move event for dragging
        projectsContainer.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - projectsContainer.offsetLeft;
            const walk = (x - startX) * 1; // Adjust scroll speed
            projectsContainer.scrollLeft = scrollLeft - walk;
        });

        // Hover events to pause auto-scroll
        projectsContainer.addEventListener('mouseenter', () => {
            isHovering = true;
            cancelAnimationFrame(animationId);
        });

        projectsContainer.addEventListener('mouseleave', () => {
            isHovering = false;
            startAutoScroll();
        });

        // Auto-scroll function
        const autoScroll = () => {
            if (isDragging || isHovering) return;

            projectsContainer.scrollLeft += scrollSpeed;

            // Prevent jittering by ensuring smooth looping
            if (projectsContainer.scrollLeft >= projectsTrack.scrollWidth - projectsContainer.offsetWidth) {
                projectsContainer.scrollLeft = 0;
            }

            animationId = requestAnimationFrame(autoScroll);
        };

        const startAutoScroll = () => {
            cancelAnimationFrame(animationId);
            animationId = requestAnimationFrame(autoScroll);
        };

        // Start auto-scroll initially
        startAutoScroll();

        // Touch events for mobile devices
        projectsContainer.addEventListener('touchstart', (e) => {
            isDragging = true;
            projectsContainer.classList.add('dragging');
            startX = e.touches[0].pageX - projectsContainer.offsetLeft;
            scrollLeft = projectsContainer.scrollLeft;
            cancelAnimationFrame(animationId);
        });

        projectsContainer.addEventListener('touchend', () => {
            isDragging = false;
            projectsContainer.classList.remove('dragging');
            startAutoScroll();
        });

        projectsContainer.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const x = e.touches[0].pageX - projectsContainer.offsetLeft;
            const walk = (x - startX) * 2;
            projectsContainer.scrollLeft = scrollLeft - walk;
        });
    }

    // Resume button alert
    document.querySelector('.resume-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        alert("Pretend you're downloading my resume! :)");
    });

    // Project outline buttons alert (for non-GitHub buttons only)
    document.querySelectorAll('.project-btn-outline').forEach(button => {
        if (!button.href.includes('github.com')) {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                alert('Pretend this is a functional button! :)');
            });
        }
    });

    // Blog Filter Functionality
    const filterTabs = document.querySelectorAll('.filter-tab');
    const archiveDropdown = document.querySelector('.archive-dropdown select');
    const blogEntries = document.querySelectorAll('.blog-entry');
    const entriesPerPage = 3;
    let currentPage = 1;
    let currentFilter = 'all';
    let currentYear = 'all';

    // Filter by category
    if (filterTabs.length > 0) {
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                currentFilter = tab.textContent.toLowerCase();
                currentPage = 1;
                filterAndPaginateEntries();
            });
        });
    }

    // Filter by year
    if (archiveDropdown) {
        archiveDropdown.addEventListener('change', (e) => {
            currentYear = e.target.value.toLowerCase();
            currentPage = 1;
            filterAndPaginateEntries();
        });
    }

    // Pagination buttons
    const prevBtn = document.querySelector('.pagination-btn.disabled');
    const nextBtn = document.querySelector('.pagination-btn:not(.disabled)');
    const pageNumbers = document.querySelector('.page-numbers');

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                filterAndPaginateEntries();
            }
        });

        nextBtn.addEventListener('click', () => {
            const filteredEntries = getFilteredEntries();
            const totalPages = Math.ceil(filteredEntries.length / entriesPerPage);
            
            if (currentPage < totalPages) {
                currentPage++;
                filterAndPaginateEntries();
            }
        });
    }

    // Main filtering and pagination function
    function filterAndPaginateEntries() {
        const filteredEntries = getFilteredEntries();
        const totalPages = Math.ceil(filteredEntries.length / entriesPerPage);
        
        // Hide all entries first
        blogEntries.forEach(entry => {
            entry.style.display = 'none';
        });
        
        // Show entries for current page
        const startIndex = (currentPage - 1) * entriesPerPage;
        const endIndex = startIndex + entriesPerPage;
        
        filteredEntries.slice(startIndex, endIndex).forEach(entry => {
            entry.style.display = 'flex';
        });
        
        // Update pagination buttons
        updatePagination(totalPages);
    }

    // Get filtered entries based on current filters
    function getFilteredEntries() {
        return Array.from(blogEntries).filter(entry => {
            const entryTags = entry.querySelectorAll('.tag');
            const entryYear = entry.querySelector('.year').textContent;
            
            // Check category filter
            const categoryMatch = currentFilter === 'all' || 
                Array.from(entryTags).some(tag => 
                    tag.classList.contains(currentFilter));
            
            // Check year filter
            const yearMatch = currentYear === 'all' || 
                entryYear === currentYear;
            
            return categoryMatch && yearMatch;
        });
    }

    // Update pagination UI
    function updatePagination(totalPages) {
        const prevBtn = document.querySelector('.pagination-btn:first-child');
        const nextBtn = document.querySelector('.pagination-btn:last-child');
        const pageNumbersContainer = document.querySelector('.page-numbers');
        
        if (prevBtn && nextBtn && pageNumbersContainer) {
            // Update previous button
            if (currentPage === 1) {
                prevBtn.classList.add('disabled');
            } else {
                prevBtn.classList.remove('disabled');
            }
            
            // Update next button
            if (currentPage >= totalPages) {
                nextBtn.classList.add('disabled');
            } else {
                nextBtn.classList.remove('disabled');
            }
            
            // Update page numbers
            pageNumbersContainer.innerHTML = '';
            
            // Always show first page
            addPageNumber(1);
            
            // Show ellipsis if needed before current page
            if (currentPage > 3) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                pageNumbersContainer.appendChild(ellipsis);
            }
            
            // Show pages around current page
            const startPage = Math.max(2, currentPage - 1);
            const endPage = Math.min(totalPages - 1, currentPage + 1);
            
            for (let i = startPage; i <= endPage; i++) {
                addPageNumber(i);
            }
            
            // Show ellipsis if needed after current page
            if (currentPage < totalPages - 2) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                pageNumbersContainer.appendChild(ellipsis);
            }
            
            // Always show last page if there's more than one page
            if (totalPages > 1) {
                addPageNumber(totalPages);
            }
        }
    }

    // Helper function to add a page number to the pagination
    function addPageNumber(page) {
        const pageNumbersContainer = document.querySelector('.page-numbers');
        const pageElement = document.createElement('span');
        pageElement.textContent = page;
        
        if (page === currentPage) {
            pageElement.classList.add('active');
        }
        
        pageElement.addEventListener('click', () => {
            currentPage = page;
            filterAndPaginateEntries();
        });
        
        pageNumbersContainer.appendChild(pageElement);
    }

    // Initialize the blog entries if they exist
    if (blogEntries.length > 0) {
        filterAndPaginateEntries();
    }

    // Category Tab Filtering
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and add to the clicked tab
            document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Get the selected category
            const selectedCategory = tab.getAttribute('data-category');

            // Filter project cards
            document.querySelectorAll('.project-card').forEach(card => {
                if (selectedCategory === 'all' || card.getAttribute('data-category') === selectedCategory) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Ensure the "Featured Projects" tab is active by default
    const defaultTab = document.querySelector('.category-tab.active');
    if (defaultTab) {
        const defaultCategory = defaultTab.getAttribute('data-category');
        document.querySelectorAll('.project-card').forEach(card => {
            if (card.getAttribute('data-category') === defaultCategory) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Handle form submission
    document.getElementById('contactForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        // Submit the form to Formspree
        fetch(this.action, {
            method: this.method,
            body: new FormData(this),
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                // Hide the contact card and show the success card
                document.querySelector('.contact-card').style.display = 'none';
                document.getElementById('successMessage').style.display = 'flex';
                
                // Trigger confetti
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            } else {
                throw new Error('Form submission failed');
            }
        }).catch(error => {
            alert('There was a problem sending your message. Please try again later.');
        });
    });
});