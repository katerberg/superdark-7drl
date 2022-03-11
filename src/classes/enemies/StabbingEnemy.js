import {ENEMY_STAB} from '../../constants';
import {EnemyKnife} from '../Weapon';
import {Enemy} from './Enemy';

export class StabbingEnemy extends Enemy {
  constructor({scene, x, y, path}) {
    super({scene, x, y, key: 'enemy-knife-move', hp: ENEMY_STAB.HP, path});
    this.weapon = new EnemyKnife();
  }
}
