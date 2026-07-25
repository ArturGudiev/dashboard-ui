/**
 * Dev proxy mirrors production Nginx: browser calls /api/*, rewritten to backend /*.
 * Keeps SPA routes (/epic/3, /epics, …) from colliding with REST paths.
 */
module.exports = {
  '/api': {
    target: 'http://localhost:8080',
    secure: false,
    changeOrigin: true,
    pathRewrite: {
      '^/api': '',
    },
  },
};
