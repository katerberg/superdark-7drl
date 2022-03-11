import {EnemyKnife} from '../Weapon';
import {Enemy} from './Enemy';

export class StabbingEnemy extends Enemy {
  constructor({scene, x, y, hp, path}) {
    super({scene, x, y, key: 'enemy-knife-move', hp, path});
    this.weapon = new EnemyKnife();
  }
}
