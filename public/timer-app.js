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

    // 음성 명령 매핑
    this.voiceCommands = [
      { keywords: ['탑 노플', '탑노플', 'top nofl', 'top 노플'], lane: 'TOP' },
      { keywords: ['정글 노플', '정글노플', 'jgl nofl', 'jungle nofl', '정글 노플'], lane: 'JGL' },
      { keywords: ['미드 노플', '미드노플', 'mid nofl', '미드 노플'], lane: 'MID' },
      { keywords: ['원딜 노플', '원딜노플', 'bot nofl', '봇 노플', '원딜 노플', '바텀 노플'], lane: 'BOT' },
      { keywords: ['서폿 노플', '서폿노플', 'sup nofl', 'support nofl', '서포트 노플'], lane: 'SUP' },
    ];
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
      element.addEventListener('click', () => {
        timer.start();
      });
    });

    console.log('타이머 매니저 초기화 완료');
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

    for (const { keywords, lane } of this.voiceCommands) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          console.log(`음성 명령 매칭: ${lane}`);

          const timer = this.timers.get(lane);
          if (timer) {
            timer.start();
          }
          return;
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
