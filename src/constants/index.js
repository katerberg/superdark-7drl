export {COLORS} from './colors';
export {EVENTS} from './events';
export {DEPTH} from './depth';
export {RUN_WALK} from './run-walk';
export {ENEMY, ENEMY_STAB, ENEMY_SHOOT} from './enemy';
export {PLAYER} from './player';
export {GAME} from './game';

export const PLAY_AREA = {
  width: 2500,
  height: 2500,
  xOffset: 0,
  yOffset: 0,
};

export const LEVELS = {
  MIN_LEVEL: 1,
  MAX_LEVEL: 5,
};

export const WALLS = {
  nodeRadius: 10,
};

export const ROOMS = {
  minSize: 150,
  maxSize: 600,
  doorSize: 100,
  minRadius: 300,
  maxRadius: 1250,
  nodeDistance: 40,
};

export const TIME = {
  DELAY: 200,
  TOTAL: 900_000,
};

export const GAME_STATUS = {
  WIN: 'won',
  LOSE: 'lost',
};

export const SCENES = {
  HUD: 'HudScene',
  GAME: 'GameScene',
  LOADING: 'LoadingScene',
  MENU: 'MenuScene',
};

export const INVENTORY = {
  ITEM_WIDTH: 150,
  ITEM_HEIGHT: 75,
};

export const EXITS = {
  HEIGHT: 103,
  Y_OFFSET: 52,
  LEFT_STAIRS_X_OFFSET: 1190,
  DISTANCE_BETWEEN_STAIRS: 120,
};

export const WEAPON_EVENT = {
  OUT_OF_AMMO: 'click',
  FIRED: 'boom',
  NOT_READY: 'still warm',
};

export const SOUND = {
  VOLUME_WALKING: 0.3,
  VOLUME_RUNNING: 0.7,
  RATE_WALKING: 1,
  RATE_RUNNING: 4,
  DETUNE_WALKING: 0,
  DETUNE_RUNNING: -1200,
};
