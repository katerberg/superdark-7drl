import {v4 as uuidv4} from 'uuid';

export class Node {
  id;
  room;
  polarPosition;
  door;
  neighbors = [];

  constructor(room, polarPosition, door) {
    this.id = uuidv4();
    this.room = room;
    this.door = door;
    this.polarPosition = polarPosition;
  }

  addNeighbor(neighbor) {
    this.neighbors.push(neighbor);
  }
}
