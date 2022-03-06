import 'regenerator-runtime/runtime';
import * as Phaser from 'phaser';
import {GAME, LEVELS} from './constants';
import {GameScene, LoadingScene} from './scenes';

const config = {
  type: Phaser.AUTO,
  parent: 'phaser-example', // I don't know why this was in the tutorial
  width: GAME.width,
  height: GAME.height,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: {y: 0},
    },
  },
  scene: [LoadingScene, GameScene],
};

window.gameState = {
  currentLevel: 1,
  winSwitch: {
    //x,y
  },
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
  window.gameState.levels[i] = {exits: []};
}

export class Game extends Phaser.Game {}

window.addEventListener('load', () => {
  new Game(config);
});
