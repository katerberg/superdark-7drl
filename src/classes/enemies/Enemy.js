import * as Phaser from 'phaser';
import {DEPTH, ENEMY, WALLS} from '../../constants';
import {isDebug} from '../../utils/environments';
import {distance} from '../../utils/math';
import {createFloatingText, createSpinningExpandingText} from '../../utils/visuals';
import {EnemyFieldOfVision} from '../EnemyFieldOfVision';
import {Legs} from '../Legs';
import {Projectile} from '../Projectile';
import {EnemyGun} from '../Weapon';

export class Enemy extends Phaser.GameObjects.Sprite {
  hp;
  lastShot = 2000;
  shotDelay = ENEMY.SHOT_DELAY;
  shotDuration = ENEMY.PROJECTILE_DURATION;
  weapon;
  patrolPath;
  path;
  nextNodeIndex;
  lastCheckedHp;
  nodeIncrement = 1;
  initialSweepAngle = null;
  state;
  investigatePosition;
  fieldOfVision;

  constructor({scene, x, y, key, hp, path, width, height, xCenter, yCenter}) {
    super(scene, x, y, key);
    this.hp = hp;
    this.lastCheckedHp = hp;
    this.angle = 0;
    this.depth = DEPTH.ENEMY;
    this.weapon = new EnemyGun();
    this.state = ENEMY.STATE.PATROL;
    this.patrolPath = path;
    this.path = path;
    this.nextNodeIndex = 1;
    this.fieldOfVision = new EnemyFieldOfVision({scene, x, y, enemy: this});

    this.setDisplaySize(width * ENEMY.SCALE, height * ENEMY.SCALE);
    this.setOrigin(xCenter / width, yCenter / height);

    scene.physics.world.enable(this);
    this.body.setCollideWorldBounds();
    this.body.setCircle(ENEMY.BOUNDINGSIZE, xCenter - ENEMY.BOUNDINGSIZE, yCenter - ENEMY.BOUNDINGSIZE);
    scene.add.existing(this);

    this.anims.create({
      key: 'walkEnemy',
      frameRate: 20,
      frames: this.anims.generateFrameNumbers(key, {start: 0, end: 19}),
      repeat: -1,
    });
    this.legs = new Legs({scene, x, y, player: this});
    this.legs.play('walk');
  }

  shoot(time) {
    this.lastShot = time;
    this.scene.addProjectile(
      new Projectile({scene: this.scene, x: this.x, y: this.y, angle: this.angle, weapon: this.weapon}),
    );
    createFloatingText(this.scene, this.x, this.y, 'boom');
  }

  handleDeath() {
    this.legs.stop();
    this.fieldOfVision.destroy();
    this.destroy();
  }

  handleHit(projectile) {
    //TODO: Make this a blood splatter
    createSpinningExpandingText(this.scene, this.x, this.y, '🩸');
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

  moveAlongPath() {
    let nextNode = this.path[this.nextNodeIndex];
    if (this.distanceTo(nextNode) < 10) {
      this.nextNodeIndex += this.nodeIncrement;
      nextNode = this.path[this.nextNodeIndex];
      if (this.nextNodeIndex === 0 || this.nextNodeIndex === this.path.length - 1) {
        this.nodeIncrement *= -1;
      }
    }

    this.aimTowards(nextNode);
    const moveAngle = this.getGoalAngle(nextNode);
    if (Math.abs(this.angle - moveAngle) < 40) {
      this.moveTowards(nextNode);
    }
  }

  moveTowards(position) {
    const moveAngle = this.getGoalAngle(position);
    this.body.setVelocity(
      ENEMY.MOVE_SPEED * Math.cos(Phaser.Math.DegToRad(moveAngle)),
      ENEMY.MOVE_SPEED * Math.sin(Phaser.Math.DegToRad(moveAngle)),
    );
  }

  aimTowards(position) {
    const goalAngle = this.getGoalAngle(position);
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

  getCurrentRoom() {
    return this.scene.rooms.find((r) => r.isPointInRoom(this.x, this.y));
  }

  setState(newState) {
    if (isDebug() && newState !== this.state) {
      console.log(newState);
    }
    this.state = newState;
  }

  setPath(newPath) {
    this.path = newPath;
    this.nextNodeIndex = 1;
    this.nodeIncrement = 1;
  }

  distanceTo(position) {
    return distance({x: this.x, y: this.y}, position);
  }

  inRange(position) {
    return this.distanceTo(position) <= this.weapon.range;
  }

  isTargeted(position) {
    const deadOnBallsAccurateAngle = this.getGoalAngle(position);
    const epsilon = 1;
    return Math.abs(this.angle - deadOnBallsAccurateAngle) < epsilon;
  }

  update(time) {
    this.body.setAngularVelocity(0);
    this.body.setVelocity(0);

    const canSeePlayer = this.isSeeing(this.scene.player);
    const dearGodIveBeenShot = this.lastCheckedHp !== this.hp;
    if (canSeePlayer) {
      // "ja, i see him!"
      this.setState(ENEMY.STATE.ENGAGE);

      const playerPosition = {x: this.scene.player.x, y: this.scene.player.y};
      this.investigatePosition = playerPosition;

      const isPlayerTargeted = this.isTargeted(playerPosition);
      const isPlayerInRange = this.inRange(playerPosition);
      if (isPlayerTargeted && isPlayerInRange) {
        if (time > this.lastShot + this.shotDelay) {
          this.shoot(time);
        }
      } else {
        if (!isPlayerTargeted) {
          this.aimTowards(playerPosition);
        }
        if (!isPlayerInRange) {
          this.moveTowards(playerPosition);
        }
      }
    } else if (dearGodIveBeenShot) {
      // "dear god! i've been shot! where did that come from?"
      this.lastCheckedHp = this.hp;
      this.setState(ENEMY.STATE.SWEEP);
    } else if (this.state === ENEMY.STATE.ENGAGE) {
      // "i can't see the player. time to check out the last place i saw him"
      this.setState(ENEMY.STATE.INVESTIGATE);
      this.setPath(this.scene.findPath({x: this.x, y: this.y}, this.investigatePosition));
    } else if (this.state === ENEMY.STATE.INVESTIGATE) {
      if (this.distanceTo(this.investigatePosition) < 10) {
        this.setState(ENEMY.STATE.SWEEP);
      } else {
        this.moveAlongPath();
      }
    } else if (this.state === ENEMY.STATE.SWEEP) {
      // cuteRotatingMilitarySeal.gif
      if (!this.initialSweepAngle) {
        this.initialSweepAngle = this.angle;
      }

      if ((this.angle - this.initialSweepAngle + 360) % 360 < 360 - ENEMY.VIEW_ANGLE) {
        this.body.setAngularVelocity(ENEMY.TURN_SPEED);
      } else {
        this.initialSweepAngle = null;
        this.setState(ENEMY.STATE.RETURN);
        this.setPath(this.scene.findPath({x: this.x, y: this.y}, this.patrolPath[0]));
      }
    } else if (this.state === ENEMY.STATE.RETURN) {
      // "back to the ol' patrol i suppose"
      // eslint-disable-next-line prefer-destructuring
      const patrolStart = this.patrolPath[0];
      if (this.distanceTo(patrolStart) < 10) {
        this.setState(ENEMY.STATE.PATROL);
        this.setPath(this.patrolPath);
      } else {
        this.moveAlongPath();
      }
    } else if (this.state === ENEMY.STATE.PATROL) {
      // "i'm walkin here"
      this.moveAlongPath();
    }

    this.fieldOfVision.update();
    this.legs.setAngle(this.angle);
    this.legs.moveTo(this.body.x, this.body.y);
  }
}
