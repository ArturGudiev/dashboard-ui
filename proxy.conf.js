const backend = {
  target: 'http://localhost:8080',
  secure: false,
  changeOrigin: true,
};

// Angular routes that share the same path as API endpoints.
const spaApiPaths = new Set([
  '/long-tasks',
  '/repetitive-tasks',
  '/directions',
  '/epics',
  '/states',
  '/files',
  '/knowledge-node',
]);

function spaBypass(req) {
  if (req.headers.accept?.includes('html')) {
    return '/index.html';
  }
}

const paths = [
  '/users',
  '/task',
  '/tasks',
  '/get-tasks',
  '/new-task',
  '/new-hierarchical-tasks',
  '/update-task',
  '/finish-task',
  '/finish-tasks',
  '/done-tasks',
  '/parents-path',
  '/repetitive-tasks',
  '/new-repetitive-task',
  '/long-tasks',
  '/long-task-progresses',
  '/directions',
  '/problem',
  '/get-problems',
  '/new-problem',
  '/update-problem',
  '/solve-problem',
  '/question',
  '/get-questions',
  '/new-question',
  '/update-question',
  '/answer-question',
  '/story',
  '/new-story',
  '/get-stories',
  '/update-story',
  '/epic',
  '/epics',
  '/get-epics',
  '/new-epic',
  '/update-epic',
  '/log-messages',
  '/container-variables',
  '/states',
  '/state-requirements',
  '/aliases',
  '/change-tasks-order',
  '/add-anonymous-task',
  '/tests',
  '/files',
  '/knowledge-node',
  '/get-knowledge-nodes',
  '/new-knowledge-node',
  '/update-knowledge-node',
];

/** @type {Record<string, import('http-proxy-middleware').Options>} */
const config = {};

for (const path of paths) {
  config[path] = {
    ...backend,
    ...(spaApiPaths.has(path) ? { bypass: spaBypass } : {}),
  };
}

module.exports = config;
