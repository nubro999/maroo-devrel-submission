import { copyFileSync, constants, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
if (!existsSync('.env')) copyFileSync('.env.example', '.env', constants.COPYFILE_EXCL);
try {
  execFileSync('git', ['rev-parse', '--git-dir'], { stdio: 'pipe' });
  execFileSync('git', ['config', '--local', 'core.hooksPath', '.githooks']);
  console.log('Local secret-check hooks enabled. Existing .env preserved.');
} catch { console.log('Run git init, then npm run setup to enable local hooks.'); }
