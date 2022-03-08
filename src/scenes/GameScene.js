import * as Phaser from 'phaser';
import characterLegsWalk from '../assets/character-legs-walk.png';
import characterMove from '../assets/character-move.png';
import enemyRifleMove from '../assets/enemy-rifle-move.png';
import exitDownImage from '../assets/exit-down.png';
import exitUpImage from '../assets/exit-up.png';
import steelTileset from '../assets/steel-tileset.jpg';
import winSwitchImage from '../assets/winSwitch.png';
import {Enemy} from '../classes/Enemy';
import {Exit} from '../classes/Exit';
import {Player} from '../classes/Player';
import {Wall} from '../classes/Wall';
import {WinSwitch} from '../classes/WinSwitch';
import {COLORS, DEPTH, ENEMY, EVENTS, GAME_STATUS, LEVELS, PLAYER, PLAY_AREA, SCENES, WALLS} from '../constants';
import {isDebug} from '../utils/environments';
import {getNormalized} from '../utils/math';
import {createLevelExits, createWinSwitch} from '../utils/setup';
import {getTimeAwareOfPauses} from '../utils/time';

const immovableOptions = {
  createCallback: (p) => {
    if (p?.body instanceof Phaser.Physics.Arcade.Body) {
      p.body.setImmovable(true);
    }
  },
};

export class GameScene extends Phaser.Scene {
  player;
  enemies;
  projectiles;
  walls;
  shadowWalls;
  shadows;
  exits;
  winSwitch;
  levelKey;
  gameEndText;
  rooms;

  constructor() {
    super({
      key: SCENES.GAME,
    });
  }

  preload() {
    this.load.image('steel-tileset', steelTileset);
    this.load.spritesheet('character', characterMove, {frameWidth: PLAYER.WIDTH, frameHeight: PLAYER.HEIGHT});
    this.load.spritesheet('characterLegsWalk', characterLegsWalk, {
      frameWidth: PLAYER.LEGS_WIDTH,
      frameHeight: PLAYER.LEGS_HEIGHT,
    });
    this.load.spritesheet('enemy-rifle-move', enemyRifleMove, {
      frameWidth: ENEMY.WIDTH,
      frameHeight: ENEMY.HEIGHT,
    });
    this.load.image('exit-up', exitUpImage);
    this.load.image('exit-down', exitDownImage);
    this.load.image('winSwitch', winSwitchImage);
    const {KeyCodes} = Phaser.Input.Keyboard;
    this.levelKey = this.input.keyboard.addKey(KeyCodes.L);
  }

  create(startingInfo) {
    this.cameras.main.setBackgroundColor(COLORS.SHADOW);
    this.physics.world.setBounds(PLAY_AREA.xOffset, PLAY_AREA.yOffset, PLAY_AREA.width, PLAY_AREA.height);

    this.add.tileSprite(PLAY_AREA.width / 2, PLAY_AREA.height / 2, PLAY_AREA.width, PLAY_AREA.height, 'steel-tileset');

    this.walls = this.physics.add.group(immovableOptions);
    this.shadowWalls = [];
    this.shadows = [];
    this.enemies = this.physics.add.group(immovableOptions);
    this.projectiles = this.physics.add.group({runChildUpdate: true});

    this.addPlayer(startingInfo);
    this.addEnemy();
    this.addExits();
    this.addWinSwitch();
    this.addRooms();

    this.game.events.emit(EVENTS.LEVEL_CHANGE);

    this.physics.add.overlap(this.player, this.exits, (_, exit) => this.handlePlayerExit(exit));
    // TODO: Figure out how to get the collision box to match angle
    this.physics.add.overlap(this.player, this.projectiles, (player, projectile) => player.handleHit(projectile));
    this.physics.add.overlap(this.walls, this.projectiles, (walls, projectile) => this.removeProjectile(projectile));
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.player, this.enemies);
    this.physics.add.collider(this.enemies, this.walls);
    this.physics.add.collider(this.enemies, this.exits);
    this.cameras.main.startFollow(this.player);
  }

  handleInput() {
    if (isDebug()) {
      if (this.levelKey.isDown) {
        const {currentLevel} = window.gameState;
        this.changeLevel(currentLevel === LEVELS.MAX_LEVEL ? currentLevel - 1 : currentLevel + 1);
      }
    }
  }

  changeLevel(level) {
    window.gameState.currentLevel = level;
    this.scene.start(SCENES.GAME, {
      startingPosition: {
        x: this.player.body.x + PLAYER.WIDTH * PLAYER.SCALE,
        y: this.player.body.y + PLAYER.WIDTH * PLAYER.SCALE,
      },
      angle: this.player.angle,
    });
  }

  handlePlayerExit(exit) {
    const goingUp = window.gameState.currentLevel === exit.end;

    this.walls.add(new Wall({scene: this, x: 200, y: 400, width: 200, height: 80}));
    this.changeLevel(goingUp ? exit.start : exit.end);
  }

  handlePlayerWinSwitch() {
    this.game.events.emit(EVENTS.GAME_END, GAME_STATUS.WIN);
  }

  makeWalls(x1, y1, x2, y2) {
    const boundaryWalls = [];
    const shadowWalls = [];
    const xDistance = x2 - x1;
    const yDistance = y2 - y1;
    const distance = Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
    const nodeDiameter = WALLS.nodeRadius * 2;
    const numberOfNodes = Math.ceil(distance / nodeDiameter);
    const nodeDistanceX = xDistance / numberOfNodes;
    const nodeDistanceY = yDistance / numberOfNodes;
    for (let i = 0; i < numberOfNodes; i++) {
      boundaryWalls.push(new Wall({scene: this, x: x1 + i * nodeDistanceX, y: y1 + i * nodeDistanceY}));
    }
    shadowWalls.push([x1, y1, x2, y2]);
    return {boundaryWalls, shadowWalls};
  }

  makeCurvyWalls(angleBegin, angleEnd, radius) {
    const boundaryWalls = [];
    const shadowWalls = [];
    const angleDiff = angleEnd - angleBegin;
    const wallLength = angleToArcLength(angleDiff, radius);
    const nodeDiameter = WALLS.nodeRadius * 2;
    const numberOfNodes = Math.ceil(wallLength / nodeDiameter);

    let wallAngle = angleBegin;
    let wallPosition = polarToCartesian(wallAngle, radius);
    for (let i = 1; i <= numberOfNodes; i++) {
      const newWallAngle = angleBegin + (i / numberOfNodes) * angleDiff;
      const newWallPosition = polarToCartesian(newWallAngle, radius);
      boundaryWalls.push(new Wall({scene: this, x: wallPosition.x, y: wallPosition.y}));
      shadowWalls.push([wallPosition.x, wallPosition.y, newWallPosition.x, newWallPosition.y]);
      wallAngle = newWallAngle;
      wallPosition = newWallPosition;
    }
    return {boundaryWalls, shadowWalls};
  }

  addExits() {
    this.exits = this.physics.add.group(immovableOptions);
    createLevelExits(window.gameState.currentLevel);
    window.gameState.levels[window.gameState.currentLevel].exits.forEach((exit) => {
      this.exits.add(
        new Exit({
          scene: this,
          x: exit.x,
          y: exit.y,
          start: exit.start,
          end: exit.end,
          direction: exit.direction,
        }),
      );
    });
  }

  addEnemy() {
    const enemy = new Enemy({scene: this, x: 200, y: 200, key: 'enemy-rifle-move'});
    enemy.setAimTarget(this.player);
    enemy.play('walkEnemy');
    this.enemies.add(enemy);
  }

  addProjectile(projectile) {
    this.projectiles.add(projectile);
  }

  removeProjectile(projectile) {
    this.projectiles.remove(projectile, true, true);
  }

  removeProjectiles(enemy) {
    const filtered = this.projectiles.children.entries.filter((p) => p.enemy === enemy);
    filtered.forEach((p) => this.removeProjectile(p));
  }

  addPlayer(startingInfo) {
    this.player = new Player({
      scene: this,
      x: startingInfo?.startingPosition?.x || PLAY_AREA.width / 2 + 100,
      y: startingInfo?.startingPosition?.y || 100,
      key: 'character',
      angle: startingInfo?.angle,
    });
    this.player.play('walk');
  }

  update(time) {
    if (window.gameState.paused) {
      this.scene.pause();
    }
    const timeAwareOfPauses = getTimeAwareOfPauses(time);
    if (this.player) {
      this.player.update();
    }
    this.enemies.children.entries.forEach((enemy) => {
      enemy.update(timeAwareOfPauses);
    });
    this.handleInput();
    this.clearShadows();
    this.drawShadows();
  }

  addWinSwitch() {
    if (window.gameState.currentLevel !== LEVELS.MAX_LEVEL) {
      return;
    }
    createWinSwitch();
    this.winSwitch = new WinSwitch({scene: this, x: window.gameState.winSwitch.x, y: window.gameState.winSwitch.y});

    this.physics.add.overlap(this.player, this.winSwitch, () => this.handlePlayerWinSwitch());
  }

  clearShadows() {
    this.shadows.forEach((shadow) => {
      // if (shadow.alpha === 0) {
      //   shadow.destroy();
      // }
      shadow.destroy();
    });
    this.shadows = [];
  }

  drawShadows() {
    this.drawObstacleShadows();
    // this.drawPeripheralShadows();
  }

  drawObstacleShadows() {
    const p = {x: this.player.x, y: this.player.y};
    const dirtyMultiplier = 10000;

    this.shadowWalls.forEach((wall) => {
      const w1 = {
        x: wall[0],
        y: wall[1],
      };
      const m1 = getNormalized({x: w1.x - p.x, y: w1.y - p.y});

      const w2 = {
        x: wall[2],
        y: wall[3],
      };
      const m2 = getNormalized({x: w2.x - p.x, y: w2.y - p.y});

      const graphics = this.add.graphics();
      graphics.fillStyle(COLORS.SHADOW);
      graphics.setDepth(DEPTH.SHADOWS);
      graphics.beginPath();

      graphics.moveTo(w1.x, w1.y);
      graphics.lineTo(w1.x + dirtyMultiplier * m1.x, w1.y + dirtyMultiplier * m1.y);
      graphics.lineTo(w2.x + dirtyMultiplier * m2.x, w2.y + dirtyMultiplier * m2.y);
      graphics.lineTo(w2.x, w2.y);

      graphics.closePath();
      graphics.fillPath();

      // this.tweens.add({
      //   targets: graphics,
      //   alpha: 1,
      //   duration: 300,
      // });

      this.shadows.push(graphics);
    });
  }

  drawPeripheralShadows() {
    const graphics = this.add.graphics();
    graphics.fillStyle(COLORS.SHADOW);
    graphics.setDepth(DEPTH.SHADOWS);
    graphics.beginPath();

    graphics.arc(
      this.player.x,
      this.player.y,
      75,
      Phaser.Math.DegToRad(this.player.angle - 100),
      Phaser.Math.DegToRad(this.player.angle + 100),
      true,
    );

    graphics.arc(
      this.player.x,
      this.player.y,
      5000,
      Phaser.Math.DegToRad(this.player.angle + 100),
      Phaser.Math.DegToRad(this.player.angle - 100),
      false,
    );

    graphics.closePath();
    graphics.fillPath();

    // this.tweens.add({
    //   targets: graphics,
    //   alpha: 1,
    //   duration: 300,
    // });

    this.shadows.push(graphics);
  }

  addRooms() {
    const minSize = 150;
    const maxSize = 600;
    const doorSize = 100;

    this.rooms = [{angleBegin: 0, angleEnd: 360, radiusBegin: 300, radiusEnd: 1250, doors: noDoors()}];

    let splittable;
    do {
      splittable = false;
      const newRooms = [];
      //eslint-disable-next-line no-loop-func
      this.rooms.forEach((r) => {
        const radiusDiff = r.radiusEnd - r.radiusBegin;
        const angleDiff = r.angleEnd - r.angleBegin;
        const midRadius = (r.radiusBegin + r.radiusEnd) / 2;

        const height = radiusDiff;
        const width = angleToArcLength(angleDiff, midRadius);

        if (height <= maxSize && width <= maxSize) {
          newRooms.push(r);
        } else if (isHorizontalWallPlaceable(r, minSize) && (height > width || !isVerticalWallPlaceable(r, minSize))) {
          // room is tall or room is not splittable horizontally, then split it vertically
          splittable = true;
          const newRadius = randomInRange(getVerticalRange(r, minSize));
          const splitDoorSet = splitDoorsVertically(r, newRadius);
          const newWallWidth = angleToArcLength(angleDiff, newRadius);
          const newDoorOffset = Math.random() * (newWallWidth - doorSize);
          const newDoorBegin = r.angleBegin + arcLengthToAngle(newDoorOffset, newRadius);
          const newDoorEnd = newDoorBegin + arcLengthToAngle(doorSize, newRadius);
          const newDoor = [newDoorBegin, newDoorEnd];
          splitDoorSet.bottomRoomDoors.top = newDoor;
          splitDoorSet.topRoomDoors.bottom = newDoor;

          newRooms.push({
            angleBegin: r.angleBegin,
            angleEnd: r.angleEnd,
            radiusBegin: r.radiusBegin,
            radiusEnd: newRadius,
            doors: splitDoorSet.bottomRoomDoors,
          });
          newRooms.push({
            angleBegin: r.angleBegin,
            angleEnd: r.angleEnd,
            radiusBegin: newRadius,
            radiusEnd: r.radiusEnd,
            doors: splitDoorSet.topRoomDoors,
          });
        } else if (isVerticalWallPlaceable(r, minSize)) {
          // otherwise split it horizontally
          splittable = true;
          const newAngle = randomInRange(getHorizontalRange(r, minSize));
          const splitDoorSet = splitDoorsHorizontally(r, newAngle);
          const newDoorOffset = Math.random() * (radiusDiff - doorSize);
          const newDoorBegin = r.radiusBegin + newDoorOffset;
          const newDoorEnd = newDoorBegin + doorSize;
          const newDoor = [newDoorBegin, newDoorEnd];
          splitDoorSet.leftRoomDoors.right = newDoor;
          splitDoorSet.rightRoomDoors.left = newDoor;

          newRooms.push({
            angleBegin: r.angleBegin,
            angleEnd: newAngle,
            radiusBegin: r.radiusBegin,
            radiusEnd: r.radiusEnd,
            doors: splitDoorSet.leftRoomDoors,
          });
          newRooms.push({
            angleBegin: newAngle,
            angleEnd: r.angleEnd,
            radiusBegin: r.radiusBegin,
            radiusEnd: r.radiusEnd,
            doors: splitDoorSet.rightRoomDoors,
          });
        } else {
          // can't split room b/c of doors
          newRooms.push(r);
        }
      });
      this.rooms = newRooms;
    } while (splittable);

    // this.drawFloorplan();

    this.rooms.forEach((room) => {
      if (room.doors.left) {
        this.addWall(room.angleBegin, room.radiusBegin, room.doors.left[0]);
        this.addWall(room.angleBegin, room.doors.left[1], room.radiusEnd);
      } else {
        this.addWall(room.angleBegin, room.radiusBegin, room.radiusEnd);
      }

      if (room.doors.bottom) {
        this.addCurvyWall(room.angleBegin, room.doors.bottom[0], room.radiusBegin);
        this.addCurvyWall(room.doors.bottom[1], room.angleEnd, room.radiusBegin);
      } else {
        this.addCurvyWall(room.angleBegin, room.angleEnd, room.radiusBegin);
      }
    });
  }

  addWall(angle, radiusBegin, radiusEnd) {
    const beginWall = polarToCartesian(angle, radiusBegin);
    const endWall = polarToCartesian(angle, radiusEnd);
    const walls = this.makeWalls(beginWall.x, beginWall.y, endWall.x, endWall.y);
    walls.boundaryWalls.forEach((w) => {
      this.walls.add(w);
    });
    walls.shadowWalls.forEach((w) => {
      this.shadowWalls.push(w);
    });
  }

  addCurvyWall(angleBegin, angleEnd, radius) {
    const walls = this.makeCurvyWalls(angleBegin, angleEnd, radius);
    walls.boundaryWalls.forEach((w) => {
      this.walls.add(w);
    });
    walls.shadowWalls.forEach((w) => {
      this.shadowWalls.push(w);
    });
  }

  drawFloorplan() {
    const drawCenter = {x: PLAY_AREA.width / 2, y: PLAY_AREA.height / 2};
    const drawScale = 1;
    const wallWidth = 10;
    const graphics = this.add.graphics();

    this.rooms.forEach((r) => {
      // const color = parseInt(Math.floor(Math.random() * 16777215).toString(16), 16);
      // graphics.lineStyle(2,color,1);
      graphics.lineStyle(wallWidth, 0x000000, 1);
      // graphics.fillStyle(color);
      graphics.beginPath();
      graphics.arc(
        drawCenter.x,
        drawCenter.y,
        r.radiusBegin * drawScale,
        offsetDegToRad(r.angleBegin),
        offsetDegToRad(r.angleEnd),
        false,
      );
      graphics.arc(
        drawCenter.x,
        drawCenter.y,
        r.radiusEnd * drawScale,
        offsetDegToRad(r.angleEnd),
        offsetDegToRad(r.angleBegin),
        true,
      );
      graphics.closePath();
      graphics.strokePath();
      // graphics.fillPath();
    });

    this.rooms.forEach((r) => {
      Object.entries(r.doors).forEach((entry) => {
        const [direction, door] = entry;
        if (door) {
          graphics.lineStyle(wallWidth, 0xaaaaaa, 1);
          graphics.beginPath();
          if (direction === 'left') {
            graphics.arc(
              drawCenter.x,
              drawCenter.y,
              door[0] * drawScale,
              offsetDegToRad(r.angleBegin),
              offsetDegToRad(r.angleBegin),
              false,
            );
            graphics.arc(
              drawCenter.x,
              drawCenter.y,
              door[1] * drawScale,
              offsetDegToRad(r.angleBegin),
              offsetDegToRad(r.angleBegin),
              true,
            );
          } else if (direction === 'right') {
            graphics.arc(
              drawCenter.x,
              drawCenter.y,
              door[0] * drawScale,
              offsetDegToRad(r.angleEnd),
              offsetDegToRad(r.angleEnd),
              false,
            );
            graphics.arc(
              drawCenter.x,
              drawCenter.y,
              door[1] * drawScale,
              offsetDegToRad(r.angleEnd),
              offsetDegToRad(r.angleEnd),
              true,
            );
          } else if (direction === 'bottom') {
            graphics.arc(
              drawCenter.x,
              drawCenter.y,
              r.radiusBegin * drawScale,
              offsetDegToRad(door[0]),
              offsetDegToRad(door[1]),
              false,
            );
          } else if (direction === 'top') {
            graphics.arc(
              drawCenter.x,
              drawCenter.y,
              r.radiusEnd * drawScale,
              offsetDegToRad(door[0]),
              offsetDegToRad(door[1]),
              false,
            );
          }
          graphics.closePath();
          graphics.strokePath();
        }
      });
    });
  }
}

function offsetDegToRad(deg) {
  return Phaser.Math.DegToRad(deg - 90);
}

function angleToArcLength(angle, radius) {
  return 2 * Math.PI * radius * (angle / 360);
}

function arcLengthToAngle(arclength, radius) {
  return (arclength * 360) / (2 * Math.PI * radius);
}

function polarToCartesian(angle, radius) {
  const x = PLAY_AREA.width / 2 + radius * Math.cos(offsetDegToRad(angle));
  const y = PLAY_AREA.height / 2 + radius * Math.sin(offsetDegToRad(angle));
  return {x, y};
}

function rangeSize(oldRange) {
  const range = normalizedRange(oldRange);
  let size = 0;
  for (let i = 0; i < range.length; i++) {
    size += range[i][1] - range[i][0];
  }
  return size;
}

// // ranges look like [[200,550],[600,900],...,[1885.4,2000]]
function normalizedRange(oldRange) {
  let range = oldRange;
  range.sort((a, b) => a[0] - b[0]);
  let overlaps;
  do {
    overlaps = false;
    const newRange = [];
    for (let i = 0; i < range.length; i++) {
      if (i < range.length - 1 && range[i][1] >= range[i + 1][0]) {
        overlaps = true;
        newRange.push([range[i][0], Math.max(range[i][1], range[i + 1][1])]);
        i++;
      } else {
        newRange.push(range[i]);
      }
    }
    range = newRange;
  } while (overlaps);

  return range;
}

function invertedRange(oldRange) {
  const range = normalizedRange(oldRange);
  const invertRange = [];
  for (let i = 0; i < range.length - 1; i++) {
    invertRange.push([range[i][1], range[i + 1][0]]);
  }
  return invertRange;
}

function randomInRange(oldRange) {
  const range = normalizedRange(oldRange);
  const magnitude = rangeSize(range);
  let rand = Math.random() * magnitude;
  for (let i = 0; i < range.length; i++) {
    const rangeletMagnitude = range[i][1] - range[i][0];
    if (rand > rangeletMagnitude) {
      rand -= rangeletMagnitude;
    } else {
      return range[i][0] + rand;
    }
  }

  //oh no
  return -1;
}

// {...,doors: {left: [begin, end], right: [begin, end], ...}}

function getVerticalRange(room, minSize) {
  const range = [];
  range.push([room.radiusBegin, room.radiusBegin + minSize]);
  range.push([room.radiusEnd - minSize, room.radiusEnd]);
  if (room.doors.left) {
    range.push(room.doors.left);
  }
  if (room.doors.right) {
    range.push(room.doors.right);
  }
  return invertedRange(range);
}

function isHorizontalWallPlaceable(room, minSize) {
  return getVerticalRange(room, minSize).length > 0;
}

function getHorizontalRange(room, minSize) {
  const range = [];
  const minAngle = arcLengthToAngle(minSize, room.radiusBegin);
  range.push([room.angleBegin, room.angleBegin + minAngle]);
  range.push([room.angleEnd - minAngle, room.angleEnd]);
  if (room.doors.top) {
    range.push(room.doors.top);
  }
  if (room.doors.bottom) {
    range.push(room.doors.bottom);
  }
  return invertedRange(range);
}

function isVerticalWallPlaceable(room, minSize) {
  return getHorizontalRange(room, minSize).length > 0;
}

function splitDoorsVertically(room, radius) {
  const bottomRoomDoors = noDoors();
  const topRoomDoors = noDoors();
  bottomRoomDoors.bottom = room.doors.bottom;
  topRoomDoors.top = room.doors.top;

  if (room.doors.left && room.doors.left[0] > radius) {
    topRoomDoors.left = room.doors.left;
  } else {
    bottomRoomDoors.left = room.doors.left;
  }

  if (room.doors.right && room.doors.right[0] > radius) {
    topRoomDoors.right = room.doors.right;
  } else {
    bottomRoomDoors.right = room.doors.right;
  }

  return {bottomRoomDoors, topRoomDoors};
}

function splitDoorsHorizontally(room, angle) {
  const leftRoomDoors = noDoors();
  const rightRoomDoors = noDoors();
  leftRoomDoors.left = room.doors.left;
  rightRoomDoors.right = room.doors.right;

  if (room.doors.bottom && room.doors.bottom[0] > angle) {
    rightRoomDoors.bottom = room.doors.bottom;
  } else {
    leftRoomDoors.bottom = room.doors.bottom;
  }

  if (room.doors.top && room.doors.top[0] > angle) {
    rightRoomDoors.top = room.doors.top;
  } else {
    leftRoomDoors.top = room.doors.top;
  }

  return {leftRoomDoors, rightRoomDoors};
}

function noDoors() {
  return {left: null, right: null, bottom: null, top: null};
}
