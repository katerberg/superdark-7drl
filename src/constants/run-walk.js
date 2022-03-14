import {GAME} from './game';

export const RUN_WALK = {
  DURATION: 70,
  X: 30,
  Y: GAME.height - 30,
  HEIGHT: 320,
  WIDTH: 320,
  SCALE: 0.3,
  STATE: {
    RUNNING: 'running',
    WALKING: 'walking',
  },
};
