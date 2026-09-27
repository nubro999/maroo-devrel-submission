# 제출본 검증

| 항목 | 결과·범위 |
|---|---|
| 의존성 | npm ci 및 npm audit. 기록은 [DEPENDENCY_AUDIT](../evidence/DEPENDENCY_AUDIT.json) |
| 오프라인 | npm test: JavaScript 문법, Solidity 컴파일, .env 예시/정상 설정 처리, 단계 순서 차단 |
| 기존 테스트넷 거래 | npm run verify:evidence: 체인 450815, PCL 거래 7개의 처리 결과 재조회. 새 거래 없음 |
| 최근 참가자 실행 | [FINAL_USER_PCL_RUN](../evidence/live-testnet/FINAL_USER_PCL_RUN.json): 사용자 제공 거래 7건의 상태·블록 시각 재조회. 잔액 변화는 사용자 로그 기준 |
| 원래 테스트넷 실행 | [FILE_LAB_REHEARSAL](../evidence/live-testnet/FILE_LAB_REHEARSAL.json). EAS 추가 조사 거래도 들어 있는 원래 기록 |
| 사용자 실행 | [USER_PCL_RUN](../evidence/live-testnet/USER_PCL_RUN.json). 이전 PowerShell 실행 기록이며 현재 참가자 가이드는 macOS/Linux |
| 로컬 Privacy | [MANUAL_CLI_RESULT](../evidence/local/MANUAL_CLI_RESULT.json): deposit/transfer code 0, 비공개 잔액 3/7, 반복 조회 결과 일치 |
| 환경 분리 | 로컬 Privacy 해시는 Maroo Explorer에서 조회되지 않음 |
| 미검증 | macOS 실기기, 전체 70분 리허설, Maroo 테스트넷의 정상 비공개 지급, 감사자의 거래 정보 열람, 영상 |

원래 파일 예시의 PCL 01–04를 실제 테스트넷에서 실행했습니다. 제출 정리본은 같은 Solidity/정책 호출을 사용하며, 하위 패키지 변경 후에도 컴파일 결과가 같은지 확인했습니다. 제출 정리 과정에서는 거래를 다시 보내지 않았습니다.

## 깨끗한 시작

새 폴더에 제출 저장소를 clone한 뒤 npm ci → npm run setup → npm run setup:account 순서로 실행합니다. .private 상태가 없는 환경에서 01부터 시작합니다. Privacy는 Docker의 새 session 디렉터리로 초기화하며 버전을 고정한 소스와 개발용 증명 생성 파일을 사용합니다.

## 현재 실습 파일 검사

핵심 코드가 주석 처리된 실습 파일과, 주석을 해제한 완성 예시를 구분해 검사합니다. npm test는 예시를 활성화한 Solidity 컴파일, JavaScript 문법, 설정 처리와 실행 전 보호 동작을 검사합니다. 주석이 남은 상태로 배포를 실행하면 거래나 단계 저장 없이 중단됩니다.

## 결과 해석

로컬 Privacy: 블록에 기록된 실행 결과 code 0과 비공개 잔액을 함께 봅니다. txhash가 출력됐다는 사실만으로 완료를 판단하지 않습니다.

## 공개 저장소 점검

신규 Git 기록에서 시작하며 .env·개인키·node_modules·원본 privacy state·이전 ZIP/PDF·작업 폴더를 제외합니다. 자동 비밀정보 검사와 실제 참가자 키에 대한 정확 일치 검사를 별도로 수행합니다. 슬라이드는 Google Slides 링크만 제공합니다.

## 최종 제출 점검 · 2026-09-28

예시 코드의 주석을 해제한 JavaScript 문법과 Solidity 컴파일, 계정 설정 처리, 순서 오류와 주석 미교체 시 거래 전 차단을 확인했습니다. npm audit에서 보고된 취약점은 0건이었고 비밀정보 검사도 통과했습니다. 문서의 상대 링크, 배포된 치트시트의 코드 복사와 모바일 표시를 확인했습니다.

최근 참가자 거래 7건은 읽기 전용으로 재조회했습니다. 이번 점검에서 새 거래 전송이나 로컬 Privacy 전체 실행을 반복하지 않았습니다. Google Slides는 조회한 권한 정보에 소유자만 표시됐으며, 5분 영상은 지원자가 촬영 완료를 알렸지만 링크가 아직 등록되지 않아 내용과 외부 접근성을 확인하지 못했습니다.
