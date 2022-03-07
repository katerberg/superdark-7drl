import {TIME} from '../constants';
import {minimumTwoDigits} from '../utils/math';

function getMsRemaining(currentTime) {
  return TIME.TOTAL - currentTime + window.gameState.pauseTime;
}

export function getTimeDisplayMain(currentTime) {
  const left = getMsRemaining(currentTime);
  const minutes = Math.floor(left / 1000 / 60);
  const seconds = Math.floor((left - minutes * 1000 * 60) / 1000);
  return `${minimumTwoDigits(minutes)}:${minimumTwoDigits(seconds)}`;
}

export function getTimeDisplayCs(currentTime) {
  const left = getMsRemaining(currentTime);
  return `${minimumTwoDigits(Math.floor(left / 10) % 100)}`;
}
