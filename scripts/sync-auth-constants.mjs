import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workspaceRoot = path.resolve(__dirname, '..');
const sourcePath = path.join(workspaceRoot, 'src', 'shared', 'auth-constants.ts');
const frontendTargetPaths = [
  path.join(workspaceRoot, 'src', 'presentation', 'web', 'src', 'shared', 'auth-constants.ts'),
  path.join(workspaceRoot, 'src', 'presentation', 'web', 'src', 'app', 'shared', 'auth-constants.ts'),
];
const envPath = path.join(workspaceRoot, 'config', '.env');

const generatedHeader = [
  '/**',
  ' * AUTO-GENERATED FILE. Do not edit directly.',
  ' * Source: src/shared/auth-constants.ts',
  ' */',
  '',
].join('\n');

dotenv.config({ path: envPath });

async function main() {
  const sourceContent = await readFile(sourcePath, 'utf8');
  const adminEmail = (process.env.EQUIEM_ADMIN_EMAIL || '').trim().toLowerCase();
  const outputContent = `${generatedHeader}${sourceContent}`.replace(
    /  return normalizeEmail\(readEnv\('EQUIEM_ADMIN_EMAIL'\) \?\? ''\);\r?\n/,
    `  return ${JSON.stringify(adminEmail)};\n`
  );

  await Promise.all(frontendTargetPaths.map((targetPath) => writeFile(targetPath, outputContent, 'utf8')));

  console.log('Synced auth constants:');
  console.log(`- Source: ${sourcePath}`);
  frontendTargetPaths.forEach((targetPath) => {
    console.log(`- Target: ${targetPath}`);
  });
}

main().catch(error => {
  console.error('Failed to sync auth constants:', error);
  process.exit(1);
});
