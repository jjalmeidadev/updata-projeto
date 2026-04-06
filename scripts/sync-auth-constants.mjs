import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workspaceRoot = path.resolve(__dirname, '..');
const sourcePath = path.join(workspaceRoot, 'src', 'shared', 'auth-constants.ts');
const frontendTargetPath = path.join(workspaceRoot, 'src', 'presentation', 'web', 'src', 'shared', 'auth-constants.ts');

const generatedHeader = [
  '/**',
  ' * AUTO-GENERATED FILE. Do not edit directly.',
  ' * Source: src/shared/auth-constants.ts',
  ' */',
  '',
].join('\n');

async function main() {
  const sourceContent = await readFile(sourcePath, 'utf8');
  const outputContent = `${generatedHeader}${sourceContent}`;

  await writeFile(frontendTargetPath, outputContent, 'utf8');

  console.log('Synced auth constants:');
  console.log(`- Source: ${sourcePath}`);
  console.log(`- Target: ${frontendTargetPath}`);
}

main().catch(error => {
  console.error('Failed to sync auth constants:', error);
  process.exit(1);
});
