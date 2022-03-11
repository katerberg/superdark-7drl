import {v4 as uuidv4} from 'uuid';
import {cartesianToPolar, polarToCartesian} from '../utils/math';

export class Room {
  id;
  angleBegin;
  angleEnd;
  radiusBegin;
  radiusEnd;
  doors;

  constructor(angleBegin, angleEnd, radiusBegin, radiusEnd, doors) {
    this.id = uuidv4();
    this.angleBegin = angleBegin;
    this.angleEnd = angleEnd;
    this.radiusBegin = radiusBegin;
    this.radiusEnd = radiusEnd;
    this.doors = doors;
  }

  getCenterish() {
    const {x: xStart, y: yStart} = polarToCartesian(this.angleBegin, this.radiusBegin);
    const {x: xEnd, y: yEnd} = polarToCartesian(this.angleEnd, this.radiusEnd);
    return {x: (xEnd + xStart) / 2, y: (yEnd + yStart) / 2};
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
