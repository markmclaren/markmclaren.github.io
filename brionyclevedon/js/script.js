// Wait for DOM to be fully loaded
$(document).ready(function() {
    
    // Mobile Navigation Toggle
    $('.hamburger').click(function() {
        $(this).toggleClass('active');
        $('.nav-menu').toggleClass('active');
    });

    // Close mobile menu when clicking on a link
    $('.nav-link').click(function() {
        $('.hamburger').removeClass('active');
        $('.nav-menu').removeClass('active');
    });

    // Smooth scrolling for navigation links
    $('.nav-link').click(function(e) {
        e.preventDefault();
        const target = $(this).attr('href');
        const offset = 80; // Account for fixed navbar
        
        $('html, body').animate({
            scrollTop: $(target).offset().top - offset
        }, 800, 'easeInOutQuart');
    });

    // Scroll to Top Button
    const scrollToTopBtn = $('#scrollToTop');
    
    $(window).scroll(function() {
        if ($(this).scrollTop() > 300) {
            scrollToTopBtn.addClass('visible');
        } else {
            scrollToTopBtn.removeClass('visible');
        }
        
        // Update navbar background on scroll
        if ($(this).scrollTop() > 50) {
            $('.navbar').css('background', 'rgba(255, 255, 255, 0.98)');
        } else {
            $('.navbar').css('background', 'rgba(255, 255, 255, 0.95)');
        }
    });

    scrollToTopBtn.click(function() {
        $('html, body').animate({
            scrollTop: 0
        }, 800, 'easeInOutQuart');
    });

    // Itinerary Tab Switching
    $('.tab-button').click(function() {
        const targetDay = $(this).data('day') || $(this).text().toLowerCase().replace(' ', '');
        
        // Remove active class from all tabs and days
        $('.tab-button').removeClass('active');
        $('.itinerary-day').removeClass('active');
        
        // Add active class to clicked tab
        $(this).addClass('active');
        
        // Show corresponding day content
        $(`#${targetDay}`).addClass('active');
    });

    // Activity Card Details Toggle
    window.toggleDetails = function(activity) {
        const card = $(`.activity-card[data-activity="${activity}"]`);
        const button = card.find('.learn-more-btn');
        
        // Create detailed information if it doesn't exist
        if (!card.find('.detailed-info').length) {
            let detailsHTML = '';
            
            switch(activity) {
                case 'puxton':
                    detailsHTML = `
                        <div class="detailed-info">
                            <h4><i class="fas fa-clock"></i> Opening Times</h4>
                            <p>Open 7 days a week, 9am-5:30pm. Tickets must be pre-booked online.</p>
                            
                            <h4><i class="fas fa-pound-sign"></i> Pricing</h4>
                            <p>All activities included in admission. Free carer tickets available with appropriate documentation.</p>
                            
                            <h4><i class="fas fa-wheelchair"></i> Accessibility Features</h4>
                            <ul>
                                <li>Wide level pathways throughout</li>
                                <li>Designated disabled parking spaces</li>
                                <li>Free wheelchair hire (book in advance)</li>
                                <li>Multiple accessible toilets</li>
                                <li>Wheelchair accessible miniature train and tractor rides</li>
                                <li>Ability wheelchair trampoline and roundabout</li>
                            </ul>
                            
                            <h4><i class="fas fa-map-marker-alt"></i> Location</h4>
                            <p>A370 in Hewish, 5 minutes from M5 Junction 21. Free parking for 260+ cars.</p>
                        </div>
                    `;
                    break;
                    
                case 'clevedon':
                    detailsHTML = `
                        <div class="detailed-info">
                            <h4><i class="fas fa-clock"></i> Opening Times</h4>
                            <p>Pier and seafront accessible 24/7. Five The Beach cafe open 7 days a week.</p>
                            
                            <h4><i class="fas fa-pound-sign"></i> Pricing</h4>
                            <p>Free to explore the seafront and pier. Small charge for pier entrance. Marine Lake free access.</p>
                            
                            <h4><i class="fas fa-baby-carriage"></i> Family Features</h4>
                            <ul>
                                <li>Level promenade perfect for pushchairs</li>
                                <li>Safe Marine Lake for paddling</li>
                                <li>Salthouse Fields playground and miniature railway</li>
                                <li>Rock pooling and crabbing opportunities</li>
                                <li>Victorian bandstand and pretty gardens</li>
                            </ul>
                            
                            <h4><i class="fas fa-utensils"></i> Dining</h4>
                            <p>Five The Beach: Stunning seafront cafe with large outdoor terrace, creative menu, and family-friendly atmosphere.</p>
                        </div>
                    `;
                    break;
                    
                case 'bristol':
                    detailsHTML = `
                        <div class="detailed-info">
                            <h4><i class="fas fa-clock"></i> Opening Times</h4>
                            <p>Suspension Bridge: Always accessible. SS Great Britain: Check website for current times.</p>
                            
                            <h4><i class="fas fa-pound-sign"></i> Pricing</h4>
                            <p>Suspension Bridge: Free to walk across. SS Great Britain: Admission charges apply, family tickets available.</p>
                            
                            <h4><i class="fas fa-bus"></i> Getting Around</h4>
                            <ul>
                                <li>Excellent public transport connections</li>
                                <li>Children under 16 travel free on First Bus during summer</li>
                                <li>Ferry services across the harbour</li>
                                <li>Combine with Gromit sculpture spotting</li>
                            </ul>
                            
                            <h4><i class="fas fa-utensils"></i> Dining</h4>
                            <p>The Athenian: Bristol harbourside restaurant with excellent views and family-friendly menu.</p>
                        </div>
                    `;
                    break;
            }
            
            card.find('.card-content').append(detailsHTML);
        }
        
        // Toggle the details
        const details = card.find('.detailed-info');
        if (details.is(':visible')) {
            details.slideUp(300);
            button.html('<i class="fas fa-info-circle"></i> Learn More');
        } else {
            details.slideDown(300);
            button.html('<i class="fas fa-chevron-up"></i> Show Less');
        }
    };

    // Smooth scroll function for hero button
    window.scrollToSection = function(sectionId) {
        const offset = 80;
        $('html, body').animate({
            scrollTop: $(`#${sectionId}`).offset().top - offset
        }, 800, 'easeInOutQuart');
    };

    // Itinerary function for buttons
    window.showItinerary = function(dayId) {
        // Remove active class from all tabs and days
        $('.tab-button').removeClass('active');
        $('.itinerary-day').removeClass('active');
        
        // Add active class to clicked tab
        $(`.tab-button:contains("${dayId.replace('day', 'Day ')}")`).addClass('active');
        
        // Show corresponding day content
        $(`#${dayId}`).addClass('active');
    };

    // Add easing function for smooth animations
    $.easing.easeInOutQuart = function (x, t, b, c, d) {
        if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
        return -c/2 * ((t-=2)*t*t*t - 2) + b;
    };

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for scroll animations
    $('.activity-card, .suggestion-card, .practical-card, .gromit-card').each(function() {
        this.style.opacity = '0';
        this.style.transform = 'translateY(30px)';
        this.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(this);
    });

    // Add hover effects for cards
    $('.activity-card, .suggestion-card, .practical-card').hover(
        function() {
            $(this).find('img').css('transform', 'scale(1.05)');
        },
        function() {
            $(this).find('img').css('transform', 'scale(1)');
        }
    );

    // Add click effects for buttons
    $('.hero-button, .learn-more-btn, .tab-button').on('click', function() {
        $(this).addClass('clicked');
        setTimeout(() => {
            $(this).removeClass('clicked');
        }, 200);
    });

    // Weather-based recommendations (simple example)
    function addWeatherTips() {
        const weatherTips = $(`
            <div class="weather-tips" style="
                background: linear-gradient(135deg, #FFE066, #F5D76E);
                padding: 1rem;
                border-radius: 15px;
                margin: 2rem 0;
                text-align: center;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            ">
                <h4 style="color: #2C3E50; margin-bottom: 0.5rem;">
                    <i class="fas fa-sun"></i> Weather Tips
                </h4>
                <p style="color: #2C3E50; margin: 0; font-size: 0.9rem;">
                    All recommended locations have excellent indoor options for any weather!
                </p>
            </div>
        `);
        
        $('.practical-section .container').append(weatherTips);
    }

    // Add weather tips after a short delay
    setTimeout(addWeatherTips, 1000);

    // Add loading animation completion
    $('body').addClass('loaded');

    // Preload images for better performance
    const imagesToPreload = [
        'images/puxton_soft_play.jpg',
        'images/puxton_animals.jpg',
        'images/clevedon_marine_lake.jpg',
        'images/bristol_families.jpg',
        'images/ss_great_britain.jpg'
    ];

    imagesToPreload.forEach(src => {
        const img = new Image();
        img.src = src;
    });

    // Add accessibility improvements
    $('.nav-link, .hero-button, .learn-more-btn, .tab-button').attr('role', 'button');
    $('.activity-card, .suggestion-card').attr('role', 'article');
    
    // Keyboard navigation support
    $('.nav-link, .hero-button, .learn-more-btn, .tab-button').keypress(function(e) {
        if (e.which === 13) { // Enter key
            $(this).click();
        }
    });

    // Add focus indicators for accessibility
    $('.nav-link, .hero-button, .learn-more-btn, .tab-button').focus(function() {
        $(this).css('outline', '2px solid #4A90E2');
    }).blur(function() {
        $(this).css('outline', 'none');
    });

    console.log('Family Adventure Guide website loaded successfully! 🎉');
});

// Add CSS for clicked effect
const style = document.createElement('style');
style.textContent = `
    .clicked {
        transform: scale(0.95) !important;
        transition: transform 0.1s ease !important;
    }
    
    body.loaded {
        opacity: 1;
    }
    
    .detailed-info {
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 2px solid #F8F9FA;
    }
    
    .detailed-info h4 {
        color: #4A90E2;
        margin: 1rem 0 0.5rem 0;
        display: flex;
        align-items: center;
        font-size: 1rem;
    }
    
    .detailed-info h4 i {
        margin-right: 0.5rem;
        color: #FF6B6B;
    }
    
    .detailed-info ul {
        list-style: none;
        padding-left: 0;
    }
    
    .detailed-info li {
        margin-bottom: 0.5rem;
        padding-left: 1.5rem;
        position: relative;
    }
    
    .detailed-info li::before {
        content: '✓';
        position: absolute;
        left: 0;
        color: #7ED321;
        font-weight: bold;
    }
    
    .detailed-info p {
        margin-bottom: 1rem;
        line-height: 1.6;
        color: #666;
    }
`;
document.head.appendChild(style);

