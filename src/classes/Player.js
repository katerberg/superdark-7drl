import * as Phaser from 'phaser';
import {DEPTH, EVENTS, GAME_STATUS, PLAYER, SCENES, WEAPON_EVENT} from '../constants';
import {isDebug} from '../utils/environments';
import {createExpandingText, createFloatingText} from '../utils/visuals';
import {Inventory} from './Inventory';
import {PlayerLegs} from './PlayerLegs';
import {Projectile} from './Projectile';

export class Player extends Phaser.GameObjects.Sprite {
  inventory;
  legs;
  cursors;
  hp = isDebug() ? PLAYER.MAX_HP_DEBUG : PLAYER.MAX_HP;

  constructor({scene, x, y, key, angle}) {
    super(scene, x, y, key);

    this.inventory = new Inventory();
    this.angle = angle || 0;
    this.depth = DEPTH.PLAYER;
    this.setDisplaySize(PLAYER.HEIGHT * PLAYER.SCALE, PLAYER.WIDTH * PLAYER.SCALE);
    this.setOrigin(PLAYER.XCENTER / PLAYER.WIDTH, PLAYER.YCENTER / PLAYER.HEIGHT);

    scene.physics.world.enable(this);

    this.body.setCircle(
      PLAYER.BOUNDINGSIZE,
      PLAYER.XCENTER - PLAYER.BOUNDINGSIZE,
      PLAYER.YCENTER - PLAYER.BOUNDINGSIZE,
    );

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

  handleShoot(currentTime, keys) {
    if (keys.space.isDown) {
      const result = this.inventory.getActiveWeapon().use(currentTime);
      if (result === WEAPON_EVENT.FIRED) {
        createFloatingText(this.scene, this.x, this.y, 'boom');
        this.scene.addPlayerProjectile(
          new Projectile({
            scene: this.scene,
            x: this.x,
            y: this.y,
            angle: this.angle,
            weapon: this.inventory.getActiveWeapon(),
          }),
        );
      } else if (result === WEAPON_EVENT.OUT_OF_AMMO) {
        createFloatingText(this.scene, this.x, this.y, 'click');
      }
    }
  }

  handleHit(projectile) {
    //TODO: Make this a blood splatter
    createExpandingText(this.scene, this.x, this.y, '🩸');
    this.hp -= projectile.getDamage();
    this.scene.removeProjectile(projectile);
    if (this.hp <= 0) {
      this.scene.game.events.emit(EVENTS.GAME_END, GAME_STATUS.LOSE);
    }
  }

  handleReload(currentTime, keys) {
    if (keys.r.isDown) {
      this.inventory.getActiveWeapon().reload(currentTime);
    }
  }

  handleActions(currentTime, keys) {
    this.handleReload(currentTime, keys);
    this.handleShoot(currentTime, keys);
  }

  handleMovement(keys) {
    const {up, down, left, right, w, s, a, d} = keys;
    if (up?.isDown || down?.isDown || w.isDown || s.isDown) {
      const moveSpeed = isDebug() ? PLAYER.SPEED_DEBUG : PLAYER.SPEED;
      const speedMagnitude = up?.isDown || w.isDown ? moveSpeed : down?.isDown || s.isDown ? -moveSpeed : 0;

      this.body.setVelocity(
        speedMagnitude * Math.cos(Phaser.Math.DegToRad(this.angle)),
        speedMagnitude * Math.sin(Phaser.Math.DegToRad(this.angle)),
      );
    } else {
      this.body.setVelocity(0);
    }
    if (left.isDown || right.isDown || a.isDown || d.isDown) {
      this.body.setAngularVelocity(left.isDown || a.isDown ? -1 * PLAYER.ANGLE_SPEED : PLAYER.ANGLE_SPEED);
    } else {
      this.body.setAngularVelocity(0);
    }
    this.legs.setAngle(this.angle); //Where we're going, we don't need legs
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
