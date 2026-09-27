# Submission Notes — Track B / Enable

최종 범위: PCL 지급 허용·차단 + 별도 Clairveil 로컬 Privacy. EAS는 추가 조사 증거로만 남겼습니다. 영상은 지원자가 추후 촬영·추가합니다.

## Assumptions / Discrepancies

은행·핀테크의 시니어 엔지니어가 카페 A의 원두 대금 지급 서비스를 만든다고 가정합니다. 기업 심사·사기 탐지·기존 원장 연동은 구현하지 않았습니다. 관리자가 지정한 송신자 차단 목록을 검사합니다. 관리자와 지급 owner는 실습에서 같은 계정입니다.

Maroo 외부 주소·ABI는 공식 문서와 @maroo-chain/contracts 0.0.9를 사용했습니다. Clairveil은 구현 참고이며 SHA `af04cfc994a3da87a8b1b902eda0988feb512539`로 고정합니다. 그 로컬 결과를 Maroo Privacy 호환성으로 간주하지 않습니다.

유효 Maroo Privacy payload를 만들기 위한 circuit pin·compatible proving artifact·public state/Merkle witness 조회·serialization/known-good fixture 연결을 확보하지 못했습니다. 최초 차단은 payload 준비이며 임의 invalid proof는 전송하지 않았습니다. 공개 조회와 로컬 정상 흐름을 분리해 제출합니다.

추가 EAS 실험에서는 유효한 false/true 증명 모두 지급이 통과했습니다. 이번 EAS_POLICY가 bool=true를 강제하지 않았다는 관찰이며, 제품 결함으로 단정하지 않습니다. 자체 발급 증명이고 은행 발급자 제한도 구현하지 않았습니다. [비교 증거](evidence/live-testnet/EAS_BOOLEAN_RESULT.json), [재조회](evidence/live-testnet/EAS_BOOLEAN_VERIFIED.json).

## Validation

검증 환경: Ubuntu 24.04 / WSL2, Node 22.14.0, ethers 6.17.0, solc 0.8.28, 계약 ABI 0.0.9, Docker의 Go 1.25.13. macOS 명령 경로는 제공하지만 실기기 실행은 미검증입니다.

- Live Testnet: 파일별 프록시 배포·허용·정상 지급·차단·복원 실행. 제출 정리 시 기존 7개 영수증을 읽기 전용 재조회했습니다.
- Local: Clairveil CLI 예치 10→지급 7→Alice 3/Bob 7, 반복 조회 일치. 개발용 artifacts와 빌드 cache를 재사용했습니다.
- Offline: 새 의존성 설치, Solidity 컴파일, JavaScript 문법, 예시 .env 처리, 정상 계정 보존, 단계 건너뛰기의 거래 전 차단을 확인합니다.
- Dependencies: solc 0.8.28은 유지하고 transitive tmp를 0.2.7로 고정했습니다. npm audit 0건을 확인했습니다. 이 결과는 실행 시점 기준이며 보안 감사를 대체하지 않습니다.

```bash
npm ci
npm test
npm audit
npm run verify:evidence
npm run secrets:check
```

실행 경로와 명령은 [참가자 가이드](workshop/PARTICIPANT_GUIDE.md), 상세 결과는 [VALIDATION](docs/VALIDATION.md), 실제 영수증은 [SUBMISSION_RECEIPTS](evidence/live-testnet/SUBMISSION_RECEIPTS.json)입니다. 제출본은 기존 실행 로직에서 불필요한 imports와 자료를 정리했으며, 최신 온체인 기록 자체는 기존 실행의 증거입니다. 새 사용자 지갑으로 모든 단계를 다시 실행했다고 주장하지 않습니다.

## AI Usage

도구: Codex. AI는 자료·ABI·소스 조사, 코드·문서 작성, 실제 명령 실행과 증거 대조를 도왔습니다. 지원자는 대상 독자·Track B·PCL/Privacy 분리·기관 지급 시나리오·실습 범위와 표현 방식을 결정했습니다.

1. 가속: 공식 문서와 pinned Clairveil 코드를 비교해 외부 인터페이스와 로컬 구현, 미확보 선행 자료를 정리했습니다.
2. 가속: 테스트넷 영수증·잔액/횟수, 로컬 CLI note 잔액을 수집·비교하는 도구와 완성 예시를 만들었습니다.
3. 오류 수정: placeholder explore:pcl을 실제 조회처럼 안내한 오류를 사용자 출력으로 확인하고 실제 PCL 조회/정책 실행과 구분했습니다.
4. 오류 수정: 체험 사이트 인증을 실제 EAS 발급으로 안내했지만 사용자가 simulation임을 확인했습니다. 실물 UID·tx 발급을 주장하지 않도록 수정했습니다.
5. 오류 수정: setup이 예시 .env를 만들었는데 계정 설정이 이를 유효 설정처럼 다뤄 invalid private key가 발생했습니다. 신규 설치 순서로 재현해 잘못된 키를 입력 단계에서 교체하고 정상 설정은 보존하도록 수정했습니다.
6. 사람이 정한 교육 방식: Node 콘솔 유지·빈칸 채우기를 없애고, 파일별 완성 예시와 핵심 코드만 표시합니다. EAS는 본 실습에서 제외하고 Privacy는 유지합니다.

## DX Feedback

| 문제 | 재현·근거 | 영향·심각도 | 제안·owner |
|---|---|---|---|
| Explorer custom error가 깨진 문자로 표시 | [실패 tx](https://explorer-testnet.maroo.io/tx/0xc879a3cbbf7061a54526f80443c9f759e10ecc9de7a6025ca95833756307648a), raw selector 0x0201b218, 공식 ABI로 InDenylist 해석 | 정책 연동 개발자의 진단 지연 / 중 | 오류 ABI·인자·원문 hex를 함께 표시 / Explorer |
| EAS payload의 false 의미가 모호 | false/true 지급 모두 status 1; 위 EAS 비교 증거 | false를 거절로 설계할 위험 / 높음 | 유효 증명 보유와 payload 검사, 발급자 통제의 차이 명시 / Docs·PCL |
| Privacy CLI의 JSON stdout에 debug 로그 혼합 | deposit/transfer stdout에서 JSON 앞 로그; sed로 JSON 시작부터 추출 후 query 성공 | CLI 자동화 파싱 실패·재전송 위험 / 중 | debug는 stderr, JSON-only 모드와 schema 고정 / Clairveil CLI |
| 현재 Maroo Privacy 재현 입력 연결 미확보 | [공개 조회](evidence/live-testnet/PRIVACY_PUBLIC_PROBE.json), [경계 설명](docs/ARCHITECTURE.md) | 외부 통합자가 proof 준비 단계에서 중단 / 높음 | verifier pin·artifact·witness query·known-good fixture 묶음 / Docs·Privacy |

Explorer 내부 구현은 확인하지 않았습니다. 사용자 체험 시작 문구 지속 노출 보고는 독립 재현을 하지 못해 핵심 DX 근거에서 제외했습니다.

## Known Limitations

- 5–8분 한국어 영상 미촬영. 추후 video-link.md에 추가합니다.
- 70분 전체 참가자 리허설은 미측정입니다. macOS 실기기는 미검증입니다.
- Maroo valid Privacy 상태 변경, auditor 복호화·disclosure 검증, 운영용 키 custody·거버넌스·보안 감사는 미완료입니다.
- PCL과 Privacy는 다른 환경의 독립 실행이며 통합 거래가 아닙니다.
- 실행 중단 시 자동 복구는 구현하지 않았습니다. lock·기록을 보고 영수증 확인 후 수동 복구합니다.
- 공개 실습 사이트는 소모성 테스트 개인키를 노출합니다. 사용자의 요청에 따른 실습 편의 기능이며 누구나 계정을 쓸 수 있습니다. 제출 저장소 및 새 Git 기록에는 해당 키를 포함하지 않습니다.
- 외부 Google Slides 링크의 제출 대상자 열람 권한은 별도 확인이 필요합니다.
