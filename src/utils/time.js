import {TIME} from '../constants';
import {minimumTwoDigits} from '../utils/math';

export function getMsRemaining(currentTime) {
  return TIME.TOTAL - currentTime + window.gameState.pauseTime + window.gameState.startTime;
}

export function getTimeAwareOfPauses(currentTime) {
  return currentTime - window.gameState.pauseTime - window.gameState.startTime;
}

export function getRealTime(pauseAwareTime) {
  return pauseAwareTime + window.gameState.pauseTime + window.gameState.startTime;
}

export function getTimeDisplayMain(msRemaining) {
  const minutes = Math.floor(msRemaining / 1000 / 60);
  const seconds = Math.floor((msRemaining - minutes * 1000 * 60) / 1000);
  return `${minimumTwoDigits(minutes)}:${minimumTwoDigits(seconds)}`;
}

export function getTimeDisplayCs(msRemaining) {
  return `${minimumTwoDigits(Math.floor(msRemaining / 10) % 100)}`;
}
