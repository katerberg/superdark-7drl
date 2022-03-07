export function getNormalized(vector) {
  const magnitude = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
  return {x: vector.x / magnitude, y: vector.y / magnitude};
}
