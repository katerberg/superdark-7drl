import * as Phaser from 'phaser';
import {DEPTH, ENEMY} from '../constants';
import {createFloatingText} from '../utils/visuals';
import {PlayerLegs} from './PlayerLegs';
import {Projectile} from './Projectile';
import {EnemyGun} from './Weapon';

export class Enemy extends Phaser.GameObjects.Sprite {
  hp;
  lastShot = 2000;
  shotDelay = ENEMY.SHOT_DELAY;
  shotDuration = ENEMY.PROJECTILE_DURATION;
  aimTarget;
  weapon;

  constructor({scene, x, y, key, hp}) {
    super(scene, x, y, key);
    this.hp = hp;
    this.angle = 0;
    this.depth = DEPTH.ENEMY;
    this.weapon = new EnemyGun();

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

  setAimTarget(target) {
    this.aimTarget = target;
  }

  shoot(time) {
    if (this.aimTarget && Math.abs(this.getGoalAimAngle() - this.angle) < 30) {
      this.lastShot = time;
      this.scene.addProjectile(
        new Projectile({scene: this.scene, x: this.x, y: this.y, angle: this.angle, weapon: this.weapon}),
      );
      createFloatingText(this.scene, this.x, this.y, 'boom');
    }
  }

  handleDeath() {
    this.legs.destroy();
    this.destroy();
  }

  handleHit(projectile) {
    createFloatingText(this.scene, this.x, this.y, 'ouch', 'red');
    this.hp -= projectile.getDamage();
    this.scene.removePlayerProjectile(projectile);
    if (this.hp <= 0) {
      this.handleDeath();
    }
  }

  getGoalAimAngle() {
    return Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(this.x, this.y, this.aimTarget.x, this.aimTarget.y));
  }

  update(time) {
    if (time > this.lastShot + this.shotDelay) {
      this.shoot(time);
    }

    if (this.aimTarget) {
      const goalAngle = this.getGoalAimAngle();

      // const absolute = abs(a-b)
      // if absolute is > 180
      //  subtract 360 from larger
      // if a-b >0 ? clockwise
      let a = goalAngle;
      let b = this.angle;
      const absolute = Math.abs(goalAngle - this.angle);
      if (absolute > 180) {
        if (goalAngle > this.angle) {
          a = goalAngle - 360;
        } else {
          b = this.angle - 360;
        }
      }

      this.body.setAngularVelocity(a < b ? ENEMY.TURN_SPEED * -1 : ENEMY.TURN_SPEED);
    }
  }
}
