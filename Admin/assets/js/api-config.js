// API Configuration
const API_CONFIG = {
    getBaseUrl: () => {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:8888';
        }
        return '';
    },
    endpoints: {
        register: '/api/auth/register',
        login: '/api/auth/login',
        profile: '/api/auth/current-user'
    },
    getFullUrl: function(endpoint) {
        return `${this.getBaseUrl()}${endpoint}`;
    }
};

// Common API request function with error handling
async function makeApiRequest(endpoint, options = {}) {
    try {
        const url = API_CONFIG.getFullUrl(endpoint);
        console.log('Making request to:', url);

        // Add default headers and options
        const requestOptions = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...options.headers
            }
        };

        // Log request details for debugging
        console.log('Request details:', {
            url,
            method: requestOptions.method || 'GET',
            headers: requestOptions.headers,
            body: options.body ? JSON.parse(options.body) : undefined
        });

        const response = await fetch(url, requestOptions);
        console.log('Response status:', response.status);

        // Try to parse the response as JSON
        let data;
        const text = await response.text();
        console.log('Raw response:', text);

        try {
            data = text ? JSON.parse(text) : {};
        } catch (e) {
            console.error('Failed to parse response as JSON:', text);
            throw new Error('Invalid server response format');
        }

        // Log the parsed response
        console.log('Parsed response:', data);

        if (!response.ok) {
            throw new Error(data.message || `Request failed with status ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('API Request Error:', {
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
}