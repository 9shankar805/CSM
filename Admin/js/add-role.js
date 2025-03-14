// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/Admin/user/login.html';
        return;
    }

    // Load existing roles
    loadRoles();
});

// Load all roles
async function loadRoles() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/roles', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch roles');
        }

        const roles = await response.json();
        displayRoles(roles);
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load roles'
        });
    }
}

// Display roles in the table
function displayRoles(roles) {
    const tbody = document.querySelector('#rolesTable tbody');
    tbody.innerHTML = '';

    roles.forEach(role => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${role.name}</td>
            <td>${role.description}</td>
            <td>${role.permissions.join(', ')}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editRole('${role._id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteRole('${role._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Add new role
async function addRole(event) {
    event.preventDefault();
    
    const name = document.getElementById('roleName').value;
    const description = document.getElementById('roleDescription').value;
    const permissionsSelect = document.getElementById('permissions');
    const permissions = Array.from(permissionsSelect.selectedOptions).map(option => option.value);

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/roles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name,
                description,
                permissions
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create role');
        }

        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Role created successfully',
            timer: 2000,
            showConfirmButton: false
        });

        // Reset form and reload roles
        document.getElementById('roleForm').reset();
        loadRoles();
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to create role'
        });
    }
}

// Edit role
async function editRole(roleId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/roles/${roleId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch role');
        }

        const role = await response.json();

        // Show edit modal
        Swal.fire({
            title: 'Edit Role',
            html: `
                <input id="editName" class="swal2-input" value="${role.name}" placeholder="Role Name">
                <input id="editDescription" class="swal2-input" value="${role.description}" placeholder="Role Description">
                <select id="editPermissions" class="swal2-select" multiple>
                    <option value="create_user" ${role.permissions.includes('create_user') ? 'selected' : ''}>Create User</option>
                    <option value="edit_user" ${role.permissions.includes('edit_user') ? 'selected' : ''}>Edit User</option>
                    <option value="delete_user" ${role.permissions.includes('delete_user') ? 'selected' : ''}>Delete User</option>
                    <option value="view_applications" ${role.permissions.includes('view_applications') ? 'selected' : ''}>View Applications</option>
                    <option value="manage_applications" ${role.permissions.includes('manage_applications') ? 'selected' : ''}>Manage Applications</option>
                    <option value="create_events" ${role.permissions.includes('create_events') ? 'selected' : ''}>Create Events</option>
                    <option value="manage_events" ${role.permissions.includes('manage_events') ? 'selected' : ''}>Manage Events</option>
                </select>
            `,
            showCancelButton: true,
            confirmButtonText: 'Update',
            preConfirm: () => {
                return {
                    name: document.getElementById('editName').value,
                    description: document.getElementById('editDescription').value,
                    permissions: Array.from(document.getElementById('editPermissions').selectedOptions).map(option => option.value)
                };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                const response = await fetch(`http://localhost:5000/api/roles/${roleId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(result.value)
                });

                if (!response.ok) {
                    throw new Error('Failed to update role');
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Role updated successfully',
                    timer: 2000,
                    showConfirmButton: false
                });

                loadRoles();
            }
        });
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to update role'
        });
    }
}

// Delete role
async function deleteRole(roleId) {
    try {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/roles/${roleId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete role');
            }

            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Role has been deleted.',
                timer: 2000,
                showConfirmButton: false
            });

            loadRoles();
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to delete role'
        });
    }
}

// Add event listener to the form
document.getElementById('roleForm').addEventListener('submit', addRole);
