// Default runtime config (overwritten in Docker by entrypoint from env vars)
// Local useProxy and cloud both use '/api'; leave empty to fall back to host:port.
window.__env = window.__env || {
  API_BASE_URL: '',
  API_HOST: 'http://localhost',
  API_PORT: '8080'
};
