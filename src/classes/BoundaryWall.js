import * as Phaser from 'phaser';
import {WALLS} from '../constants';

export class BoundaryWall extends Phaser.GameObjects.Ellipse {
  constructor({scene, x, y}) {
    super(scene, x, y, WALLS.nodeRadius * 2, WALLS.nodeRadius * 2, 0x000000, 1);

    scene.physics.world.enable(this);
    scene.add.existing(this);
    this.setOrigin(0.5);
    this.body.setCircle(WALLS.nodeRadius);
    this.setVisible(false);
  }
}
