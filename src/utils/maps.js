import {Room} from '../classes/Room';
import {ROOMS} from '../constants/index';
import {angleToArcLength, arcLengthToAngle} from './math';

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

function getVerticalRange(room) {
  const range = [];
  range.push([room.radiusBegin, room.radiusBegin + ROOMS.minSize]);
  range.push([room.radiusEnd - ROOMS.minSize, room.radiusEnd]);
  if (room.doors.left) {
    range.push(room.doors.left);
  }
  if (room.doors.right) {
    range.push(room.doors.right);
  }
  return invertedRange(range);
}

function isHorizontalWallPlaceable(room) {
  return getVerticalRange(room, ROOMS.minSize).length > 0;
}

function getHorizontalRange(room) {
  const range = [];
  const minAngle = arcLengthToAngle(ROOMS.minSize, room.radiusBegin);
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

function isVerticalWallPlaceable(room) {
  return getHorizontalRange(room, ROOMS.minSize).length > 0;
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

function getCompletelyRandomRoom(rooms, excludeSides = 2) {
  return rooms[Math.floor(Math.random() * (rooms.length - excludeSides * 2)) + excludeSides];
}

export function getRandomRoom(rooms, excludeSides = 2, onlySecondHalf) {
  let room;
  while (!room) {
    room = getCompletelyRandomRoom(rooms, excludeSides);
    if (onlySecondHalf && room.angleBegin < 180) {
      room = undefined;
    }
  }
  return room;
}

export function generateRooms() {
  let rooms = [new Room(0, 360, ROOMS.minRadius, ROOMS.maxRadius, noDoors())];

  let splittable;
  do {
    splittable = false;
    const newRooms = [];
    //eslint-disable-next-line no-loop-func
    rooms.forEach((r) => {
      const radiusDiff = r.radiusEnd - r.radiusBegin;
      const angleDiff = r.angleEnd - r.angleBegin;
      const midRadius = (r.radiusBegin + r.radiusEnd) / 2;

      const height = radiusDiff;
      const width = angleToArcLength(angleDiff, midRadius);

      if (height <= ROOMS.maxSize && width <= ROOMS.maxSize) {
        newRooms.push(r);
      } else if (isHorizontalWallPlaceable(r) && (height > width || !isVerticalWallPlaceable(r))) {
        // room is tall or room is not splittable horizontally, then split it vertically
        splittable = true;
        const newRadius = randomInRange(getVerticalRange(r));
        const splitDoorSet = splitDoorsVertically(r, newRadius);
        const newWallWidth = angleToArcLength(angleDiff, newRadius);
        const newDoorOffset = Math.random() * (newWallWidth - ROOMS.doorSize);
        const newDoorBegin = r.angleBegin + arcLengthToAngle(newDoorOffset, newRadius);
        const newDoorEnd = newDoorBegin + arcLengthToAngle(ROOMS.doorSize, newRadius);
        const newDoor = [newDoorBegin, newDoorEnd];
        splitDoorSet.bottomRoomDoors.top = newDoor;
        splitDoorSet.topRoomDoors.bottom = newDoor;

        newRooms.push(new Room(r.angleBegin, r.angleEnd, r.radiusBegin, newRadius, splitDoorSet.bottomRoomDoors));
        newRooms.push(new Room(r.angleBegin, r.angleEnd, newRadius, r.radiusEnd, splitDoorSet.topRoomDoors));
      } else if (isVerticalWallPlaceable(r)) {
        // otherwise split it horizontally
        splittable = true;
        const newAngle = randomInRange(getHorizontalRange(r));
        const splitDoorSet = splitDoorsHorizontally(r, newAngle);
        const newDoorOffset = Math.random() * (radiusDiff - ROOMS.doorSize);
        const newDoorBegin = r.radiusBegin + newDoorOffset;
        const newDoorEnd = newDoorBegin + ROOMS.doorSize;
        const newDoor = [newDoorBegin, newDoorEnd];
        splitDoorSet.leftRoomDoors.right = newDoor;
        splitDoorSet.rightRoomDoors.left = newDoor;

        newRooms.push(new Room(r.angleBegin, newAngle, r.radiusBegin, r.radiusEnd, splitDoorSet.leftRoomDoors));
        newRooms.push(new Room(newAngle, r.angleEnd, r.radiusBegin, r.radiusEnd, splitDoorSet.rightRoomDoors));
      } else {
        // can't split room b/c of doors
        newRooms.push(r);
      }
    });
    rooms = newRooms;
  } while (splittable);

  // this.addWalls();
  return rooms;
}
