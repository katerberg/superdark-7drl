import * as Phaser from 'phaser';
import {DEPTH, EVENTS, GAME_STATUS, PLAYER, SCENES} from '../constants';
import {isDebug} from '../utils/environments';
import {createFloatingText} from '../utils/visuals';
import {Inventory} from './Inventory';
import {PlayerLegs} from './PlayerLegs';

export class Player extends Phaser.GameObjects.Sprite {
  inventory;
  legs;
  cursors;
  lastReload = window.gameState.startTime - 10_0000;
  hp = isDebug() ? PLAYER.MAX_HP_DEBUG : PLAYER.MAX_HP;

  constructor({scene, x, y, key, angle}) {
    super(scene, x, y, key);

    this.inventory = new Inventory();
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

  handleReload(currentTime, keys) {
    if (keys.r.isDown && currentTime > this.lastReload + this.inventory.getActiveWeapon().reloadTime) {
      this.inventory.getActiveWeapon().reload();
      this.lastReload = currentTime;
    }
  }

  handleActions(currentTime, keys) {
    this.handleReload(currentTime, keys);
  }

  handleMovement(keys) {
    const {up, down, left, right, w, s, a, d} = keys;
    if (up?.isDown || down?.isDown || left?.isDown || right?.isDown || w.isDown || s.isDown || a.isDown || d.isDown) {
      const moveSpeed = isDebug() ? PLAYER.SPEED_DEBUG : PLAYER.SPEED;
      const angleSpeed = PLAYER.ANGLE_SPEED;
      const speedMagnitude = up?.isDown || w.isDown ? moveSpeed : down?.isDown || s.isDown ? -moveSpeed : 0;

      this.angle -= left?.isDown || a.isDown ? angleSpeed : 0;
      this.angle += right?.isDown || d.isDown ? angleSpeed : 0;
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

  handleInput(currentTime) {
    const keys = this.scene.scene.get(SCENES.HUD).playerKeys;
    this.handleMovement(keys);
    this.handleActions(currentTime, keys);
  }

  update(currentTime) {
    this.handleInput(currentTime);
  }
}
