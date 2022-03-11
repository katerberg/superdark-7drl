import {Knife, Revolver} from './Weapon';

export class Inventory {
  weaponSlots;
  gear;

  constructor() {
    this.weaponSlots = [new Revolver(true), new Knife()]; //Weapon[]
    this.gear = []; //Gear[]
  }

  getActiveWeapon() {
    return this.weaponSlots.find((weapon) => weapon.active);
  }
}
