import * as Phaser from 'phaser';
import {DEPTH, WEAPON_EVENT} from '../constants';
import {getRealTime} from '../utils/time';

class Weapon {
  characterMoveAnimation;
  range;
  size;
  damage;
  currentAmmunition;
  maxAmmunition;
  storedAmmunition;
  useTime;
  reloadTime;
  soundRadiusOfUse;
  active;
  lastReload = -10000;
  lastShot = -10000;

  constructor(
    scene,
    image,
    active = false,
    range = 1000,
    size = 20,
    damage = 1,
    currentAmmunition = 999_999_999,
    maxAmmunition = 999_999_999,
    storedAmmunition = 999_999_999,
    useTime = 1000,
    reloadTime = 1000,
    soundRadiusOfUse = 300,
    swapTime = 500,
  ) {
    this.characterMoveAnimation = 'pistolMove';
    this.scene = scene;
    this.image = image;
    this.active = active;
    this.range = range;
    this.size = size;
    this.damage = damage;
    this.currentAmmunition = currentAmmunition;
    this.maxAmmunition = maxAmmunition;
    this.storedAmmunition = storedAmmunition;
    this.useTime = useTime;
    this.reloadTime = reloadTime;
    this.soundRadiusOfUse = soundRadiusOfUse;
    this.swapTime = swapTime;
  }

  setActive() {
    this.active = true;
  }

  setInactive() {
    this.active = false;
  }

  getAmmoText() {
    if (this.currentAmmunition > 10_000) {
      return '';
    }
    return `${this.currentAmmunition}/${this.storedAmmunition > 100_000 ? '∞' : this.storedAmmunition}`;
  }

  // eslint-disable-next-line no-unused-vars,class-methods-use-this
  useAnimation(x, y, angle) {
    // meant to be overriden
  }

  use(time) {
    if (time < this.lastReload + this.reloadTime) {
      return WEAPON_EVENT.NOT_READY;
    }
    if (time > this.lastShot + this.useTime) {
      window.gameState.runUntil[getRealTime(this.useTime + time)] = 'item use';
      const {x, y} = this.scene.player.getProjectileStart();
      this.scene.addSoundWave(x, y, this.soundRadiusOfUse);
      this.lastShot = time;
      if (this.currentAmmunition) {
        --this.currentAmmunition;
        return WEAPON_EVENT.FIRED;
      }
      return WEAPON_EVENT.OUT_OF_AMMO;
    }
    return WEAPON_EVENT.NOT_READY;
  }

  reload(currentTime) {
    if (currentTime > this.lastReload + this.reloadTime) {
      this.currentAmmunition = this.maxAmmunition;
      window.gameState.runUntil[getRealTime(this.reloadTime + currentTime)] = 'reload';
      this.lastReload = currentTime;
    }
  }
}

export class Knife extends Weapon {
  constructor(scene, active) {
    super(scene, 'weapon-knife', active, 30, 30, 3, undefined, undefined, undefined, undefined, 0, 30);
    this.characterMoveAnimation = 'knifeMove';
  }

  useAnimation(x, y, angle) {
    const knifeArc = 60;
    const distanceFromPlayerToStart = 20;
    const length = this.range - distanceFromPlayerToStart;
    const thickness = 5;
    const sweepAngleStart = angle - knifeArc / 2;
    const sweepAngleEnd = angle + knifeArc / 2;
    const barDuration = 50;
    // create bars each rotated and offset from the center
    for (let sweepAngle = sweepAngleStart; sweepAngle <= sweepAngleEnd; sweepAngle += thickness) {
      const bar = this.scene.add
        .rectangle(
          distanceFromPlayerToStart * Math.cos(Phaser.Math.DegToRad(sweepAngle)) + x,
          distanceFromPlayerToStart * Math.sin(Phaser.Math.DegToRad(sweepAngle)) + y,
          length,
          thickness,
          0xffffff,
          0.3,
        )
        .setAngle(sweepAngle)
        .setAlpha(0)
        .setDepth(100);
      const delay = Math.abs(sweepAngleEnd - bar.angle);
      this.scene.add.tween({
        delay,
        targets: bar,
        duration: barDuration,
        ease: 'Exponential.In',
        alpha: 0.8,

        onComplete: () => {
          bar.destroy();
        },
        callbackScope: this.scene,
      });
    }
  }
}

export class Revolver extends Weapon {
  constructor(scene, active) {
    super(scene, 'weapon-revolver', active, 10_000, 10, 1, 5, 6, undefined, undefined, undefined, 600);
    this.characterMoveAnimation = 'pistolMove';
  }

  useAnimation(x, y, angle) {
    const lineLength = 1000;
    const animation = this.scene.add
      .rectangle(x, y, 1, 1, 0xffffff, 1)
      .setAngle(angle)
      .setDepth(DEPTH.PROJECTILE)
      .setOrigin(0);

    this.scene.add.tween({
      targets: animation,
      ease: 'Exponential.In',
      width: lineLength,
      alpha: 0.2,
      duration: 250,
      onStart: () => {
        animation.alpha = 1;
      },

      onComplete: () => {
        animation.destroy();
      },
      callbackScope: this.scene,
    });
  }
}

export class EnemyGun extends Weapon {
  constructor() {
    super(null, 'NEVER RENDER', false, 10_000, 20, 5);
  }
}

export class EnemyKnife extends Weapon {
  constructor() {
    super(null, 'NEVER RENDER', false, 100, 20, 3);
  }
}
