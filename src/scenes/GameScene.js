import * as Phaser from 'phaser';
import characterLegsWalk from '../assets/character-legs-walk.png';
import characterMove from '../assets/character-move.png';
import {Player} from '../classes/Player';
import {Wall} from '../classes/Wall';
import {PLAY_AREA, SCENES} from '../constants';
import * as Constants from '../constants/index';

export class GameScene extends Phaser.Scene {
  player;
  walls;
  shadows;

  constructor() {
    super({
      key: SCENES.game,
    });
  }

  preload() {
    this.load.spritesheet('character', characterMove, {frameWidth: 253, frameHeight: 216});
    this.load.spritesheet('characterLegsWalk', characterLegsWalk, {frameWidth: 172, frameHeight: 124});
  }

  create() {
    this.cameras.main.setBackgroundColor('#FFFFFF');
    this.physics.world.setBounds(PLAY_AREA.xOffset, PLAY_AREA.yOffset, PLAY_AREA.width, PLAY_AREA.height);

    const immovableOptions = {
      createCallback: (p) => {
        if (p?.body instanceof Phaser.Physics.Arcade.Body) {
          p.body.setImmovable(true);
        }
      },
    };

    this.walls = this.physics.add.group(immovableOptions);
    this.shadows = [];

    this.addPlayer();
    this.addWalls();

    this.physics.add.collider(this.player, this.walls);
  }

  update() {
    if (this.player) {
      this.player.update();
    }
    this.shadows.forEach((shadow) => {
      shadow.destroy();
    });
    this.drawShadows();
  }

  addWalls() {
    this.walls.add(new Wall({scene: this, x: 300, y: 300}));
    this.walls.add(new Wall({scene: this, x: 500, y: 500}));
  }

  addPlayer() {
    this.player = new Player({
      scene: this,
      x: 100,
      y: 100,
      key: 'character',
    });
    this.player.play('walk');
  }

  drawShadows() {
    //! get player position (p)
    //!    for each rectangle:
    //      get pairs of line segments
    //      for each segment:
    //        get the vector from (p) to the first point (r1), normalized (m1)
    //        getBoundsIntersection(r1, m1) (b1, boundnum1)
    //        get the vector from (p) to the second point (r2), normalized (m2)
    //        getBoundsIntersection(r2, m2) (b2, boundnum2)
    //        find intermediate points using boundnum1 and boundnum2
    //        draw from r1 to b1 to intermediate points to b2 to r2 to r1
    // (also figure out divide by zero errors for slope)

    this.shadows = [];

    const p = {x: this.player.x, y: this.player.y};
    const dirtyMultiplier = 10000;

    console.log('player', p);
    this.walls.children.entries.forEach((wall) => {
      console.log('wall', wall);
      const w1 = {x: wall.pathData[0] + wall.x - wall.width / 2, y: wall.pathData[1] + wall.y - wall.height / 2};
      const m1 = getNormalized({x: w1.x - p.x, y: w1.y - p.y});
      console.log('first', w1);
      const b1 = getBoundsIntersection(w1, m1);
      console.log('bound1', b1);

      const w2 = {x: wall.pathData[6] + wall.x - wall.width / 2, y: wall.pathData[7] + wall.y - wall.height / 2};
      const m2 = getNormalized({x: w2.x - p.x, y: w2.y - p.y});
      console.log('second', w2);
      const b2 = getBoundsIntersection(w2, m2);
      console.log('bound2', b2);

      const graphics = this.add.graphics();
      graphics.fillStyle(0x999999);
      graphics.beginPath();

      graphics.moveTo(w1.x, w1.y);
      graphics.lineTo(w1.x + dirtyMultiplier * m1.x, w1.y + dirtyMultiplier * m1.y);
      graphics.lineTo(w2.x + dirtyMultiplier * m2.x, w2.y + dirtyMultiplier * m2.y);
      graphics.lineTo(w2.x, w2.y);

      graphics.closePath();
      graphics.fillPath();

      this.shadows.push(graphics);
    });
  }
}

function getNormalized(vector) {
  const magnitude = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
  return {x: vector.x / magnitude, y: vector.y / magnitude};
}

function getBoundsIntersection(pos, dir) {
  const w = Constants.GAME.width;
  const h = Constants.GAME.height;
  let t, bX, bY;

  // check bounds 0: (0,0) to (w,0)
  bY = 0;
  t = (bY - pos.y) / dir.y;
  bX = pos.x + dir.x * t;
  if (t >= 0 && bX >= 0 && bX <= w) {
    return {boundNum: 0, x: bX, y: bY};
  }

  // bounds 1: (w,0) to (w,h)
  bX = w;
  t = (bX - pos.x) / dir.x;
  bY = pos.y + dir.y * t;
  if (t >= 0 && bY >= 0 && bY <= h) {
    return {boundNum: 1, x: bX, y: bY};
  }

  // bounds 2: (w,h) to (0,h)
  bY = h;
  t = (bY - pos.y) / dir.y;
  bX = pos.x + dir.x * t;
  if (t >= 0 && bX >= 0 && bX <= w) {
    return {boundNum: 2, x: bX, y: bY};
  }

  // bounds 3: (0,h) to (0,0)
  bX = 0;
  t = (bX - pos.x) / dir.x;
  bY = pos.y + dir.y * t;
  if (t >= 0 && bY >= 0 && bY <= h) {
    return {boundNum: 3, x: bX, y: bY};
  }

  //uh oh
  return {boundNum: -1, x: -1, y: -1};
}
