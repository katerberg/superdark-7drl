import {cartesianToPolar} from '../utils/math';

export class Room {
  angleBegin;
  angleEnd;
  radiusBegin;
  radiusEnd;
  doors;

  constructor(angleBegin, angleEnd, radiusBegin, radiusEnd, doors) {
    this.angleBegin = angleBegin;
    this.angleEnd = angleEnd;
    this.radiusBegin = radiusBegin;
    this.radiusEnd = radiusEnd;
    this.doors = doors;
  }

  isPointInRoom(x, y) {
    const polarStart = cartesianToPolar(x, y);
    return (
      polarStart.angle > this.angleBegin &&
      polarStart.angle < this.angleEnd &&
      polarStart.radius > this.radiusBegin &&
      polarStart.radius < this.radiusEnd
    );
  }
}
