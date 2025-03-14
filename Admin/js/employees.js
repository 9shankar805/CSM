// Initialize DataTable
let employeesTable;

document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/Admin/user/login.html';
        return;
    }

    // Initialize DataTable
    employeesTable = $('#employeesTable').DataTable({
        pageLength: 10,
        order: [[0, 'asc']],
        columns: [
            { data: 'name' },
            { data: 'employeeId' },
            { data: 'department' },
            { data: 'position' },
            { data: 'status' },
            { data: 'actions' }
        ]
    });

    // Load employees
    loadEmployees();

    // Add event listeners for filters
    document.getElementById('departmentFilter').addEventListener('change', loadEmployees);
    document.getElementById('statusFilter').addEventListener('change', loadEmployees);
    document.getElementById('searchInput').addEventListener('input', debounce(loadEmployees, 300));
});

// Debounce function for search input
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Load employees with filters
async function loadEmployees() {
    try {
        const token = localStorage.getItem('token');
        const department = document.getElementById('departmentFilter').value;
        const status = document.getElementById('statusFilter').value;
        const search = document.getElementById('searchInput').value;

        let url = 'http://localhost:5000/api/employees?';
        if (department) url += `department=${department}&`;
        if (status) url += `status=${status}&`;
        if (search) url += `search=${search}&`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch employees');
        }

        const employees = await response.json();
        updateEmployeesTable(employees);
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load employees'
        });
    }
}

// Update employees table
function updateEmployeesTable(employees) {
    employeesTable.clear();

    employees.forEach(employee => {
        const initials = `${employee.firstName[0]}${employee.lastName[0]}`;
        const statusClass = `status-${employee.status}`;
        
        employeesTable.row.add({
            name: `
                <div class="d-flex align-items-center">
                    <div class="employee-avatar me-2">${initials}</div>
                    <div>
                        <div class="fw-bold">${employee.firstName} ${employee.lastName}</div>
                        <div class="small text-muted">${employee.email}</div>
                    </div>
                </div>
            `,
            employeeId: employee.employeeId,
            department: employee.department,
            position: employee.position,
            status: `<span class="status-badge ${statusClass}">${employee.status.replace('_', ' ').toUpperCase()}</span>`,
            actions: `
                <button class="btn btn-sm btn-info me-1" onclick="viewEmployee('${employee._id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-primary me-1" onclick="editEmployee('${employee._id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteEmployee('${employee._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            `
        });
    });

    employeesTable.draw();
}

// Show add employee modal
function showAddEmployeeModal() {
    Swal.fire({
        title: 'Add New Employee',
        html: `
            <form id="addEmployeeForm" class="text-start">
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">First Name</label>
                        <input id="firstName" class="form-control" required>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Last Name</label>
                        <input id="lastName" class="form-control" required>
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label">Email</label>
                    <input id="email" type="email" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Phone</label>
                    <input id="phone" type="tel" class="form-control" required>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Department</label>
                        <select id="department" class="form-select" required>
                            <option value="IT">IT</option>
                            <option value="HR">HR</option>
                            <option value="Finance">Finance</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Operations">Operations</option>
                        </select>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Position</label>
                        <input id="position" class="form-control" required>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Joining Date</label>
                        <input id="joiningDate" type="date" class="form-control" required>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Salary</label>
                        <input id="salary" type="number" class="form-control" required>
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label">Skills (comma-separated)</label>
                    <input id="skills" class="form-control">
                </div>
                <div class="mb-3">
                    <label class="form-label">Address</label>
                    <input id="street" class="form-control mb-2" placeholder="Street">
                    <div class="row">
                        <div class="col-md-6">
                            <input id="city" class="form-control mb-2" placeholder="City">
                        </div>
                        <div class="col-md-6">
                            <input id="state" class="form-control mb-2" placeholder="State">
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <input id="zipCode" class="form-control" placeholder="Zip Code">
                        </div>
                        <div class="col-md-6">
                            <input id="country" class="form-control" placeholder="Country">
                        </div>
                    </div>
                </div>
            </form>
        `,
        showCancelButton: true,
        confirmButtonText: 'Add Employee',
        cancelButtonText: 'Cancel',
        width: '800px',
        preConfirm: () => {
            const formData = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                department: document.getElementById('department').value,
                position: document.getElementById('position').value,
                joiningDate: document.getElementById('joiningDate').value,
                salary: parseFloat(document.getElementById('salary').value),
                skills: document.getElementById('skills').value.split(',').map(s => s.trim()).filter(s => s),
                address: {
                    street: document.getElementById('street').value,
                    city: document.getElementById('city').value,
                    state: document.getElementById('state').value,
                    zipCode: document.getElementById('zipCode').value,
                    country: document.getElementById('country').value
                }
            };

            // Validation
            if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone ||
                !formData.department || !formData.position || !formData.joiningDate || !formData.salary) {
                Swal.showValidationMessage('Please fill in all required fields');
                return false;
            }

            return formData;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            createEmployee(result.value);
        }
    });
}

// Create new employee
async function createEmployee(data) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/employees', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Failed to create employee');
        }

        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Employee created successfully',
            timer: 2000,
            showConfirmButton: false
        });

        loadEmployees();
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to create employee'
        });
    }
}

// View employee details
async function viewEmployee(id) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/employees/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch employee details');
        }

        const employee = await response.json();
        
        Swal.fire({
            title: `${employee.firstName} ${employee.lastName}`,
            html: `
                <div class="text-start">
                    <p><strong>Employee ID:</strong> ${employee.employeeId}</p>
                    <p><strong>Email:</strong> ${employee.email}</p>
                    <p><strong>Phone:</strong> ${employee.phone}</p>
                    <p><strong>Department:</strong> ${employee.department}</p>
                    <p><strong>Position:</strong> ${employee.position}</p>
                    <p><strong>Joining Date:</strong> ${new Date(employee.joiningDate).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> ${employee.status}</p>
                    <p><strong>Skills:</strong> ${employee.skills.join(', ')}</p>
                    <p><strong>Address:</strong><br>
                        ${employee.address.street}<br>
                        ${employee.address.city}, ${employee.address.state} ${employee.address.zipCode}<br>
                        ${employee.address.country}
                    </p>
                </div>
            `,
            width: '600px'
        });
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to fetch employee details'
        });
    }
}

// Edit employee
async function editEmployee(id) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/employees/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch employee details');
        }

        const employee = await response.json();

        Swal.fire({
            title: 'Edit Employee',
            html: `
                <form id="editEmployeeForm" class="text-start">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">First Name</label>
                            <input id="editFirstName" class="form-control" value="${employee.firstName}" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Last Name</label>
                            <input id="editLastName" class="form-control" value="${employee.lastName}" required>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Email</label>
                        <input id="editEmail" type="email" class="form-control" value="${employee.email}" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Phone</label>
                        <input id="editPhone" type="tel" class="form-control" value="${employee.phone}" required>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Department</label>
                            <select id="editDepartment" class="form-select" required>
                                <option value="IT" ${employee.department === 'IT' ? 'selected' : ''}>IT</option>
                                <option value="HR" ${employee.department === 'HR' ? 'selected' : ''}>HR</option>
                                <option value="Finance" ${employee.department === 'Finance' ? 'selected' : ''}>Finance</option>
                                <option value="Marketing" ${employee.department === 'Marketing' ? 'selected' : ''}>Marketing</option>
                                <option value="Operations" ${employee.department === 'Operations' ? 'selected' : ''}>Operations</option>
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Position</label>
                            <input id="editPosition" class="form-control" value="${employee.position}" required>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Status</label>
                            <select id="editStatus" class="form-select" required>
                                <option value="active" ${employee.status === 'active' ? 'selected' : ''}>Active</option>
                                <option value="inactive" ${employee.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                                <option value="on_leave" ${employee.status === 'on_leave' ? 'selected' : ''}>On Leave</option>
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Salary</label>
                            <input id="editSalary" type="number" class="form-control" value="${employee.salary}" required>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Skills (comma-separated)</label>
                        <input id="editSkills" class="form-control" value="${employee.skills.join(', ')}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Address</label>
                        <input id="editStreet" class="form-control mb-2" value="${employee.address.street}" placeholder="Street">
                        <div class="row">
                            <div class="col-md-6">
                                <input id="editCity" class="form-control mb-2" value="${employee.address.city}" placeholder="City">
                            </div>
                            <div class="col-md-6">
                                <input id="editState" class="form-control mb-2" value="${employee.address.state}" placeholder="State">
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <input id="editZipCode" class="form-control" value="${employee.address.zipCode}" placeholder="Zip Code">
                            </div>
                            <div class="col-md-6">
                                <input id="editCountry" class="form-control" value="${employee.address.country}" placeholder="Country">
                            </div>
                        </div>
                    </div>
                </form>
            `,
            showCancelButton: true,
            confirmButtonText: 'Update',
            cancelButtonText: 'Cancel',
            width: '800px',
            preConfirm: () => {
                const formData = {
                    firstName: document.getElementById('editFirstName').value,
                    lastName: document.getElementById('editLastName').value,
                    email: document.getElementById('editEmail').value,
                    phone: document.getElementById('editPhone').value,
                    department: document.getElementById('editDepartment').value,
                    position: document.getElementById('editPosition').value,
                    status: document.getElementById('editStatus').value,
                    salary: parseFloat(document.getElementById('editSalary').value),
                    skills: document.getElementById('editSkills').value.split(',').map(s => s.trim()).filter(s => s),
                    address: {
                        street: document.getElementById('editStreet').value,
                        city: document.getElementById('editCity').value,
                        state: document.getElementById('editState').value,
                        zipCode: document.getElementById('editZipCode').value,
                        country: document.getElementById('editCountry').value
                    }
                };

                // Validation
                if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone ||
                    !formData.department || !formData.position || !formData.status || !formData.salary) {
                    Swal.showValidationMessage('Please fill in all required fields');
                    return false;
                }

                return formData;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                updateEmployee(id, result.value);
            }
        });
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load employee details'
        });
    }
}

// Update employee
async function updateEmployee(id, data) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/employees/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Failed to update employee');
        }

        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Employee updated successfully',
            timer: 2000,
            showConfirmButton: false
        });

        loadEmployees();
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to update employee'
        });
    }
}

// Delete employee
async function deleteEmployee(id) {
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
            const response = await fetch(`http://localhost:5000/api/employees/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete employee');
            }

            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Employee has been deleted.',
                timer: 2000,
                showConfirmButton: false
            });

            loadEmployees();
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to delete employee'
        });
    }
}
