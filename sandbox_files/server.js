const express = require('express');
const path = require('path');
const compression = require('compression');
const { PROJECT_CONFIG, APPS } = require('./esbuild.config');

const app = express();
const PORT = PROJECT_CONFIG.PORT || 3000;

// Enable gzip compression
app.use(compression());

// Serve static files
app.use(express.static(PROJECT_CONFIG.buildDir));

// Configure routes for each app
APPS.forEach(appConfig => {
  const appPath = `/${PROJECT_CONFIG.name}/${appConfig.targetDir}`;
  const buildPath = path.join(PROJECT_CONFIG.buildDir, appConfig.buildDir);

  // Serve static files for the specific app
  app.use(appPath, express.static(buildPath));

  // Serve index.html for all sub-routes within the app
  app.get(`${appPath}/*`, (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
});

// Default route
app.get('/', (req, res) => {
  res.send(`
    <h1>${PROJECT_CONFIG.name}</h1>
    <ul>
      ${APPS.map(app => `
        <li>
          <a href="/${PROJECT_CONFIG.name}/${app.targetDir}">
            ${app.name}
          </a>
        </li>
      `).join('')}
    </ul>
  `);
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('\nAvailable routes:');
  APPS.forEach(app => {
    console.log(`- http://localhost:${PORT}/${PROJECT_CONFIG.name}/${app.targetDir}`);
  });
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
