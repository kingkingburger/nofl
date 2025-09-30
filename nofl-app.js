// NoFl App - Flash Timer with Voice Recognition
// This script manages lane timers and voice command integration

(function() {
  'use strict';

  // Lane Timer State Management
  const laneTimers = {
    TOP: { timeLeft: 300, isActive: false, interval: null },
    JGL: { timeLeft: 300, isActive: false, interval: null },
    MID: { timeLeft: 300, isActive: false, interval: null },
    BOT: { timeLeft: 300, isActive: false, interval: null },
    SUP: { timeLeft: 300, isActive: false, interval: null }
  };

  const FLASH_COOLDOWN = 300; // 5 minutes in seconds

  // Format time as MM:SS
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Start timer for a specific lane
  function startTimer(lane) {
    const timer = laneTimers[lane];
    if (timer.isActive) {
      console.log(`${lane} timer is already active`);
      return;
    }

    // Reset and start
    timer.timeLeft = FLASH_COOLDOWN;
    timer.isActive = true;

    const timerElement = document.querySelector(`.lane-timer[data-lane="${lane}"]`);
    const timeDisplay = timerElement.querySelector('.lane-time');
    const progressBar = timerElement.querySelector('.progress-bar');

    timerElement.classList.add('active');

    // Update UI immediately
    updateTimerUI(lane);

    // Start interval
    timer.interval = setInterval(() => {
      timer.timeLeft--;
      updateTimerUI(lane);

      if (timer.timeLeft <= 0) {
        stopTimer(lane);
      }
    }, 1000);

    console.log(`${lane} timer started`);
  }

  // Stop timer for a specific lane
  function stopTimer(lane) {
    const timer = laneTimers[lane];
    if (timer.interval) {
      clearInterval(timer.interval);
      timer.interval = null;
    }

    timer.isActive = false;
    timer.timeLeft = FLASH_COOLDOWN;

    const timerElement = document.querySelector(`.lane-timer[data-lane="${lane}"]`);
    const timeDisplay = timerElement.querySelector('.lane-time');
    const progressBar = timerElement.querySelector('.progress-bar');

    timerElement.classList.remove('active');
    timeDisplay.textContent = 'READY';
    progressBar.style.width = '0%';

    console.log(`${lane} timer stopped`);
  }

  // Update timer UI
  function updateTimerUI(lane) {
    const timer = laneTimers[lane];
    const timerElement = document.querySelector(`.lane-timer[data-lane="${lane}"]`);
    const timeDisplay = timerElement.querySelector('.lane-time');
    const progressBar = timerElement.querySelector('.progress-bar');

    timeDisplay.textContent = formatTime(timer.timeLeft);

    const progress = ((FLASH_COOLDOWN - timer.timeLeft) / FLASH_COOLDOWN) * 100;
    progressBar.style.width = `${progress}%`;
  }

  // Process voice commands
  function processVoiceCommand(text) {
    const lowerText = text.toLowerCase().trim();
    console.log('Processing voice command:', lowerText);

    const laneCommands = [
      { keywords: ['탑 노플', '탑노플', 'top nofl', 'top 노플'], lane: 'TOP' },
      { keywords: ['정글 노플', '정글노플', 'jgl nofl', 'jungle nofl', '정글 노플'], lane: 'JGL' },
      { keywords: ['미드 노플', '미드노플', 'mid nofl', '미드 노플'], lane: 'MID' },
      { keywords: ['원딜 노플', '원딜노플', 'bot nofl', '봇 노플', '원딜 노플', '바텀 노플'], lane: 'BOT' },
      { keywords: ['서폿 노플', '서폿노플', 'sup nofl', 'support nofl', '서포트 노플'], lane: 'SUP' },
    ];

    for (const { keywords, lane } of laneCommands) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          console.log(`Voice command matched: ${lane}`);
          startTimer(lane);
          return;
        }
      }
    }
  }

  // Monitor transcript changes
  let lastTranscript = '';
  function monitorTranscript() {
    const transcriptElement = document.getElementById('state-transcribed');
    if (!transcriptElement) return;

    const currentTranscript = transcriptElement.textContent || transcriptElement.innerHTML;

    if (currentTranscript !== lastTranscript && currentTranscript !== '[음성 인식 결과가 여기에 표시됩니다]') {
      lastTranscript = currentTranscript;

      // Extract new text (remove HTML tags)
      const textOnly = currentTranscript.replace(/<br>/g, ' ').replace(/<[^>]*>/g, '');

      if (textOnly.trim()) {
        processVoiceCommand(textOnly);
      }
    }
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    console.log('NoFl App initialized');

    // Add click handlers for manual timer start
    document.querySelectorAll('.lane-timer').forEach(timerElement => {
      timerElement.addEventListener('click', () => {
        const lane = timerElement.getAttribute('data-lane');
        startTimer(lane);
      });
    });

    // Monitor transcript every 500ms
    setInterval(monitorTranscript, 500);

    console.log('Lane timers ready. Say "탑 노플" to start TOP timer.');
  });

})();