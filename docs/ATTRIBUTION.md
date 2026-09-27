# 외부 소스와 변경 범위

- Maroo Docs: 외부 ABI·주소·정책 설명의 기준. 예제를 참고해 ethers 실행 래퍼와 진단 문서를 작성했습니다. 체인 코어를 수정하지 않았습니다.
- @maroo-chain/contracts 0.0.9: 배포 ABI를 import했습니다. 해당 패키지의 LICENSE 및 각 Solidity 헤더를 따릅니다. PCL 인터페이스 MIT, IEas 헤더 LGPL-3.0-only 등 파일별 차이를 임의로 하나로 묶지 않습니다.
- ethers 6.17.0 (MIT), solc 0.8.28 npm wrapper (MIT; 동봉된 Solidity compiler의 별도 고지 포함): 실행·컴파일 도구. package-lock으로 고정합니다.
- Clairveil: https://github.com/DELIGHT-LABS/clairveil, SHA af04cfc994a3da87a8b1b902eda0988feb512539, Apache-2.0. 별도 체크아웃의 원본 LICENSE/NOTICE를 유지하며 원본 전체를 제출 저장소에 복사하지 않았습니다. 실행을 돕는 코드와 공개 결과 요약만 추가했습니다.
- workshop/files/Payment.sol: 이 과제를 위해 작성한 MIT 실습 계약. 운영용 감사 완료 계약이 아닙니다.
- tmp 0.2.7 (MIT): solc의 하위 의존성을 고정해 npm audit 경고를 해소했습니다. 컴파일러 자체 버전은 유지했습니다.
- 슬라이드·대본·도식: 본 과제를 위해 AI의 도움을 받아 작성·제작하고, 내용을 실제 실행 기록과 대조했습니다. 제3자 로고·이미지는 사용하지 않았습니다.
