# 구조와 확인한 범위

## PCL · 실제 테스트넷 실행

```mermaid
flowchart LR
  A[카페 A 서명 지갑] -->|pay + 0.001 tOKRW| B[PCL 등록 프록시]
  B --> C[지급 전 차단 목록 검사]
  C -->|통과| D[프록시에서 지급 코드 실행]
  D --> E[지급 후 정책 검사]
  E -->|완료| F[원두업체 B]
  C -->|거절| G[거래 변경 사항 취소]
  E -->|거절| G
```

이번 차단 목록(Denylist)은 송신자를 검사합니다. 수취 기업 심사나 사기 자동 탐지는 구현하지 않았습니다. 정책 관리자와 지급 권한을 가진 계정(owner)는 실습에서 같은 지갑입니다. 운영에서는 역할 분리·권한 변경·감사 로그가 필요합니다. PCL은 실제 은행 심사를 대체하지 않습니다.

```mermaid
sequenceDiagram
  participant A as 카페 A
  participant P as 등록 프록시
  participant C as PCL
  participant I as 지급 구현체
  A->>P: pay(원두업체 B), value
  P->>C: 지급 전 검사 - preCall
  alt 정책 통과
    P->>I: 지급 코드 실행 - delegatecall
    I-->>P: 잔액/지급 횟수 변경
    P->>C: 지급 후 검사 - postCall
    P-->>A: status 1
  else 송신자 차단
    P-->>A: InDenylist, status 0
  end
```

## Privacy · Local

Alice는 카페 A, Bob은 원두업체 B입니다. 먼저 공개적으로 예치해 비공개 잔액 기록(note)을 만듭니다. 내 컴퓨터의 증명 생성 프로그램은 잔액과 소유권 등의 데이터를 사용해 지급이 유효하다는 증명(proof)을 만듭니다. 로컬 체인이 이를 확인하면 지급이 반영되고, Bob은 자신의 키로 받은 잔액을 조회합니다. 예치 10 → 지급 7 → Alice 3 / Bob 7을 확인했습니다.

| 경계 | 책임·공개 범위 | 검증 |
|---|---|---|
| 공개 RPC/체인 | 거래·이벤트·공개 예치 정보 | 모든 단계가 비공개라고 주장하지 않음 |
| 지갑 | 서명키·수신/조회용 비밀 관리 | 내 컴퓨터에서 비공개 잔액 조회 확인 |
| 증명 생성 프로그램 | 비공개 입력 데이터 처리 | 내 컴퓨터에서 증명 생성; 외부 서버 위탁은 미검증 |
| 감사자 | 감사용 키와 거래 정보 열람 권한 관리 | 구성은 존재하지만 감사자의 거래 정보 열람 미검증 |
| 정책 관리자 | 정책 변경과 중지 책임 | 테스트넷 Denylist 변경 확인 |

## Maroo 테스트넷의 정상 비공개 지급에 더 필요한 준비

**Maroo 테스트넷에 보낼 정상적인 거래 입력을 준비하는 단계에서 멈췄습니다.** 체인의 검증 방식에 맞는 증명 생성 파일, 증명에 넣을 데이터, 전송 형식을 함께 확인해야 합니다. 이번 조사에서는 이들을 연결해 실행하는 방법을 확보하지 못했습니다. 필요한 자료가 없거나 기능이 작동하지 않는다는 뜻은 아닙니다.

임의로 만든 잘못된 증명은 보내지 않았습니다. [공개 인터페이스 조회](../evidence/live-testnet/PRIVACY_PUBLIC_PROBE.json)는 실제 지급이 이루어졌다는 증거는 아닙니다. 내 컴퓨터의 Clairveil에서 만든 증명이 Maroo에서도 통한다는 뜻은 아닙니다. 운영 적용 전에는 위 선행 자료, 키 보관·관리, 감사 권한, 중복 지급 방지와 장애 복구를 별도로 검증해야 합니다.

Clairveil SHA: `af04cfc994a3da87a8b1b902eda0988feb512539`. 외부 Maroo 주소·ABI는 [Maroo Docs](https://docs.maroo.io), 구현 참고는 [Clairveil](https://github.com/DELIGHT-LABS/clairveil/tree/af04cfc994a3da87a8b1b902eda0988feb512539)를 사용합니다.
