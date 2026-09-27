# 오류 해결

| 증상 | 원인 후보 | 확인 | 해결 |
|---|---|---|---|
| invalid private key | 예시 .env 또는 잘못된 키 | setup:account 결과 | `npm run setup:account` 재실행. 정상 .env는 보존, 잘못된 키는 입력 단계에서 교체 |
| 셸에서 설정한 다른 계정 사용 | 환경 변수가 .env보다 우선 | 출력 지급자 주소 | 가이드의 `env -u MAROO_PRIVATE_KEY -u MAROO_RECIPIENT` 실행 명령 사용 |
| Insufficient balance | 수수료+지급액 부족 | 테스트넷 주소 잔액 | faucet 충전, 공유 계정은 별도 계정으로 교체하되 중간 상태와 혼용 금지 |
| 실행 순서가 다름 | 완료 파일 재실행 또는 단계 건너뜀 | state.json의 next | next=0은 01, next=1은 02. 다음 파일 실행 |
| 이전 실행이 완료되지 않음 | 거래 처리 결과 대기 중단·RPC 실패 | in-progress.json, transactions.jsonl, Explorer | 자동 재시도 중지. 전송한 거래의 식별 번호의 거래 처리 결과부터 확인. 배포 중간 실패는 해당 주소/거래 처리 결과 기록 후 진행자와 새 실행으로 복구 |
| InDenylist / status 0 | 현재 송신자 차단 | 정책과 잔액/횟수 | 04에서는 기대 결과. 마지막 복원 거래도 status 1인지 확인 |
| Explorer decoded가 깨진 문자 | 컨트랙트가 정의한 오류를 ABI로 표시하지 못함 | 오류 식별 번호와 함께 담긴 값 | 제공 decode 사용. 원래 오류 데이터는 보존 |
| docker-credential-desktop.exe not found | WSL PATH와 Docker credential helper 불일치 | Docker 설정의 credsStore와 helper 경로 | Docker Desktop WSL 연동/PATH 복구. 공개 이미지 확인은 인증정보 없는 작업 전용 DOCKER_CONFIG로 수행 가능 |
| Docker 권한/daemon 오류 | Docker 미실행·권한 | docker info | Docker 실행, Linux 사용자 권한 확인 후 재로그인 |
| CPU profile·OOM 오류 | CPU 기능 또는 메모리 부족 | /opt/lab/check-cpu, 컨테이너 종료 상태 | 지원 호스트와 메모리 확보. 다른 아키텍처 강제 에뮬레이션으로 우회하지 않음 |
| JSON parse 오류 | 진단 메시지가 JSON 결과 앞에 섞임 | 저장한 명령 출력 | 가이드의 sed 추출 사용. txhash가 이미 있으면 재전송하지 않고 query만 실행 |
| transaction not found | 거래가 아직 블록에 기록되지 않았거나 조회에 반영되지 않음 | RPC·노드 로그 | 잠시 후 query만 재실행 |
| compile 오류 | Solidity 예시 수정 오류 | 컴파일 메시지 | Payment.sol 문법 확인. 제출 전 실패라도 중복 실행 방지 파일이 남으므로 기록을 확인한 후 진행자와 복구 |

## 어느 단계에서 실패했는지 확인

- `status 0 + InDenylist`: 체인에 포함된 정책 거절입니다.
- 입력 형식 오류: 거래 전 로컬/RPC 검증 실패일 수 있습니다.
- 증명 자료·입력 준비 방법 미확보: 보낼 거래를 준비하지 못한 상태입니다. 체인이 증명을 받아 본 뒤 거절했다는 뜻은 아닙니다.
- RPC/노드 접속 오류: 접속 환경의 문제이며 정책 판정으로 해석하지 않습니다.

## 대체 진행

Maroo 장애에는 evidence/live-testnet의 기존 거래 처리 결과·해시를 사용합니다. Privacy 빌드/노드 장애에는 evidence/local/MANUAL_CLI_RESULT.json을 사용합니다. 새 실행 성공으로 표시하지 않습니다.

중간에 멈춘 실행의 중복 실행 방지 파일을 근거 없이 삭제하거나 이미 제출한 지급을 재전송하지 않습니다. 같은 계정으로 동시에 실행하는 것도 피합니다. 자동 복구는 구현 범위가 아닙니다.
