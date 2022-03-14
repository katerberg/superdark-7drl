import {EVENTS} from '../constants';
import {getRealTime} from '../utils/time';
import {Knife, Revolver, Smg} from './Weapon';

export class Inventory {
  scene;
  weaponSlots;
  gear;
  swapFinish;

  constructor(scene) {
    this.scene = scene;
    this.weaponSlots = [new Knife(scene, true), new Revolver(scene), new Smg(scene)]; //Weapon[]
    this.gear = []; //Gear[]
  }

  getActiveWeapon() {
    return this.weaponSlots.find((weapon) => weapon.active);
  }

  handleInput(timeAwareOfPauses, keys) {
    const inventoryKey = Object.keys(keys).find((key) => ['1', '2', '3', '4', '5'].includes(key) && keys[key].isDown);
    if (inventoryKey) {
      this.handleSwapStart(timeAwareOfPauses, Number.parseInt(inventoryKey, 10) - 1);
    }
  }

  handleSwapStart(timeAwareOfPauses, newActiveSlotNumber) {
    this.weaponSlots.forEach((s, i) => {
      s.activating = false;
      if (i === newActiveSlotNumber) {
        this.scene.game.events.emit(EVENTS.SWAPPING_START, i + 1);

        this.scene.player.play(s.characterMoveAnimation);
        this.swapFinish = s.swapTime + timeAwareOfPauses;
        s.activating = true;
        window.gameState.runUntil[getRealTime(this.swapFinish)] = 'item swap';
      }
      s.setInactive();
    });
  }

  handleSwapFinish(timeAwareOfPauses) {
    if (this.swapFinish && this.swapFinish < timeAwareOfPauses) {
      this.swapFinish = null;
      const slot = this.weaponSlots.find((s) => s.activating);
      slot.setActive();
      this.scene.game.events.emit(EVENTS.SWAPPING_FINISH, this.weaponSlots.indexOf(slot) + 1);
    }
  }

  update(timeAwareOfPauses, keys) {
    this.handleInput(timeAwareOfPauses, keys);
    this.handleSwapFinish(timeAwareOfPauses);
  }
}
