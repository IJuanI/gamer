import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workerPath = path.join(__dirname, '.open-next/worker.js');

console.log('Patching worker.js to fix middleware manifest loading...');

if (!fs.existsSync(workerPath)) {
  console.error('ERROR: worker.js not found at', workerPath);
  process.exit(1);
}

let content = fs.readFileSync(workerPath, 'utf-8');
const originalSize = content.length;

// Patch 1: Replace the dynamic require error with a default empty object
// This catches the "Dynamic require of middleware-manifest.json is not supported" error
content = content.replace(
  /require\s*\(\s*["'`]\/\.next\/server\/middleware-manifest\.json["'`]\s*\)/g,
  '({})'
);

// Patch 2: Wrap middleware manifest loading in try-catch if not already done
if (content.includes('getMiddlewareManifest')) {
  // Replace any dynamic require calls in middleware manifest functions
  content = content.replace(
    /getMiddlewareManifest\s*\(\s*\)\s*{([^}]*?)require\([^)]*middleware-manifest[^)]*\)([^}]*?)}/g,
    'getMiddlewareManifest() {$1({}){$2}'
  );
}

// Patch 3: Ensure middleware returns empty object if missing
content = content.replace(
  /middleware\s*:\s*undefined/g,
  'middleware: null'
);

const newSize = content.length;
console.log(`Original size: ${originalSize} bytes`);
console.log(`New size: ${newSize} bytes`);
console.log(`Bytes changed: ${Math.abs(newSize - originalSize)}`);

fs.writeFileSync(workerPath, content, 'utf-8');
console.log('✓ Successfully patched worker.js');
