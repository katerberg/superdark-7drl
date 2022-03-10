import * as Phaser from 'phaser';
import {DEPTH, ENEMY, WALLS} from '../constants';
import {createExpandingText, createFloatingText} from '../utils/visuals';
import {MoveTarget} from './MoveTarget';
import {PlayerLegs} from './PlayerLegs';
import {Projectile} from './Projectile';
import {EnemyGun} from './Weapon';

export class Enemy extends Phaser.GameObjects.Sprite {
  hp;
  lastShot = 2000;
  shotDelay = ENEMY.SHOT_DELAY;
  shotDuration = ENEMY.PROJECTILE_DURATION;
  aimTarget;
  moveTarget;
  weapon;
  path;
  lastNode;
  nodeIncrement = -1;

  constructor({scene, x, y, key, hp, path}) {
    super(scene, x, y, key);
    this.hp = hp;
    this.angle = 0;
    this.depth = DEPTH.ENEMY;
    this.weapon = new EnemyGun();
    this.lastNode = 0;
    this.path = path;

    this.setDisplaySize(ENEMY.WIDTH * ENEMY.SCALE, ENEMY.HEIGHT * ENEMY.SCALE);
    this.setOrigin(ENEMY.XCENTER / ENEMY.WIDTH, ENEMY.YCENTER / ENEMY.HEIGHT);

    scene.physics.world.enable(this);
    this.body.setCollideWorldBounds();
    this.body.setCircle(ENEMY.BOUNDINGSIZE, ENEMY.XCENTER - ENEMY.BOUNDINGSIZE, ENEMY.YCENTER - ENEMY.BOUNDINGSIZE);
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

  setMoveTarget(target) {
    this.moveTarget = target;
  }

  shoot(time) {
    if (this.aimTarget && Math.abs(this.getGoalAngle(this.aimTarget) - this.angle) < 30) {
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
    //TODO: Make this a blood splatter
    createExpandingText(this.scene, this.x, this.y, '🩸');
    this.hp -= projectile.getDamage();
    this.scene.removePlayerProjectile(projectile);
    if (this.hp <= 0) {
      this.handleDeath();
    }
  }

  getGoalAngle(target) {
    return Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y));
  }

  isInFieldOfView(angle) {
    return Math.abs(angle - this.angle) < ENEMY.VIEW_ANGLE;
  }

  isSeeing(target) {
    if (!this.isInFieldOfView(this.getGoalAngle(target))) {
      return false;
    }

    const line = new Phaser.Geom.Line(this.x, this.y, target.x, target.y);
    return !this.scene.boundaryWalls
      .getChildren()
      .some((wall) =>
        Phaser.Geom.Intersects.LineToCircle(line, new Phaser.Geom.Circle(wall.x, wall.y, WALLS.nodeRadius)),
      );
  }

  goToNode(nodeNumber) {
    const nextPoint = this.path[nodeNumber];

    this.setMoveTarget(new MoveTarget(nextPoint.x, nextPoint.y));
  }

  moveTowardsMoveTarget() {
    // TODO: Handle getting trapped in corner when he turns around to go back
    // TODO: Handle having to turn around after overshooting the other side of the door
    if (!this.moveTarget || this.moveTarget.matches(this.x, this.y)) {
      if (this.lastNode === this.path.length - 1 || this.lastNode === 0) {
        this.nodeIncrement *= -1;
      }
      this.lastNode += this.nodeIncrement;
      this.goToNode(this.lastNode);
    }
    const goalAngle = this.getGoalAngle(this.moveTarget);
    this.aimTowards(goalAngle);
    if (Math.abs(goalAngle - this.angle) < 40) {
      const speedMagnitude = ENEMY.MOVE_SPEED;
      this.body.setVelocity(
        speedMagnitude * Math.cos(Phaser.Math.DegToRad(this.angle)),
        speedMagnitude * Math.sin(Phaser.Math.DegToRad(this.angle)),
      );
    }
  }

  aimTowards(goalAngle) {
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

    const angleDiff = a - b;
    const epsilon = 1;
    this.body.setAngularVelocity(
      angleDiff > epsilon ? ENEMY.TURN_SPEED : angleDiff < -epsilon ? ENEMY.TURN_SPEED * -1 : 0,
    );
  }

  aimTowardsAimTarget() {
    if (this.aimTarget) {
      const goalAngle = this.getGoalAngle(this.aimTarget);
      this.aimTowards(goalAngle);
    }
  }

  getCurrentRoom() {
    return this.scene.rooms.find((r) => r.isPointInRoom(this.x, this.y));
  }

  update(time) {
    if (time > this.lastShot + this.shotDelay) {
      this.shoot(time);
    }

    const canSeePlayer = this.isSeeing(this.scene.player);

    // const canSeePlayer = false;
    // if (!this.aimTarget && canSeePlayer) {
    //   this.aimTarget = this.scene.player;
    //   this.moveTarget = this.scene.player;
    // }
    if (!canSeePlayer) {
      this.moveTowardsMoveTarget();
    } else {
      this.aimTarget = this.scene.player;
      this.aimTowardsAimTarget();
    }
    this.legs.setAngle(this.angle); //Where we're going, we don't need legs
    this.legs.moveTo(this.body.x, this.body.y);
  }
}
