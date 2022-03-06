import * as Phaser from 'phaser';
import {DEPTH, ENEMY} from '../constants';
import {createFloatingText} from '../utils/visuals';
import {PlayerLegs} from './PlayerLegs';
import {Projectile} from './Projectile';

export class Enemy extends Phaser.GameObjects.Sprite {
  lastShot = 2000;
  shotDelay = 1000;
  shotDuration = 100;

  constructor({scene, x, y, key}) {
    super(scene, x, y, key);
    this.angle = 180;
    this.depth = DEPTH.ENEMY;

    this.setDisplaySize(ENEMY.WIDTH * ENEMY.SCALE, ENEMY.HEIGHT * ENEMY.SCALE);
    const xOrigin = 0.45;
    const yOrigin = 0.47;
    this.setDisplayOrigin(xOrigin, yOrigin);
    this.setOrigin(xOrigin, yOrigin);

    scene.physics.world.enable(this);
    this.body.setCollideWorldBounds();
    this.body.setCircle(30);
    scene.add.existing(this);

    this.anims.create({
      key: 'walkEnemy',
      frameRate: 20,
      frames: this.anims.generateFrameNumbers('enemy-rifle-move', {start: 0, end: 19}),
      repeat: -1,
    });
    this.legs = new PlayerLegs({scene, x, y, key: `${key}legs`, player: this});
    this.legs.play('walk');
  }

  update(time) {
    if (time > this.lastShot + this.shotDelay) {
      this.lastShot = time;
      this.scene.addProjectile(
        new Projectile({scene: this.scene, x: this.x, y: this.y, angle: this.angle, enemy: this}),
      );
      createFloatingText(this.scene, this.x, this.y, 'boom');
    }
    if (time > this.lastShot + this.shotDuration) {
      this.scene.removeProjectiles(this);
    }

    this.setAngle(this.angle + 0.25);
  }
}
