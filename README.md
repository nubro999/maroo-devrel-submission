# Maroo 기업 지급 워크숍

**Primary Track: B — Enable** · 한국어 · 70분 구성

은행·핀테크의 시니어 엔지니어를 위한 워크숍입니다. EVM·Solidity·JSON-RPC 경험이 있고 Maroo와 영지식 증명은 처음인 참가자를 대상으로 합니다. 카페가 원두업체에 대금을 지급하는 사례를 통해 **Maroo 테스트넷의 정책 기반 지급 통제**와 **Clairveil 로컬 환경의 비공개 지급**을 각각 실행합니다.

## 제출 자료

| 자료 | 내용 |
|---|---|
| [Google Slides · 13장](https://docs.google.com/presentation/d/12lcnMRimrosbLEd8PpE40ZvFPl7kivfFuo4TcTB2CXc/edit) | 발표 자료와 구조 다이어그램 |
| [실습 사이트](https://maroo-workshop-cheatsheet.vercel.app/) · [참가자 가이드](workshop/PARTICIPANT_GUIDE.md) | 실행 순서, 예시 코드, 복사할 명령 |
| [진행자 가이드](workshop/FACILITATOR_GUIDE.md) | 시간 배분, 발표 메모, 토론 질문 |
| [SUBMISSION_NOTES.md](SUBMISSION_NOTES.md) | 가정과 구현 범위, 검증, AI 활용, 개선 제안, 한계 |
| [검증 결과](docs/VALIDATION.md) · [구조 설명](docs/ARCHITECTURE.md) | 실행 근거와 두 환경의 경계 |
| [오류 해결](workshop/TROUBLESHOOTING.md) | 오류별 대응과 장애 시 대체 진행 |
| [시연 영상](video-link.md) | **5분 촬영 완료 · 링크 등록 대기** |

외부 소스와 라이선스는 [출처 문서](docs/ATTRIBUTION.md)에 있습니다. 과제 요구사항별 제출 위치는 [기준 대조표](docs/SUBMISSION_CHECKLIST.md)에 정리했습니다.

## 구현 및 검증 범위

| 환경 | 직접 확인한 내용 | 실행 근거 |
|---|---|---|
| Maroo 테스트넷 | 프록시 배포 → 정상 지급 → 송신자 차단 → 지급 거절 → 정책 복원 | [최근 실습 거래 7건 확인](evidence/live-testnet/FINAL_USER_PCL_RUN.json) |
| Clairveil 로컬 | 10 예치 → 7 비공개 지급 → 잔액 3/7 확인, 반복 조회 일치 | [실행 기록](evidence/local/MANUAL_CLI_RESULT.json) |

테스트넷의 [정상 지급](https://explorer-testnet.maroo.io/tx/0xbfc7dbefd64c84ca3bda0374e77372309c63e212bea0dbb7de59e3c9285343e9)과 [차단된 지급](https://explorer-testnet.maroo.io/tx/0x2086224c79b7f7c263876da0078e762720b9e788363cc4aab1508a94acf8d131)은 탐색기에서 확인할 수 있습니다.

**두 실습은 독립된 실행입니다.** Maroo 테스트넷의 정상 Privacy 지급, PCL과 Privacy의 연결 동작 및 정책 위반 시 비공개 지급까지 차단되는지는 검증하지 않았습니다. 로컬 Privacy 성공을 테스트넷 통합 지급의 성공으로 해석하지 않습니다.

## 코드 검토와 재실행

사전 준비: Node 22.14 이상/24, Git, macOS 또는 Linux(Windows는 WSL2). Privacy에는 Docker와 사전 빌드가 필요합니다.

PCL 실습 파일은 [workshop/files](workshop/files), Privacy 실행 환경은 [demo/clairveil](demo/clairveil)에 있습니다. 설치와 실제 거래 실행은 [참가자 가이드](workshop/PARTICIPANT_GUIDE.md#환경-준비)를 따릅니다. 실습용 핵심 코드는 주석 블록으로 제공하며, 치트시트의 예시로 교체한 뒤 실행합니다. 사이트를 사용할 수 없을 때는 같은 블록의 시작·끝 주석 표시만 제거해 동일한 예시를 사용할 수 있습니다. Solidity 컴파일과 설정 처리 등 거래를 보내지 않는 검사는 저장소 폴더에서 다음과 같이 실행합니다.

```bash
npm ci
npm test
```

검증 환경은 Ubuntu 24.04 / WSL2, Node 22.14.0입니다. Clairveil 소스는 `af04cfc994a3da87a8b1b902eda0988feb512539`로 고정했습니다. 최근 참가자 실행은 Node 24.15.0의 터미널 출력과 거래 7건의 재조회로 확인했습니다. 이 실행은 핵심 코드를 주석 처리하기 전 버전이며, 최종 실습 파일은 거래를 보내지 않는 검사로 확인했습니다.

## 남은 제출 항목

시연 영상 링크 등록과 Google Slides의 외부 열람 권한 확인이 남아 있습니다. macOS 실기기 실행과 전체 70분 참가자 리허설은 미검증입니다. 상세 범위는 [Known Limitations](SUBMISSION_NOTES.md#known-limitations)에 있습니다.
