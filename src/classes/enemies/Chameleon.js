import {ENEMY_SHOOT} from '../../constants';
import {EnemyKnife} from '../Weapon';
import {Enemy} from './Enemy';

export class Chameleon extends Enemy {
  constructor({scene, x, y, path}) {
    super({
      scene,
      x,
      y,
      key: 'enemy-knife-move',
      hp: ENEMY_SHOOT.HP,
      path,
      width: ENEMY_SHOOT.WIDTH,
      height: ENEMY_SHOOT.HEIGHT,
      xCenter: ENEMY_SHOOT.X_CENTER,
      yCenter: ENEMY_SHOOT.Y_CENTER,
    });
    this.weapon = new EnemyKnife();
    this.goInvisible();
  }

  goInvisible() {
    this.alpha = 0;
    this.fieldOfVision.alpha = 0;
    this.legs.alpha = 0;
  }

  enemySpecificUpdate() {
    const canSeePlayer = this.isSeeing(this.scene.player);
    if (canSeePlayer) {
      this.goInvisible();
    }
  }
}
