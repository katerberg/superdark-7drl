import {LEVELS, GAME} from '../constants';

export function createLevelExits(level) {
  if (window.gameState.levels[level].exits.length) {
    return;
  }
  if (level !== LEVELS.MIN_LEVEL) {
    //add upstairs
    const start = level - 1;
    let x = Math.floor(Math.random() * GAME.width);
    let y = Math.floor(Math.random() * GAME.height);

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
    //add downstairs
    const end = level + 1;
    let x = Math.floor(Math.random() * GAME.width);
    let y = Math.floor(Math.random() * GAME.height);

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
