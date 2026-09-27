// Configure a local testnet account; never submits transactions or prints keys.
import { existsSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, constants } from 'node:fs';
import { parseEnv } from 'node:util';
import { randomUUID } from 'node:crypto';
import { createInterface } from 'node:readline';
import { Writable } from 'node:stream';
import { Wallet, isAddress } from 'ethers';

async function askKey() {
  if (!process.stdin.isTTY) throw Error('터미널에서 npm run setup:account를 직접 실행하세요.');
  const silent = new Writable({ write(chunk, encoding, callback) { callback(); } });
  const rl = createInterface({ input: process.stdin, output: silent, terminal: true });
  process.stdout.write('사이트에서 복사한 테스트 개인키 입력 (입력은 보이지 않음): ');
  const key = await new Promise(resolve => {
    rl.question('', resolve);
    rl.on('SIGINT', () => { rl.close(); process.stdout.write('\n취소했습니다.\n'); process.exit(130); });
  });
  rl.close(); process.stdout.write('\n');
  try { return new Wallet(key.trim()); } catch { throw Error('개인키 형식이 올바르지 않습니다. 다시 실행하세요.'); }
}
try {
  const previous = existsSync('.env') ? readFileSync('.env', 'utf8') : '';
  const env = parseEnv(previous);
  let payer;
  try { payer = new Wallet(env.MAROO_PRIVATE_KEY); } catch { /* Missing or example key: ask below. */ }
  const validRecipient = payer && isAddress(env.MAROO_RECIPIENT) && env.MAROO_RECIPIENT.toLowerCase() !== payer.address.toLowerCase();
  if (payer && validRecipient) {
    console.log('기존 .env 사용 · 지급자:', payer.address, '\n수취인:', env.MAROO_RECIPIENT, '\nA1부터 진행하세요.');
  } else {
    if (!payer) { console.log('개인키가 없거나 예시 값입니다. 지금 설정합니다.'); payer = await askKey(); }
    mkdirSync('.private', { recursive: true, mode: 0o700 });
    let recipient = env.MAROO_RECIPIENT;
    if (!isAddress(recipient) || recipient.toLowerCase() === payer.address.toLowerCase()) {
      const receiver = Wallet.createRandom(); recipient = receiver.address;
      writeFileSync(`.private/terminal-recipient-${randomUUID()}.json`, JSON.stringify({address:recipient,privateKey:receiver.privateKey}), {mode:0o600,flag:'wx'});
    }
    const values = {MAROO_RPC_URL:'https://rpc-testnet.maroo.io',MAROO_CHAIN_ID:'450815',MAROO_ADDRESS:payer.address,MAROO_RECIPIENT:recipient,MAROO_AMOUNT_OKRW:'0.001',MAROO_PRIVATE_KEY:payer.privateKey};
    const remaining = previous.split(/\r?\n/).filter(line => !/^\s*(?:export\s+)?(MAROO_RPC_URL|MAROO_CHAIN_ID|MAROO_ADDRESS|MAROO_RECIPIENT|MAROO_AMOUNT_OKRW|MAROO_PRIVATE_KEY)\s*=/.test(line));
    if (previous) copyFileSync('.env', `.private/env-backup-${randomUUID()}`, constants.COPYFILE_EXCL);
    writeFileSync('.env',remaining.join('\n').trimEnd()+'\n'+Object.entries(values).map(([k,v])=>`${k}=${v}`).join('\n')+'\n',{mode:0o600});
    console.log('설정 완료 · 지급자:',payer.address,'\n수취인:',recipient,'\nA1부터 진행하세요.');
  }
} catch (error) {
  console.error(/^(터미널|개인키)/.test(error.message) ? error.message : '설정 저장에 실패했습니다. .env와 .private 파일 권한을 확인하세요.');
  process.exitCode=1;
}
