const readline = require('readline');
const player = require('play-sound')();

const duckFrame =
  [
    "   _          _          _          _          _          ",
    " >(')____,  >(')____,  >(')____,  >(')____,  >(') ___,    ",
    "   (` =~~/    (` =~~/    (` =~~/    (` =~~/    (` =~~/    ",
    "~^~^`---'~^~^~^`---'~^~^~^`---'~^~^~^`---'~^~^~^`---'~^~^~"
  ];

const shots = [];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function getFrameLineWithShots(lineIndex, clearColumnIndex) {
  const line = duckFrame[lineIndex];
  const shotsForLine = shots[lineIndex] || [];
  shotsForLine[clearColumnIndex] = false;

  return shotsForLine.reduce(function(line, isShot, shotColumnIndex) {

    if (isShot) {
      return line.substr(0, shotColumnIndex) + 'X' + line.substr(shotColumnIndex + 1);
    }

    return line;
  }, line);
}

function getFrame(columnIndex) {
  return duckFrame.map(function(line, lineIndex) {
    const shotLine = getFrameLineWithShots(lineIndex, columnIndex);
    return shotLine.substr(columnIndex, shotLine.length - columnIndex) +
      shotLine.substr(0, columnIndex);
  });
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

function shoot(frame) {
  player.play(__dirname + '/../resources/gunshot.mp3');

  const shotLineIndex = Math.floor(Math.random() * duckFrame.length);
  const shotColumnIndex = Math.floor(Math.random() * duckFrame[0].length);
  if (!shots[shotLineIndex]) {
    shots[shotLineIndex] = [];
  }
  shots[shotLineIndex][shotColumnIndex] = true;

  removeFrame([true]);
  removeFrame(frame);
  renderFrame(frame);
}

function animate() {
  var frameIndex = 0;
  var frame = getFrame(frameIndex);
  renderFrame(frame);

  rl.on('line', function(cmd) {
    if (cmd === '') {
      shoot(frame);
    }
  });

  setInterval(function() {
    removeFrame(frame);

    frameIndex += 1;
    if (frameIndex >= frame[0].length) {
      frameIndex = 0;
    }

    frame = getFrame(frameIndex);
    renderFrame(frame);
  }, 200);
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
