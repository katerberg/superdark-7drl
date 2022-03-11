import {ENEMY_SHOOT} from '../../constants';
import {EnemyGun} from '../Weapon';
import {Enemy} from './Enemy';

export class ShootingEnemy extends Enemy {
  constructor({scene, x, y, path}) {
    super({scene, x, y, key: 'enemy-rifle-move', hp: ENEMY_SHOOT.HP, path});
    this.weapon = new EnemyGun();
  }
}
