import { type Lane } from '../types/types';

/**
 * 리그 오브 레전드의 5개 라인에 대한 상수 데이터입니다.
 * 각 라인은 고유 이름, 한국어 키워드, 영어 키워드를 포함합니다.
 */
export const LANES: Lane[] = [
  { name: '탑', kor: '탑', eng: 'top', aliases: ['탑', 'top'] },
  { name: '정글', kor: '정글', eng: 'jungle', aliases: ['정글', 'jungle', 'jg'] },
  { name: '미드', kor: '미드', eng: 'mid', aliases: ['미드', 'mid'] },
  { name: '원딜', kor: '원딜', eng: 'bot', aliases: ['원딜', 'bot', 'ad', 'adc'] },
  { name: '서폿', kor: '서폿', eng: 'support', aliases: ['서폿', 'support', 'sup'] },
];

/** 플래시 소환사 주문의 재사용 대기시간 (초) */
export const FLASH_DURATION = 300; // 5분

/** 사용자에게 알림을 주는 시간 (초) */
export const NOTIFICATION_TIME = 60; // 1분