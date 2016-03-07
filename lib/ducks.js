const readline = require('readline');
const player = require('play-sound')();

const duckFrame =
  [
    "   _              _          _            _              _          ",
    " >(')____,      >(')____,  >(')____,    >(')____,      >(') ___,    ",
    "   (` =~~/        (` =~~/    (` =~~/      (` =~~/        (` =~~/    ",
    "~^~^`---'~^~^~^~^~^`---'~^~^~^`---'~^~^~^~^`---'~^~^~^~^~^`---'~^~^~"
  ];
const frameLength = duckFrame[0].length;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function getFrameLineWithShots(lineIndex, frameContext) {
  const shotPositions = frameContext.shotPositions;
  const line = duckFrame[lineIndex];
  const shotsForLine = shotPositions[lineIndex] || [];

  return shotsForLine.reduce(function(line, isShot, shotColumnIndex) {
    if (isShot) {
      return line.substr(0, shotColumnIndex) + 'X' + line.substr(shotColumnIndex + 1);
    }

    return line;
  }, line);
}

function getTargetLine(frameContext) {
  const targetIndex = frameContext.targetIndex;
  return Array(targetIndex).join('_') + '^' +
    Array(frameLength - targetIndex).join('_');
}

function getFrame(frameContext) {
  const columnIndex = frameContext.frameIndex;
  const scoreLine = frameContext.score.toString() + ' points';
  const frame = duckFrame.map(function(line, lineIndex) {
    const shotLine = getFrameLineWithShots(lineIndex, frameContext);
    return shotLine.substr(columnIndex, shotLine.length - columnIndex) +
      shotLine.substr(0, columnIndex);
  });
  const targetLine = getTargetLine(frameContext);

  frame.push(targetLine);
  frame.unshift(scoreLine);
  return frame;
}

function renderFrame(frame) {
  frame.forEach(function (frame) {
    rl.write(frame + '\n');
  });
}

function removeFrame(frame) {
  frame.forEach(function (frame) {
    readline.moveCursor(process.stdout, 0, -1);
    readline.clearLine(process.stdout, 0);
  });
}

function isHit(lineIndex, columnIndex) {
  const onDuckLine = lineIndex === 1 || lineIndex === 2;
  return onDuckLine ? duckFrame[lineIndex][columnIndex] !== ' ' : false;
}

function isBonus(lineIndex, columnIndex) {
  return duckFrame[lineIndex][columnIndex] !== '>';
}

function updateScore(lineIndex, columnIndex, frameContext) {
  if (isHit(lineIndex, columnIndex)) {
    const score = isBonus(lineIndex, columnIndex) ? 75 : 10;
    const streakBonus = (10 * frameContext.hitStreak);
    frameContext.score += score + streakBonus;
    frameContext.hitStreak += 1;
  } else {
    frameContext.score -= 10;
    frameContext.hitStreak = 0;
  }
}

function shoot(frame, frameContext) {
  const frameIndex = frameContext.frameIndex;
  const targetIndex = frameContext.targetIndex;
  const shotPositions = frameContext.shotPositions;

  const shotLineIndex = Math.floor(Math.random() * (duckFrame.length - 1));
  const shotColumnIndex = frameIndex + targetIndex;
  const adjustedColumnIndex = shotColumnIndex > frameLength ?
    shotColumnIndex - frameLength : shotColumnIndex;

  if (!shotPositions[shotLineIndex]) {
    shotPositions[shotLineIndex] = [];
  }
  shotPositions[shotLineIndex][adjustedColumnIndex] = true;

  updateScore(shotLineIndex, shotColumnIndex, frameContext);
  animateShot(frame, frameContext);
}

function animateShot(frame, frameContext) {
  player.play(__dirname + '/../resources/gunshot.mp3');
  removeFrame([true]); // input line
  removeFrame(frame);
  renderFrame(getFrame(frameContext));
}

function clearStaleShots(frameContext) {
  const frameIndex = frameContext.frameIndex;

  frameContext.shotPositions.forEach(function(line) {
    line[frameIndex] = false;
  });
}

function animateDucks(frameContext) {
  if (frameContext.moveDucks) {
    frameContext.frameIndex += 1;
    if (frameContext.frameIndex >= frameLength) {
      frameContext.frameIndex = 0;
    }
    frameContext.moveDucks = false;
  } else {
    frameContext.moveDucks = true;
  }

  clearStaleShots(frameContext);
}

function animateTarget(frameContext) {
  frameContext.targetIndex = frameContext.targetIndex + frameContext.targetDirection;
  if (frameContext.targetIndex >= frameLength) {
    frameContext.targetDirection = -1;
  } else if (frameContext.targetIndex <= 0) {
    frameContext.targetDirection = 1;
  }
}

function animate() {
  const frameContext = {
    moveDucks: false,
    frameIndex: 0,
    targetDirection: 1,
    targetIndex: Math.floor(frameLength / 2),
    shotPositions: [],
    score: 0,
    hitStreak: 0
  };

  var frame = getFrame(frameContext);
  renderFrame(frame);

  rl.on('line', function(cmd) {
    // listen for shots
    if (cmd === '') {
      shoot(frame, frameContext);
    }
  });

  setInterval(function() {
    animateDucks(frameContext);
    animateTarget(frameContext);

    removeFrame(frame);
    frame = getFrame(frameContext);
    renderFrame(frame);
  }, 75);
}

function quack() {
  const timeout = Math.random() * (5000 - 500) + 500;

  setTimeout(function() {
    player.play(__dirname + '/../resources/quack.mp3');
    quack();
  }, timeout);
}

module.exports.animate = animate;
module.exports.quack = quack;
