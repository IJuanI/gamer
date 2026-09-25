import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workerPath = path.join(__dirname, '.open-next/worker.js');
const middlewareHandlerPath = path.join(__dirname, '.open-next/middleware/handler.mjs');
const serverHandlerPath = path.join(__dirname, '.open-next/server-functions/default/apps/web/handler.mjs');
const manifestPath = path.join(__dirname, '.open-next/server-functions/default/apps/web/.next/server/middleware-manifest.json');

console.log('Patching files to fix middleware manifest loading...');

if (!fs.existsSync(workerPath)) {
  console.error('ERROR: worker.js not found at', workerPath);
  process.exit(1);
}

// Ensure middleware-manifest.json exists at the expected location
const manifestDir = path.dirname(manifestPath);
if (!fs.existsSync(manifestDir)) {
  fs.mkdirSync(manifestDir, { recursive: true });
}

const manifestContent = {
  version: 3,
  middleware: {},
  sortedMiddleware: [],
  functions: {}
};

fs.writeFileSync(manifestPath, JSON.stringify(manifestContent, null, 2));
console.log('✓ Created middleware-manifest.json');

// First, try to patch the middleware handler directly
if (fs.existsSync(middlewareHandlerPath)) {
  console.log('Patching middleware handler...');
  let mwContent = fs.readFileSync(middlewareHandlerPath, 'utf-8');
  const originalMwSize = mwContent.length;

  // Replace all variants of require("/.next/server/middleware-manifest.json")
  // This handles both bare requires and those inside try-catch blocks
  mwContent = mwContent.replace(
    /require\s*\(\s*["'`][\\/\.]*\.?next[\\/]server[\\/]middleware-manifest\.json["'`]\s*\)/g,
    'null || {}'
  );

  // Also handle require with parentheses around the path
  mwContent = mwContent.replace(
    /require\s*\(\s*\(\s*["'`][\\/\.]*\.?next[\\/]server[\\/]middleware-manifest\.json["'`]\s*\)\s*\)/g,
    'null || {}'
  );

  if (mwContent !== fs.readFileSync(middlewareHandlerPath, 'utf-8')) {
    fs.writeFileSync(middlewareHandlerPath, mwContent, 'utf-8');
    const newMwSize = mwContent.length;
    console.log(`Middleware handler patched: ${originalMwSize} -> ${newMwSize} bytes`);
  }
}

// Then patch worker.js as a secondary measure
let content = fs.readFileSync(workerPath, 'utf-8');
const originalSize = content.length;

// Replace require calls in the worker
content = content.replace(
  /require\s*\(\s*["'`][\\/\.]*\.?next[\\/]server[\\/]middleware-manifest\.json["'`]\s*\)/g,
  'null || {}'
);

const newSize = content.length;
if (newSize !== originalSize) {
  fs.writeFileSync(workerPath, content, 'utf-8');
  console.log(`Worker patched: ${originalSize} -> ${newSize} bytes`);
} else {
  console.log('No middleware-manifest requires found in worker.js');
}

// Patch the actual getMiddlewareManifest() call site found in the bundled Next.js server
if (fs.existsSync(serverHandlerPath)) {
  console.log('Patching server handler getMiddlewareManifest()...');
  let shContent = fs.readFileSync(serverHandlerPath, 'utf-8');
  const originalShSize = shContent.length;

  shContent = shContent.replace(
    /getMiddlewareManifest\(\)\{return this\.minimalMode\?null:require\(this\.middlewareManifestPath\)\}/g,
    'getMiddlewareManifest(){if(this.minimalMode)return null;try{return require(this.middlewareManifestPath)}catch(e){return{version:3,middleware:{},sortedMiddleware:[],functions:{}}}}'
  );

  if (shContent.length !== originalShSize) {
    fs.writeFileSync(serverHandlerPath, shContent, 'utf-8');
    console.log(`Server handler patched: ${originalShSize} -> ${shContent.length} bytes`);
  } else {
    console.log('No getMiddlewareManifest() call site found in server handler.mjs');
  }
}

console.log('✓ Patching complete');
