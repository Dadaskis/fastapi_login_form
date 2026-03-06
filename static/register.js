function handleRegister(event) {
    event.preventDefault();
    
    // Get form elements
    const username = document.getElementById('username');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const terms = document.getElementById('terms');
    
    // Get error containers
    const usernameError = document.getElementById('usernameError');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    
    // Get register button
    const registerButton = document.getElementById('registerButton');
    
    // Reset all errors
    const allInputs = [username, email, password, confirmPassword];
    allInputs.forEach(input => input.classList.remove('error'));
    
    const allErrors = [usernameError, emailError, passwordError, confirmPasswordError];
    allErrors.forEach(error => error.classList.remove('show'));
    
    // Validate username
    if (!username.value) {
        username.classList.add('error');
        usernameError.textContent = 'USERNAME REQUIRED';
        usernameError.classList.add('show');
        return;
    }
    
    if (username.value.length < 3) {
        username.classList.add('error');
        usernameError.textContent = 'USERNAME TOO SHORT (MIN 3)';
        usernameError.classList.add('show');
        return;
    }
    
    if (!/^[a-zA-Z0-9]+$/.test(username.value)) {
        username.classList.add('error');
        usernameError.textContent = 'USERNAME CAN ONLY CONTAIN LETTERS AND NUMBERS';
        usernameError.classList.add('show');
        return;
    }
    
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
    
    // Validate password
    if (!password.value) {
        password.classList.add('error');
        passwordError.textContent = 'PASSWORD REQUIRED';
        passwordError.classList.add('show');
        return;
    }
    
    const passwordChecks = validatePassword(password.value);
    
    if (!passwordChecks.isValid) {
        password.classList.add('error');
        passwordError.textContent = 'PASSWORD DOES NOT MEET REQUIREMENTS';
        passwordError.classList.add('show');
        updatePasswordRequirements(password.value);
        return;
    }
    
    // Validate password confirmation
    if (!confirmPassword.value) {
        confirmPassword.classList.add('error');
        confirmPasswordError.textContent = 'PLEASE CONFIRM YOUR PASSWORD';
        confirmPasswordError.classList.add('show');
        return;
    }
    
    if (password.value !== confirmPassword.value) {
        confirmPassword.classList.add('error');
        confirmPasswordError.textContent = 'PASSWORDS DO NOT MATCH';
        confirmPasswordError.classList.add('show');
        return;
    }
    
    // Validate terms acceptance
    if (!terms.checked) {
        alert('YOU MUST ACCEPT THE TERMS AND CONDITIONS');
        return;
    }
    
    // Show loading state
    registerButton.disabled = true;
    registerButton.innerHTML = '<span class="spinner"></span>CREATING ACCOUNT...';
    
    // API call
    setTimeout(() => {
        // Successful registration
        registerButton.innerHTML = '✓ ACCOUNT CREATED';
        setTimeout(() => {
            window.location.href = '/login?registered=true';
        }, 1000);
        
        fetch('/api/register_user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username.value,
                email: email.value,
                password: password.value
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                registerButton.innerHTML = '✓ ACCOUNT CREATED';
                setTimeout(() => {
                    window.location.href = '/login?registered=true';
                }, 1000);
            } else {
                throw new Error(data.message);
            }
        })
        .catch(error => {
            registerButton.disabled = false;
            registerButton.innerHTML = 'CREATE ACCOUNT';
            
            // Handle specific errors
            if (error.message.includes('email')) {
                email.classList.add('error');
                emailError.textContent = 'E-MAIL ALREADY REGISTERED';
                emailError.classList.add('show');
            } else if (error.message.includes('username')) {
                username.classList.add('error');
                usernameError.textContent = 'USERNAME TAKEN';
                usernameError.classList.add('show');
            } else {
                alert('REGISTRATION FAILED: ' + error.message);
            }
        });
    }, 1500);
}

// Real-time password validation
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

// Real-time validation listeners
document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function(e) {
            updatePasswordRequirements(e.target.value);
        });
    }
    
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordError = document.getElementById('confirmPasswordError');
    
    if (confirmPasswordInput && passwordInput) {
        confirmPasswordInput.addEventListener('input', function(e) {
            if (passwordInput.value && e.target.value) {
                if (passwordInput.value !== e.target.value) {
                    confirmPasswordInput.classList.add('error');
                    if (passwordError) {
                        passwordError.textContent = 'PASSWORDS DO NOT MATCH';
                        passwordError.classList.add('show');
                    }
                } else {
                    confirmPasswordInput.classList.remove('error');
                    if (passwordError) {
                        passwordError.classList.remove('show');
                    }
                }
            }
        });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const termsAccepted = urlParams.get('terms') === 'accepted';
    const soulTransferred = urlParams.get('soul') === 'transferred';
    const firstbornScheduled = urlParams.get('firstborn') === 'scheduled';
    
    if (termsAccepted && soulTransferred && firstbornScheduled) {
        const termsCheckbox = document.getElementById('terms');
        if (termsCheckbox) {
            // Auto-check the checkbox
            termsCheckbox.checked = true;
            showTermsAcceptedMessage();
            termsCheckbox.parentElement.classList.add('terms-pre-approved');
        }
    }
});

function showTermsAcceptedMessage() {
    const message = document.createElement('div');
    message.className = 'terms-accepted-message';
    message.innerHTML = `
        <div style="
            background: #00ff0022;
            border: 2px solid #00ff00;
            color: #00ff00;
            padding: 10px;
            margin: 10px 0;
            text-align: center;
            font: condensed 0.9em 'Fira Sans', sans-serif;
            text-shadow: 0 0 10px #00ff00;
            animation: pulse 2s infinite;
        ">
            ⚡ SOUL TRANSFERRED | FIRSTBORN SCHEDULED ⚡
            <br>
            <small>Welcome back, eternal servant.</small>
        </div>
    `;
    
    const form = document.getElementById('registerForm');
    if (form) {
        form.insertBefore(message, form.firstChild);
    }
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function handleSocialRegister(provider) {
    alert(`${provider.toUpperCase()} REGISTRATION INITIATED`);
    // window.location.href = `/auth/${provider}/register`;
}