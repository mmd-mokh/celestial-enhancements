// ============================================================
// NAVIGATION (v2) — sticky header, mobile drawer, scroll-spy
// Replaces the v1 inline-onclick nav module.
// ============================================================
(function initNavigation() {
    const RESPONSIVE_WIDTH = 1024;
    const SCROLL_THRESHOLD = 80; // px from top to trigger frosted glass
    const SPY_OFFSET = 120; // px from top to consider a section "active"

    // ---- Element refs (early exit if header is missing) ----
    const header = document.querySelector('[data-site-header]');
    if (!header) return;

    const collapseBtn = document.getElementById('collapse-btn');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const drawerPanel = mobileDrawer ? mobileDrawer.querySelector('.mobile-drawer__panel') : null;
    const drawerCloseTriggers = mobileDrawer
        ? mobileDrawer.querySelectorAll('[data-drawer-close]')
        : [];
    const drawerLinks = mobileDrawer
        ? mobileDrawer.querySelectorAll('.mobile-drawer__link')
        : [];
    const navLinks = document.querySelectorAll('[data-nav-link]');
    const sections = document.querySelectorAll('main section[id]');

    // ---- State ----
    let isDrawerOpen = false;
    let lastFocusedElement = null;
    let stickyRaf = 0;
    let spyRaf = 0;

    // ============================================================
    // 1. Sticky header — frosted glass effect on scroll
    // ============================================================
    function updateStickyHeader() {
        if (window.scrollY > SCROLL_THRESHOLD) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }
    window.addEventListener('scroll', () => {
        if (stickyRaf) return;
        stickyRaf = requestAnimationFrame(() => {
            updateStickyHeader();
            stickyRaf = 0;
        });
    }, { passive: true });
    updateStickyHeader(); // initial state

    // ============================================================
    // 2. Mobile drawer — open, close, focus trap, scroll lock
    // ============================================================
    function getDrawerFocusable() {
        if (!drawerPanel) return [];
        const sel = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
        return Array.from(drawerPanel.querySelectorAll(sel));
    }

    function openDrawer() {
        if (!mobileDrawer || isDrawerOpen) return;
        isDrawerOpen = true;
        lastFocusedElement = document.activeElement;

        // Make the drawer accessible to AT before animating
        mobileDrawer.hidden = false;
        mobileDrawer.setAttribute('aria-hidden', 'false');

        // Force reflow so the transition fires on the next frame
        void mobileDrawer.offsetHeight;
        mobileDrawer.classList.add('is-open');

        if (collapseBtn) {
            collapseBtn.setAttribute('aria-expanded', 'true');
            collapseBtn.setAttribute('aria-label', 'بستن منو');
            const icon = collapseBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('bi-list');
                icon.classList.add('bi-x-lg');
            }
        }

        document.body.classList.add('nav-drawer-open');

        // Focus the panel after the slide-in starts
        setTimeout(() => {
            if (drawerPanel) drawerPanel.focus({ preventScroll: true });
        }, 80);

        document.addEventListener('keydown', handleDrawerKeydown);
    }

    function closeDrawer() {
        if (!mobileDrawer || !isDrawerOpen) return;
        isDrawerOpen = false;

        mobileDrawer.classList.remove('is-open');
        mobileDrawer.setAttribute('aria-hidden', 'true');

        if (collapseBtn) {
            collapseBtn.setAttribute('aria-expanded', 'false');
            collapseBtn.setAttribute('aria-label', 'باز کردن منو');
            const icon = collapseBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('bi-x-lg');
                icon.classList.add('bi-list');
            }
        }

        document.body.classList.remove('nav-drawer-open');
        document.removeEventListener('keydown', handleDrawerKeydown);

        // Hide from AT after the transition completes
        const onTransitionEnd = (e) => {
            if (e.target === drawerPanel) {
                mobileDrawer.hidden = true;
                drawerPanel.removeEventListener('transitionend', onTransitionEnd);
            }
        };
        if (drawerPanel) {
            drawerPanel.addEventListener('transitionend', onTransitionEnd);
            // Safety fallback: hide after 400ms even if no transition fires
            setTimeout(() => {
                if (!isDrawerOpen) {
                    mobileDrawer.hidden = true;
                    drawerPanel.removeEventListener('transitionend', onTransitionEnd);
                }
            }, 400);
        }

        // Restore focus to the element that opened the drawer
        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
            lastFocusedElement.focus({ preventScroll: true });
        }
    }

    function toggleDrawer() {
        isDrawerOpen ? closeDrawer() : openDrawer();
    }

    function handleDrawerKeydown(e) {
        // Escape closes the drawer
        if (e.key === 'Escape') {
            e.preventDefault();
            closeDrawer();
            return;
        }
        // Tab focus trap
        if (e.key === 'Tab') {
            const focusables = getDrawerFocusable();
            if (focusables.length === 0) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            const active = document.activeElement;
            if (e.shiftKey && active === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && active === last) {
                e.preventDefault();
                first.focus();
            }
        }
    }

    // Wire up drawer triggers
    if (collapseBtn) {
        collapseBtn.addEventListener('click', toggleDrawer);
    }
    drawerCloseTriggers.forEach((btn) => btn.addEventListener('click', closeDrawer));
    drawerLinks.forEach((link) => {
        link.addEventListener('click', () => {
            if (isDrawerOpen) closeDrawer();
        });
    });

    // Close drawer if the viewport widens past the breakpoint
    let resizeTimer = 0;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth >= RESPONSIVE_WIDTH && isDrawerOpen) {
                closeDrawer();
            }
        }, 150);
    });

    // ============================================================
    // 3. Scroll-spy with aria-current
    // ============================================================
    function updateActiveNav() {
        const scrollPosition = window.scrollY + SPY_OFFSET;
        let currentId = '';
        sections.forEach((section) => {
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;
            if (scrollPosition >= top && scrollPosition < bottom) {
                currentId = section.id;
            }
        });
        navLinks.forEach((link) => {
            const href = link.getAttribute('href') || '';
            const matches = href === '#' + currentId;
            link.classList.toggle('is-active', matches);
            if (matches) {
                link.setAttribute('aria-current', 'location');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }
    window.addEventListener('scroll', () => {
        if (spyRaf) return;
        spyRaf = requestAnimationFrame(() => {
            updateActiveNav();
            spyRaf = 0;
        });
    }, { passive: true });
    updateActiveNav();
})();




// ===== ACCESSIBILITY: FAQ Keyboard Navigation =====
document.addEventListener('DOMContentLoaded', () => {
    const faqDetails = document.querySelectorAll('details');
    
    faqDetails.forEach(details => {
        const summary = details.querySelector('summary');
        
        if (summary) {
            // Ensure summary is keyboard accessible
            summary.setAttribute('tabindex', '0');
            
            // Add keyboard event handlers
            summary.addEventListener('keydown', (e) => {
                // Handle Space and Enter keys
                if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') {
                    e.preventDefault();
                    
                    // Toggle the details element
                    if (details.open) {
                        details.open = false;
                    } else {
                        details.open = true;
                    }
                    
                    // Update ARIA expanded state
                    summary.setAttribute('aria-expanded', details.open.toString());
                }
            });
            
            // Set initial ARIA expanded state
            summary.setAttribute('aria-expanded', details.open.toString());
            
            // Update ARIA expanded state when toggled by mouse
            details.addEventListener('toggle', () => {
                summary.setAttribute('aria-expanded', details.open.toString());
            });
        }
    });
});


// ===== SPRINT 4: VISUAL POLISH & MICROINTERACTIONS =====


// Scroll to Top Button
const scrollToTopButton = document.createElement('button');
scrollToTopButton.className = 'scroll-to-top';
scrollToTopButton.setAttribute('aria-label', 'بازگشت به بالای صفحه');
scrollToTopButton.innerHTML = '<i class="bi bi-arrow-up tw-text-xl"></i>';
document.body.appendChild(scrollToTopButton);

function handleScrollToTopVisibility() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 300) {
        scrollToTopButton.classList.add('visible');
    } else {
        scrollToTopButton.classList.remove('visible');
    }
}

// Throttle scroll events for scroll-to-top button with passive listener
let scrollToTopTimeout;
window.addEventListener('scroll', () => {
    if (scrollToTopTimeout) {
        window.cancelAnimationFrame(scrollToTopTimeout);
    }
    scrollToTopTimeout = window.requestAnimationFrame(handleScrollToTopVisibility);
}, { passive: true });

// Smooth scroll to top
scrollToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Keyboard support for scroll-to-top
scrollToTopButton.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
});

// ===== Newsletter Form Validation with Loading States =====
const newsletterForm = document.getElementById('newsletter-form');
const newsletterEmail = document.getElementById('newsletter-email');
const newsletterMessage = document.getElementById('newsletter-message');
const newsletterSubmitBtn = newsletterForm?.querySelector('button[type="submit"]');

if (newsletterForm && newsletterSubmitBtn) {
    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = newsletterEmail.value.trim();
        const originalButtonText = newsletterSubmitBtn.innerHTML;
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email || !emailRegex.test(email)) {
            showNewsletterMessage('لطفاً یک ایمیل معتبر وارد کنید', 'error');
            return;
        }
        
        // Show loading state with spinner
        newsletterSubmitBtn.disabled = true;
        newsletterSubmitBtn.innerHTML = '<span class="loading-spinner"></span> <span>در حال ارسال...</span>';
        newsletterSubmitBtn.style.opacity = '0.7';
        newsletterSubmitBtn.style.cursor = 'not-allowed';
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Success state
            showNewsletterMessage('<i class="bi bi-check-circle-fill" aria-hidden="true"></i> با موفقیت در خبرنامه عضو شدید!', 'success');
            newsletterEmail.value = '';
            
            // Reset button
            setTimeout(() => {
                newsletterSubmitBtn.disabled = false;
                newsletterSubmitBtn.innerHTML = originalButtonText;
                newsletterSubmitBtn.style.opacity = '1';
                newsletterSubmitBtn.style.cursor = 'pointer';
            }, 2000);
            
        } catch (error) {
            showNewsletterMessage('خطا در ثبت‌نام. لطفاً دوباره تلاش کنید', 'error');
            newsletterSubmitBtn.disabled = false;
            newsletterSubmitBtn.innerHTML = originalButtonText;
            newsletterSubmitBtn.style.opacity = '1';
            newsletterSubmitBtn.style.cursor = 'pointer';
        }
    });
    
    function showNewsletterMessage(message, type) {
        newsletterMessage.innerHTML = message;
        newsletterMessage.classList.remove('tw-hidden');
        newsletterMessage.classList.add('message-fade-in');
        
        if (type === 'success') {
            newsletterMessage.classList.add('tw-text-green-600');
            newsletterMessage.classList.remove('tw-text-red-600');
            newsletterMessage.setAttribute('role', 'status');
            newsletterEmail.removeAttribute('aria-invalid');
            newsletterEmail.removeAttribute('aria-describedby');
        } else {
            newsletterMessage.classList.add('tw-text-red-600');
            newsletterMessage.classList.remove('tw-text-green-600');
            newsletterMessage.setAttribute('role', 'alert');
            newsletterMessage.setAttribute('aria-live', 'assertive');
            newsletterEmail.setAttribute('aria-invalid', 'true');
            newsletterEmail.setAttribute('aria-describedby', 'newsletter-message');
        }
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            newsletterMessage.classList.add('tw-hidden');
        }, 5000);
    }
}

// Enhanced FAQ Animations with Content Fade
document.addEventListener('DOMContentLoaded', () => {
    const faqDetails = document.querySelectorAll('details');
    
    faqDetails.forEach(details => {
        details.addEventListener('toggle', () => {
            if (details.open) {
                const content = details.querySelector('p');
                if (content) {
                    content.style.animation = 'fadeInUp 0.3s ease-out';
                }
            }
        });
    });
});

// Intersection Observer for Scroll Animations (Optional Enhancement)
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply fade-in animation to sections (optional)
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        fadeInObserver.observe(section);
    });
});

// Respect prefers-reduced-motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (prefersReducedMotion.matches) {
    // Disable scroll animations
    document.documentElement.style.scrollBehavior = 'auto';
    
    // Disable section fade-in animations
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '1';
        section.style.transform = 'none';
    });
}

// Listen for changes in motion preference
prefersReducedMotion.addEventListener('change', () => {
    if (prefersReducedMotion.matches) {
        document.documentElement.style.scrollBehavior = 'auto';
    } else {
        document.documentElement.style.scrollBehavior = 'smooth';
    }
});

// Enhanced Button Interactions
document.addEventListener('DOMContentLoaded', () => {
    // Add ripple effect to buttons (optional subtle enhancement)
    const buttons = document.querySelectorAll('.btn, button[type="submit"]');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});

// Add ripple CSS dynamically
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .btn, button[type="submit"] {
        position: relative;
        overflow: hidden;
    }
`;
document.head.appendChild(rippleStyle);

console.log('✨ Sprint 4: Visual Polish & Microinteractions loaded successfully!');

// ===== Light/Dark Theme Toggle =====
const THEME_KEY = 'gamio-theme';
const themeToggleBtn = document.getElementById('theme-toggle');

function getStoredTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
}

function setStoredTheme(theme) {
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* unavailable */ }
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    if (themeToggleBtn) {
        const icon = themeToggleBtn.querySelector('i');
        if (icon) {
            // Sun in light mode, moon in dark mode
            icon.className = theme === 'dark' ? 'bi bi-moon-fill' : 'bi bi-sun-fill';
        }
        themeToggleBtn.setAttribute(
            'aria-label',
            theme === 'dark' ? 'تغییر به تم روشن' : 'تغییر به تم تاریک'
        );
    }
}

// Apply theme on init. Default is LIGHT (per spec), unless user has explicitly
// chosen dark. The inline pre-paint script in <head> may have already set
// data-theme="dark" to avoid a flash; we just keep it in sync with the button.
const storedTheme = getStoredTheme();
const initialTheme = storedTheme === 'dark' ? 'dark' : 'light';
applyTheme(initialTheme);

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';

        // Trigger the spin animation
        themeToggleBtn.classList.add('is-switching');
        setTimeout(() => themeToggleBtn.classList.remove('is-switching'), 450);

        applyTheme(next);
        setStoredTheme(next);
    });
}
