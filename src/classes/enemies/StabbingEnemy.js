import {ENEMY_STAB} from '../../constants';
import {EnemyKnife} from '../Weapon';
import {Enemy} from './Enemy';

export class StabbingEnemy extends Enemy {
  constructor({scene, x, y, path}) {
    super({
      scene,
      x,
      y,
      key: 'enemy-knife-move',
      hp: ENEMY_STAB.HP,
      path,
      width: ENEMY_STAB.WIDTH,
      height: ENEMY_STAB.HEIGHT,
      xCenter: ENEMY_STAB.X_CENTER,
      yCenter: ENEMY_STAB.Y_CENTER,
    });
    this.weapon = new EnemyKnife();
  }
}
