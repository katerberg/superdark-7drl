export {COLORS} from './colors';
export {EVENTS} from './events';

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

export const PLAYER = {
  WIDTH: 253,
  HEIGHT: 216,
  SCALE: 0.25,
  LEGS_WIDTH: 172,
  LEGS_HEIGHT: 124,
};

export const DEPTH = {
  DEFAULT: 0,
  PLAYER: 1,
  HUD: 2,
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
