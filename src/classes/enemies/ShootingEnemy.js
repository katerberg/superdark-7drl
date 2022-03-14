import {ENEMY_SHOOT} from '../../constants';
import {FloorRevolver} from '../Pickup';
import {EnemyGun} from '../Weapon';
import {Enemy} from './Enemy';

export class ShootingEnemy extends Enemy {
  constructor({scene, x, y, path}) {
    super({
      scene,
      x,
      y,
      key: 'enemy-rifle-move',
      hp: ENEMY_SHOOT.HP,
      path,
      width: ENEMY_SHOOT.WIDTH,
      height: ENEMY_SHOOT.HEIGHT,
      xCenter: ENEMY_SHOOT.X_CENTER,
      yCenter: ENEMY_SHOOT.Y_CENTER,
      moveSpeed: ENEMY_SHOOT.MOVE_SPEED,
    });
    this.weapon = new EnemyGun();
  }

  enemySpecificDeath() {
    this.scene.pickups.add(new FloorRevolver({scene: this.scene, x: this.x, y: this.y}));
  }

  // eslint-disable-next-line no-unused-vars,class-methods-use-this
  playUseSound() {
    this.scene.sound.play('gunshot', {volume: 0.6, rate: 0.7});
  }
}
