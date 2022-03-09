import * as Phaser from 'phaser';
import {PLAY_AREA} from '../constants';

export function getNormalized(vector) {
  const magnitude = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
  return {x: vector.x / magnitude, y: vector.y / magnitude};
}

export function minimumTwoDigits(number) {
  return number.toLocaleString('en-US', {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
}

export function offsetDegToRad(deg) {
  return Phaser.Math.DegToRad(deg - 90);
}

export function offsetRadToDeg(rad) {
  return Phaser.Math.RadToDeg((rad + Math.PI / 2) % (Math.PI * 2));
}

export function angleToArcLength(angle, radius) {
  return 2 * Math.PI * radius * (angle / 360);
}

export function arcLengthToAngle(arclength, radius) {
  return (arclength * 360) / (2 * Math.PI * radius);
}

export function polarToCartesian(angle, radius) {
  const x = PLAY_AREA.width / 2 + radius * Math.cos(offsetDegToRad(angle));
  const y = PLAY_AREA.height / 2 + radius * Math.sin(offsetDegToRad(angle));
  return {x, y};
}

export function cartesianToPolar(x, y) {
  const xNew = x - PLAY_AREA.width / 2;
  const yNew = y - PLAY_AREA.height / 2;
  const radius = Math.sqrt(Math.pow(xNew, 2) + Math.pow(yNew, 2));
  console.log('xNew', xNew);
  console.log('yNew', yNew);
  const angle = offsetRadToDeg(Math.atan(yNew / xNew)) + (xNew > 0 ? 0 : 180);
  return {angle, radius};
}

export function distance(pointA, pointB) {
  let A, B;
  if (pointA.x) {
    A = pointA;
  } else {
    A = polarToCartesian(pointA.angle, pointA.radius);
  }
  if (pointB.x) {
    B = pointB;
  } else {
    B = polarToCartesian(pointB.angle, pointB.radius);
  }

  return Math.sqrt(Math.pow(A.x - B.x, 2) + Math.pow(A.y - B.y, 2));
}
