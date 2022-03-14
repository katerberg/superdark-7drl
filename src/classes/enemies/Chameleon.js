import {ENEMY_CHAMELEON} from '../../constants/enemy';
import {EnemyKnife} from '../Weapon';
import {Enemy} from './Enemy';

export class Chameleon extends Enemy {
  constructor({scene, x, y, path}) {
    super({
      scene,
      x,
      y,
      key: 'enemy-knife-move',
      hp: ENEMY_CHAMELEON.HP,
      path,
      width: ENEMY_CHAMELEON.WIDTH,
      height: ENEMY_CHAMELEON.HEIGHT,
      xCenter: ENEMY_CHAMELEON.X_CENTER,
      yCenter: ENEMY_CHAMELEON.Y_CENTER,
      moveSpeed: ENEMY_CHAMELEON.MOVE_SPEED,
    });
    this.setTint(0xff4444);
    this.weapon = new EnemyKnife();
  }

  goInvisible() {
    this.scene.add.tween({
      targets: [this, this.fieldOfVision, this.legs],
      duration: 100,
      ease: 'Exponential.Out',
      alpha: 0,
    });
  }

  enemySpecificUpdate() {
    const canSeePlayer = this.isSeeing(this.scene.player);
    if (canSeePlayer) {
      this.goInvisible();
    }
  }
}
