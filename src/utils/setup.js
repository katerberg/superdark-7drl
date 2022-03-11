import {LEVELS, GAME, EXITS, PLAYER} from '../constants';
import {isDebug} from './environments';

export function createLevelExits(level) {
  if (window.gameState.levels[level].exits.length) {
    return;
  }
  if (level !== LEVELS.MIN_LEVEL) {
    //add up stairs
    const start = level - 1;
    let x = (level % 2) * EXITS.DISTANCE_BETWEEN_STAIRS + EXITS.LEFT_STAIRS_X_OFFSET;
    let y = EXITS.Y_OFFSET;

    const connectingExit = window.gameState.levels[start].exits.find((e) => e.end === level);
    if (connectingExit) {
      ({x} = connectingExit);
      ({y} = connectingExit);
    }

    window.gameState.levels[level].exits.push({
      x,
      y,
      start,
      end: level,
      direction: 'up',
    });
  }
  if (level !== LEVELS.MAX_LEVEL) {
    //add down stairs
    const end = level + 1;
    let x = ((level + 1) % 2) * EXITS.DISTANCE_BETWEEN_STAIRS + EXITS.LEFT_STAIRS_X_OFFSET;
    let y = EXITS.Y_OFFSET;

    const connectingExit = window.gameState.levels[end].exits.find((e) => e.end === level);
    if (connectingExit) {
      ({x} = connectingExit);
      ({y} = connectingExit);
    }

    window.gameState.levels[level].exits.push({
      x,
      y,
      start: level,
      end,
      direction: 'down',
    });
  }
}

export function createWinSwitch() {
  if (window.gameState.winSwitch.x) {
    return;
  }
  const x = Math.floor(Math.random() * GAME.width);
  const y = Math.floor(Math.random() * GAME.height);

  window.gameState.winSwitch.x = x;
  window.gameState.winSwitch.y = y;
}

export function getCurrentHp(startingInfo) {
  let hp = startingInfo?.hp;
  if (!hp) {
    hp = isDebug() ? PLAYER.MAX_HP_DEBUG : PLAYER.MAX_HP;
  }
  return hp;
}
