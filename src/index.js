import 'regenerator-runtime/runtime';
import * as Phaser from 'phaser';
import {GAME, LEVELS} from './constants';
import {HudScene, GameScene, LoadingScene} from './scenes';
import {isDebug} from './utils/environments';

const config = {
  type: Phaser.AUTO,
  parent: 'phaser-example', // I don't know why this was in the tutorial
  width: GAME.width,
  height: GAME.height,
  physics: {
    default: 'arcade',
    arcade: {
      debug: isDebug(),
      gravity: {y: 0},
      enableBody: true,
    },
  },
  scene: [LoadingScene, GameScene, HudScene],
};

const getInitialGameState = (startTime) => {
  const initialGameState = {
    currentLevel: 1,
    gameEnded: undefined, // GAME_STATUS
    winSwitch: {
      //x,y
    },
    startTime,
    pauseTime: 0,
    paused: false,
    levels: {
      // 1: {
      //   walls: [{x1, x2, y1, y2}]
      //   blockingThings: [{x, y}]
      //   enemies: [{x, y, type, hp}]
      //   items: [{x, y, type}]
      //   exits: [{x, y, start, end}]
      // },
    },
  };
  for (let i = LEVELS.MIN_LEVEL; i <= LEVELS.MAX_LEVEL; i++) {
    initialGameState.levels[i] = {exits: []};
  }
  return initialGameState;
};

window.resetGame = (startTime = 0) => {
  window.gameState = getInitialGameState(startTime);
};

window.gameState = getInitialGameState();

export class Game extends Phaser.Game {}

window.addEventListener('load', () => {
  new Game(config);
});