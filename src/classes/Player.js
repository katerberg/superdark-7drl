import * as Phaser from 'phaser';
import {DEPTH, EVENTS, GAME_STATUS, PLAYER, SCENES} from '../constants';
import {isDebug} from '../utils/environments';
import {createFloatingText} from '../utils/visuals';
import {PlayerLegs} from './PlayerLegs';

export class Player extends Phaser.GameObjects.Sprite {
  legs;
  cursors;
  hp = isDebug() ? PLAYER.MAX_HP_DEBUG : PLAYER.MAX_HP;

  constructor({scene, x, y, key, angle}) {
    super(scene, x, y, key);

    this.angle = angle || 0;
    this.depth = DEPTH.PLAYER;
    this.setDisplaySize(PLAYER.HEIGHT * PLAYER.SCALE, PLAYER.WIDTH * PLAYER.SCALE);
    const xOrigin = 0.45;
    const yOrigin = 0.47;
    this.setDisplayOrigin(xOrigin, yOrigin);
    this.setOrigin(xOrigin, yOrigin);
    scene.physics.world.enable(this);

    this.body.setCircle(90);
    this.body.setCollideWorldBounds();
    scene.add.existing(this);

    this.anims.create({
      key: 'walk',
      frameRate: 20,
      frames: this.anims.generateFrameNumbers('character', {start: 0, end: 19}),
      repeat: -1,
    });
    this.legs = new PlayerLegs({scene, x, y, key: `${key}legs`, player: this});
    this.legs.play('walk');
  }

  handleHit(projectile) {
    createFloatingText(this.scene, this.x, this.y, 'ouch', 'red');
    this.hp -= projectile.damage;
    this.scene.removeProjectile(projectile);
    if (this.hp <= 0) {
      this.scene.game.events.emit(EVENTS.GAME_END, GAME_STATUS.LOSE);
    }
  }

  handleMovement() {
    const {up, down, left, right} = this.scene.scene.get(SCENES.HUD).playerKeys;

    if (up?.isDown || down?.isDown || left?.isDown || right?.isDown) {
      const moveSpeed = isDebug() ? PLAYER.SPEED_DEBUG : PLAYER.SPEED;
      const angleSpeed = 5;
      const speedMagnitude = up?.isDown ? moveSpeed : down?.isDown ? -moveSpeed : 0;

      this.angle -= left?.isDown ? angleSpeed : 0;
      this.angle += right?.isDown ? angleSpeed : 0;
      this.body.setVelocity(
        speedMagnitude * Math.cos(Phaser.Math.DegToRad(this.angle)),
        speedMagnitude * Math.sin(Phaser.Math.DegToRad(this.angle)),
      );
    } else {
      this.body.setVelocity(0);
    }
    this.legs.setAngle(this.angle);
    this.legs.moveTo(this.body.x, this.body.y);
  }

  handleInput() {
    this.handleMovement();
  }

  update() {
    this.handleInput();
  }
}
