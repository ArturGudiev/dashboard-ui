// Default runtime config (overwritten in Docker by entrypoint from env vars)
// Cloud: set API_BASE_URL: '/api' and Nginx will proxy to backend
window.__env = window.__env || {
  API_BASE_URL: '',
  API_HOST: 'http://localhost',
  API_PORT: '8080'
};
