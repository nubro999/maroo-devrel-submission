# 참가자 가이드

카페 A가 원두업체 B에 지급합니다. PCL은 Maroo 테스트넷, Privacy는 내 컴퓨터의 별도 Clairveil 환경에서 실행합니다. 두 경로를 하나의 체인에 기록된 통합 거래로 구현한 것은 아닙니다.

## 환경 준비

macOS/Linux의 Bash 또는 zsh, Node 22.14 이상/24, Git이 필요합니다. Windows에서는 WSL2를 사용합니다.

```bash
git clone https://github.com/nubro999/maroo-devrel-submission.git
cd maroo-devrel-submission
npm ci
npm run setup
npm run setup:account
```

`npm run setup:account`에서 실습 사이트의 테스트 개인키 또는 별도로 충전한 실습 계정을 설정합니다. 정상적인 기존 `.env`는 유지하고, 예시 개인키는 입력받은 값으로 교체합니다. 공개 실습 계정은 다른 사람도 사용할 수 있으므로 잔액과 독점 사용을 보장하지 않습니다. 이후 명령은 모두 저장소 폴더에서 실행합니다.

```bash
node --version
npm test
```

Node 22.14 이상/24와 오프라인 검증 PASS가 기준입니다. Privacy용 Docker는 수업 전에 `docker info`와 이미지 빌드를 완료합니다. PowerShell은 Bash 명령·경로 처리와 호환되지 않아 이 가이드에서 제외합니다.

## PCL

기본 연결·컴파일·상태 저장은 제공 코드에 있습니다. 파일은 완성된 예시이며 빈칸을 채우지 않습니다. 파일을 읽거나 수정한 뒤 아래 명령을 한 단계씩 실행합니다.

| 파일 | 동작 | 결과 |
|---|---|---|
| `workshop/files/Payment.sol` | 지급 권한·0보다 큰 금액·프록시를 통한 요청인지 확인 후 지급 | 지급 로직 예시 |
| `01-deploy.mjs` | 구현체·등록 프록시 배포 | proxy 주소 |
| `02-allow.mjs` | pay 함수의 빈 차단 목록 설정 | 차단 주소 없음 |
| `03-pay.mjs` | 카페 A → 원두업체 B에 0.001 tOKRW | status 1, 잔액·횟수 증가 |
| `04-deny.mjs` | 송신자 차단·재요청·정책 복원 | InDenylist, status 0, 잔액·횟수 불변 |

```bash
env -u MAROO_PRIVATE_KEY -u MAROO_RECIPIENT node --env-file=.env workshop/files/01-deploy.mjs
env -u MAROO_PRIVATE_KEY -u MAROO_RECIPIENT node --env-file=.env workshop/files/02-allow.mjs
env -u MAROO_PRIVATE_KEY -u MAROO_RECIPIENT node --env-file=.env workshop/files/03-pay.mjs
env -u MAROO_PRIVATE_KEY -u MAROO_RECIPIENT node --env-file=.env workshop/files/04-deny.mjs
```

상태: `.private/file-lab/state.json`. 거래 기록: `.private/terminal/transactions.jsonl`. 출력의 status 0은 차단 예시에서 기대하는 결과입니다. 예외로 종료되면 다음 파일로 진행하지 않습니다. `in-progress.json`이 남아 있으면 거래 처리 결과 확인 전 같은 거래를 다시 보내지 않습니다.

## Privacy

Alice=카페 A, Bob=원두업체 B. 예치 10 → 지급 7 → 비공개 잔액 3/7을 확인합니다. 단위는 로컬 uclair입니다. 예치는 공개이며 노드 초기화·증명 자료는 개발용입니다.

Docker Desktop(macOS) 또는 Docker Engine(Linux), 메모리 8GB 이상 권장. 아래 환경 준비와 노드 시작은 수업 전 완료합니다. macOS 실기기 전체 실행은 미검증입니다.

### 환경 준비 · 터미널 A

```bash
docker build -t maroo-privacy-lab -f demo/clairveil/container/Dockerfile demo/clairveil
mkdir -p .private/privacy-terminal
docker run --rm -it --init --name maroo-privacy-terminal \
  --mount type=volume,source=maroo-privacy-cache,target=/cache \
  --mount "type=bind,source=$PWD/.private/privacy-terminal,target=/results" \
  --entrypoint bash maroo-privacy-lab
```

### 노드 시작 · 컨테이너 A

```bash
/opt/lab/check-cpu
python3 /opt/lab/prepare-terminal.py --source /opt/clairveil --run-dir "/results/session-$(date +%s)"
source /results/ACTIVE.env
"$BIN" start --home "$NODE_HOME" --audit-config "$CONFIG" --audit-artifacts "$ARTIFACTS" \
  --rpc.laddr "$RPC" --p2p.laddr tcp://127.0.0.1:28656 \
  --grpc.address 127.0.0.1:28658 --minimum-gas-prices 0uclair
```

### CLI 접속 · 새 터미널 B

```bash
docker exec -it maroo-privacy-terminal bash
```

### 예치 · 컨테이너 B

```bash
source /results/ACTIVE.env
COMMON=(--home "$NODE_HOME" --keyring-backend test --chain-id "$CHAIN" --node "$RPC")
"$BIN" status --node "$RPC"
"$BIN" tx privacy deposit 10uclair --from alice "${COMMON[@]}" --gas 3500000 --gas-prices 0uclair --yes --output json > /results/deposit.json
cat /results/deposit.json
DEPOSIT_TX=$(sed -n '/^{/,$p' /results/deposit.json | python3 -c 'import json,sys;print(json.load(sys.stdin)["txhash"])')
"$BIN" query tx "$DEPOSIT_TX" --node "$RPC" --output json
```

### 비공개 지급 · 컨테이너 B

```bash
"$BIN" tx privacy list-notes --from alice "${COMMON[@]}" --json
"$BIN" tx privacy show-address --from bob "${COMMON[@]}" --output json > /results/bob-address.json
BOB=$(python3 -c 'import json;print(json.load(open("/results/bob-address.json"))["address"])')
"$BIN" tx privacy transfer "$BOB" 7uclair --from alice "${COMMON[@]}" --gas 9000000 --gas-prices 0uclair --yes --output json > /results/transfer.json
cat /results/transfer.json
TRANSFER_TX=$(sed -n '/^{/,$p' /results/transfer.json | python3 -c 'import json,sys;print(json.load(sys.stdin)["txhash"])')
"$BIN" query tx "$TRANSFER_TX" --node "$RPC" --output json
```

### 비공개 잔액 조회 · 컨테이너 B

```bash
"$BIN" tx privacy list-notes --from alice "${COMMON[@]}" --json > /results/alice-after.json
"$BIN" tx privacy list-notes --from bob "${COMMON[@]}" --json > /results/bob-after.json
"$BIN" tx privacy list-notes --from bob "${COMMON[@]}" --json > /results/bob-repeat.json
python3 - <<'CHECK'
import json
read = lambda name: json.load(open('/results/'+name))['summary']
a, b, again = read('alice-after.json'), read('bob-after.json'), read('bob-repeat.json')
assert a['total_spendable'] == '3'
assert b['total_spendable'] == '7'
assert b == again
print('PASS: Alice 3 / Bob 7 / repeat scan stable')
CHECK
```

예치·지급 거래의 블록에 기록된 실행 결과는 code 0입니다. 마지막 조회는 `PASS: Alice 3 / Bob 7 / repeat scan stable`을 출력합니다. 거래가 조회되지 않으면 query만 다시 실행합니다. 전송 명령은 반복하지 않습니다.

## 초기화·종료

PCL 마지막 단계는 빈 차단 목록을 복원합니다. 재실습은 이전 모든 거래의 거래 처리 결과과 복원 완료를 확인한 뒤 `.private/file-lab`을 다른 이름으로 옮겨 새 배포로 시작합니다. 기존 체인 컨트랙트는 삭제되지 않습니다. 중간 실패는 [오류 해결](TROUBLESHOOTING.md)을 따릅니다.

Privacy는 터미널 B에서 `exit`, A에서 `Ctrl+C` 후 `exit`로 종료합니다. 컨테이너는 삭제되지만 컴퓨터에 연결해 둔 기록과 Docker의 빌드 저장 공간은 유지됩니다. 재실습은 준비 명령의 새 session 디렉터리로 초기화합니다. `.private` 안의 키·비공개 잔액 기록·증명 입력 데이터·원본 로그는 공유하지 않습니다.
