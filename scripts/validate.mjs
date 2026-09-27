import assert from 'node:assert/strict';
import {readFileSync,readdirSync,mkdtempSync,writeFileSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import solc from 'solc';
import {Wallet} from 'ethers';
const root=process.cwd();
function check(cmd,args,opts={}) { const r=spawnSync(cmd,args,{encoding:'utf8',...opts});assert.equal(r.status,0,r.stderr||r.stdout);return r; }
for(const dir of ['scripts','workshop/files','workshop/terminal'])for(const f of readdirSync(dir).filter(f=>f.endsWith('.mjs')))check(process.execPath,['--check',`${dir}/${f}`]);
const output=JSON.parse(solc.compile(JSON.stringify({language:'Solidity',sources:{'Payment.sol':{content:readFileSync('workshop/files/Payment.sol','utf8')}},settings:{evmVersion:'paris',optimizer:{enabled:true,runs:200},outputSelection:{'*':{'*':['abi','evm.bytecode.object']}}}})));
assert(!(output.errors||[]).some(e=>e.severity==='error'));
assert(output.contracts['Payment.sol'].WorkshopPayment.abi.some(x=>x.name==='pay'));
const temp=mkdtempSync(join(tmpdir(),'maroo-submission-'));
try {
 writeFileSync(join(temp,'.env.example'),'MAROO_PRIVATE_KEY=YOUR_PRIVATE_KEY\nMAROO_RECIPIENT=YOUR_RECIPIENT\n');
 check(process.execPath,[resolve('scripts/setup.mjs')],{cwd:temp});assert(existsSync(join(temp,'.env')));
 const rejected=spawnSync(process.execPath,[resolve('scripts/setup-account.mjs')],{cwd:temp,encoding:'utf8'});assert.equal(rejected.status,1);assert(rejected.stderr.includes('터미널'));
 const payer=Wallet.createRandom(),recipient=Wallet.createRandom();
 const env=`MAROO_PRIVATE_KEY=${payer.privateKey}\nMAROO_RECIPIENT=${recipient.address}\n`;writeFileSync(join(temp,'.env'),env);
 const success=check(process.execPath,[resolve('scripts/setup-account.mjs')],{cwd:temp});assert(!success.stdout.includes(payer.privateKey));assert.equal(readFileSync(join(temp,'.env'),'utf8'),env);
 // A fresh process must reject skipped steps before any network transaction.
 const guarded=spawnSync(process.execPath,['--env-file=.env',resolve('workshop/files/03-pay.mjs')],{cwd:temp,encoding:'utf8'});
 assert.notEqual(guarded.status,0);assert(guarded.stderr.includes('실행 순서'));assert(!existsSync(join(temp,'.private/terminal/transactions.jsonl')));
} finally {rmSync(temp,{recursive:true,force:true});}
console.log('PASS: syntax, Solidity compile, setup placeholder handling, valid env preservation, skipped-step transaction guard');
