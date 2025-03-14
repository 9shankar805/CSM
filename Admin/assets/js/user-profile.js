// Load user profile data when page loads
document.addEventListener('DOMContentLoaded', loadUserProfile);

async function loadUserProfile() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'auth-login.html';
            return;
        }

        const response = await fetch('/api/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load profile');
        }

        const user = await response.json();
        updateProfileUI(user);
    } catch (error) {
        console.error('Error loading profile:', error);
        if (error.message.includes('401')) {
            window.location.href = 'auth-login.html';
        }
    }
}

function updateProfileUI(user) {
    // Update profile elements if they exist
    const userNameElements = document.querySelectorAll('#userName');
    const userRoleElements = document.querySelectorAll('#userRole');
    const userAvatarElements = document.querySelectorAll('#userAvatar');

    userNameElements.forEach(element => {
        element.textContent = user.fullName || 'User';
    });

    userRoleElements.forEach(element => {
        element.textContent = user.role || 'User';
    });

    userAvatarElements.forEach(element => {
        if (user.profileImage) {
            element.src = user.profileImage;
        }
    });
}

function handleLogout() {
    localStorage.removeItem('token');
    window.location.href = 'auth-login.html';
}
