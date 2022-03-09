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
}
