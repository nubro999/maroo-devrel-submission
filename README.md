# Maroo 기업 지급 워크숍

**Primary Track: B — Enable** · 한국어 · 70분 워크숍

카페 A가 원두업체 B에 대금을 지급하는 상황을 가정합니다. 은행·핀테크의 시니어 백엔드/블록체인 엔지니어가 PCL의 지급 허용·차단을 Maroo 테스트넷에서 실행하고, 내 컴퓨터의 별도 Clairveil 환경에서 비공개 지급을 실행합니다. EVM·Solidity·JSON-RPC에는 익숙하지만 Maroo와 ZK는 처음인 참가자를 대상으로 합니다.

| 시작 지점 | 자료 |
|---|---|
| 발표 자료 | [Google Slides · 12장](https://docs.google.com/presentation/d/12lcnMRimrosbLEd8PpE40ZvFPl7kivfFuo4TcTB2CXc/edit) |
| 실습 | [참가자 가이드](workshop/PARTICIPANT_GUIDE.md) · [복사용 실습 사이트](https://maroo-workshop-cheatsheet.vercel.app/?v=core-code-1) |
| 진행 | [70분 진행안·대본](workshop/FACILITATOR_GUIDE.md) |
| 실행 확인 | [검증 결과](docs/VALIDATION.md) · [오류 해결](workshop/TROUBLESHOOTING.md) |
| 구현 범위·AI 활용·개선 제안 | [제출 노트](SUBMISSION_NOTES.md) · [구조와 확인한 범위](docs/ARCHITECTURE.md) |
| 영상 | [video-link.md](video-link.md) — **아직 촬영하지 않았으며 추후 추가 예정** |

## 먼저 알아둘 이름

- **PCL**: 지급 전에 정해 둔 조건을 검사하는 기능입니다. 이번에는 차단 목록을 사용합니다.
- **EAS**: 누가 누구에게 어떤 자격을 발급했는지 기록합니다. 이번 실습에서는 개념만 소개합니다.
- **Privacy**: 거래 정보 노출을 줄이는 기능입니다. 내 컴퓨터의 별도 체인에서 실습합니다.
- **프록시**: 지급 요청을 받아 정책 검사와 지급 코드를 연결하는 컨트랙트입니다.
- **note**: Privacy에서 금액과 소유 정보를 담는 비공개 기록입니다. 이를 조회해 잔액을 확인합니다.

## 실행

macOS/Linux의 Bash 또는 zsh, Node 22.14 이상/24, Git이 필요합니다. Windows는 WSL2를 사용합니다. Privacy에만 Docker가 필요하며 빌드·개발용 증명 자료 생성은 수업 전에 완료합니다.

```bash
git clone https://github.com/nubro999/maroo-devrel-submission.git
cd maroo-devrel-submission
npm ci
npm run setup
npm run setup:account
```

계정 입력에는 테스트 토큰이 있는 전용 키를 사용합니다. 기존 정상 .env는 보존하며 예시 키는 입력 단계에서 교체합니다. 공개 실습 사이트의 계정은 누구나 사용할 수 있는 소모성 테스트 계정이므로 잔액·독점 사용을 보장하지 않습니다. 저장소에는 개인키를 포함하지 않습니다.

완성된 예시 파일은 `workshop/files/`에 있습니다. 저장소 루트에서 아래 명령을 **한 단계씩** 실행합니다. 실제 테스트넷 거래가 전송됩니다.

```bash
env -u MAROO_PRIVATE_KEY -u MAROO_RECIPIENT node --env-file=.env workshop/files/01-deploy.mjs
env -u MAROO_PRIVATE_KEY -u MAROO_RECIPIENT node --env-file=.env workshop/files/02-allow.mjs
env -u MAROO_PRIVATE_KEY -u MAROO_RECIPIENT node --env-file=.env workshop/files/03-pay.mjs
env -u MAROO_PRIVATE_KEY -u MAROO_RECIPIENT node --env-file=.env workshop/files/04-deny.mjs
```

정상 지급은 status 1, 수취인 +0.001 tOKRW입니다. 차단된 지급은 status 0, 수취인 잔액과 지급 횟수가 유지됩니다. 실패 거래에도 수수료는 발생합니다. 상태는 `.private/file-lab/state.json`, 전송한 거래의 식별 번호는 `.private/terminal/transactions.jsonl`에 저장됩니다.

Privacy 실행 명령은 [참가자 가이드](workshop/PARTICIPANT_GUIDE.md#privacy)에 있습니다. Clairveil 고정 SHA: `af04cfc994a3da87a8b1b902eda0988feb512539`.

## 직접 확인한 결과

| 분류 | 결과 | 근거 |
|---|---|---|
| 실제 테스트넷 실행 | 프록시 배포, 정상 지급, Denylist 거절·복원 | [실행 해시](evidence/live-testnet/FILE_LAB_REHEARSAL.json), [거래 처리 결과 재조회](evidence/live-testnet/SUBMISSION_RECEIPTS.json) |
| Local | 예치 10 → 지급 7 → Alice 3 / Bob 7, 반복 조회 일치 | [CLI 결과](evidence/local/MANUAL_CLI_RESULT.json) |
| 테스트넷 실행 미검증 | Maroo 테스트넷에서 비공개 지급을 실행하기 위한 증명 자료와 입력 준비 방법을 확보하지 못함 | [경계](docs/ARCHITECTURE.md) |

[정상 지급 거래](https://explorer-testnet.maroo.io/tx/0x00b3322342c0fcf113d5833e6100d1efa505988733cfbd7594665911460a787a) · [차단 거래](https://explorer-testnet.maroo.io/tx/0x022a0b263b022ee75b76bc6ece42f84143d5c102f5c5f506dae96b445b674f43)

## 제출 상태

코드·가이드·슬라이드·공개 증거를 포함했습니다. **영상은 미완료**입니다. 70분은 설계 시간이며 전체 참가자 리허설 시간은 측정하지 않았습니다. macOS 실기기 실행, Maroo Privacy 정상 거래, 감사자의 거래 정보 열람와 운영용 키 관리·보안 감사는 검증하지 않았습니다. 로컬 Privacy 결과를 Maroo Privacy 성공으로 표현하지 않습니다.
