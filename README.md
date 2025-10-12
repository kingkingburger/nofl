# 🎤 NoFl - 음성 인식 플래시 타이머

리그 오브 레전드 플레이어를 위한 음성 인식 기반 플래시 쿨타임 트래커입니다. 말로 "탑 노플"이라고 하면 자동으로 타이머가 시작됩니다!

![NoFl Demo](https://via.placeholder.com/800x400.png?text=NoFl+Demo)

## ✨ 주요 기능

- 🎙️ **음성 인식**: Whisper.cpp를 사용한 고정밀 음성 인식
- ⏱️ **자동 타이머**: 5개 라인(TOP, JGL, MID, BOT, SUP)의 플래시 쿨타임 자동 추적
- 🌐 **브라우저 기반**: 별도 설치 없이 웹 브라우저에서 바로 사용
- 💾 **오프라인 지원**: IndexedDB 캐싱으로 모델 다운로드 한 번만 필요
- 🌍 **다국어 지원**: 한국어, 영어, 일본어, 중국어 음성 인식 지원

## 🚀 빠른 시작

### 1. 설치

```bash
# 저장소 클론
git clone https://github.com/yourusername/nofl.git
cd nofl

# 의존성 설치
pnpm install
```

### 2. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 `http://localhost:5173` 열기

### 3. 사용 방법

1. **모델 선택**: base, small, medium 중 하나 선택 (처음엔 base 추천)
2. **녹음 시작**: "녹음 시작" 버튼 클릭
3. **음성 명령**: 마이크에 대고 말하기
   - "탑 노플" → TOP 타이머 시작
   - "정글 노플" → JGL 타이머 시작
   - "미드 노플" → MID 타이머 시작
   - "원딜 노플" 또는 "바텀 노플" → BOT 타이머 시작
   - "서폿 노플" → SUP 타이머 시작

## 🎯 음성 명령어

| 라인 | 한국어 명령어 | 영어 명령어 |
|------|--------------|-------------|
| TOP  | 탑 노플, 탑노플, 탑 높을 | top nofl |
| JGL  | 정글 노플, 정글노플, 정글 높을 | jungle nofl, jgl nofl |
| MID  | 미드 노플, 미드노플, 미드 높을 | mid nofl |
| BOT  | 원딜 노플, 바텀 노플, 원딜 높을 | bot nofl |
| SUP  | 서폿 노플, 서포트 노플, 서폿 높을 | sup nofl, support nofl |

## 🛠️ 기술 스택

- **Frontend**: TypeScript, Vite
- **음성 인식**: Whisper.cpp (WebAssembly)
- **오디오 처리**: Web Audio API, MediaRecorder API
- **스토리지**: IndexedDB
- **스타일**: Custom CSS

## 📦 프로젝트 구조

```
nofl/
├── public/
│   ├── scripts/
│   │   ├── whisper-helpers.ts    # Whisper 유틸리티
│   │   ├── whisper-engine.ts     # 음성 인식 엔진
│   │   └── timer-app.ts          # 타이머 앱 로직
│   └── styles/
│       └── main.css              # 메인 스타일
├── src/
│   ├── assets/                   # 라인 아이콘
│   └── ...
├── example/                      # Whisper.cpp 예제 파일
├── index.html                    # 메인 HTML
└── package.json
```

## 🔧 개발 명령어

```bash
# 개발 서버 시작
pnpm dev

# 프로덕션 빌드
pnpm build

# 린트 검사
pnpm lint

# 프리뷰 서버
pnpm preview

# 테스트 실행
pnpm test
```

## 📱 브라우저 호환성

- ✅ Chrome/Edge (권장)
- ✅ Firefox
- ✅ Safari (macOS/iOS)
- ⚠️ HTTPS 또는 localhost에서만 작동 (마이크 권한 필요)

## 🎨 모델 크기 선택 가이드

| 모델 | 크기 | 속도 | 정확도 | 추천 환경 |
|------|------|------|--------|----------|
| base | 142 MB | 빠름 | 보통 | 일반 사용자 |
| small | 466 MB | 중간 | 높음 | 고성능 PC |
| medium | 1.6 GB | 느림 | 매우 높음 | 최고 정확도 필요 시 |

## 💡 팁

- 🎤 조용한 환경에서 사용하면 인식률이 올라갑니다
- 🔊 명령어를 또박또박 발음하세요
- 💾 모델은 한 번 다운로드하면 캐시에 저장됩니다
- 🖱️ 타이머를 클릭해도 수동으로 시작할 수 있습니다

## 🐛 문제 해결

### 마이크가 작동하지 않을 때
- 브라우저 마이크 권한 확인
- HTTPS 또는 localhost에서 실행 중인지 확인

### 음성 인식이 안 될 때
- 선택한 언어 설정 확인
- 더 큰 모델(small/medium) 사용 시도
- 브라우저 콘솔에서 에러 메시지 확인

### 캐시 문제
- "캐시 지우기" 버튼으로 IndexedDB 초기화
- 브라우저 캐시 삭제

## 📄 라이선스

MIT License

## 🙏 사용한 라이브러리

- [Whisper.cpp](https://github.com/ggerganov/whisper.cpp) - 음성 인식 엔진


