import * as Phaser from 'phaser';
import {SCENES} from '../constants';
import {isDebug} from '../utils/environments';

export class LoadingScene extends Phaser.Scene {
  constructor() {
    super({
      key: SCENES.loading,
    });
  }

  update() {
    this.cameras.main.setBackgroundColor('#FFFFFF');
    if (isDebug()) {
      // this.scene.start(SCENES.cards);
      // this.scene.start(SCENES.hud);
      // this.scene.start(SCENES.game);
      // this.scene.bringToTop(SCENES.hud);
      // this.scene.bringToTop(SCENES.cards);
    } else {
      // this.scene.start(SCENES.menu);
    }
  }
}
