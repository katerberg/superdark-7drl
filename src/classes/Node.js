import {v4 as uuidv4} from 'uuid';

export class Node {
  id;
  room;
  polarPosition;
  door;
  neighbors;

  constructor({id, room, polarPosition, door, neighbors}) {
    this.id = id || uuidv4();
    this.room = room;
    this.door = door;
    this.polarPosition = polarPosition;
    this.neighbors = neighbors || [];
  }

  addNeighbor(neighbor) {
    this.neighbors.push(neighbor);
  }
}
