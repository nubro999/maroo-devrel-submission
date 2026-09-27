#!/usr/bin/env python3
"""Pinned, development-only local chain rehearsal. Never connects to Maroo."""
import argparse
import datetime
import json
import os
from pathlib import Path
import re
import subprocess
import time
import urllib.request

PIN = 'af04cfc994a3da87a8b1b902eda0988feb512539'
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source', required=True, type=Path)
parser.add_argument('--run-dir', required=True, type=Path, help='New private directory; must not exist')
parser.add_argument('--artifacts', type=Path, help='Reuse a verified development bundle; otherwise generate it')
parser.add_argument('--go', default='go')
parser.add_argument('--port', type=int, default=28657)
args = parser.parse_args()
source = args.source.resolve()
run = args.run_dir.resolve()
if subprocess.check_output(['git', '-C', str(source), 'rev-parse', 'HEAD'], text=True).strip() != PIN:
    raise SystemExit('Wrong upstream commit')
if subprocess.check_output(['git', '-C', str(source), 'status', '--porcelain'], text=True).strip():
    raise SystemExit('Upstream checkout must be clean')
os.umask(0o077)
run.mkdir(mode=0o700, parents=False, exist_ok=False)
env = os.environ.copy()
env.setdefault('GOPATH', str(run / 'go'))
env.setdefault('GOCACHE', str(run / 'cache'))
env.setdefault('GOMAXPROCS', '4')
artifacts = args.artifacts.resolve() if args.artifacts else run / 'artifacts'
binary = run / 'clairveild'
nodehome = run / 'node'
rpc = f'http://127.0.0.1:{args.port}'
node = f'tcp://127.0.0.1:{args.port}'
chain = 'devrel-local-1'

def execute(label, command, cwd=source, timeout=900):
    with (run / f'{label}.stdout').open('w') as stdout, (run / f'{label}.stderr').open('w') as stderr:
        completed = subprocess.run([str(x) for x in command], cwd=cwd, env=env, stdout=stdout, stderr=stderr, timeout=timeout)
    if completed.returncode:
        raise RuntimeError(f'{label} failed ({completed.returncode}); inspect private logs in {run}')
    return (run / f'{label}.stdout').read_text()

def object_with(text, key):
    decoder = json.JSONDecoder()
    found = []
    for i, char in enumerate(text):
        if char == '{':
            try:
                obj, _ = decoder.raw_decode(text[i:])
                if isinstance(obj, dict) and key in obj:
                    found.append(obj)
            except ValueError:
                pass
    if not found:
        raise RuntimeError(f'No JSON object containing {key}')
    return found[-1]

def query(path):
    with urllib.request.urlopen(rpc + path, timeout=5) as response:
        data = json.load(response)
    if 'error' in data:
        raise RuntimeError('Local RPC: ' + str(data['error']))
    return data['result']

def receipt(txhash):
    for _ in range(40):
        try:
            result = query('/tx?hash=0x' + txhash)
        except Exception:
            time.sleep(1)
            continue
        tx = result['tx_result']
        if tx['code'] != 0:
            raise RuntimeError(f'Included transaction failed: {txhash}; code={tx["code"]}')
        return {'hash': txhash, 'height': result['height'], 'code': tx['code'], 'gasUsed': tx['gas_used'], 'eventTypes': sorted(set(e['type'] for e in tx.get('events', [])))}
    raise RuntimeError('Transaction inclusion timeout: ' + txhash)

print('Building pinned Linux node.', flush=True)
execute('build-node', [args.go, 'build', '-p', '2', '-o', binary, './cmd/clairveild'])
if not args.artifacts:
    print('Generating development artifacts; this is pre-work, not workshop time.', flush=True)
    execute('setup', [args.go, 'run', '-p', '2', './cmd/clairveil-setup', '-development', '-out', artifacts], timeout=5400)
execute('config', [args.go, 'run', '-p', '2', Path(__file__).resolve().with_name('configgen.go'), artifacts, run / 'config'])
config = run / 'config/audit-config.json'
execute('init', [binary, 'init', 'devrel-node', '--home', nodehome, '--chain-id', chain, '--audit-config', config])
for account in ['validator', 'alice', 'bob']:
    execute('key-' + account, [binary, 'keys', 'add', account, '--home', nodehome, '--keyring-backend', 'test', '--output', 'json'])
    address = execute('address-' + account, [binary, 'keys', 'show', account, '-a', '--home', nodehome, '--keyring-backend', 'test']).strip()
    execute('fund-' + account, [binary, 'add-genesis-account', address, '100000000000000000000000000uclair', '--home', nodehome])
execute('gentx', [binary, 'gentx', 'validator', '1000000000000uclair', '--home', nodehome, '--keyring-backend', 'test', '--chain-id', chain])
execute('collect', [binary, 'collect-gentxs', '--home', nodehome])
execute('validate', [binary, 'validate', '--home', nodehome])
env['CLAIRVEIL_PRIVACY_ZK_ARTIFACT_DIR'] = str(artifacts)
with (run / 'node.log').open('w') as node_log:
    process = subprocess.Popen([str(binary), 'start', '--home', str(nodehome), '--audit-config', str(config), '--audit-artifacts', str(artifacts), '--rpc.laddr', node, '--p2p.laddr', f'tcp://127.0.0.1:{args.port-1}', '--grpc.address', f'127.0.0.1:{args.port+1}', '--minimum-gas-prices', '0uclair'], env=env, stdout=node_log, stderr=subprocess.STDOUT)
    try:
        for _ in range(90):
            if process.poll() is not None:
                raise RuntimeError('Node exited; inspect private node.log')
            try:
                status = query('/status')
                if status['node_info']['network'] == chain and int(status['sync_info']['latest_block_height']) > 0:
                    break
            except Exception:
                pass
            time.sleep(1)
        else:
            raise RuntimeError('Node readiness timeout')
        common = ['--home', nodehome, '--keyring-backend', 'test', '--chain-id', chain, '--node', node]
        def scan(who, phase):
            output = execute(f'scan-{who}-{phase}', [binary, 'tx', 'privacy', 'list-notes', '--from', who, *common, '--json'])
            return object_with(output, 'summary')['summary']
        bob_before = scan('bob', 'before')
        print('Depositing 10uclair.', flush=True)
        dep = execute('deposit', [binary, 'tx', 'privacy', 'deposit', '10uclair', '--from', 'alice', *common, '--gas', '3500000', '--gas-prices', '0uclair', '--yes', '--output', 'json'])
        dep_receipt = receipt(object_with(dep, 'txhash')['txhash'])
        alice_before = scan('alice', 'before')
        bob_address = object_with(execute('bob-shielded', [binary, 'tx', 'privacy', 'show-address', '--from', 'bob', *common, '--output', 'json']), 'address')['address']
        print('Transferring 7uclair; automatic dummy preparation may take a few minutes.', flush=True)
        transfer = execute('transfer', [binary, 'tx', 'privacy', 'transfer', bob_address, '7uclair', '--from', 'alice', *common, '--gas', '9000000', '--gas-prices', '0uclair', '--yes', '--output', 'json'])
        transfer_receipt = receipt(object_with(transfer, 'txhash')['txhash'])
        preparations = []
        for line in (run / 'transfer.stderr').read_text().splitlines():
            if 'tx:' in line and 'final transfer accepted' not in line:
                for txhash in re.findall(r'\b[A-Fa-f0-9]{64}\b', line):
                    preparations.append(receipt(txhash))
        alice_after, bob_after = scan('alice', 'after'), scan('bob', 'after')
        bob_repeat = scan('bob', 'repeat')
        assert alice_before['total_spendable'] == '10'
        assert bob_before['total_spendable'] == '0'
        assert alice_after['total_spendable'] == '3'
        assert bob_after['total_spendable'] == '7'
        assert bob_repeat == bob_after, 'Repeat scan changed wallet totals'
        evidence = {'label':'Local', 'result':'PASS', 'timestamp':datetime.datetime.now(datetime.timezone.utc).isoformat(), 'commit':PIN, 'chainId':chain, 'artifactKind':'development only', 'marooCompatibilityVerified':False, 'deposit':dep_receipt, 'preparation':preparations, 'transfer':transfer_receipt, 'walletSummaries':{'aliceBefore':alice_before,'aliceAfter':alice_after,'bobBefore':bob_before,'bobAfter':bob_after}, 'repeatScanStable':True}
        (run / 'PUBLIC_RESULT.json').write_text(json.dumps(evidence, indent=2)+'\n')
        print('PASS: Alice 10 -> 3; Bob 0 -> 7; included transactions code 0; repeated scan stable.', flush=True)
        print('Share only PUBLIC_RESULT.json. Other files contain private local test material.', flush=True)
    finally:
        process.terminate()
        try:
            process.wait(timeout=20)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait()
