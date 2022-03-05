import * as Phaser from 'phaser';
import * as misc from '../utils/misc';
import {PlayerLegs} from './PlayerLegs';

export class Player extends Phaser.GameObjects.Sprite {
  legs;
  cursors;

  constructor({scene, x, y, key}) {
    super(scene, x, y, key);

    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.angle = 0;
    this.depth = 1;
    const scale = 0.5;
    this.setOrigin(0.5).setDisplaySize(216 * scale, 253 * scale);
    scene.physics.world.enable(this);
    this.body.setCollideWorldBounds();
    scene.add.existing(this);

    this.anims.create({
      key: 'walk',
      frameRate: 20,
      frames: this.anims.generateFrameNumbers('character', {start: 0, end: 19}),
      repeat: -1,
    });
    this.legs = new PlayerLegs({scene, x, y, key: `${key}legs`, scale});
    this.legs.play('walk');
    // this.angle = 45;
    //  .world.bringToTop(activeCard);
  }

  handleMovement() {
    const {up, down, left, right} = this.cursors;

    // const {KeyCodes} = Phaser.Input.Keyboard;
    // this.scene.input.keyboard.addKey(KeyCodes.P);
    if (up?.isDown || down?.isDown || left?.isDown || right?.isDown) {
      const moveSpeed = 150;
      const angleSpeed = 5;
      const speedMagnitude = up?.isDown ? moveSpeed : down?.isDown ? -moveSpeed : 0;

      this.angle -= left?.isDown ? angleSpeed : 0;
      this.angle += right?.isDown ? angleSpeed : 0;
      this.body.setVelocity(
        speedMagnitude * Math.cos(misc.toRadians(this.angle)),
        speedMagnitude * Math.sin(misc.toRadians(this.angle)),
      );
    } else {
      this.legs.body.setVelocity(0);
      this.body.setVelocity(0);
    }
  }

  handleInput() {
    this.handleMovement();
  }
  update() {
    this.handleInput();
  }
}
