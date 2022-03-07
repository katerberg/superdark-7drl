export {COLORS} from './colors';
export {EVENTS} from './events';
export {DEPTH} from './depth';
export {ENEMY} from './enemy';
export {PLAYER} from './player';

export const GAME = {
  width: 1200,
  height: 800,
};

export const PLAY_AREA = {
  width: 2500,
  height: 2500,
  xOffset: 0,
  yOffset: 0,
};

export const LEVELS = {
  MIN_LEVEL: 1,
  MAX_LEVEL: 10,
};

export const WALLS = {
  nodeRadius: 10,
};

export const TIME = {
  TOTAL: 900000,
};

export const GAME_STATUS = {
  WIN: 'won',
  LOSE: 'lost',
};

export const SCENES = {
  HUD: 'HudScene',
  GAME: 'GameScene',
  LOADING: 'LoadingScene',
};
