document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/Admin/user/login.html';
        return;
    }

    // Load all dashboard data
    loadDashboardStats();
    loadRecentApplications();
    loadUpcomingEvents();
});

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const token = localStorage.getItem('token');
        
        // Load employees count
        const employeesResponse = await fetch('http://localhost:5000/api/employees', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const employees = await employeesResponse.json();
        document.getElementById('totalEmployees').textContent = employees.length;

        // Load active applications count
        const applicationsResponse = await fetch('http://localhost:5000/api/applications?status=pending', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const applications = await applicationsResponse.json();
        document.getElementById('activeApplications').textContent = applications.length;

        // Load upcoming events count
        const eventsResponse = await fetch('http://localhost:5000/api/events?status=upcoming', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const events = await eventsResponse.json();
        document.getElementById('upcomingEvents').textContent = events.length;

        // Load active discussions count
        const discussionsResponse = await fetch('http://localhost:5000/api/discussions?status=live', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const discussions = await discussionsResponse.json();
        document.getElementById('activeDiscussions').textContent = discussions.length;

    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Load recent applications
async function loadRecentApplications() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/applications?limit=5', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const applications = await response.json();
        const tbody = document.querySelector('#recentApplications tbody');
        tbody.innerHTML = '';

        applications.forEach(app => {
            const tr = document.createElement('tr');
            const statusClass = getStatusClass(app.status);
            
            tr.innerHTML = `
                <td>
                    <div class="fw-bold">${app.user.fullName}</div>
                    <div class="small text-muted">${app.user.email}</div>
                </td>
                <td>${app.position}</td>
                <td><span class="badge ${statusClass}">${app.status.toUpperCase()}</span></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading recent applications:', error);
    }
}

// Load upcoming events
async function loadUpcomingEvents() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/events?status=upcoming&limit=5', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const events = await response.json();
        const tbody = document.querySelector('#upcomingEventsList tbody');
        tbody.innerHTML = '';

        events.forEach(event => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="fw-bold">${event.title}</div>
                    <div class="small text-muted">${event.type}</div>
                </td>
                <td>${formatDate(event.startTime)}</td>
                <td>${event.participants.length}/${event.maxParticipants}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading upcoming events:', error);
    }
}

// Helper function to get status badge class
function getStatusClass(status) {
    switch (status.toLowerCase()) {
        case 'pending':
            return 'bg-warning';
        case 'approved':
            return 'bg-success';
        case 'rejected':
            return 'bg-danger';
        case 'in_review':
            return 'bg-info';
        default:
            return 'bg-secondary';
    }
}

// Helper function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
        return `Today at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return `Tomorrow at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}
