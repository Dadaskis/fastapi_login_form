function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const loginButton = document.getElementById('loginButton');
    
    // Reset errors
    email.classList.remove('error');
    password.classList.remove('error');
    emailError.classList.remove('show');
    passwordError.classList.remove('show');
    
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
    
    if (password.value.length < 6) {
        password.classList.add('error');
        passwordError.textContent = 'PASSWORD TOO SHORT (MIN 6)';
        passwordError.classList.add('show');
        return;
    }
    
    // Show loading state
    loginButton.disabled = true;
    loginButton.innerHTML = '<span class="spinner"></span>AUTHENTICATING...';
    
    // DO THE REAL API CALL WOOHOO
    fetch('/api/login_user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email.value,
            password: password.value
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loginButton.innerHTML = '✓ ACCESS GRANTED';
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
        } else {
            throw new Error(data.message);
        }
    })
    .catch(error => {
        loginButton.disabled = false;
        loginButton.innerHTML = 'Login';
        
        password.classList.add('error');
        passwordError.textContent = 'ACCESS DENIED - INVALID CREDENTIALS';
        passwordError.classList.add('show');
    });
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function handleSocialLogin(provider) {
    window.location.href = `/login/${provider}`;
}