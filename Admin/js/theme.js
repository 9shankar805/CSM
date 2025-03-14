class ThemeManager {
    constructor() {
        this.themes = {
            light: {
                '--primary-color': '#0066FF',
                '--secondary-color': '#64748b',
                '--success-color': '#10b981',
                '--background-color': '#f8fafc',
                '--card-background': '#ffffff',
                '--text-color': '#334155',
                '--border-color': '#e2e8f0',
                '--hover-color': '#f1f5f9'
            },
            dark: {
                '--primary-color': '#60a5fa',
                '--secondary-color': '#94a3b8',
                '--success-color': '#34d399',
                '--background-color': '#0f172a',
                '--card-background': '#1e293b',
                '--text-color': '#e2e8f0',
                '--border-color': '#334155',
                '--hover-color': '#1e293b'
            }
        };
        
        this.init();
    }

    init() {
        // Check for saved theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
        
        // Update switch state
        const themeSwitch = document.getElementById('themeSwitch');
        if (themeSwitch) {
            themeSwitch.checked = savedTheme === 'dark';
            themeSwitch.addEventListener('change', (e) => {
                this.setTheme(e.target.checked ? 'dark' : 'light');
            });
        }
    }

    setTheme(themeName) {
        const theme = this.themes[themeName];
        const root = document.documentElement;
        
        // Apply theme colors
        for (const [property, value] of Object.entries(theme)) {
            root.style.setProperty(property, value);
        }
        
        // Update body class for theme-specific styles
        document.body.classList.remove('theme-light', 'theme-dark');
        document.body.classList.add(`theme-${themeName}`);
        
        // Save theme preference
        localStorage.setItem('theme', themeName);
        
        // Update navbar class
        const navbar = document.querySelector('.navbar');
        navbar.classList.toggle('navbar-dark', themeName === 'dark');
        navbar.classList.toggle('bg-dark', themeName === 'dark');
    }
}

// Initialize theme manager
const themeManager = new ThemeManager();
