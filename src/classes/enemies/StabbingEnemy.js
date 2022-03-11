import {ENEMY_STAB} from '../../constants';
import {createFloatingText} from '../../utils/visuals';
import {Projectile} from '../Projectile';
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

  shoot(time) {
    this.lastShot = time;
    this.scene.addProjectile(
      new Projectile({scene: this.scene, x: this.x, y: this.y, angle: this.angle, weapon: this.weapon}),
    );
    createFloatingText(this.scene, this.x, this.y, 'stab');
  }
}
