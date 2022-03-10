export class MoveTarget {
  x;
  y;
  angle; // optional

  constructor(x, y, angle) {
    this.x = x;
    this.y = y;

    if (typeof angle === 'number') {
      this.angle = angle;
    }
  }

  hasAngle() {
    return typeof this.angle === 'number';
  }

  matches(x, y) {
    return Math.abs(this.x - x) < 10 && Math.abs(this.y - y) < 10;
  }
}
