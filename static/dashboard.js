// State management
let currentUser = {
    username: 'johndoe',
    full_name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'JD',
    created_at: 'January 2024',
    company: 'Independent Developer',
    location: 'Riga, Latvia',
    bio: 'Full-stack developer specializing in FastAPI and Godot. Building the future one endpoint at a time.'
};

let apiKeys = [
    { id: 1, name: 'Development', key: 'fastapi_dev_abc123...', created: '2024-01-15', lastUsed: '2024-01-20' },
    { id: 2, name: 'Production', key: 'fastapi_prod_xyz789...', created: '2024-01-10', lastUsed: '2024-01-21' },
    { id: 3, name: 'Testing', key: 'fastapi_test_def456...', created: '2024-01-18', lastUsed: '2024-01-19' },
    { id: 4, name: 'Mobile App', key: 'fastapi_mobile_ghi012...', created: '2024-01-20', lastUsed: '2024-01-21' }
];

let sessions = [
    { id: 1, device: 'Chrome / Windows', location: 'Riga, LV', ip: '192.168.1.1', lastActive: 'Now', current: true },
    { id: 2, device: 'Firefox / macOS', location: 'Tallinn, EE', ip: '192.168.1.2', lastActive: '2 hours ago', current: false },
    { id: 3, device: 'Safari / iOS', location: 'Vilnius, LT', ip: '192.168.1.3', lastActive: 'Yesterday', current: false }
];

let activities = [
    { id: 1, type: 'login', description: 'Logged in from new device', time: '2 minutes ago', icon: '🔐' },
    { id: 2, type: 'api', description: 'API key "Development" used', time: '15 minutes ago', icon: '⚡' },
    { id: 3, type: 'settings', description: 'Profile updated', time: '1 hour ago', icon: '✏️' },
    { id: 4, type: 'security', description: 'Password changed', time: '3 hours ago', icon: '🔒' },
    { id: 5, type: 'api', description: 'New API key created: "Mobile App"', time: '5 hours ago', icon: '🔑' }
];

let notifications = [
    { id: 1, title: 'New login detected', message: 'Someone logged in from Tallinn, EE', time: '2 hours ago', unread: true },
    { id: 2, title: 'API limit warning', message: 'You\'ve used 80% of your daily quota', time: '5 hours ago', unread: true },
    { id: 3, title: 'Security alert', message: 'Your password expires in 7 days', time: '1 day ago', unread: true },
    { id: 4, title: 'Welcome to the dashboard!', message: 'Explore your new dashboard features', time: '2 days ago', unread: false }
];

let billingHistory = [
    { date: '2024-01-01', description: 'Developer Pro - Monthly', amount: '$29.00', status: 'paid', invoice: '#INV-001' },
    { date: '2023-12-01', description: 'Developer Pro - Monthly', amount: '$29.00', status: 'paid', invoice: '#INV-002' },
    { date: '2023-11-01', description: 'Developer Pro - Monthly', amount: '$29.00', status: 'paid', invoice: '#INV-003' },
    { date: '2023-10-01', description: 'Developer Starter - Monthly', amount: '$9.00', status: 'paid', invoice: '#INV-004' }
];

function updateCurrentUserFields() {
    document.getElementById('userName').innerHTML = currentUser.full_name;
    document.getElementById('userEmail').innerHTML = currentUser.email;
    document.getElementById('userAvatar').innerHTML = currentUser.avatar;
    document.getElementById('profileAvatar').innerHTML = currentUser.avatar;
    document.getElementById('profileUsername').value = currentUser.username;
    document.getElementById('profileDisplayNameInput').value = currentUser.full_name;
    document.getElementById('profileEmail').value = currentUser.email;
    document.getElementById('profileBio').value = currentUser.bio;
    document.getElementById('profileCompany').value = currentUser.company;
    document.getElementById('profileLocation').value = currentUser.location;
    document.getElementById('profileDisplayName').textContent = currentUser.full_name;
    document.getElementById('profileMemberSince').textContent = `Member since ${currentUser.created_at}`;
}

document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/account_data', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        for (const key in currentUser) {
            try {
                currentUser[key] = data[key];
            } catch (ex) {
                console.log("Invalid key: " + key + " " + ex);
            }
        }
        console.log(currentUser);
        updateCurrentUserFields();
    });

    // Initialize user data
    updateUserDisplay();
    populateActivity();
    populateApiKeys();
    populateSessions();
    populateNotifications();
    populateBillingHistory();
    setupEventListeners();
    updateDashboardStats();
    
    // Set user avatar initials
    const avatar = document.getElementById('userAvatar');
    if (avatar) {
        avatar.textContent = currentUser.avatar;
    }
    
    const profileAvatar = document.getElementById('profileAvatar');
    if (profileAvatar) {
        profileAvatar.textContent = currentUser.avatar;
    }

    updateCurrentUserFields();
    
    // Global search
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase();
            if (query.length > 2) {
                highlightSearchResults(query);
            } else {
                clearSearchHighlights();
            }
        });
    }
});

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            switchSection(section);
        });
    });
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        handleLogout();
    });
    
    // Notifications
    document.getElementById('notificationsBtn').addEventListener('click', function() {
        toggleNotifications();
    });
    
    // Settings
    document.getElementById('settingsBtn').addEventListener('click', function() {
        toggleSettings();
    });
    
    // Close panels on escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeNotifications();
            closeSettings();
        }
    });
}

function switchSection(section) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    // Update content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${section}-section`).classList.add('active');
    
    // Update header title
    const titles = {
        'overview': 'OVERVIEW',
        'profile': 'PROFILE',
        'security': 'SECURITY',
        'activity': 'ACTIVITY',
        'api': 'API KEYS',
        'billing': 'BILLING'
    };
    document.getElementById('sectionTitle').textContent = titles[section];
}

function updateUserDisplay() {
    document.getElementById('userName').textContent = currentUser.displayName;
    document.getElementById('userEmail').textContent = currentUser.email;
}

function updateDashboardStats() {
    // Simulate changing stats
    setInterval(() => {
        const requests = document.getElementById('statRequests');
        if (requests) {
            const current = parseInt(requests.textContent);
            const newValue = current + Math.floor(Math.random() * 100);
            requests.textContent = newValue + 'k';
        }
    }, 30000);
}

function populateActivity() {
    const container = document.getElementById('recentActivity');
    if (!container) return;
    
    container.innerHTML = '';
    activities.slice(0, 5).forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <div class="activity-icon">${activity.icon}</div>
            <div class="activity-content">
                <div class="activity-title">${activity.description}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        `;
        container.appendChild(item);
    });
}

function populateApiKeys() {
    const container = document.getElementById('apiKeysList');
    if (!container) return;
    
    container.innerHTML = '';
    apiKeys.forEach(key => {
        const item = document.createElement('div');
        item.className = 'api-key-item';
        item.innerHTML = `
            <div>
                <div class="api-key-name">${key.name}</div>
                <div class="api-key-value">${key.key}</div>
                <div style="font-size: 0.8em; color: #FFFFFF;">Created: ${key.created} | Last used: ${key.lastUsed}</div>
            </div>
            <div class="api-key-actions">
                <button onclick="copyApiKey('${key.key}')" title="Copy">📋</button>
                <button onclick="editApiKey(${key.id})" title="Edit">✏️</button>
                <button onclick="revokeApiKey(${key.id})" title="Revoke">🗑️</button>
            </div>
        `;
        container.appendChild(item);
    });
}

function populateSessions() {
    const container = document.getElementById('sessionsList');
    if (!container) return;
    
    container.innerHTML = '';
    sessions.forEach(session => {
        const item = document.createElement('div');
        item.className = `session-item ${session.current ? 'session-current' : ''}`;
        item.innerHTML = `
            <div>
                <div class="session-device">${session.device} ${session.current ? '(CURRENT)' : ''}</div>
                <div class="session-location">${session.location} • ${session.ip}</div>
                <div class="session-time">Last active: ${session.lastActive}</div>
            </div>
            ${!session.current ? '<button class="session-revoke" onclick="revokeSession(' + session.id + ')">REVOKE</button>' : ''}
        `;
        container.appendChild(item);
    });
}

function populateNotifications() {
    const container = document.getElementById('notificationList');
    if (!container) return;
    
    container.innerHTML = '';
    notifications.forEach(notification => {
        const item = document.createElement('div');
        item.className = `notification-item ${notification.unread ? 'unread' : ''}`;
        item.innerHTML = `
            <div style="font-weight: ${notification.unread ? 'bold' : 'normal'}">${notification.title}</div>
            <div style="color: #59e0f0; font-size: 0.9em;">${notification.message}</div>
            <div style="color: #FFFFFF; font-size: 0.8em; margin-top: 4px;">${notification.time}</div>
        `;
        container.appendChild(item);
    });
}

function populateBillingHistory() {
    const container = document.getElementById('billingHistory');
    if (!container) return;
    
    container.innerHTML = '';
    billingHistory.forEach(invoice => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${invoice.date}</td>
            <td>${invoice.description}</td>
            <td>${invoice.amount}</td>
            <td class="status-${invoice.status}">${invoice.status.toUpperCase()}</td>
            <td><a href="#" onclick="downloadInvoice('${invoice.invoice}')" style="color: #59e0f0;">${invoice.invoice}</a></td>
        `;
        container.appendChild(row);
    });
}

function handleProfileUpdate(event) {
    event.preventDefault();
    
    const saveBtn = event.target.querySelector('button[type="submit"]');
    const originalText = saveBtn.innerHTML;
    
    saveBtn.innerHTML = '<span class="spinner"></span>SAVING...';
    saveBtn.disabled = true;
    
    fetch('/api/profile_update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: document.getElementById('profileUsername').value,
            full_name: document.getElementById('profileDisplayNameInput').value,
            email: document.getElementById('profileEmail').value,
            bio: document.getElementById('profileBio').value,
            company: document.getElementById('profileCompany').value,
            location: document.getElementById('profileLocation').value
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            currentUser = {
                ...currentUser,
                username: document.getElementById('profileUsername').value,
                full_name: document.getElementById('profileDisplayNameInput').value,
                email: document.getElementById('profileEmail').value,
                bio: document.getElementById('profileBio').value,
                company: document.getElementById('profileCompany').value,
                location: document.getElementById('profileLocation').value
            };
            
            document.getElementById('profileDisplayName').textContent = currentUser.displayName;
            updateUserDisplay();
            
            saveBtn.innerHTML = '✓ SAVED!';
            setTimeout(() => {
                saveBtn.innerHTML = originalText;
                saveBtn.disabled = false;
            }, 2000);
        } else {
            throw new Error();
        }
    })
    .catch(error => {
        saveBtn.innerHTML = 'X ERROR!';
        setTimeout(() => {
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        }, 2000);
    });
}

function cancelProfileEdit() {
    // Reset form to current user data
    document.getElementById('profileUsername').value = currentUser.username;
    document.getElementById('profileDisplayNameInput').value = currentUser.displayName;
    document.getElementById('profileEmail').value = currentUser.email;
    document.getElementById('profileBio').value = currentUser.bio;
    document.getElementById('profileCompany').value = currentUser.company;
    document.getElementById('profileLocation').value = currentUser.location;
}

function handlePasswordChange(event) {
    event.preventDefault();
    
    const currentPass = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirmPass = document.getElementById('confirmNewPassword').value;
    
    if (!currentPass || !newPass || !confirmPass) {
        alert('ALL FIELDS REQUIRED');
        return;
    }
    
    if (newPass.length < 6) {
        alert('PASSWORD TOO SHORT (MIN 6)');
        return;
    }
    
    if (newPass !== confirmPass) {
        alert('PASSWORDS DO NOT MATCH');
        return;
    }
    
    const saveBtn = event.target.querySelector('button[type="submit"]');
    const originalText = saveBtn.innerHTML;
    
    saveBtn.innerHTML = '<span class="spinner"></span>UPDATING...';
    saveBtn.disabled = true;
    
    setTimeout(() => {
        saveBtn.innerHTML = '✓ UPDATED!';
        event.target.reset();
        
        setTimeout(() => {
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        }, 2000);
    }, 1500);
}

function enable2FA() {
    alert('2FA ENABLED. CHECK YOUR AUTHENTICATOR APP.\n\n(Just kidding, this is a demo. Kevin from accounting is now your 2FA backup.)');
}

function createApiKey() {
    const name = prompt('ENTER API KEY NAME:');
    if (name) {
        const newKey = {
            id: apiKeys.length + 1,
            name: name,
            key: `fastapi_${Math.random().toString(36).substring(2, 10)}...`,
            created: new Date().toISOString().split('T')[0],
            lastUsed: 'Never'
        };
        apiKeys.push(newKey);
        populateApiKeys();
    }
}

function copyApiKey(key) {
    navigator.clipboard.writeText(key);
    showToast('API KEY COPIED TO CLIPBOARD');
}

function editApiKey(id) {
    const key = apiKeys.find(k => k.id === id);
    if (key) {
        const newName = prompt('EDIT API KEY NAME:', key.name);
        if (newName) {
            key.name = newName;
            populateApiKeys();
        }
    }
}

function revokeApiKey(id) {
    if (confirm('REVOKE THIS API KEY? THIS ACTION CANNOT BE UNDONE.')) {
        apiKeys = apiKeys.filter(k => k.id !== id);
        populateApiKeys();
        showToast('API KEY REVOKED');
    }
}

function revokeSession(id) {
    if (confirm('REVOKE THIS SESSION? THE USER WILL BE LOGGED OUT.')) {
        sessions = sessions.filter(s => s.id !== id);
        populateSessions();
    }
}

function toggleNotifications() {
    const panel = document.getElementById('notificationPanel');
    panel.classList.toggle('active');
    closeSettings();
}

function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    panel.classList.toggle('active');
    closeNotifications();
}

function closeNotifications() {
    document.getElementById('notificationPanel').classList.remove('active');
}

function closeSettings() {
    document.getElementById('settingsPanel').classList.remove('active');
}

function handleLogout() {
    if (confirm('LOGOUT? YOUR SESSION WILL BE TERMINATED.')) {
        // Clear any session data
        showToast('LOGGING OUT...');
        setTimeout(() => {
            window.location.href = '/login?logged_out=true';
        }, 1000);
    }
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #0d1f2d;
        border: 2px solid #ff8200;
        color: #e0f7fa;
        padding: 12px 24px;
        font: condensed 0.9em 'Fira Sans', sans-serif;
        box-shadow: 0 0 30px #ff8200;
        z-index: 9999;
        animation: slideUp 0.3s ease-out;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function downloadInvoice(invoiceNumber) {
    showToast(`DOWNLOADING ${invoiceNumber}... (just kidding, this is a demo)`);
}

function highlightSearchResults(query) {
    clearSearchHighlights();
    
    const searchable = document.querySelectorAll('.stat-label, .activity-title, .api-key-name, .session-device');
    searchable.forEach(el => {
        if (el.textContent.toLowerCase().includes(query)) {
            el.style.background = '#ff820040';
            el.style.boxShadow = '0 0 15px #ff8200';
        }
    });
}

function clearSearchHighlights() {
    document.querySelectorAll('.stat-label, .activity-title, .api-key-name, .session-device').forEach(el => {
        el.style.background = '';
        el.style.boxShadow = '';
    });
}

// Easter egg: Konami code for dashboard
let konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', function(e) {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            showToast('🦄 KEVIN FROM ACCOUNTING SAYS HELLO');
            document.querySelector('.dashboard-header h1').style.textShadow = '0 0 30px #ff00ff, 0 0 60px #00ffff';
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});