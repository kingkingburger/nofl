# Technical Requirements Document (TRD)

## 1. Executive Technical Summary
- **Project Overview**: 본 프로젝트는 LoL 플레이어들이 한국어 음성 명령을 통해 라인별 노플 타이머를 자동 관리할 수 있는 PC 브라우저 웹앱을 개발하는 것을 목표로 한다. 주요 기능은 음성 인식, 타이머 관리, 실시간 UI 업데이트, 알림 제공이며, 이를 통해 사용자는 게임에 더욱 집중하고 전략적 판단을 효율적으로 수행할 수 있다.
- **Core Technology Stack**: React, Vite, TailwindCSS, TypeScript, Whisper WASM을 기반으로 구축하며, 필요에 따라 Cloudflare Pages 및 Cloudflare Workers를 활용한다.
- **Key Technical Objectives**: 1초 이내의 음성 명령 반응 속도, 90% 이상의 음성 인식 정확도, 낮은 CPU 점유율을 목표로 한다.
- **Critical Technical Assumptions**: 사용자는 Chrome, Edge 등 최신 브라우저를 사용하며, 안정적인 인터넷 연결을 가정한다. 오프라인 동작은 지원하지 않는다.

## 2. Tech Stack

| Category          | Technology / Library        | Reasoning (Why it's chosen for this project) |
| ----------------- | --------------------------- | -------------------------------------------- |
| Frontend Framework | React                       | 컴포넌트 기반 UI 개발에 용이하며, 풍부한 생태계와 재사용성 높은 컴포넌트 구축에 적합하다. |
| Build Tool        | Vite                        | 빠른 개발 서버 시작 및 빌드 속도를 제공하여 개발 생산성을 향상시킨다. |
| Styling           | TailwindCSS                 | 유틸리티 기반 CSS 프레임워크로, 빠른 UI 스타일링 및 일관성 유지에 효과적이다. |
| Language          | TypeScript                  | 정적 타입 검사를 통해 코드 안정성을 높이고, 유지보수성을 향상시킨다. |
| Speech Recognition| Whisper WASM               | 로컬에서 실행되는 WebAssembly 기반 음성 인식 라이브러리로, 빠른 응답 속도와 개인 정보 보호에 유리하다. Web Speech API를 fallback으로 사용하여 안정성을 확보한다. |
| Deployment        | Cloudflare Pages            | 정적 웹사이트 호스팅에 최적화되어 있으며, 글로벌 CDN을 통해 빠른 콘텐츠 전송이 가능하다. |
| Backend (Optional)| Cloudflare Workers          | 서버리스 환경에서 간단한 API 및 백엔드 로직을 구현할 수 있으며, 필요에 따라 추가 기능을 확장할 수 있다. |

## 3. System Architecture Design

### Top-Level building blocks
- **Frontend (React UI)**:
    - 사용자 인터페이스 (HUD, 메인 UI)
    - 음성 입력 처리 및 Whisper WASM 연동
    - 타이머 상태 관리 및 업데이트
    - 알림 및 시각 효과 제어
- **Speech Recognition Module (Whisper WASM)**:
    - 한국어 음성 인식
    - 텍스트 변환
    - 명령 추출
- **Timer Management Module**:
    - 라인별 타이머 생성 및 관리
    - 타이머 상태 업데이트 (시작, 종료, 재설정)
    - 알림 트리거
- **Cloudflare Pages (Hosting)**:
    - 정적 자산 (HTML, CSS, JavaScript) 호스팅
    - CDN을 통한 빠른 콘텐츠 전송
- **Cloudflare Workers (Optional)**:
    - (선택 사항) 간단한 API 엔드포인트 제공
    - (선택 사항) 데이터 처리 및 로직 실행

### Top-Level Component Interaction Diagram

```mermaid
graph TD
    A[User] --> B[Frontend (React UI)]
    B --> C[Speech Recognition Module (Whisper WASM)]
    C --> B
    B --> D[Timer Management Module]
    D --> B
    B -- HTTP/HTTPS --> E[Cloudflare Pages]
    E --> F[Cloudflare Workers (Optional)]
```

- 사용자는 웹 브라우저를 통해 Frontend (React UI)와 상호 작용한다.
- Frontend는 사용자의 음성 입력을 Speech Recognition Module (Whisper WASM)로 전달하여 텍스트로 변환한다.
- 변환된 텍스트는 명령으로 해석되어 Timer Management Module에 전달되고, 타이머가 시작, 종료, 재설정된다.
- Timer Management Module은 타이머 상태를 Frontend에 업데이트하고, Frontend는 사용자에게 시각적, 청각적 알림을 제공한다.
- Frontend는 Cloudflare Pages를 통해 호스팅되며, Cloudflare Workers를 통해 추가적인 백엔드 로직을 처리할 수 있다.

### Code Organization & Convention
**Domain-Driven Organization Strategy**
- **Domain Separation**: 음성 인식, 타이머 관리, UI 컴포넌트 등 각 기능 도메인별로 코드를 분리한다.
- **Layer-Based Architecture**: 프레젠테이션 레이어 (UI 컴포넌트), 비즈니스 로직 레이어 (타이머 관리), 데이터 레이어 (Whisper WASM 연동)로 분리한다.
- **Feature-Based Modules**: 각 라인별 타이머 기능을 모듈로 구성하여 독립적으로 관리한다.
- **Shared Components**: 공통으로 사용되는 UI 컴포넌트 (버튼, 타이머 표시 등) 및 유틸리티 함수를 공유 모듈에 정의한다.

**Universal File & Folder Structure**
```
/
├── src/
│   ├── components/          # 재사용 가능한 UI 컴포넌트
│   │   ├── Timer/           # 타이머 컴포넌트
│   │   │   ├── Timer.tsx
│   │   │   ├── Timer.module.css
│   │   ├── HUD/             # HUD 컴포넌트
│   │   │   ├── HUD.tsx
│   │   │   ├── HUD.module.css
│   │   ├── ...
│   ├── utils/               # 유틸리티 함수
│   │   ├── audio.ts         # 오디오 관련 유틸리티
│   │   ├── timer.ts         # 타이머 관련 유틸리티
│   │   ├── ...
│   ├── services/            # 외부 서비스 연동 (Whisper WASM)
│   │   ├── speechRecognition.ts
│   ├── pages/               # 페이지 컴포넌트
│   │   ├── Home.tsx
│   ├── App.tsx              # 최상위 컴포넌트
│   ├── main.tsx             # 진입점
│   ├── types/               # 타입 정의
│   │   ├── timer.ts
│   ├── assets/              # 이미지, 사운드 등 정적 자산
│   ├── styles/              # 전역 스타일
│   │   ├── global.css
├── public/              # 정적 파일 (Whisper WASM 모델)
├── vite.config.ts       # Vite 설정 파일
├── tsconfig.json        # TypeScript 설정 파일
├── package.json         # 패키지 관리 파일
├── README.md
```

### Data Flow & Communication Patterns
- **Client-Server Communication**: Frontend는 Cloudflare Pages를 통해 제공되는 정적 자산을 로드하고, 필요에 따라 Cloudflare Workers API를 호출한다.
- **Database Interaction**: 데이터 영속화는 MVP에 포함되지 않으므로 데이터베이스는 사용하지 않는다.
- **External Service Integration**: Whisper WASM은 브라우저 내에서 실행되므로 외부 서비스와의 직접적인 통신은 없다.
- **Real-time Communication**: 실시간 타이머 업데이트는 React의 상태 관리 기능을 통해 처리한다.
- **Data Synchronization**: 모든 데이터는 클라이언트 측에서 관리되며, 세션이 종료되면 데이터는 삭제된다.

## 4. Performance & Optimization Strategy

- **Whisper WASM 모델 최적화**: 모델 크기를 최소화하고, 필요한 부분만 로드하여 초기 로딩 시간을 단축한다.
- **React 컴포넌트 최적화**: 불필요한 리렌더링을 방지하고, 메모이제이션을 활용하여 성능을 개선한다.
- **코드 분할 (Code Splitting)**: Vite의 코드 분할 기능을 활용하여 초기 로딩에 필요한 코드만 로드하고, 나머지는 필요할 때 로드한다.
- **CDN 활용**: Cloudflare Pages의 CDN을 활용하여 정적 자산을 빠르게 전송한다.

## 5. Implementation Roadmap & Milestones
### Phase 1: Foundation (MVP Implementation)
- **Core Infrastructure**: Vite 프로젝트 설정, React 컴포넌트 구조 설계, TailwindCSS 스타일링 설정
- **Essential Features**: 한국어 음성 명령 감지, 라인별 5분 타이머 시작, 라인별 실시간 타이머 UI, 타이머 종료 1분 전 음성 알림 + UI 강조, 수동 클릭 또는 핫키(F1~F5)로 타이머 시작·리셋, 게임 화면 위 작은 HUD(오버레이) 표시
- **Basic Security**: 브라우저 마이크 권한 요청 및 보안 가이드 제공
- **Development Setup**: 개발 환경 설정, 코드 저장소 (GitHub) 설정, CI/CD 파이프라인 (Cloudflare Pages) 설정
- **Timeline**: 4주

### Phase 2: Feature Enhancement
- **Advanced Features**: 다국어(영어) 지원, 라인별 알림 음성/볼륨 커스터마이즈, 타이머 기록 공유·저장 기능, 모바일 웹 지원
- **Performance Optimization**: Whisper WASM 모델 최적화, React 컴포넌트 최적화, 코드 분할, CDN 활용
- **Enhanced Security**: 추가적인 보안 검토 및 취약점 분석
- **Monitoring Implementation**: Google Analytics 또는 유사한 도구를 사용하여 사용자 행동 분석 및 성능 모니터링
- **Timeline**: 4주

## 6. Risk Assessment & Mitigation Strategies
### Technical Risk Analysis
- **Technology Risks**: Whisper WASM의 모델 크기로 인한 초기 로딩 지연, 브라우저별 마이크 권한 문제
    - **Mitigation Strategies**: Web Speech API fallback 구현, 브라우저별 마이크 권한 가이드 제공
- **Performance Risks**: HUD CPU 점유율 증가
    - **Mitigation Strategies**: React 컴포넌트 최적화, 불필요한 리렌더링 방지
- **Security Risks**: 악성 코드 삽입 및 XSS 공격 가능성
    - **Mitigation Strategies**: 코드 검토, 입력 값 검증, Content Security Policy (CSP) 설정
- **Integration Risks**: Web Speech API fallback 시 음성 인식 성능 저하
    - **Mitigation Strategies**: Web Speech API 설정 조정 및 사용자 가이드 제공

### Project Delivery Risks
- **Timeline Risks**: 개발 일정 지연
    - **Contingency Plans**: 기능 우선순위 조정, 추가 개발 인력 투입
- **Resource Risks**: 핵심 개발자 이탈
    - **Contingency Plans**: 코드 리뷰 및 지식 공유 강화, 대체 인력 확보
- **Quality Risks**: 버그 발생 및 사용자 불만 증가
    - **Contingency Plans**: 충분한 테스트 및 QA 수행, 사용자 피드백 수집 및 반영
- **Deployment Risks**: 배포 과정에서 문제 발생
    - **Contingency Plans**: 배포 자동화, 롤백 전략 마련
