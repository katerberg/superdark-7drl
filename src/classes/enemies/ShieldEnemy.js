import {ENEMY_SHIELD} from '../../constants/enemy';
import {createSpinningExpandingText} from '../../utils/visuals';
import {EnemyGun, Knife} from '../Weapon';
import {Enemy} from './Enemy';

export class ShieldEnemy extends Enemy {
  constructor({scene, x, y, path}) {
    super({
      scene,
      x,
      y,
      key: 'enemy-shield-move',
      hp: ENEMY_SHIELD.HP,
      path,
      width: ENEMY_SHIELD.WIDTH,
      height: ENEMY_SHIELD.HEIGHT,
      xCenter: ENEMY_SHIELD.X_CENTER,
      yCenter: ENEMY_SHIELD.Y_CENTER,
      moveSpeed: ENEMY_SHIELD.MOVE_SPEED,
    });
    this.weapon = new EnemyGun();
  }

  handleHit(projectile) {
    if (!this.isSeeing(this.scene.player)) {
      //TODO: Make this a blood splatter
      createSpinningExpandingText(this.scene, this.x, this.y, '🩸');
      this.hp -= projectile.getDamage();
    } else {
      createSpinningExpandingText(this.scene, this.x, this.y, '💧');
    }
    this.scene.removePlayerProjectile(projectile);
    if (projectile.weapon instanceof Knife) {
      this.scene.sound.play('knife', {rate: 1.5, seek: 0.2});
    }
    if (this.hp <= 0) {
      this.handleDeath();
    }
  }
}
