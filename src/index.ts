import 'regenerator-runtime/runtime';
import * as Phaser from 'phaser';
import {GAME} from './constants';
import {LoadingScene} from './scenes';

const config: Phaser.Types.Core.GameConfig = {
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
  scene: [LoadingScene],
};

export class Game extends Phaser.Game {}

window.addEventListener('load', () => {
  new Game(config);
});
