# 제출본 검증

| 항목 | 결과·범위 |
|---|---|
| 의존성 | npm ci 및 npm audit. 기록은 [DEPENDENCY_AUDIT](../evidence/DEPENDENCY_AUDIT.json) |
| 오프라인 | npm test: JavaScript 문법, Solidity 컴파일, .env 예시/정상 설정 처리, 단계 순서 차단 |
| 기존 체인에 기록된 기록 | npm run verify:evidence: 체인 450815, PCL 7개 거래 거래 처리 결과 재조회. 새 거래 없음 |
| 원래 테스트넷 실행 | [FILE_LAB_REHEARSAL](../evidence/live-testnet/FILE_LAB_REHEARSAL.json). EAS 추가 조사 거래도 들어 있는 원래 기록 |
| 사용자 실행 | [USER_PCL_RUN](../evidence/live-testnet/USER_PCL_RUN.json). 이전 PowerShell 실행 기록이며 현재 참가자 가이드는 macOS/Linux |
| 로컬 Privacy | [MANUAL_CLI_RESULT](../evidence/local/MANUAL_CLI_RESULT.json): deposit/transfer code 0, 비공개 잔액 3/7, 반복 조회 결과 일치 |
| 환경 분리 | 로컬 Privacy 해시는 Maroo Explorer에서 조회되지 않음 |
| 미검증 | macOS 실기기, 전체 70분 리허설, Maroo 테스트넷의 정상 비공개 지급, 감사자의 거래 정보 열람, 영상 |

원래 파일 예시의 PCL 01–04를 실제 테스트넷에서 실행했습니다. 제출 정리본은 같은 Solidity/정책 호출을 사용하며, 의존성 하위 패키지 변경 후 컴파일 결과를 비교합니다. 정리 과정에서 불필요한 재송금은 하지 않습니다.

## 깨끗한 시작

새 폴더에 제출 저장소를 clone한 뒤 npm ci → npm run setup → npm run setup:account 순서로 실행합니다. .private 상태가 없는 환경에서 01부터 시작합니다. Privacy는 Docker의 새 session 디렉터리로 초기화하며 버전을 고정한 소스와 개발용 증명 생성 파일을 사용합니다.

## 결과 해석

정상 지급: status 1, 수취인 +0.001 tOKRW, 지급 횟수 +1. 차단 지급: InDenylist, status 0, 잔액·횟수 변화 없음. 실패 거래의 가스비는 발생합니다. Gwei는 가스 가격의 크기를 표시하는 단위이며 토큰 이름이 아닙니다. 총 수수료는 gasUsed × effectiveGasPrice로 계산합니다.

로컬 Privacy: 블록에 기록된 실행 결과 code 0과 비공개 잔액을 함께 봅니다. txhash가 출력됐다는 사실만으로 완료를 판단하지 않습니다.

## 출판 점검

신규 Git 기록에서 시작하며 .env·개인키·node_modules·원본 privacy state·이전 ZIP/PDF·작업 폴더를 제외합니다. 자동 비밀정보 검사와 실제 참가자 키에 대한 정확 일치 검사를 별도로 수행합니다. 슬라이드는 Google Slides 링크만 제공합니다.
