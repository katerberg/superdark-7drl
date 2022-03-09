import {WEAPON_EVENT} from '../constants';
import {getRealTime} from '../utils/time';

class Weapon {
  range;
  size;
  damage;
  currentAmmunition;
  maxAmmunition;
  storedAmmunition;
  useTime;
  reloadTime;
  soundRadiusOfUse;
  active;
  lastShot = -10000;

  constructor(
    image,
    active = false,
    range = 100,
    size = 20,
    damage = 1,
    currentAmmunition = 999_999_999,
    maxAmmunition = 999_999_999,
    storedAmmunition = 999_999_999,
    useTime = 1000,
    reloadTime = 1000,
    soundRadiusOfUse = 300,
  ) {
    this.image = image;
    this.active = active;
    this.range = range;
    this.size = size;
    this.damage = damage;
    this.currentAmmunition = currentAmmunition;
    this.maxAmmunition = maxAmmunition;
    this.storedAmmunition = storedAmmunition;
    this.useTime = useTime;
    this.reloadTime = reloadTime;
    this.soundRadiusOfUse = soundRadiusOfUse;
  }

  setActive() {
    this.active = true;
  }

  setInactive() {
    this.active = false;
  }

  getAmmoText() {
    return `${this.currentAmmunition}/${this.storedAmmunition > 100_000 ? '∞' : this.storedAmmunition}`;
  }

  use(time) {
    if (time > this.lastShot + this.useTime) {
      window.gameState.runUntil[getRealTime(this.useTime + time)] = 'item use';
      this.lastShot = time;
      if (this.currentAmmunition) {
        --this.currentAmmunition;
        return WEAPON_EVENT.FIRED;
      }
      return WEAPON_EVENT.OUT_OF_AMMO;
    }
    return WEAPON_EVENT.NOT_READY;
  }

  reload() {
    this.currentAmmunition = this.maxAmmunition;
  }
}

export class Revolver extends Weapon {
  constructor(active) {
    super('weapon-revolver', active, 100, 20, 1, 5, 6);
  }
}
