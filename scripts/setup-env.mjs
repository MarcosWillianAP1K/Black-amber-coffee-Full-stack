import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const envPairs = [
  { example: 'Database/.env.example', target: 'Database/.env' },
  { example: 'Backend/.env.example', target: 'Backend/.env' },
  { example: 'Frontend/.env.example', target: 'Frontend/.env' },
];

for (const { example, target } of envPairs) {
  const examplePath = path.join(rootDir, example);
  const targetPath = path.join(rootDir, target);

  if (!fs.existsSync(targetPath) && fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, targetPath);
    console.log(`[setup:env] Criado ${target} a partir de ${example}`);
  } else if (fs.existsSync(targetPath)) {
    console.log(`[setup:env] ${target} já existe (mantido).`);
  }
}
