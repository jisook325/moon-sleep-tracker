# 🌙 달빛 수면 트래커 (Moon Sleep Tracker)

개인 및 가족 공용 수면 기록 웹앱입니다. 구글 시트를 백엔드로 사용하여 데이터를 안전하게 보관하고 통계를 조회할 수 있습니다.

## ✨ 주요 기능
- **프리미엄 야간 테마**: 눈이 편안한 다크 모드와 Glassmorphism UI
- **다중 사용자 지원**: 가족 구성원별 개별 기록 관리
- **실시간 상태 유지**: 브라우저를 새로고침하거나 닫아도 '수면 중' 상태가 로컬 스토리지에 유지됨
- **데이터 시각화**: Chart.js를 이용한 주간 수면 시간 및 퀄리티 트렌드 분석
- **구글 시트 연동**: Google Apps Script(GAS)를 통한 무료 DB 인터페이스

## 🚀 시작하기

### 1. 백엔드 설정 (Google Apps Script)
1. 구글 시트를 생성하고 헤더를 아래와 같이 설정합니다.
   `날짜 | 사용자 | 취침시각 | 기상시각 | 수면시간_분 | 별점 | 메모`
2. `Code.gs` 파일을 Apps Script에 복사하고 '웹 앱'으로 배포합니다.
3. 배포된 URL과 설정한 API 토큰을 기억해 두세요.

### 2. 프론트엔드 실행
생성된 프로젝트 폴더에서 다음 명령어를 실행합니다.
```bash
npm install
npm run dev
```

### 3. 앱 내 설정
앱 하단의 **설정(⚙️)** 탭에서 다음 항목을 입력하고 저장합니다.
- Google Apps Script URL
- API 보안 토큰
- 사용자 목록

## 🛠 기술 스택
- HTML5 / CSS3 (Vanilla)
- JavaScript (Vanilla, ES6+)
- Vite (Build Tool)
- Chart.js (Data Visualization)
- Google Apps Script (Backend)
