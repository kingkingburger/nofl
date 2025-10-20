/**
 * =================================================================
 * NoFl - Flash Timer Application
 * =================================================================
 * 음성 인식으로 플래시 타이머를 제어하는 메인 애플리케이션
 */

(function() {
  'use strict';

// =================================================================
// Constants
// =================================================================
const FLASH_COOLDOWN_SECONDS = 300; // 5분 (플래시 쿨다운)
const TRANSCRIPT_CHECK_INTERVAL = 500; // 음성 인식 결과 체크 간격 (ms)

// =================================================================
// Lane Timer Class
// =================================================================
class LaneTimer {
  constructor(lane, element) {
    this.lane = lane;
    this.element = element;
    this.timeLeft = FLASH_COOLDOWN_SECONDS;
    this.isActive = false;
    this.interval = null;

    // DOM 요소 캐싱
    this.timeDisplay = element.querySelector('.lane-time');
    this.progressBar = element.querySelector('.progress-bar');
  }

  /**
   * 타이머 시작
   */
  start() {
    if (this.isActive) {
      console.log(`${this.lane} 타이머가 이미 실행 중입니다`);
      return;
    }

    this.timeLeft = FLASH_COOLDOWN_SECONDS;
    this.isActive = true;
    this.element.classList.add('active');

    this.updateUI();

    this.interval = setInterval(() => {
      this.timeLeft--;
      this.updateUI();

      if (this.timeLeft <= 0) {
        this.stop();
      }
    }, 1000);

    console.log(`${this.lane} 타이머 시작`);
  }

  /**
   * 타이머 중지
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    this.isActive = false;
    this.timeLeft = FLASH_COOLDOWN_SECONDS;
    this.element.classList.remove('active');
    this.timeDisplay.textContent = 'READY';
    this.progressBar.style.width = '0%';

    console.log(`${this.lane} 타이머 중지`);
  }

  /**
   * UI 업데이트
   */
  updateUI() {
    this.timeDisplay.textContent = this.formatTime(this.timeLeft);

    const progress = ((FLASH_COOLDOWN_SECONDS - this.timeLeft) / FLASH_COOLDOWN_SECONDS) * 100;
    this.progressBar.style.width = `${progress}%`;
  }

  /**
   * 시간 포맷 (MM:SS)
   */
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

// =================================================================
// Timer Manager
// =================================================================
class TimerManager {
  constructor() {
    this.timers = new Map();
    this.lastTranscript = '';

    // 기본 음성 명령 매핑
    this.defaultKeywords = {
      'TOP': ['탑 노플', '탑노플', 'top nofl', 'top 노플', '탑 높을'],
      'JGL': ['정글 노플', '정글노플', 'jgl nofl', 'jungle nofl', '정글 노플', '정글 높을'],
      'MID': ['미드 노플', '미드노플', 'mid nofl', '미드 노플', '미드 높을'],
      'BOT': ['원딜 노플', '원딜노플', 'bot nofl', '봇 노플', '원딜 노플', '바텀 노플', '바텀 높을'],
      'SUP': ['서폿 노플', '서폿노플', 'sup nofl', 'support nofl', '서포트 노플', '서폿 높을']
    };

    // 사용자 정의 키워드 로드
    this.loadCustomKeywords();
  }

  /**
   * localStorage에서 사용자 정의 키워드 로드
   */
  loadCustomKeywords() {
    const saved = localStorage.getItem('nofl_custom_keywords');
    this.customKeywords = saved ? JSON.parse(saved) : {};
  }

  /**
   * 사용자 정의 키워드 저장
   */
  saveCustomKeywords() {
    localStorage.setItem('nofl_custom_keywords', JSON.stringify(this.customKeywords));
  }

  /**
   * 특정 라인의 키워드 설정
   */
  setLaneKeyword(lane, keyword) {
    if (!keyword || keyword.trim() === '') {
      delete this.customKeywords[lane];
    } else {
      this.customKeywords[lane] = keyword.trim().toLowerCase();
    }
    this.saveCustomKeywords();
    console.log(`${lane} 키워드 설정:`, this.customKeywords[lane] || '기본값');
  }

  /**
   * 특정 라인의 모든 키워드 가져오기 (사용자 정의 + 기본)
   */
  getLaneKeywords(lane) {
    const keywords = [];

    // 사용자 정의 키워드가 있으면 추가
    if (this.customKeywords[lane]) {
      keywords.push(this.customKeywords[lane]);
    }

    // 기본 키워드도 추가 (항상 사용 가능하도록)
    if (this.defaultKeywords[lane]) {
      keywords.push(...this.defaultKeywords[lane].map(k => k.toLowerCase()));
    }

    return keywords;
  }

  /**
   * 타이머 초기화
   */
  initialize() {
    const laneElements = document.querySelectorAll('.lane-timer');

    laneElements.forEach(element => {
      const lane = element.getAttribute('data-lane');
      const timer = new LaneTimer(lane, element);
      this.timers.set(lane, timer);

      // 클릭 이벤트 추가
      element.addEventListener('click', (e) => {
        // 입력 필드를 클릭한 경우는 타이머 시작하지 않음
        if (e.target.classList.contains('lane-keyword-input')) {
          return;
        }
        timer.start();
      });
    });

    // 키워드 입력 필드 초기화
    this.initializeKeywordInputs();

    console.log('타이머 매니저 초기화 완료');
  }

  /**
   * 키워드 입력 필드 초기화
   */
  initializeKeywordInputs() {
    const inputs = document.querySelectorAll('.lane-keyword-input');

    inputs.forEach(input => {
      const lane = input.getAttribute('data-lane');

      // 저장된 키워드가 있으면 입력 필드에 표시
      if (this.customKeywords[lane]) {
        input.value = this.customKeywords[lane];
      }

      // 입력 이벤트 리스너 추가 (실시간 저장)
      input.addEventListener('input', (e) => {
        this.setLaneKeyword(lane, e.target.value);
      });

      // Enter 키를 눌렀을 때 포커스 해제
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.target.blur();
        }
      });
    });

    console.log('키워드 입력 필드 초기화 완료');
  }

  /**
   * 음성 인식 모니터링 시작
   */
  startTranscriptMonitoring() {
    setInterval(() => {
      this.checkTranscript();
    }, TRANSCRIPT_CHECK_INTERVAL);

    console.log('음성 인식 모니터링 시작');
  }

  /**
   * 음성 인식 결과 확인
   */
  checkTranscript() {
    const transcriptElement = document.getElementById('state-transcribed');
    if (!transcriptElement) return;

    const currentTranscript = transcriptElement.textContent || transcriptElement.innerHTML;

    // 새로운 음성 인식 결과가 있는 경우에만 처리
    if (currentTranscript !== this.lastTranscript &&
        currentTranscript !== '[음성 인식 결과가 여기에 표시됩니다]') {

      this.lastTranscript = currentTranscript;

      // HTML 태그 제거
      const textOnly = currentTranscript
        .replace(/<br>/g, ' ')
        .replace(/<[^>]*>/g, '');

      if (textOnly.trim()) {
        this.processVoiceCommand(textOnly);
      }
    }
  }

  /**
   * 음성 명령 처리
   */
  processVoiceCommand(text) {
    const lowerText = text.toLowerCase().trim();
    console.log('음성 명령 처리:', lowerText);

    // 모든 라인에 대해 키워드 매칭 시도
    const lanes = ['TOP', 'JGL', 'MID', 'BOT', 'SUP'];

    for (const lane of lanes) {
      const keywords = this.getLaneKeywords(lane);

      for (const keyword of keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          console.log(`음성 명령 매칭: ${lane} (키워드: ${keyword})`);

          const timer = this.timers.get(lane);
          if (timer) {
            timer.start();
          }
          return; // 첫 번째 매칭만 처리
        }
      }
    }
  }
}

// =================================================================
// Application Initialization
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('NoFl 애플리케이션 초기화');

  const manager = new TimerManager();
  manager.initialize();
  manager.startTranscriptMonitoring();

  console.log('레인 타이머 준비 완료. "탑 노플"이라고 말해보세요.');
});

})();
