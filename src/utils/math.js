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
