class Weapon {
  range;
  size;
  damage;
  currentAmmunition;
  maxAmmunition;
  useTime;
  reloadTime;
  soundRadiusOfUse;
  active;

  constructor(
    active = false,
    range = 100,
    size = 20,
    damage = 1,
    currentAmmunition = 999_999_999,
    maxAmmunition = 999_999_999,
    useTime = 1000,
    reloadTime = 1000,
    soundRadiusOfUse = 300,
  ) {
    this.active = active;
    this.range = range;
    this.size = size;
    this.damage = damage;
    this.currentAmmunition = currentAmmunition;
    this.maxAmmunition = maxAmmunition;
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

  useAmmo() {
    if (this.currentAmmunition) {
      return --this.currentAmmunition;
    }
    return 0;
  }

  reload() {
    this.currentAmmunition = this.maxAmmunition;
  }
}

export class Revolver extends Weapon {
  constructor() {
    super(false, 100, 20, 1, 5, 6);
  }
}
