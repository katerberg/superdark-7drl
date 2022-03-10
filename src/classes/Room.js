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
}
