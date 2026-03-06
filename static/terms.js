// Track if user has scrolled through terms
let hasScrolledToBottom = false;
let acceptEnabled = false;
let progressInterval = null;

function handleAgree() {
    const agreeBtn = document.getElementById('agreeBtn');
    const disagreeBtn = document.getElementById('disagreeBtn');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    // Disable buttons during processing
    agreeBtn.disabled = true;
    disagreeBtn.disabled = true;
    
    // Show progress
    progressContainer.style.display = 'block';
    
    // Start progress simulation
    let progress = 0;
    progressInterval = setInterval(() => {
        progress += 1;
        progressBar.style.width = progress + '%';
        
        // Update progress text based on progress
        if (progress < 25) {
            progressText.textContent = 'Selling your soul...';
        } else if (progress < 50) {
            progressText.textContent = 'Transferring firstborn child...';
        } else if (progress < 75) {
            progressText.textContent = 'Collecting browsing history...';
        } else if (progress < 90) {
            progressText.textContent = 'Informing Kevin from accounting...';
        } else if (progress < 100) {
            progressText.textContent = 'Preparing unicorn documentation...';
        }
        
        if (progress >= 100) {
            clearInterval(progressInterval);
            progressBar.style.width = '100%';
            progressText.textContent = 'ACCEPTANCE COMPLETE. YOU ARE OURS NOW.';
            
            // Redirect after dramatic pause
            setTimeout(() => {
                // Check if came from registration
                const referrer = document.referrer;
                if (referrer.includes('register')) {
                    window.location.href = '/register?terms=accepted&soul=transferred&firstborn=scheduled';
                } else {
                    window.location.href = '/?terms=accepted&eternal=true';
                }
            }, 2000);
        }
    }, 50);
}

function handleDisagree() {
    const messages = [
        "That's not how this works...",
        "Disagree isn't really an option here.",
        "You'll agree eventually. We have patience.",
        "Kevin from accounting has been notified of your rebellion.",
        "The unicorns are disappointed in you.",
        "Your firstborn child will be returned... eventually.",
        "Fine. But the Klaus clause still applies.",
        "ERROR: 'Disagree' function not implemented.",
        "You can run but you can't hide from the terms.",
        "The goats in Wales will remember this."
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    // Create floating message
    const msg = document.createElement('div');
    msg.textContent = randomMessage;
    msg.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #ff3300;
        color: black;
        padding: 20px;
        border: 2px solid #ff8200;
        box-shadow: 0 0 50px #ff3300;
        z-index: 1000;
        font: condensed 1.2em "Fira Sans", sans-serif;
        text-align: center;
        animation: slideUp 0.3s ease-out;
    `;
    
    document.body.appendChild(msg);
    
    // Remove after 3 seconds
    setTimeout(() => {
        msg.remove();
    }, 3000);
    
    // Slightly increase disagree button size each time
    const disagreeBtn = document.getElementById('disagreeBtn');
    const currentSize = parseInt(window.getComputedStyle(disagreeBtn).padding);
    
    // Make agree button more appealing
    const agreeBtn = document.getElementById('agreeBtn');
    agreeBtn.style.boxShadow = '0 0 50px #ff8200';
    agreeBtn.style.transform = 'scale(1.05)';
    
    // Add passive-aggressive counter
    let counter = document.getElementById('rebellion-counter');
    if (!counter) {
        counter = document.createElement('div');
        counter.id = 'rebellion-counter';
        counter.style.cssText = `
            text-align: center;
            margin-top: 10px;
            color: #ff3300;
            font: condensed 0.9em "Fira Sans", sans-serif;
        `;
        document.querySelector('.terms-footer').appendChild(counter);
    }
    
    const currentCount = parseInt(counter.textContent.match(/\d+/) || 0);
    counter.textContent = `Rebellion attempts: ${currentCount + 1} (Kevin is watching you)`;
}

// Scroll tracking
document.addEventListener('DOMContentLoaded', function() {
    const termsContent = document.getElementById('termsContent');
    const agreeBtn = document.getElementById('agreeBtn');
    
    if (termsContent) {
        termsContent.addEventListener('scroll', function() {
            const scrollPercentage = (this.scrollTop + this.clientHeight) / this.scrollHeight;
            
            // Enable accept when scrolled to 95%
            if (scrollPercentage > 0.95 && !hasScrolledToBottom) {
                hasScrolledToBottom = true;
                
                // Flash the agree button
                agreeBtn.style.animation = 'pulse 0.5s 3';
                
                // Create achievement popup
                const achievement = document.createElement('div');
                achievement.textContent = '🏆 ACHIEVEMENT UNLOCKED: ACTUALLY READ THE TERMS';
                achievement.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: #ff8200;
                    color: black;
                    padding: 15px;
                    border: 2px solid #59e0f0;
                    box-shadow: 0 0 30px #ff8200;
                    z-index: 1000;
                    font: condensed 1em "Fira Sans", sans-serif;
                    animation: slideUp 0.3s ease-out;
                `;
                
                document.body.appendChild(achievement);
                
                // Remove after 5 seconds
                setTimeout(() => {
                    achievement.remove();
                }, 5000);
            }
        });
    }
    
    // Add Easter egg for Klaus-es
    if (document.referrer.includes('klaus') || localStorage.getItem('isKlaus')) {
        localStorage.setItem('isKlaus', 'true');
        
        // Add Klaus-specific styling
        const header = document.querySelector('.header h1');
        if (header) {
            header.innerHTML = 'KLAUS-SPECIFIC TERMS & CONDITIONS (EXTRA SPICY)';
            header.style.color = '#ff8200';
            header.style.textShadow = '0 0 20px #ff8200';
        }
        
        // Add extra Klaus section
        const klausSection = document.createElement('div');
        klausSection.className = 'terms-section';
        klausSection.innerHTML = `
            <h2>☀️ SPECIAL KLAUS APPENDIX ☀️</h2>
            <p>Congratulations on being a Klaus! You get: 47 additional pages of terms (emailed to your great-aunt), a lifetime supply of German chocolate cake (void where prohibited by cake), and the eternal respect of Kevin from accounting (he's a Klaus too).</p>
            <p>Your Klaus status grants you the right to organize spice racks alphabetically during full moons. Please submit your spice organization schedule to HR. Failure to comply will result in your Klaus privileges being revoked and replacement with a "Steve" identity. No one wants to be Steve.</p>
        `;
        
        document.getElementById('termsContent').prepend(klausSection);
    }
});

// Clean up on page unload
window.addEventListener('beforeunload', function() {
    if (progressInterval) {
        clearInterval(progressInterval);
    }
});

// Easter egg: Konami code unlocks secret message
let konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', function(e) {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            // Secret message for those who know
            const secret = document.createElement('div');
            secret.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #000;
                color: #59e0f0;
                padding: 30px;
                border: 4px solid #ff8200;
                z-index: 9999;
                font: condensed 2em "Fira Mono", monospace;
                text-align: center;
                box-shadow: 0 0 100px #59e0f0;
            `;
            secret.innerHTML = '🦄 KLAUS WAS HERE 🦄<br><small style="font-size: 0.5em;">Kevin from accounting sends his regards</small>';
            document.body.appendChild(secret);
            
            setTimeout(() => secret.remove(), 5000);
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});