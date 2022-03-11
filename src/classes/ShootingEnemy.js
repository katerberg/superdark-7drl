import {Enemy} from './Enemy';

export class ShootingEnemy extends Enemy {
  constructor({scene, x, y, hp, path}) {
    super({scene, x, y, key: 'enemy-rifle-move', hp, path});
  }
}
