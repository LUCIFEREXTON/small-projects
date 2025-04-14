const esbuild = require('esbuild');
const tailwindPlugin = require('esbuild-plugin-tailwindcss').default;
const postcssPlugin = require('esbuild-plugin-postcss').default;
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const {
  PROJECT_CONFIG,
  BUILD_CONFIG,
  APPS,
  createNginxHtmlContent,
  createAppHtmlContent,
} = require('./esbuild.config');

async function ensureDirectoryExists(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    console.log(`Directory created: ${dirPath}`);
    execSync(`chown -R www-data:www-data ${dirPath}`);
    execSync(`chmod -R 755 ${dirPath}`);
  } catch (err) {
    console.error(`Failed to create directory: ${dirPath}`, err);
    throw err;
  }
}

async function createNginxIndexHtml(dir, app, hashedFiles) {
  try {
    const htmlContent = createNginxHtmlContent(app, PROJECT_CONFIG.name, hashedFiles);
    await fs.writeFile(path.join(dir, 'index.html'), htmlContent, 'utf8');
    console.log(`index.html created in ${dir}`);
  } catch (err) {
    console.error(`Failed to create index.html in ${dir}:`, err);
    throw err;
  }
}

async function createAppIndexHtml(app, hashedFiles) {
  try {
    const htmlContent = createAppHtmlContent(app, PROJECT_CONFIG.name, hashedFiles);
    const appBuildDir = path.join(PROJECT_CONFIG.buildDir, app.buildDir);
    await fs.writeFile(path.join(appBuildDir, 'index.html'), htmlContent, 'utf8');
    console.log(`index.html created in ${appBuildDir}`);
  } catch (err) {
    console.error(`Failed to create index.html in ${appBuildDir}:`, err);
    throw err;
  }
}

function generateHash(content) {
  return crypto.createHash('md5').update(content).digest('hex').slice(0, 8);
}

async function copyFileWithHash(filePath, hash, fileType, targetDir, buildDir, app, hashedFiles) {
  const hashedFileName = `${app.outputName}_${hash}.${fileType}`;
  const destPath = path.join(targetDir, hashedFileName);

  // Copy file with hashed name
  await fs.copyFile(filePath, destPath);
  await fs.copyFile(filePath, path.join(buildDir, app.buildDir, hashedFileName));
  await fs.unlink(filePath);

  hashedFiles[fileType] = hashedFileName;

  console.log(`Copied ${filePath} to ${destPath}`);
}

async function copyAppFiles(buildDir, app) {
  const targetDir = path.join(PROJECT_CONFIG.sandboxDir, app.targetDir);
  await ensureDirectoryExists(targetDir);

  try {
    let hashedFiles = {};

    try {
      const jsContent = await fs.readFile(path.join(buildDir, app.buildDir, `${app.outputName}.js`), 'utf8');
      const jsHash = generateHash(jsContent);
      for (const fileType of ['js', 'js.map']) {
        const filePath = path.join(buildDir, app.buildDir, `${app.outputName}.${fileType}`);
        await copyFileWithHash(filePath, jsHash, fileType, targetDir, buildDir, app, hashedFiles);
      }
    } catch (err) {
      console.error(`Failed to copy ${app.name} JS File:`, err);
    }

    try {
      const cssContent = await fs.readFile(path.join(buildDir, app.buildDir, `${app.outputName}.css`), 'utf8');
      const cssHash = generateHash(cssContent);
      for (const fileType of ['css', 'css.map']) {
        const filePath = path.join(buildDir, app.buildDir, `${app.outputName}.${fileType}`);
        await copyFileWithHash(filePath, cssHash, fileType, targetDir, buildDir, app, hashedFiles);
      }
    } catch (err) {
      console.error(`Failed to copy ${app.name} CSS Files:`, err);
    }

    execSync(`chown -R www-data:www-data ${targetDir}`);
    execSync(`chmod -R 755 ${targetDir}`);

    await createNginxIndexHtml(targetDir, app, hashedFiles);
    await createAppIndexHtml(app, hashedFiles);

    console.log(`Files copied for ${app.name} to ${targetDir}`);
  } catch (err) {
    console.error(`Error copying files for ${app.name}:`, err);
    throw err;
  }
}

async function handlePostBuild(buildDir) {
  await ensureDirectoryExists(PROJECT_CONFIG.sandboxDir);
  await Promise.all(APPS.map(app => copyAppFiles(buildDir, app)));
}

async function buildBundles() {
  const startTime = Date.now();
  try {
    await ensureDirectoryExists(PROJECT_CONFIG.buildDir);

    // Create build configurations for each app
    const buildTasks = APPS.map(app => ({
      ...BUILD_CONFIG,
      entryPoints: [app.entryPoint],
      jsx: 'automatic',
      plugins: [
        tailwindPlugin(),
        postcssPlugin()
      ],
      loader: { '.js': 'jsx', '.css': 'css' },
      outfile: path.join(PROJECT_CONFIG.buildDir, app.buildDir, `${app.outputName}.js`)
    }));

    // Build all bundles in parallel
    await Promise.all(
      buildTasks.map(config => esbuild.build(config))
    );

    const buildEndTime = Date.now();
    console.log(`Build process completed in ${(buildEndTime - startTime) / 1000} seconds.`);

    // Handle post-build operations
    await handlePostBuild(PROJECT_CONFIG.buildDir);
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildBundles();
