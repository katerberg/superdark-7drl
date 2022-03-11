import {ENEMY_SHOOT} from '../../constants';
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
    });
    this.weapon = new EnemyGun();
  }
}
