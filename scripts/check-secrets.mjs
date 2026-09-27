#!/usr/bin/env node
// Best-effort guard only: no scanner can guarantee that all secrets are detected.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const git = (...args) => execFileSync('git', args, { maxBuffer: 128 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
const findings = new Set();
function report(path, rule) { findings.add(`${JSON.stringify(path)}: ${rule}`); }
function inspect(path, data) {
  const parts = path.replaceAll('\\', '/').split('/');
  const name = parts.at(-1).toLowerCase();
  if (parts.some(p => ['private', '.private', '.external'].includes(p.toLowerCase())) ||
      (name.startsWith('.env') && name !== '.env.example') ||
      /(?:^|[._-])(?:keystore|seed|mnemonic)(?:[._-]|$)/i.test(name) ||
      /\.(?:pem|key|p12|pfx|jks)$/i.test(name)) report(path, 'forbidden secret-bearing path');
  const content = data.toString('utf8');
  if (/-----BEGIN (?:RSA |EC |OPENSSH |ENCRYPTED )?PRIVATE KEY-----/.test(content)) report(path, 'private key block');
  if (/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,}|AKIA[A-Z0-9]{16}|xox[baprs]-[A-Za-z0-9-]{20,}|sk-(?:proj-)?[A-Za-z0-9_-]{30,})\b/.test(content)) report(path, 'recognized access token');
  for (const line of content.split(/\r?\n/)) {
    // Match literal assignments only. Environment accesses and scanner source are not values.
    const match = line.match(/^\s*(?:export\s+|(?:const|let|var)\s+)?["']?([\w.-]*(?:private[_-]?key|mnemonic|seed(?:[_-]?phrase)?|api[_-]?key|access[_-]?token|auth[_-]?token|bearer[_-]?token)[\w.-]*)["']?\s*[:=]\s*(.+?)\s*[,;]?\s*$/i);
    if (match) {
      let value = match[2].trim();
      const quoted = value.match(/^(["'`])([\s\S]*?)\1\s*[,;]?(?:\s*#.*)?$/);
      if (quoted) value = quoted[2];
      else if (/^(?:process\.|import\.|env\b|undefined\b|null\b|(?:true|false)\b|\w+\(|\w+\.|\{)/.test(value)) continue;
      value = value.replace(/\s+#.*$/, '').trim();
      if (!value || /^(?:<[^>]+>|\$\{[^}]+\}|YOUR_[A-Z_]+|REPLACE_ME|CHANGEME|TODO)$/i.test(value)) continue;
      if (/private[_-]?key/i.test(match[1]) && /^(?:0x)?[a-f0-9]{64}$/i.test(value)) report(path, 'literal private key');
      else if (/mnemonic|seed/i.test(match[1]) && value.split(/\s+/).length >= 12) report(path, 'literal seed phrase');
      else if (/api[_-]?key|(?:access|auth|bearer)[_-]?token/i.test(match[1]) && /^[A-Za-z0-9_./+=-]{16,}$/.test(value)) report(path, 'literal credential');
    }
    if (/\bAuthorization\s*[:=]\s*["']?Bearer\s+[A-Za-z0-9._~+/-]{20,}/i.test(line)) report(path, 'literal bearer credential');
  }
}

try {
  const args = process.argv.slice(2);
  if (args.some(a => !['--staged', '--history'].includes(a)) || args.length > 1) throw new Error('usage');
  if (args.includes('--staged')) {
    for (const entry of git('ls-files', '--stage', '-z').toString().split('\0').filter(Boolean)) {
      const match = entry.match(/^\d+ ([a-f0-9]+) (\d)\t([\s\S]+)$/);
      if (match && match[2] === '0') inspect(match[3], git('cat-file', 'blob', match[1]));
    }
  } else {
    for (const path of git('ls-files', '--cached', '--others', '--exclude-standard', '-z').toString().split('\0').filter(Boolean)) {
      try { inspect(path, readFileSync(path)); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
    if (args.includes('--history')) {
      const scanned = new Set();
      const blobs = new Map();
      for (const commit of git('rev-list', '--all').toString().trim().split('\n').filter(Boolean)) {
        for (const entry of git('ls-tree', '-r', '-z', commit).toString().split('\0').filter(Boolean)) {
          const match = entry.match(/^\d+ blob ([a-f0-9]+)\t([\s\S]+)$/);
          if (!match) continue;
          const id = `${match[1]}:${match[2]}`;
          if (scanned.has(id)) continue;
          scanned.add(id);
          if (!blobs.has(match[1])) blobs.set(match[1], git('cat-file', 'blob', match[1]));
          inspect(match[2], blobs.get(match[1]));
        }
      }
    }
  }
  if (findings.size) {
    console.error('Secret guard blocked publication:');
    for (const finding of findings) console.error(finding);
    process.exitCode = 1;
  } else console.log('Secret guard passed (best effort; manual review is still required).');
} catch {
  console.error('Secret guard could not complete. Run in the repository root; use --staged or --history individually.');
  process.exitCode = 2;
}
