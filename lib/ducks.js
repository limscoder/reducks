const readline = require('readline');
const player = require('play-sound')();

const duckFrame =
  [
    "   _          _          _          _          _          ",
    " >(')____,  >(')____,  >(')____,  >(')____,  >(') ___,    ",
    "   (` =~~/    (` =~~/    (` =~~/    (` =~~/    (` =~~/    ",
    "~^~^`---'~^~^~^`---'~^~^~^`---'~^~^~^`---'~^~^~^`---'~^~^~"
  ];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function getFrame(index) {
  return duckFrame.map(function(line) {
    return line.substr(index, line.length - index) + line.substr(0, index);
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

function animate() {
  var frameIndex = 0;
  var frame = getFrame(frameIndex);
  renderFrame(frame);

  setInterval(function() {
    removeFrame(frame);

    frameIndex += 1;
    if (frameIndex >= frame[0].length) {
      frameIndex = 0;
    }

    frame = getFrame(frameIndex);
    renderFrame(frame);
  }, 250);
}

function quack() {
  const timeout = Math.random() * (5000 - 500) + 500;

  setTimeout(function() {
    player.play('../resources/quack.mp3');
    quack();
  }, timeout);
}

module.exports.animate = animate;
module.exports.quack = quack;
