// State management
let currentStep = 1;
let userEmail = '';
let recoveryCode = '';
let countdownInterval = null;

document.addEventListener('DOMContentLoaded', function() {
    // Check if user came from login with email pre-filled
    const urlParams = new URLSearchParams(window.location.search);
    const prefilledEmail = urlParams.get('email');
    
    if (prefilledEmail) {
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.value = prefilledEmail;
        }
    }
    
    // Password validation listeners for step 3
    const newPasswordInput = document.getElementById('newPassword');
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', function(e) {
            updatePasswordRequirements(e.target.value);
        });
    }
    
    const confirmPasswordInput = document.getElementById('confirmNewPassword');
    const confirmError = document.getElementById('confirmNewPasswordError');
    
    if (confirmPasswordInput && newPasswordInput) {
        confirmPasswordInput.addEventListener('input', function(e) {
            if (newPasswordInput.value && e.target.value) {
                if (newPasswordInput.value !== e.target.value) {
                    confirmPasswordInput.classList.add('error');
                    if (confirmError) {
                        confirmError.textContent = 'PASSWORDS DO NOT MATCH';
                        confirmError.classList.add('show');
                    }
                } else {
                    confirmPasswordInput.classList.remove('error');
                    if (confirmError) {
                        confirmError.classList.remove('show');
                    }
                }
            }
        });
    }
    
    // Auto-format code input (numbers only)
    const codeInput = document.getElementById('code');
    if (codeInput) {
        codeInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '').slice(0, 6);
        });
    }
});

function handleForgotRequest(event) {
    event.preventDefault();
    
    const email = document.getElementById('email');
    const emailError = document.getElementById('emailError');
    const submitButton = document.getElementById('submitButton');
    
    // Reset errors
    email.classList.remove('error');
    emailError.classList.remove('show');
    
    // Validate email
    if (!email.value) {
        email.classList.add('error');
        emailError.textContent = 'E-MAIL REQUIRED';
        emailError.classList.add('show');
        return;
    }
    
    if (!isValidEmail(email.value)) {
        email.classList.add('error');
        emailError.textContent = 'INVALID E-MAIL FORMAT';
        emailError.classList.add('show');
        return;
    }
    
    // Show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner"></span>SENDING...';

    fetch('/api/reset_password_verification', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email.value
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            goToStep(2);

            submitButton.disabled = false;
            submitButton.innerHTML = 'SEND RECOVERY CODE';
        } else {
            throw new Error(data.message);
        }
    })
    .catch(error => {
        alert("Something went wrong and we couldn't send you a verification code. Please, try again later!")

        submitButton.disabled = false;
        submitButton.innerHTML = 'SEND RECOVERY CODE';
    });
}

function handleCodeVerification(event) {
    event.preventDefault();
    
    const code = document.getElementById('code');
    const codeError = document.getElementById('codeError');
    const verifyButton = document.getElementById('verifyButton');
    
    // Reset errors
    code.classList.remove('error');
    codeError.classList.remove('show');
    
    // Validate code
    if (!code.value) {
        code.classList.add('error');
        codeError.textContent = 'RECOVERY CODE REQUIRED';
        codeError.classList.add('show');
        return;
    }
    
    if (code.value.length !== 6 || !/^\d+$/.test(code.value)) {
        code.classList.add('error');
        codeError.textContent = 'INVALID CODE FORMAT (6 DIGITS REQUIRED)';
        codeError.classList.add('show');
        return;
    }
    
    // Show loading state
    verifyButton.disabled = true;
    verifyButton.innerHTML = '<span class="spinner"></span>VERIFYING...';

    fetch('/api/reset_password_confirmation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email.value,
            code: code.value
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            goToStep(3);

            verifyButton.disabled = false;
            verifyButton.innerHTML = 'VERIFY CODE';
        } else {
            throw new Error(data.message);
        }
    })
    .catch(error => {
        code.classList.add('error');
        codeError.textContent = 'INVALID RECOVERY CODE';
        codeError.classList.add('show');
        
        verifyButton.disabled = false;
        verifyButton.innerHTML = 'VERIFY CODE';
    });
}

function handleNewPassword(event) {
    event.preventDefault();
    
    const newPassword = document.getElementById('newPassword');
    const confirmPassword = document.getElementById('confirmNewPassword');
    const newPasswordError = document.getElementById('newPasswordError');
    const confirmError = document.getElementById('confirmNewPasswordError');
    const resetButton = document.getElementById('resetButton');
    
    // Reset errors
    newPassword.classList.remove('error');
    confirmPassword.classList.remove('error');
    newPasswordError.classList.remove('show');
    confirmError.classList.remove('show');
    
    // Validate password
    if (!newPassword.value) {
        newPassword.classList.add('error');
        newPasswordError.textContent = 'NEW PASSWORD REQUIRED';
        newPasswordError.classList.add('show');
        return;
    }
    
    const passwordChecks = validatePassword(newPassword.value);
    if (!passwordChecks.isValid) {
        newPassword.classList.add('error');
        newPasswordError.textContent = 'PASSWORD DOES NOT MEET REQUIREMENTS';
        newPasswordError.classList.add('show');
        updatePasswordRequirements(newPassword.value);
        return;
    }
    
    // Validate confirmation
    if (!confirmPassword.value) {
        confirmPassword.classList.add('error');
        confirmError.textContent = 'PLEASE CONFIRM YOUR PASSWORD';
        confirmError.classList.add('show');
        return;
    }
    
    if (newPassword.value !== confirmPassword.value) {
        confirmPassword.classList.add('error');
        confirmError.textContent = 'PASSWORDS DO NOT MATCH';
        confirmError.classList.add('show');
        return;
    }
    
    // Show loading state
    resetButton.disabled = true;
    resetButton.innerHTML = '<span class="spinner"></span>RESETTING...';
    
    fetch('/api/reset_password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            password: newPassword.value
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            goToStep(4);

            resetButton.disabled = false;
            resetButton.innerHTML = 'RESET PASSWORD';
        } else {
            throw new Error(data.message);
        }
    })
    .catch(error => {
        alert("Something went wrong and we couldn't reset your password. Please, try again later!")
        
        resetButton.disabled = false;
        resetButton.innerHTML = 'RESET PASSWORD';
    });
}

function goToStep(step) {
    // Hide all steps
    document.querySelectorAll('.step').forEach(el => {
        el.classList.remove('active');
    });
    
    // Show requested step
    const targetStep = document.getElementById(`step${step}`);
    if (targetStep) {
        targetStep.classList.add('active');
        currentStep = step;
    }
    
    // Special case for success (step 4)
    if (step === 4) {
        document.getElementById('success').classList.add('active');
    }
}

function resendCode() {
    const resendLink = event.target;
    const originalText = resendLink.textContent;
    
    resendLink.textContent = 'SENDING...';
    resendLink.style.pointerEvents = 'none';
    
    // Simulate resend
    setTimeout(() => {
        // Generate new code
        recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`[DEMO] New recovery code for ${userEmail}: ${recoveryCode}`);
        
        resendLink.textContent = 'CODE RESENT!';
        resendLink.style.color = '#00ff00';
        
        showDemoMessage(`New demo code: ${recoveryCode}`);
        
        setTimeout(() => {
            resendLink.textContent = originalText;
            resendLink.style.color = '';
            resendLink.style.pointerEvents = 'auto';
        }, 3000);
    }, 1000);
}

function validatePassword(password) {
    const checks = {
        length: password.length >= 6,
        number: /[0-9]/.test(password),
        uppercase: /[A-Z]/.test(password)
    };
    
    checks.isValid = checks.length && checks.number && checks.uppercase;
    return checks;
}

function updatePasswordRequirements(password) {
    const checks = validatePassword(password);
    
    const reqLength = document.getElementById('reqLength');
    const reqNumber = document.getElementById('reqNumber');
    const reqUpper = document.getElementById('reqUpper');
    
    if (reqLength) {
        reqLength.innerHTML = checks.length ? '✓ At least 6 characters' : '✗ At least 6 characters';
        reqLength.style.color = checks.length ? '#00ff00' : '#ff3300';
    }
    
    if (reqNumber) {
        reqNumber.innerHTML = checks.number ? '✓ At least one number' : '✗ At least one number';
        reqNumber.style.color = checks.number ? '#00ff00' : '#ff3300';
    }
    
    if (reqUpper) {
        reqUpper.innerHTML = checks.uppercase ? '✓ At least one uppercase letter' : '✗ At least one uppercase letter';
        reqUpper.style.color = checks.uppercase ? '#00ff00' : '#ff3300';
    }
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showDemoMessage(text) {
    // Only show in development
    if (window.location.hostname !== 'localhost') return;
    
    const msg = document.createElement('div');
    msg.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #0d1f2d;
        border: 2px solid #ff8200;
        color: #e0f7fa;
        padding: 15px;
        font: condensed 0.9em 'Fira Sans', sans-serif;
        box-shadow: 0 0 30px #ff8200;
        z-index: 1000;
        animation: slideUp 0.3s ease-out;
        max-width: 300px;
    `;
    msg.textContent = text;
    
    document.body.appendChild(msg);
    
    setTimeout(() => {
        msg.remove();
    }, 5000);
}

// Clean up
window.addEventListener('beforeunload', function() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
});

// Allow going back to login
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && currentStep === 1) {
        window.location.href = '/login';
    }
});