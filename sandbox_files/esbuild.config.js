const path = require('path');
const packegeJson = require('./package.json');

const projectName = packegeJson.name;

// Project configuration
const PROJECT_CONFIG = {
  name: projectName,
  buildDir: path.join(__dirname, 'build'),
  sandboxDir: `/var/www/sandboxes/${projectName}/`,
  PORT: 3001,
};

// Build configuration
const BUILD_CONFIG = {
  loader: { '.js': 'jsx' },
  minify: true,
  sourcemap: true,
  treeShaking: true,
  alias: {
    '@app': path.resolve(__dirname, 'app/javascript/horizon/src'),
    '@tests': path.resolve(__dirname, 'app/javascript/horizon/tests'),
    '@demo': path.resolve(__dirname, 'app/javascript/horizon/demo'),
    '@shared': path.resolve(__dirname, 'app/javascript/horizon/src/shared'),
    '@shadcn': path.resolve(__dirname, 'app/javascript/horizon/src/shared/shadcn'),
    "@shadcn-components": path.resolve(__dirname, 'app/javascript/horizon/src/shared/shadcn/components/ui'),
  },
  bundle: true,
};

// Apps configuration
const APPS = [
  {
    name: 'tests',
    entryPoint: 'app/javascript/horizon/tests/index.js',
    outputName: 'test-bundle',
    rootId: 'test-app',
    targetDir: 'tests',
    buildDir: 'tests',
    testEnv: true,
  }
];

// HTML template function
const createHtmlContent = (app, projectName, hashedFiles = {}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#000000" />
  <link rel="icon" href="/favicon.ico" />
  <title>${projectName} - ${app.name}</title>
  <link rel="stylesheet" href="/${projectName}/${app.targetDir}/${hashedFiles.css}">
  <script>
    window.isTestEnvironment = ${app.testEnv};
  </script>
  ${app.testEnv ? '<script crossOrigin="anonymous" src="//unpkg.com/react-scan/dist/auto.global.js"></script>' : ''}
  <script defer src="/${projectName}/${app.targetDir}/${hashedFiles.js}"></script>
  <style>
    *, *:after, *:before {
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  <noscript>You need to enable JavaScript to run this app.</noscript>
  <div id="${app.rootId}"></div>
</body>
</html>
`

const createNginxHtmlContent = createHtmlContent
const createAppHtmlContent = createHtmlContent

module.exports = {
  projectName,
  PROJECT_CONFIG,
  BUILD_CONFIG,
  APPS,
  createNginxHtmlContent,
  createAppHtmlContent,
};
