import clone from 'just-clone';
import * as Phaser from 'phaser';
import characterKnifeMove from '../assets/character-knife-move.png';
import characterLegsWalk from '../assets/character-legs-walk.png';
import characterPistolMove from '../assets/character-pistol-move.png';
import enemyKnifeMove from '../assets/enemy-knife-move.png';
import enemyRifleMove from '../assets/enemy-rifle-move.png';
import exitDownImage from '../assets/exit-down.png';
import exitUpImage from '../assets/exit-up.png';
import medKitImage from '../assets/medkit.png';
import steelTileset from '../assets/steel-tileset.jpg';
import winSwitchImage from '../assets/winSwitch.png';
import {BoundaryWall} from '../classes/BoundaryWall';
import {Chameleon} from '../classes/enemies/Chameleon';
import {ShootingEnemy} from '../classes/enemies/ShootingEnemy';
import {StabbingEnemy} from '../classes/enemies/StabbingEnemy';
import {Exit} from '../classes/Exit';
import {Node} from '../classes/Node';
import {MedKit} from '../classes/Pickup';
import {Player} from '../classes/Player';
import {SoundWave} from '../classes/SoundWave';
import {WinSwitch} from '../classes/WinSwitch';
import {
  COLORS,
  DEPTH,
  ENEMY_STAB,
  EVENTS,
  GAME_STATUS,
  LEVELS,
  PLAYER,
  PLAY_AREA,
  SCENES,
  WALLS,
  ROOMS,
  GAME,
  ENEMY_SHOOT,
} from '../constants';
import {isDebug} from '../utils/environments';
import {generateRooms} from '../utils/maps';
import {
  angleToArcLength,
  arcLengthToAngle,
  cartesianToPolar,
  distance,
  getMidpoint,
  getNormalized,
  offsetDegToRad,
  polarToCartesian,
} from '../utils/math';
import {createLevelExits, createWinSwitch, getBottomOfStairs, getCurrentHp} from '../utils/setup';
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
  playerProjectiles;
  walls;
  shadowWalls;
  shadows;
  soundWaves;
  exits;
  winSwitch;
  levelUpKey;
  levelDownKey;
  gameEndText;
  rooms;
  nodes;

  constructor() {
    super({
      key: SCENES.GAME,
    });
  }

  preload() {
    this.load.image('steel-tileset', steelTileset);
    this.load.spritesheet('characterPistolMove', characterPistolMove, {
      frameWidth: PLAYER.WIDTH,
      frameHeight: PLAYER.HEIGHT,
    });
    this.load.spritesheet('characterKnifeMove', characterKnifeMove, {
      frameWidth: PLAYER.KNIFE_WIDTH,
      frameHeight: PLAYER.KNIFE_HEIGHT,
    });
    this.load.spritesheet('characterLegsWalk', characterLegsWalk, {
      frameWidth: PLAYER.LEGS_WIDTH,
      frameHeight: PLAYER.LEGS_HEIGHT,
    });
    this.load.spritesheet('enemy-rifle-move', enemyRifleMove, {
      frameWidth: ENEMY_SHOOT.WIDTH,
      frameHeight: ENEMY_SHOOT.HEIGHT,
    });
    this.load.spritesheet('enemy-knife-move', enemyKnifeMove, {
      frameWidth: ENEMY_STAB.WIDTH,
      frameHeight: ENEMY_STAB.HEIGHT,
    });
    this.load.image('pickup-medkit', medKitImage);
    this.load.image('exit-up', exitUpImage);
    this.load.image('exit-down', exitDownImage);
    this.load.image('winSwitch', winSwitchImage);
    const {KeyCodes} = Phaser.Input.Keyboard;
    this.levelDownKey = this.input.keyboard.addKey(KeyCodes.L);
    this.levelUpKey = this.input.keyboard.addKey(KeyCodes.O);
  }

  create(startingInfo) {
    this.cameras.main.setBackgroundColor(COLORS.SHADOW);
    this.physics.world.setBounds(PLAY_AREA.xOffset, PLAY_AREA.yOffset, PLAY_AREA.width, PLAY_AREA.height);

    this.add.tileSprite(PLAY_AREA.width / 2, PLAY_AREA.height / 2, PLAY_AREA.width, PLAY_AREA.height, 'steel-tileset');

    this.boundaryWalls = this.physics.add.group(immovableOptions);
    this.shadowWalls = [];
    this.shadows = [];
    this.nodes = [];
    this.soundWaves = this.physics.add.group();
    this.enemies = this.physics.add.group();
    this.pickups = this.physics.add.group();
    this.projectiles = this.physics.add.group({runChildUpdate: true});
    this.playerProjectiles = this.physics.add.group({runChildUpdate: true});

    this.addPlayer(startingInfo);
    this.addExits();
    this.addWinSwitch();
    this.addRooms();
    this.makePaths();

    this.addEnemies();
    this.addPickups();

    this.game.events.emit(EVENTS.LEVEL_CHANGE);

    this.physics.add.overlap(this.player, this.exits, (_, exit) => this.handlePlayerExit(exit));
    // TODO: Figure out how to get the collision box to match angle
    this.physics.add.overlap(this.enemies, this.playerProjectiles, (enemy, projectile) => enemy.handleHit(projectile));
    this.physics.add.overlap(this.player, this.projectiles, (player, projectile) => player.handleHit(projectile));
    this.physics.add.overlap(this.player, this.pickups, (player, pickup) => pickup.pickup(player));
    this.physics.add.overlap(this.boundaryWalls, this.projectiles, (wall, projectile) => {
      const {x, y} = getMidpoint(wall.body, projectile.body);
      this.addSoundWave(x, y, projectile.weapon.soundRadiusOfUse, COLORS.ENEMY_GUN_FIRE);
      return this.removeProjectile(projectile);
    });
    this.physics.add.overlap(this.boundaryWalls, this.playerProjectiles, (wall, projectile) =>
      this.removePlayerProjectile(projectile),
    );
    this.physics.add.collider(this.player, this.boundaryWalls);
    this.physics.add.collider(this.player, this.enemies);
    this.physics.add.collider(this.enemies, this.boundaryWalls);
    this.physics.add.collider(this.enemies, this.exits);
    this.cameras.main.startFollow(this.player).setOrigin(GAME.cameraWidthRatio, GAME.cameraHeightRatio);
  }

  handleInput() {
    if (isDebug()) {
      if (this.levelDownKey.isDown) {
        const {currentLevel} = window.gameState;
        this.changeLevel(
          currentLevel === LEVELS.MAX_LEVEL ? currentLevel - 1 : currentLevel + 1,
          currentLevel === LEVELS.MAX_LEVEL,
          true,
        );
      }
      if (this.levelUpKey.isDown) {
        const {currentLevel} = window.gameState;
        this.changeLevel(
          currentLevel === LEVELS.MIN_LEVEL ? currentLevel + 1 : currentLevel - 1,
          currentLevel === LEVELS.MIN_LEVEL,
          true,
        );
      }
    }
  }

  changeLevel(level, isGoingUp, holdPosition) {
    window.gameState.currentLevel = level;
    const {x, y} = getBottomOfStairs(level, isGoingUp);
    this.scene.start(SCENES.GAME, {
      startingPosition: {
        x: holdPosition ? this.player.body.x : x,
        y: holdPosition ? this.player.body.y : y,
      },
      hp: this.hp,
      angle: 90,
    });
  }

  handlePlayerExit(exit) {
    const goingUp = window.gameState.currentLevel === exit.end;

    this.boundaryWalls.add(new BoundaryWall({scene: this, x: 200, y: 400, width: 200, height: 80}));
    this.changeLevel(goingUp ? exit.start : exit.end, goingUp);
  }

  handlePlayerWinSwitch() {
    this.game.events.emit(EVENTS.GAME_END, GAME_STATUS.WIN);
  }

  makeWalls(x1, y1, x2, y2) {
    const boundaryWalls = [];
    const shadowWalls = [];
    const xDistance = x2 - x1;
    const yDistance = y2 - y1;
    const wallLength = Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
    const nodeDiameter = WALLS.nodeRadius * 2;
    const numberOfNodes = Math.ceil(wallLength / nodeDiameter);
    const nodeDistanceX = xDistance / numberOfNodes;
    const nodeDistanceY = yDistance / numberOfNodes;
    for (let i = 0; i < numberOfNodes; i++) {
      boundaryWalls.push(new BoundaryWall({scene: this, x: x1 + i * nodeDistanceX, y: y1 + i * nodeDistanceY}));
    }

    const normal = getNormalized({x: y2 - y1, y: x1 - x2});
    const inner1 = {x: x1 - normal.x * WALLS.nodeRadius, y: y1 - normal.y * WALLS.nodeRadius};
    const outer1 = {x: x1 + normal.x * WALLS.nodeRadius, y: y1 + normal.y * WALLS.nodeRadius};
    const inner2 = {x: x2 - normal.x * WALLS.nodeRadius, y: y2 - normal.y * WALLS.nodeRadius};
    const outer2 = {x: x2 + normal.x * WALLS.nodeRadius, y: y2 + normal.y * WALLS.nodeRadius};
    shadowWalls.push(
      [inner1.x, inner1.y, outer1.x, outer1.y],
      [inner2.x, inner2.y, outer2.x, outer2.y],
      [inner1.x, inner1.y, inner2.x, inner2.y],
      [outer1.x, outer1.y, outer2.x, outer2.y],
    );
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
    let wallInnerPosition = polarToCartesian(wallAngle, radius - WALLS.nodeRadius);
    let wallOuterPosition = polarToCartesian(wallAngle, radius + WALLS.nodeRadius);
    shadowWalls.push([wallInnerPosition.x, wallInnerPosition.y, wallOuterPosition.x, wallOuterPosition.y]);
    for (let i = 1; i <= numberOfNodes; i++) {
      const newWallAngle = angleBegin + (i / numberOfNodes) * angleDiff;
      const newWallPosition = polarToCartesian(newWallAngle, radius);
      const newWallInnerPosition = polarToCartesian(newWallAngle, radius - WALLS.nodeRadius);
      const newWallOuterPosition = polarToCartesian(newWallAngle, radius + WALLS.nodeRadius);
      boundaryWalls.push(new BoundaryWall({scene: this, x: wallPosition.x, y: wallPosition.y}));
      shadowWalls.push(
        [wallInnerPosition.x, wallInnerPosition.y, newWallInnerPosition.x, newWallInnerPosition.y],
        [wallOuterPosition.x, wallOuterPosition.y, newWallOuterPosition.x, newWallOuterPosition.y],
      );
      wallAngle = newWallAngle;
      wallPosition = newWallPosition;
      wallInnerPosition = newWallInnerPosition;
      wallOuterPosition = newWallOuterPosition;
    }
    shadowWalls.push([wallInnerPosition.x, wallInnerPosition.y, wallOuterPosition.x, wallOuterPosition.y]);
    return {boundaryWalls, shadowWalls};
  }

  //{doorEntry: {
  //  door: [startValueOfDoor, endValueOfDoor] // curved wall are start and end angle, straight are radius from center
  // }}
  makePaths() {
    this.rooms.forEach((room) => {
      const nodes = [];
      Object.entries(room.doors).forEach((doorEntry) => {
        const [position, door] = doorEntry;
        if (door) {
          const node = new Node({room, polarPosition: {}, door});

          if (position === 'left') {
            node.polarPosition.radius = (door[0] + door[1]) / 2;
            node.polarPosition.angle =
              room.angleBegin + arcLengthToAngle(ROOMS.nodeDistance, node.polarPosition.radius);
          } else if (position === 'right') {
            node.polarPosition.radius = (door[0] + door[1]) / 2;
            node.polarPosition.angle = room.angleEnd - arcLengthToAngle(ROOMS.nodeDistance, node.polarPosition.radius);
          } else if (position === 'top') {
            node.polarPosition.angle = (door[0] + door[1]) / 2;
            node.polarPosition.radius = room.radiusEnd - ROOMS.nodeDistance;
          } else if (position === 'bottom') {
            node.polarPosition.angle = (door[0] + door[1]) / 2;
            node.polarPosition.radius = room.radiusBegin + ROOMS.nodeDistance;
          }
          nodes.push(node);
        }
      });

      // connect em all
      nodes.forEach((node, nodeIndex) => {
        node.neighbors = [];
        nodes.forEach((neighborNode, neighborIndex) => {
          if (nodeIndex !== neighborIndex) {
            node.addNeighbor({
              number: this.nodes.length + neighborIndex,
              distance: distance(node.polarPosition, neighborNode.polarPosition),
            });
          }
        });
      });

      this.nodes = [...this.nodes, ...nodes];
      // push to this.nodes
    });

    this.nodes.forEach((node, nodeIndex) => {
      this.nodes.forEach((otherNode, otherNodeIndex) => {
        // TODO: fix asap. dirtiest hack ever.
        if (nodeIndex !== otherNodeIndex && node.door[0] === otherNode.door[0] && node.door[1] === otherNode.door[1]) {
          node.addNeighbor({
            number: otherNodeIndex,
            distance: distance(node.polarPosition, otherNode.polarPosition),
          });
        }
      });
    });

    this.basePath = this.findPath({x: 1350, y: 100}, {x: 1150, y: 100});
    if (isDebug()) {
      this.drawBasePath();
    }
  }

  drawBasePath() {
    this.nodes.forEach((node, nodeIndex) => {
      const position = polarToCartesian(node.polarPosition.angle, node.polarPosition.radius);
      const circle = new Phaser.Geom.Circle(position.x, position.y, 5);
      const graphics = this.add.graphics();
      graphics.fillStyle(0xff0000, 1);
      graphics.lineStyle(2, 0xff0000, 1);
      graphics.fillCircleShape(circle);
      this.add.text(position.x, position.y, `${nodeIndex}`);
      node.neighbors.forEach((neighborNode) => {
        const neighborPosition = polarToCartesian(
          this.nodes[neighborNode.number].polarPosition.angle,
          this.nodes[neighborNode.number].polarPosition.radius,
        );
        const line = new Phaser.Geom.Line(position.x, position.y, neighborPosition.x, neighborPosition.y);
        graphics.strokeLineShape(line);
      });
    });

    this.basePath.forEach((point, pointIndex) => {
      if (pointIndex < this.basePath.length - 1) {
        const graphics = this.add.graphics();
        graphics.lineStyle(4, 0xff9999, 1);
        const line = new Phaser.Geom.Line(
          point.x,
          point.y,
          this.basePath[pointIndex + 1].x,
          this.basePath[pointIndex + 1].y,
        );
        graphics.strokeLineShape(line);
      }
    });
  }

  findPath(start, end) {
    // find what rooms start and end are in and generate new nodes array incorporating them
    // (how do i generate if they're in a doorway?)
    const polarStart = cartesianToPolar(start.x, start.y);
    const polarEnd = cartesianToPolar(end.x, end.y);
    let startRoom, endRoom;
    this.rooms.forEach((room) => {
      if (room.isPointInRoom(start.x, start.y)) {
        startRoom = room;
      }
      if (room.isPointInRoom(end.x, end.y)) {
        endRoom = room;
      }
    });

    if (startRoom === endRoom) {
      return [start, end];
    }

    const newNodes = clone(this.nodes).map((n) => new Node(n));
    const startIndex = newNodes.length;
    const endIndex = newNodes.length + 1;
    newNodes.push(new Node({room: startRoom, polarPosition: polarStart}));
    newNodes.push(new Node({room: endRoom, polarPosition: polarEnd}));

    newNodes.forEach((node, nodeIndex) => {
      if (nodeIndex < startIndex) {
        if (node.room.id === startRoom.id) {
          const nodeDistance = distance(node.polarPosition, polarStart);
          node.addNeighbor({number: startIndex, distance: nodeDistance});
          newNodes[startIndex].addNeighbor({number: nodeIndex, distance: nodeDistance});
        }
        if (node.room.id === endRoom.id) {
          const nodeDistance = distance(node.polarPosition, polarEnd);
          node.addNeighbor({number: endIndex, distance: nodeDistance});
          newNodes[endIndex].addNeighbor({number: nodeIndex, distance: nodeDistance});
        }
      }
    });

    const frontier = [];
    frontier.push({index: startIndex, priority: 0});
    const cameFrom = {};
    cameFrom[startIndex] = -1; // not sure if that's right
    const costSoFar = {};
    costSoFar[startIndex] = 0;
    while (frontier.length > 0) {
      const nodeIndex = frontier.pop().index;
      if (nodeIndex === endIndex) {
        break;
      }
      newNodes[nodeIndex].neighbors.forEach((neighborNode) => {
        const neighborNodeIndex = neighborNode.number;
        const costToNeighbor =
          costSoFar[nodeIndex] + distance(newNodes[nodeIndex].polarPosition, newNodes[neighborNodeIndex].polarPosition);
        if (typeof costSoFar[neighborNodeIndex] === 'undefined' || costToNeighbor < costSoFar[neighborNodeIndex]) {
          costSoFar[neighborNodeIndex] = costToNeighbor;
          const priority =
            costToNeighbor + distance(newNodes[neighborNodeIndex].polarPosition, newNodes[endIndex].polarPosition);
          cameFrom[neighborNodeIndex] = nodeIndex;
          frontier.push({index: neighborNodeIndex, priority});
          frontier.sort((a, b) => b.priority - a.priority);
        }
      });
    }

    const nodeIndexPath = [endIndex];
    let nextNodeIndex;
    while (cameFrom[nextNodeIndex] !== -1) {
      nextNodeIndex = nodeIndexPath[nodeIndexPath.length - 1];
      nodeIndexPath.push(cameFrom[nextNodeIndex]);
    }
    nodeIndexPath.pop();
    nodeIndexPath.reverse();

    const pointPath = [];
    nodeIndexPath.forEach((nodeIndex) => {
      pointPath.push({
        ...polarToCartesian(newNodes[nodeIndex].polarPosition.angle, newNodes[nodeIndex].polarPosition.radius),
        nodeIndex,
      });
    });
    return pointPath;

    //! add start to frontier with priority 0
    //! make came_from array. given an node index, shows what node it came from
    //! came_from[start] is null
    //! make cost_so_far array. distance travelled from start position to node
    //! cost_so_far[start] is 0
    //! while frontier is not empty:
    //!    currentNode = frontier.get()
    //!    if currentNode == end:
    //!      we're done, break
    //!    for each neighbor of currentNode.neighbors:
    //!      cost_to_neighbor = cost_so_far[currentNode] + distance(currentNode, neighbor)
    //!      if neighbor isn't in cost_so_far, or this is a shorter path (cost_to_neighbor is less than cost_so_far[neighbor]):
    //!        cost_so_far[neighbor] = cost_to_neighbor
    //!        priority = cost_to_neighbor + distance(neighbor, end)
    //!        add (neighbor, priority) to frontier
    //!        came_from[neighbor] = currentNode
  }

  addSoundWave(x, y, radius, color) {
    this.soundWaves.add(
      new SoundWave({
        scene: this,
        x,
        y,
        radius,
        color,
      }),
    );
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

  addPickups() {
    if (isDebug()) {
      this.pickups.add(new MedKit({scene: this, x: 1350, y: 150}));
    }

    // Add medkit to a random room that isn't the startin two or ending two
    this.pickups.add(
      new MedKit({scene: this, ...this.rooms[Math.floor(Math.random() * (this.rooms.length - 4)) + 2].getCenterish()}),
    );
  }

  addEnemies() {
    this.addShootingEnemy();
    this.addChameleon();
    for (let i = 0; i <= Math.floor(this.rooms.length / 4); i++) {
      this.addStabbingEnemy();
    }
  }

  addChameleon() {
    // Disallow first 4 rooms, and ensure that there is some space to walk
    const path = this.basePath.slice(1, 4);
    const [{x, y}] = path;
    this.enemies.add(new Chameleon({scene: this, x, y, path}));
  }

  addShootingEnemy() {
    // Disallow first 4 rooms, and ensure that there is some space to walk
    const firstNode = this.basePath.length - 8;
    const path = this.basePath.slice(firstNode, firstNode + 4);
    const [{x, y}] = path;
    this.enemies.add(new ShootingEnemy({scene: this, x, y, path}));
  }

  addStabbingEnemy() {
    // Disallow first 4 rooms, and ensure that there is some space to walk
    const firstNode = Math.floor(Math.random() * (this.basePath.length - 8)) + 4;
    const path = this.basePath.slice(firstNode, firstNode + 4);
    const [{x, y}] = path;
    this.enemies.add(new StabbingEnemy({scene: this, x, y, path}));
  }

  addProjectile(projectile) {
    this.projectiles.add(projectile);
  }

  addPlayerProjectile(projectile) {
    this.playerProjectiles.add(projectile);
  }

  removePlayerProjectile(projectile) {
    this.playerProjectiles.remove(projectile, true, true);
  }

  removeProjectile(projectile) {
    this.projectiles.remove(projectile, true, true);
  }

  removeExtraProjectiles(time) {
    this.projectiles.children.each((p) => {
      if (time > p.weapon.range + p.shotTime) {
        this.removeProjectile(p);
      }
    });
    this.playerProjectiles.children.each((p) => {
      if (time > p.weapon.range + p.shotTime) {
        this.removePlayerProjectile(p);
      }
    });
  }

  addPlayer(startingInfo) {
    this.player = new Player({
      scene: this,
      x: startingInfo?.startingPosition?.x || PLAY_AREA.width / 2 + 50,
      y: startingInfo?.startingPosition?.y || 50,
      hp: getCurrentHp(startingInfo),
      key: 'characterPistolMove',
      angle: startingInfo?.angle || 60,
    });
    this.player.play('knifeMove');
  }

  update(time) {
    if (window.gameState.paused) {
      this.enemies.children.iterate((e) => e.setAlpha(1));
      this.scene.pause();
    }
    const timeAwareOfPauses = getTimeAwareOfPauses(time);
    if (this.player) {
      this.player.update(timeAwareOfPauses);
    }
    this.enemies.children.iterate((enemy) => {
      enemy.update(timeAwareOfPauses);
    });
    this.handleInput();
    // this.clearShadows();
    this.drawShadows();
    this.removeExtraProjectiles(timeAwareOfPauses);
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
    if (!isDebug()) {
      this.drawObstacleShadows();
      // this.drawPeripheralShadows();
    }
  }

  drawObstacleShadows() {
    const p = {x: this.player.x, y: this.player.y};
    const dirtyMultiplier = 10000;

    // set of two points
    this.shadowWalls.forEach((wall, i) => {
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

      let graphics = this.shadows[i];
      if (!graphics) {
        graphics = this.add.graphics();
        this.shadows.push(graphics);
      }
      graphics.clear();
      graphics.fillStyle(COLORS.SHADOW);
      graphics.setDepth(DEPTH.SHADOWS);
      graphics.beginPath();

      graphics.moveTo(w1.x, w1.y);
      graphics.lineTo(w1.x + dirtyMultiplier * m1.x, w1.y + dirtyMultiplier * m1.y);
      graphics.lineTo(w2.x + dirtyMultiplier * m2.x, w2.y + dirtyMultiplier * m2.y);
      graphics.lineTo(w2.x, w2.y);

      graphics.closePath();
      graphics.fillPath();
    });
  }

  drawPeripheralShadows() {
    let graphics = this.shadows[this.shadows.length - 1];
    if (this.shadows.length === this.shadowWalls.length) {
      graphics = this.add.graphics();
      this.shadows.push(graphics);
      graphics.setScrollFactor(0);
      const glowOptions = {glowColor: 0x000, innerStrength: 1, outerStrength: 4, quality: 0.1};
      this.plugins.get('rexGlowFilterPipeline').add(graphics, glowOptions);
    }
    graphics.clear();
    graphics.fillStyle(COLORS.SHADOW);
    graphics.setDepth(DEPTH.SHADOWS);
    graphics.beginPath();

    graphics.arc(
      GAME.width / 2,
      GAME.height / 2,
      75,
      Phaser.Math.DegToRad(this.player.angle - PLAYER.VISION_ANGLE / 2),
      Phaser.Math.DegToRad(this.player.angle + PLAYER.VISION_ANGLE / 2),
      true,
    );

    graphics.arc(
      GAME.width / 2,
      GAME.height / 2,
      GAME.maxDistance,
      Phaser.Math.DegToRad(this.player.angle + PLAYER.VISION_ANGLE / 2),
      Phaser.Math.DegToRad(this.player.angle - PLAYER.VISION_ANGLE / 2),
      false,
    );

    graphics.closePath();
    graphics.fillPath();
  }

  addRooms() {
    this.rooms = window.gameState.levels[window.gameState.currentLevel].rooms;
    if (!this.rooms?.length) {
      this.rooms = generateRooms();
      window.gameState.levels[window.gameState.currentLevel].rooms = this.rooms;
    }

    if (isDebug()) {
      this.drawFloorplan();
    }

    this.addWalls();
  }

  addWalls() {
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
    this.addCurvyWall(0, 360, ROOMS.maxRadius);
  }

  addWall(angle, radiusBegin, radiusEnd) {
    const beginWall = polarToCartesian(angle, radiusBegin);
    const endWall = polarToCartesian(angle, radiusEnd);
    const walls = this.makeWalls(beginWall.x, beginWall.y, endWall.x, endWall.y);
    walls.boundaryWalls.forEach((w) => {
      this.boundaryWalls.add(w);
    });
    walls.shadowWalls.forEach((w) => {
      // [x1, y1, x2, y2]
      this.shadowWalls.push(w);
    });
  }

  addCurvyWall(angleBegin, angleEnd, radius) {
    const walls = this.makeCurvyWalls(angleBegin, angleEnd, radius);
    walls.boundaryWalls.forEach((w) => {
      this.boundaryWalls.add(w);
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
