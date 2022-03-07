import {TIME} from '../constants';
import {minimumTwoDigits} from '../utils/math';

export function getTimeDisplayMain(currentTime) {
  const left = TIME.TOTAL - currentTime + window.gameState.pauseTime;
  const minutes = minimumTwoDigits(Math.floor(left / 1000 / 60));
  const seconds = minimumTwoDigits(Math.floor((left - minutes * 1000 * 60) / 1000));
  return `${minutes}:${seconds}`;
}
