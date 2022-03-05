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
      this.scene.start(SCENES.game);
    } else {
      this.scene.start(SCENES.game);
      // TODO: Set up the menu flow later
      // this.scene.start(SCENES.menu);
    }
  }
}
