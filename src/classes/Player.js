import * as Phaser from 'phaser';
import {DEPTH, EVENTS, GAME_STATUS, PLAYER, RUN_WALK, SCENES, WEAPON_EVENT} from '../constants';
import {isDebug} from '../utils/environments';
import {getNormalized} from '../utils/math';
import {getRealTime} from '../utils/time';
import {createFloatingText, createSpinningExpandingText} from '../utils/visuals';
import {Inventory} from './Inventory';
import {Legs} from './Legs';
import {Projectile} from './Projectile';
import {Reticle} from './Reticle';

export class Player extends Phaser.GameObjects.Sprite {
  inventory;
  legs;
  cursors;
  hp;
  lastStep = -2000;
  lastRunChange = -2000;
  runWalk = RUN_WALK.STATE.WALKING;

  constructor({scene, x, y, angle, hp}) {
    super(scene, x, y, 'characterPistolMove');

    this.inventory = new Inventory(scene);
    this.hp = hp;
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
      key: 'pistolMove',
      frameRate: 20,
      frames: this.anims.generateFrameNumbers('characterPistolMove', {start: 0, end: 19}),
      repeat: -1,
    });
    this.anims.create({
      key: 'knifeMove',
      frameRate: 20,
      frames: this.anims.generateFrameNumbers('characterKnifeMove', {start: 0, end: 19}),
      repeat: -1,
    });
    this.legs = new Legs({scene, x, y, player: this});
    this.legs.play('walk');

    this.reticle = new Reticle({scene, x, y, player: this});
  }

  getProjectileStart() {
    return {
      x: 0.5 * PLAYER.BOUNDINGSIZE * Math.cos(Phaser.Math.DegToRad(this.angle)) + this.x,
      y: 0.5 * PLAYER.BOUNDINGSIZE * Math.sin(Phaser.Math.DegToRad(this.angle)) + this.y,
    };
  }

  handleShoot(currentTime, keys) {
    if (keys.space.isDown) {
      const result = this.inventory.getActiveWeapon()?.use(currentTime);
      if (result === WEAPON_EVENT.FIRED) {
        this.scene.addPlayerProjectile(
          new Projectile({
            scene: this.scene,
            angle: this.angle,
            weapon: this.inventory.getActiveWeapon(),
            ...this.getProjectileStart(),
          }),
        );
      } else if (result === WEAPON_EVENT.OUT_OF_AMMO) {
        createFloatingText(this.scene, this.x, this.y, 'click');
      }
    }
  }

  heal(amount) {
    this.hp += amount;
    if (this.hp > PLAYER.MAX_HP) {
      this.hp = PLAYER.MAX_HP;
    }
  }

  handleHit(projectile) {
    //TODO: Make this a blood splatter
    createSpinningExpandingText(this.scene, this.x, this.y, '🩸');
    this.hp -= projectile.getDamage();
    this.scene.removeProjectile(projectile);
    if (this.hp <= 0) {
      this.scene.game.events.emit(EVENTS.GAME_END, GAME_STATUS.LOSE);
    }
  }

  handleReload(currentTime, keys) {
    if (keys.r.isDown) {
      this.inventory.getActiveWeapon()?.reload(currentTime);
    }
  }

  handleActions(currentTime, keys) {
    this.handleReload(currentTime, keys);
    this.handleShoot(currentTime, keys);
  }

  handleRunWalkChange(currentTime, keys) {
    if (keys.shift.isDown && getRealTime(currentTime) > this.lastRunChange + 400) {
      this.lastRunChange = getRealTime(currentTime);
      this.runWalk = this.runWalk === RUN_WALK.STATE.RUNNING ? RUN_WALK.STATE.WALKING : RUN_WALK.STATE.RUNNING;
      this.scene.game.events.emit(EVENTS.RUN_WALK_CHANGE, this.runWalk);
    }
  }

  handleMovement(timeAwareOfPauses, keys) {
    const {up, down, left, right, w, s, a, d, q, e} = keys;
    const isRunning = this.runWalk === RUN_WALK.STATE.RUNNING;

    const moveSpeed = isDebug() ? PLAYER.SPEED_DEBUG : isRunning ? PLAYER.RUN_SPEED : PLAYER.SPEED;
    const forwardMove = up.isDown || w.isDown;
    const backwardMove = down.isDown || s.isDown;
    const leftStrafe = q.isDown;
    const rightStrafe = e.isDown;
    const leftRotate = left.isDown || a.isDown;
    const rightRotate = right.isDown || d.isDown;
    let moveVector = {x: forwardMove ? 1 : backwardMove ? -1 : 0, y: leftStrafe ? -1 : rightStrafe ? 1 : 0};
    if (moveVector.x || moveVector.y) {
      moveVector = getNormalized(moveVector);
      moveVector.x *= moveSpeed;
      moveVector.y *= moveSpeed;
      if (timeAwareOfPauses > this.lastStep + (isRunning ? PLAYER.RUN_SOUND_DELAY : PLAYER.WALK_SOUND_DELAY)) {
        this.lastStep = timeAwareOfPauses;
        this.scene.addSoundWave(this.x, this.y, isRunning ? PLAYER.RUN_SOUND_RADIUS : PLAYER.WALK_SOUND_RADIUS);
      }
    }
    const runWalkMultiplier = isRunning ? 1.75 : 1;
    const angularMultiplier = leftRotate ? -1 : rightRotate ? 1 : 0;
    this.body.setVelocity(
      moveVector.x * Math.cos(this.rotation) - moveVector.y * Math.sin(this.rotation),
      moveVector.x * Math.sin(this.rotation) + moveVector.y * Math.cos(this.rotation),
    );

    this.body.setAngularVelocity(angularMultiplier * PLAYER.ANGLE_SPEED * runWalkMultiplier);

    this.legs.setAngle(this.angle); //Where we're going, we don't need legs (⌐■_■)
    this.legs.moveTo(this.body.x, this.body.y);
  }

  handleInput(timeAwareOfPauses) {
    const keys = this.scene.scene.get(SCENES.HUD).playerKeys;
    this.inventory.update(timeAwareOfPauses, keys);
    this.handleRunWalkChange(timeAwareOfPauses, keys);
    this.handleMovement(timeAwareOfPauses, keys);
    this.handleActions(timeAwareOfPauses, keys);
  }

  update(timeAwareOfPauses) {
    this.handleInput(timeAwareOfPauses);
    this.reticle.update();
  }
}
