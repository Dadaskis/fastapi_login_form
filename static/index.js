document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');
    
    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileNav.classList.toggle('active');
            mobileMenuBtn.textContent = mobileNav.classList.contains('active') ? '✕' : '☰';
        });
    }
    
    // Close mobile menu when clicking a link
    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', function() {
            mobileNav.classList.remove('active');
            mobileMenuBtn.textContent = '☰';
        });
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.style.background = '#0d1f2d';
        } else {
            navbar.style.background = '#0d1f2d29';
        }
        
        lastScroll = currentScroll;
    });
    
    // Animate stats on scroll
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateValue(entry.target, 0, parseInt(entry.target.textContent), 2000);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => observer.observe(stat));
    
    // Parallax effect for background
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        document.body.style.backgroundPositionY = -(scrolled * 0.5) + 'px';
    });
    
    // Typing effect for hero subtitle
    const subtitle = document.querySelector('.title-sub');
    if (subtitle) {
        const text = subtitle.textContent;
        subtitle.textContent = '';
        
        let i = 0;
        function typeWriter() {
            if (i < text.length) {
                subtitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        }
        
        // Start typing after a short delay
        setTimeout(typeWriter, 1000);
    }
    
    // Feature cards hover effect
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Pricing card highlight
    const featuredCard = document.querySelector('.pricing-card.featured');
    if (featuredCard) {
        setInterval(() => {
            featuredCard.style.boxShadow = featuredCard.style.boxShadow ? 
                '0 0 40px rgba(255,130,0,0.3)' : 
                '0 0 60px rgba(255,130,0,0.5)';
        }, 2000);
    }
    
    // Demo code line highlighting
    const codeLines = document.querySelectorAll('.demo-code code');
    codeLines.forEach(code => {
        code.innerHTML = code.innerHTML.split('\n').map(line => {
            if (line.includes('FastAPI')) {
                return `<span style="color: #ff8200; text-shadow: 0 0 10px #ff8200;">${line}</span>`;
            }
            return line;
        }).join('\n');
    });
    
    // Easter egg: Konami code
    let konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;
    
    document.addEventListener('keydown', function(e) {
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                // Activate rainbow mode
                document.querySelectorAll('.title-highlight').forEach(el => {
                    el.style.animation = 'rainbow 2s linear infinite';
                });
                
                // Add Kevin from accounting message
                const kevinMsg = document.createElement('div');
                kevinMsg.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: #0d1f2d;
                    border: 2px solid #ff8200;
                    color: #59e0f0;
                    padding: 15px;
                    font: condensed 1em 'Fira Sans', sans-serif;
                    box-shadow: 0 0 30px #ff8200;
                    z-index: 9999;
                    animation: slideUp 0.3s ease-out;
                `;
                kevinMsg.innerHTML = '🦄 KEVIN FROM ACCOUNTING APPROVES THIS PAGE 🦄';
                document.body.appendChild(kevinMsg);
                
                setTimeout(() => kevinMsg.remove(), 5000);
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });
});

// Utility function to animate numbers
function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            element.textContent = end + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + '+';
        }
    }, 16);
}

// Add rainbow animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes rainbow {
        0% { color: #ff0000; text-shadow: 0 0 30px #ff0000; }
        17% { color: #ff8200; text-shadow: 0 0 30px #ff8200; }
        33% { color: #ffff00; text-shadow: 0 0 30px #ffff00; }
        50% { color: #00ff00; text-shadow: 0 0 30px #00ff00; }
        67% { color: #00ffff; text-shadow: 0 0 30px #00ffff; }
        83% { color: #0000ff; text-shadow: 0 0 30px #0000ff; }
        100% { color: #ff00ff; text-shadow: 0 0 30px #ff00ff; }
    }
    
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Track scroll position for analytics (demo)
let scrollDepth = 0;
window.addEventListener('scroll', function() {
    const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
    
    if (scrollPercent > 25 && scrollDepth < 25) {
        console.log('📊 User scrolled 25%');
        scrollDepth = 25;
    } else if (scrollPercent > 50 && scrollDepth < 50) {
        console.log('📊 User scrolled 50%');
        scrollDepth = 50;
    } else if (scrollPercent > 75 && scrollDepth < 75) {
        console.log('📊 User scrolled 75%');
        scrollDepth = 75;
    } else if (scrollPercent > 90 && scrollDepth < 90) {
        console.log('📊 User scrolled 90% - engaged!');
        scrollDepth = 90;
    }
});

// Add interactive hover effects to community cards
document.querySelectorAll('.community-card').forEach(card => {
    card.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
});

// Prefetch login and register pages for faster navigation
if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
        const links = ['/login', '/register'];
        links.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = href;
            document.head.appendChild(link);
        });
    });
}