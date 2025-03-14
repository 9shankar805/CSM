const config = {
    apiBaseUrl: process.env.NODE_ENV === 'development'
        ? 'http://localhost:8888/api'
        : '/api'
};

// Export the config
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
} else {
    window.config = config;
}