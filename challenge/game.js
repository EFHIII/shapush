/*
TODO:
graphics:
asset creation
- animation stack
  - win
- add tutorial
- add levels
*/
let showAccess = true;
let code = false;
let beat = false;
let inc = 0.2;
(new URL(window.location.href)).searchParams.forEach((val, term) =>{
  switch(term.toLowerCase()){
    case "slow":
      inc = val.toLowerCase() == "true" ? inc = 0.05 : 0.5;

    break;
    case "showaccess":
      showAccess = val.toLowerCase() == "true";
    break;
    case "beat":
      beat = val.toLowerCase() == "true";
    break;
    case "code":
      code = val;
    break;
  }});
//initialize canvas
const c = document.getElementById("canvas");
const ctx = c.getContext("2d", { alpha: false });
c.style.backgroundColor = "red";
c.width = window.innerWidth;
c.height = window.innerHeight;
//check for mobile
function isMobile() {
  let prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
  let mq = function(query) {
    return window.matchMedia(query).matches;
  }

  if(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
    return true;
  }
  let query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
  return mq(query);
}

//initialize variables and constants
let w = c.width,
  h = c.height,
  mobile = isMobile(),
  last = true,
  mouseIsPressed = false;
let keys = [];
let mouseX = 0,
  mouseY = 0;
//check aspect ratio
let ARType = 1,
  min, minx, miny;

function getARType(AR) {
  if(AR < 0.8) { ARType = 1; } else if(AR > 1.2) { ARType = 3; } else { ARType = 2; }
  min = w > h ? h : w;
  minx = min;
  miny = min;
}
getARType(w / h);

let version = "0.6.2b";
let level = 0;

function hash(str){
  var hash = 0, i, chr;
  for (i = 0; i < str.length; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}
let levels = [
  {
    title: "Challenge",
    size: { width: 5, height: 5 },
    start: { x: 2, y: 2 },
    board: [
      [[1,-1],[3, 2],[3,-1],[2, 1],[2,-1]],
      [[1,-1],[0,-1],[0,-1],[0,-1],[2,-1]],
      [[1, 0],[0,-1],[0,-1],[0,-1],[2,-1]],
      [[4,-1],[0,-1],[0,-1],[0,-1],[5, 4]],
      [[4, 3],[4,-1],[0,-1],[5,-1],[5,-2]],
    ],
    stepGoals: [500, 500, 500, 500],
    best: 0
  },
];

let steps = 0,
  counter = 0;
let gameGrid = [];
let player = { x: 0, y: 0, facing: 0 };

//asset stuff
const colors = ["white", "grey", "#151515", "white", "blue"];

const tiles = [
  {
    img: groundTile,
    elevator: groundTile,
    elevatorTube: elevator0
  },
  {
    img: tile1,
    elevator: elevatorTile1,
    elevatorTube: elevator1
  },
  {
    img: tile2,
    elevator: elevatorTile2,
    elevatorTube: elevator2
  },
  {
    img: tile3,
    elevator: elevatorTile3,
    elevatorTube: elevator3
  },
  {
    img: tile4,
    elevator: elevatorTile4,
    elevatorTube: elevator4
  },
  {
    img: tile5,
    elevator: elevatorTile5,
    elevatorTube: elevator5
  },
  {
    img: tile6,
    elevator: elevatorTile6,
    elevatorTube: elevator6
  },
];

function button(x, y, w, h, callback, img, imgb) {
  if(img) {
    if(mouseX > x &&
      mouseX < x + w &&
      mouseY > y &&
      mouseY < y + h) {
      document.body.style.cursor = 'pointer';
      if(!last && mouseIsPressed) {
        callback();
        last = true;
      }
      ctx.drawImage(imgb, x >> 0, y >> 0, w >> 0, h >> 0);
    } else {
      ctx.drawImage(img, x >> 0, y >> 0, w >> 0, h >> 0);
    }
    return;
  }

  if(mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h) {
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    document.body.style.cursor = 'pointer';
    if(!last && mouseIsPressed) {
      callback();
      last = true;
    }
    ctx.fillRect(x >> 0, y >> 0, w >> 0, h >> 0);
  } else if(!img) {
    ctx.fillStyle = colors[2];
    ctx.fillRect(x >> 0, y >> 0, w >> 0, h >> 0);
  }
}

//animations
let moveHistory = [];
let movesMade = [];
const abc = "_-___________A0BCDEFGHIJKLM1NOPQRSTUVWXY2Zabcdefghijk3lmnopqrstuvw4xyzÀÁÂÃ5ÄÅÆÇ5ÈÉÊËÌÍÎÏÐÑÒÓ6ÔÕÖØÙÚÛÜÝÞßà7áâãäåæçèéêëì8íîïðñòóôõöøù!úû$&()@[]{}";

function stateString(state) {
  let w = levels[level].size.width;
  let h = levels[level].size.height;
  let t = '' + state[1] + state[2] + state[3];
  for(let i = 0; i < w; i++) {
    for(let j = 0; j < h; j++) {
      t += abc[state[0][i][j][0] * 13 + state[0][i][j][1] + 2];
    }
  }
  return t;
}

function parseState(str) {
  let w = levels[level].size.width;
  let h = levels[level].size.height;
  let state = [
    [], str[0] * 1, str[1] * 1, str[2] * 1
  ];
  for(let i = 0; i < w; i++) {
    state[0].push([]);
    for(let j = 0; j < h; j++) {
      state[0][i].push([abc.indexOf(str[3 + i * w + j]) / 13 >> 0, abc.indexOf(str[3 + i * w + j]) % 13 - 2]);
    }
  }
  return state;
}

let animationQueue = [];

function animate(keep) {
  if(animationQueue.length <= 0) { return; }
  switch (animationQueue[0][0]) {
    case ('facing'):
      if(player.facing === animationQueue[0][1]) {
        animationQueue.shift();
        animate(keep);
        break;
      }
      if(player.facing === 0 && animationQueue[0][1] === 3) {
        player.facing = 4;
      } else if(player.facing === 3 && animationQueue[0][1] === 0) {
        player.facing = -1;
      }
      player.facing += (animationQueue[0][1] - player.facing) * inc;
      if(player.facing - animationQueue[0][1] < 0) {
        player.facing += inc;
      } else {
        player.facing -= inc;
      }
      if(Math.abs(player.facing - animationQueue[0][1]) < inc) {
        player.facing = animationQueue[0][1];
        animationQueue.shift();
      }
      break;
    case ('playerPos'):
      if(player.x - animationQueue[0][1] < 0) {
        player.x += inc;
      } else if(player.x - animationQueue[0][1] > 0) {
        player.x -= inc;
      } else if(player.y - animationQueue[0][2] < 0) {
        player.y += inc;
      } else if(player.y - animationQueue[0][2] > 0) {
        player.y -= inc;
      }
      if(Math.abs(player.x - animationQueue[0][1]) < 0.05 && Math.abs(player.y - animationQueue[0][2]) < inc) {
        player.x = animationQueue[0][1];
        player.y = animationQueue[0][2];
        animationQueue.shift();
        if(!keep && gameGrid[player.x][player.y][1] === -2) {
          beatLevel();
        }
      }
      break;
    case ('moveBlock'):
      if(animationQueue[0][5] === 0) {
        for(let i = animationQueue[0][4].length - 1; i >= 0; i--) {
          gameGrid[animationQueue[0][4][i][0]][animationQueue[0][4][i][1]] = [0, -1];
        }
      }
      if(player.x - animationQueue[1][1] < 0) {
        player.x += inc;
      } else if(player.x - animationQueue[1][1] > 0) {
        player.x -= inc;
      } else if(player.y - animationQueue[1][2] < 0) {
        player.y += inc;
      } else if(player.y - animationQueue[1][2] > 0) {
        player.y -= inc;
      }

      animationQueue[0][5] += inc;
      if(animationQueue[0][5] >= 1) {
        for(let i = animationQueue[0][4].length - 1; i >= 0; i--) {
          gameGrid[animationQueue[0][4][i][0] + animationQueue[0][2]][animationQueue[0][4][i][1] + animationQueue[0][3]] = [animationQueue[0][1], animationQueue[0][4][i][2]];
        }
        animationQueue.shift();
        player.x = animationQueue[0][1];
        player.y = animationQueue[0][2];
        animationQueue.shift();
        if(!keep && gameGrid[player.x][player.y][1] === -2) {
          beatLevel();
        }
      };
      break;
  }
}

//game Objects
function moveBlock(block, x, y) {
  let W = levels[level].size.width;
  let H = levels[level].size.height;
  let ar = [];
  for(let i = W - 1; i >= 0; i--) {
    for(let j = H - 1; j >= 0; j--) {
      if(gameGrid[i][j][0] === block && (i + x < 0 || j + y < 0 || i + x >= W || j + y >= H || gameGrid[i + x][j + y][0] && gameGrid[i + x][j + y][0] != block)) {
        return;
      } else if(gameGrid[i][j][0] === block) {
        ar.push([i, j, gameGrid[i][j][1]]);
      }
    }
  }

  animationQueue.push(["moveBlock", block, x, y, ar, 0]);
  return true;
}

//game functions
function setupLevel(L) {
  keys[10] = false;
  moveHistory = [];
  movesMade = [];
  animationQueue = [];
  steps = 0;
  gameGrid = [];
  player.x = L.start.x;
  player.y = L.start.y;
  player.facing = 0;
  for(let i = 0; i < L.size.width; i++) {
    gameGrid.push([]);
    for(let j = 0; j < L.size.height; j++) {
      gameGrid[i].push(L.board[i][j]);
    }
  }
}

function imageInSquare(img, x, y, W, H, tx, ty) {
  switch (ARType) {
    case (1):
      ctx.drawImage(img, x * min, ty + y * min, W * min, H * min);
      break;
    case (2):
      if(w > h * 0.85) {
        ctx.drawImage(img, 0.5 * (w - h * 0.85) + x * (h * 0.85), 0.15 * h + y * (h * 0.85), W * h * 0.85, H * h * 0.85);
      } else {
        ctx.drawImage(img, x * min, 0.15 * h + y * min, W * min, H * min);
      }
      break;
    case (3):
      let mn = 0,
        px = 0,
        py = 0;
      if(min > 0.6 * w) {
        mn = 0.6 * w;
        px = (w - 0.6 * w) / 2;
        py = (h - 0.6 * w);
        if((h - (0.6 * w)) * 3.2 < w * 0.2) {
          py /= 2;
        }
      } else {
        mn = min;
        px = (w - min) / 2;
      }
      ctx.drawImage(img, px + mn * x, py + mn * y, mn * W, mn * H);
      break;
  }
}

function drawPlayer(x, y, facing, W, H, tx, ty, playerImg) {
  switch (ARType) {
    case (1):
      ctx.save();
      ctx.translate(W * x * min + 0.5 * W * min, ty + H * y * min + 0.5 * H * min);
      ctx.rotate(facing * Math.PI * 0.5);
      ctx.drawImage(playerImg, -0.5 * W * min, -0.5 * H * min, W * min, H * min);
      ctx.restore();
      break;
    case (2):
      if(w > h * 0.85) {
        ctx.save();
        ctx.translate(0.5 * (w - h * 0.85) + W * x * h * 0.85 + 0.5 * W * h * 0.85,
          0.15 * h + H * y * h * 0.85 + 0.5 * H * h * 0.85);
        ctx.rotate(facing * Math.PI * 0.5);
        ctx.drawImage(playerImg, -0.5 * W * h * 0.85, -0.5 * H * h * 0.85, W * h * 0.85, H * h * 0.85);
        ctx.restore();
      } else {
        ctx.save();
        ctx.translate(W * x * min + 0.5 * W * min, 0.15 * h + H * y * min + 0.5 * H * min);
        ctx.rotate(facing * Math.PI * 0.5);
        ctx.drawImage(playerImg, -0.5 * W * min, -0.5 * H * min, W * min, H * min);
        ctx.restore();
      }
      break;
    case (3):
      let mn = 0,
        px = 0,
        py = 0;
      if(min > 0.6 * w) {
        mn = 0.6 * w;
        px = (w - 0.6 * w) / 2;
        py = (h - 0.6 * w);
        if((h - (0.6 * w)) * 3.2 < w * 0.2) {
          py /= 2;
        }
      } else {
        mn = min;
        px = (w - min) / 2;
      }
      ctx.save();
      ctx.translate(px + W * x * mn + 0.5 * mn * W, py + H * y * mn + 0.5 * mn * H);
      ctx.rotate(facing * Math.PI * 0.5);
      ctx.drawImage(playerImg, -0.5 * mn * W, -0.5 * mn * H, mn * W, mn * H);
      ctx.restore();
      break;
  }
}

function movePlayer(x, y) {
  steps++;
  let ret = false;
  let curs = gameGrid[player.x][player.y];
  let nexs = [0, 0];
  let grabbing = !!(keys[32] || keys[16] || keys[10] || keys[13]);
  if(player.x + x >= 0 && player.x + x < levels[level].size.width &&
    player.y + y >= 0 && player.y + y < levels[level].size.height) {
    nexs = gameGrid[player.x + x][player.y + y];
    var fc = [0, 0];
    switch (player.facing) {
      case (0):
        fc = [0, 1];
        break;
      case (1):
        fc = [-1, 0];
        break;
      case (2):
        fc = [0, -1];
        break;
      case (3):
        fc = [1, 0];
        break;
    }
    let fcns = [0, 0];
    if(player.x + fc[0] >= 0 && player.y + fc[1] >= 0 && player.x + fc[0] < gameGrid.length && player.y + fc[1] < gameGrid[0].length) {
      fcns = gameGrid[player.x + fc[0]][player.y + fc[1]];
    }
    let rmp = curs[1] > 0;
    if(grabbing && (player.x + fc[0] < 0 || player.y + fc[1] < 0 || player.x + fc[0] >= levels[level].size.width || player.y + fc[1] >= levels[level].size.height)) {
      ret = true;
    } else if(grabbing && (curs[0] === nexs[0] || (fcns[0] === nexs[0] && (rmp || !curs[0] || !curs[1])) || !nexs[0] && (!curs[0] || rmp || !curs[1]))) {
      if(rmp && ((fc[0] === x && fc[1] === y && curs[0]) || nexs[0] === 0)) {
        steps--;
        return true;
      }
      ret = true;
      if(player.x + fc[0] >= 0 && player.y + fc[1] >= 0 && player.x + fc[0] < levels[level].size.width && player.y + fc[1] < levels[level].size.height) {
        if(fcns[0] > 0 && fcns[0] !== curs[0] && moveBlock(fcns[0], x, y)) {
          animationQueue.push(['playerPos', player.x + x, player.y + y]);
          return true;
        }
        if(fcns[0] !== curs[0] && fcns[0] !== 0) {
          steps--;
          return true;
        }
      }
    } else if(grabbing && nexs[0] > 0 && nexs[1] === curs[0]) {
      if(fcns[0] > 0 && (x !== fc[0] || y !== fc[1]) && fcns[0] !== curs && moveBlock(fcns[0], x, y)) {
        animationQueue.push(['playerPos', player.x + x, player.y + y]);
        return true;
      }
      if(fcns[0] !== curs[0] && fcns[0] !== 0) {
        steps--;
        return true;
      }
    } else if(grabbing && curs[0] > 0 && nexs[0] === curs[1]) {
      if(fcns[0] > 0 && fcns[0] !== nexs && moveBlock(fcns[0], x, y)) {
        if(fcns[0] === curs[0]) {
          animationQueue.pop();
        }
        animationQueue.push(['playerPos', player.x + x, player.y + y]);
        return true;
      } else if(fcns[0] !== nexs[0] && fcns[0] !== 0) {
        if(fcns[0] === curs[0]) {
          animationQueue.push(['playerPos', player.x + x, player.y + y]);
        } else { steps--; }
        return true;
      }
    }
    if(grabbing) { ret = true; }
    if(player.x + x < 0 || player.x + x >= levels[level].size.width ||
      player.y + y < 0 || player.y + y >= levels[level].size.height) {
      if(ret) { steps--; return true; }
      return;
    }
    if(curs[0] === nexs[0]) {
      animationQueue.push(['playerPos', player.x + x, player.y + y]);
      return ret;
    }
    if(nexs[0] > 0 && nexs[1] === curs[0]) {
      animationQueue.push(['playerPos', player.x + x, player.y + y]);
      return ret;
    }
    if(curs[0] > 0 && nexs[0] === curs[1]) {
      animationQueue.push(['playerPos', player.x + x, player.y + y]);
      return ret;
    }
    if(curs[1] > 0 && curs[1] === nexs[1]) {
      animationQueue.push(['playerPos', player.x + x, player.y + y]);
      return ret;
    }
  }
  if(grabbing) { steps--; return true; }
  if(ret) { steps--; return true; }
}

function undoMove() {
  if(animationQueue.length === 0 && moveHistory.length > 0) {
    let state = parseState(moveHistory.pop());
    gameGrid = state[0];
    player.x = state[1];
    player.y = state[2];
    player.facing = state[3];
    steps = moveHistory.length;
  }
}

function drawBoard(L, tx, ty) {
  var W = 1 / (L.size.width),
    H = 1 / (L.size.height);
  for(let i = L.size.width - 1; i >= 0; i--) {
    for(let j = L.size.height - 1; j >= 0; j--) {
      imageInSquare(groundTile, W * i, H * j, W, H, tx, ty);
    }
  }
  let tempAnimationQueue = JSON.stringify(animationQueue);
  let tempPlayer = JSON.stringify(player);
  let tempGrid = JSON.stringify(gameGrid);
  let tempSteps = steps;
  let len = animationQueue.length;
  while(animationQueue.length > 0 && animationQueue.length === len) {
    animate(true);
  }

  let accessQ = [
    [player.x >> 0, player.y >> 0]
  ];
  let access = [(player.x >> 0) + ',' + (player.y >> 0)];
  const OS = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0]
  ];
  let w = L.size.width,
    h = L.size.height;
  let targeta = gameGrid[player.x >> 0][player.y >> 0][0];
  let targetb = gameGrid[player.x >> 0][player.y >> 0][1];
  while(accessQ.length > 0) {
    let p = accessQ.shift();

    for(let i = 0; i < 4; i++) {
      let X = p[0] + OS[i][0];
      let Y = p[1] + OS[i][1];
      if(access.indexOf(X + ',' + Y) < 0 && X >= 0 && Y >= 0 && X < w && Y < h &&
        (gameGrid[X][Y][0] === targeta || gameGrid[X][Y][1] === targeta ||
          (targetb >= 0 && (gameGrid[X][Y][0] === targetb || gameGrid[X][Y][1] === targetb)))) {
        accessQ.push([X, Y]);
        access.push(X + ',' + Y);
      }
    }
  }

  animationQueue = JSON.parse(tempAnimationQueue);
  gameGrid = JSON.parse(tempGrid);
  player = JSON.parse(tempPlayer);

  for(let i = L.size.width - 1; i >= 0; i--) {
    for(let j = L.size.height - 1; j >= 0; j--) {
      if(access.indexOf(i + ',' + j) < 0) {
        if(showAccess){imageInSquare(outside, W * i, H * j, W, H, tx, ty);}
      }
    }
  }

  if(animationQueue.length > 0 && animationQueue[0][0] === 'moveBlock') {
    for(let i = 0; i < animationQueue[0][4].length; i++) {
      let good = false;
      for(let j = 0; j < 4; j++) {
        if(((OS[j][0] !== 0 && OS[j][0] !== -animationQueue[0][2]) ||
            (OS[j][1] !== 0 && OS[j][1] !== -animationQueue[0][3])) &&
          access.indexOf((animationQueue[0][2] + animationQueue[0][4][i][0] + OS[j][0]) + ',' + (animationQueue[0][3] + animationQueue[0][4][i][1] + OS[j][1]))) {
          //console.log(' - - - ' + (animationQueue[0][2] + animationQueue[0][4][i][0] + OS[j][0]) + ',' + (animationQueue[0][3] + animationQueue[0][4][i][1] + OS[j][1]));
          //console.log(OS[j][0] + ' - ' + animationQueue[0][2]);
          //console.log(OS[j][1] + ' - ' + animationQueue[0][3]);
          good = true;
          j = 4;
        }
      }
      if(good) {
        //imageInSquare(groundTile,W*(animationQueue[0][2]+animationQueue[0][4][i][0]),H*(animationQueue[0][3]+animationQueue[0][4][i][1]),W,H,tx,ty);
      }
    }
  }

  for(let j = 0; j < L.size.height; j++) {
    let bots = [];
    for(let i = gameGrid.length - 1; i >= 0; i--) {
      bots.push([]);
    }

    for(let i = gameGrid.length - 1; i >= 0; i--) {
      let nd = -1;
      if(animationQueue.length > 0 && animationQueue[0][0] === 'moveBlock') {
        for(let k = 0; k < animationQueue[0][4].length; k++) {
          if(animationQueue[0][4][k][0] === i && animationQueue[0][4][k][1] === j) {
            if(animationQueue[0][4][k][2] >= 0) {
              imageInSquare(tiles[animationQueue[0][4][k][2]].elevatorTube, W * (i + animationQueue[0][2] * animationQueue[0][5]), H * (j + animationQueue[0][3] * animationQueue[0][5]), W, H, tx, ty);
              imageInSquare(tiles[animationQueue[0][1]].elevator, W * (i + animationQueue[0][2] * animationQueue[0][5]), H * (j + animationQueue[0][3] * animationQueue[0][5]), W, H, tx, ty);
            } else {
              imageInSquare(tiles[animationQueue[0][1]].img, W * (i + animationQueue[0][2] * animationQueue[0][5]), H * (j + animationQueue[0][3] * animationQueue[0][5]), W, H, tx, ty);
            }
            if(animationQueue[0][4][k][2] === -2) {
              imageInSquare(goal, W * (i + animationQueue[0][2] * animationQueue[0][5]), H * (j + animationQueue[0][3] * animationQueue[0][5]), W, H, tx, ty);
            }
            if(animationQueue[0][4][k][2] !== gameGrid[player.x >> 0][player.y >> 0][0] || (player.x - (i + animationQueue[0][2] * animationQueue[0][5])) + (player.y - (j + animationQueue[0][3] * animationQueue[0][5])) > 1.5) {
              if(showAccess){imageInSquare(outside, W * (i + animationQueue[0][2] * animationQueue[0][5]), H * (j + animationQueue[0][3] * animationQueue[0][5]), W, H, tx, ty);}
            }
          }
        }
      }
      if(gameGrid[i][j][0]) {
        if(gameGrid[i][j][1] >= 0) {
          imageInSquare(tiles[gameGrid[i][j][1]].elevatorTube, W * i, H * j, W, H, tx, ty);
          imageInSquare(tiles[gameGrid[i][j][0]].elevator, W * i, H * j, W, H, tx, ty);
        } else {
          imageInSquare(tiles[gameGrid[i][j][0]].img, W * i, H * j, W, H, tx, ty);
        }
        if(access.indexOf(i + ',' + j) < 0) {
          if(showAccess){imageInSquare(outside, W * i, H * j, W, H, tx, ty);}
        }
      }
      if(gameGrid[i][j][1] === -2) {
        imageInSquare(goal, W * i, H * j, W, H, tx, ty);
      }
    }
  }

  let img = playerImg;
  if((keys[32] || keys[16] || keys[10] || keys[13]) && counter % 4 < 2) {
    img = playerImgA;
  } else if(keys[32] || keys[16] || keys[10] || keys[13]) {
    img = playerImgB;
  }
  drawPlayer(player.x, player.y, player.facing, W, H, tx, ty, img);
}

//scenes
const stars = [stars1, stars2, stars3, stars4];

const cABC = ["<","^",">","v","<*","^*",">*","v*"];

const b64c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

function compress(a){
  let bits = "";
  for(let i = 0; i < a.length; i++){
    bits += cABC.indexOf(a[i]).toString(2).padStart(3,0);
  }
  if(a.length%2){bits+="111";}
  let ans = "";
  for(let i = 0; i < bits.length; i+=6){
    ans += b64c[parseInt(bits.slice(i,i+6),2)];
  }
  return ans;
}

function decompress(a){
  let bits = "";
  for(let i = 0; i < a.length; i++){
    bits += b64c.indexOf(a[i]).toString(2).padStart(6,0);
  }
  let ans = "";
  for(let i = 0; i < bits.length; i += 3){
    ans += cABC[parseInt(bits.slice(i,i + 3), 2)] + " ";
  }
  return ans;
}

function inputMoves(moves){
    let bits = "";
    for(let i = 0; i < moves.length; i++){
      bits += b64c.indexOf(moves[i]).toString(2).padStart(6,0);
    }
    for(let i = 0; i < bits.length-3; i += 3){
      let id = parseInt(bits.slice(i,i + 3), 2);
      keys[10] = !!(id > 3);
      keyDown({keyCode:37+(id%4)});
    }
    if(bits.slice(bits.length-3,bits.length) != "111"){
      let id = parseInt(bits.slice(bits.length-3,bits.length), 2);
      keys[10] = !!(id > 3);
      keyDown({keyCode:37+(id%4)});
    }
    keys[10] = false;
}

function s0(tx, ty) {}
function s1(tx, ty) {}

function s2(tx, ty) {
  ctx.fillStyle = colors[0];
  switch (ARType) {
    case (1):
      ctx.font = (min / 15 >> 0) + "px sans-serif";
      ctx.textAlign = 'center';
      //ctx.fillText(steps+"/"+levels[level].stepGoals[3],0.3*w,0.1*(h-min)+min/16);
      ctx.fillText(steps + "/" + levels[level].stepGoals[3], 0.3 * w, 0.25 * (h - min) + (min / 15 >> 0) / 5);
      ctx.font = (min / 20 >> 0) + "px sans-serif";
      for(let i = 0; i < 4; i++) {
        //ctx.drawImage(stars[i], (0.4 + 0.1 * i) * w, -0.06 * w + 0.25 * (h - min), 0.1 * w, 0.1 * w);
        //ctx.fillText(levels[level].stepGoals[3 - i], (0.45 + 0.1 * i) * w, 0.06 * w + 0.25 * (h - min));
      }

      if(levels[level].best > 0) {
        ctx.font = (min / 24 >> 0) + "px sans-serif";
        ctx.fillText("best: " + levels[level].best, 0.3 * w, 0.25 * (h - min) + (min / 15 >> 0) * 0.8);
      }
      if(h / w > 1.4) {
        if(mobile){
          button(0,h-0.5*(h-min),w*0.8,0.5*(h-min),()=>{keys[10]=!keys[10]});
          ctx.drawImage(grab,0.4*w,h-(h-min)*0.25-0.1*w,0.2*w,0.2*w);

          button(0.8 * w, h-0.5*(h-min), 0.2 * w, 0.5*(h-min), () => { undoMove() });
          ctx.drawImage(undo,0.8 * w, h - (h - min) * 0.25 - 0.1 * w, 0.2 * w, 0.2 * w);
        }
        else{
        //button(0.4 * w, h - (h - min) * 0.25 - 0.1 * w, 0.2 * w, 0.2 * w, () => { keys[10] = !keys[10] }, grab, grabb);
          button(0.8 * w, h - (h - min) * 0.25 - 0.1 * w, 0.2 * w, 0.2 * w, () => { undoMove() }, undo, undob);
        }

        button(0.8 * w, (h - min) * 0.25 - 0.1 * w, 0.2 * w, 0.2 * w, () => { setupLevel(levels[level]) }, restart, restartb);
        //button(0, (h - min) * 0.25 - 0.1 * w, 0.2 * w, 0.2 * w, () => { sb = 1 }, backMini, backMinib);
      } else {
        if(mobile){
          button(0,h-0.5*(h-min),w*0.8,0.5*(h-min),()=>{keys[10]=!keys[10]});
          ctx.drawImage(grab,0.5*w-0.25*(h-min),h-0.5*(h-min),0.5*(h-min),0.5*(h-min));
          button(0.8 * w, h - 0.5 * (h - min), 0.2*w, 0.5*(h-min), () => { undoMove() });
          ctx.drawImage(undo,0.9 * w - 0.25 * (h - min), h - 0.5 * (h - min), 0.5 * (h - min), 0.5 * (h - min));
        }
        else{
        //button(0.5 * w - 0.25 * (h - min), h - 0.5 * (h - min), 0.5 * (h - min), 0.5 * (h - min), () => { keys[10] = !keys[10] }, grab, grabb);
        button(0.9 * w - 0.25 * (h - min), h - 0.5 * (h - min), 0.5 * (h - min), 0.5 * (h - min), () => { undoMove() }, undo, undob);
        }

        button(w - 0.5 * (h - min), 0, 0.5 * (h - min), 0.5 * (h - min), () => { setupLevel(levels[level]) }, restart, restartb);
        //button(0, 0, 0.5 * (h - min), 0.5 * (h - min), () => { sb = 1 }, backMini, backMinib);
      }
      break;
    case (2):
      ctx.font = (min / 14 >> 0) + "px sans-serif";
      ctx.textAlign = 'left';
      ctx.fillText(steps + "/" + levels[level].stepGoals[3], 0.15 * h, 0.08 * h);

      ctx.font = (0.03 * w * w / h >> 0) + "px sans-serif";
      ctx.textAlign = 'center';
      for(let i = 0; i < 4; i++) {
        //ctx.drawImage(stars[i], (0.6 - (4 * 0.07 * w / h) + 0.07 * w / h * (i + 0.5)) * w, 0, 0.07 * w * w / h, 0.07 * w * w / h);
        //ctx.fillText(levels[level].stepGoals[3 - i], (0.6 - (3.5 * 0.07 * w / h) + 0.07 * w / h * (i + 0.5)) * w, 0.08 * w * w / h);
      }

      if(levels[level].best > 0) {
        ctx.textAlign = 'left';
        ctx.font = (min / 30 >> 0) + "px sans-serif";
        ctx.fillText("best: " + levels[level].best, 0.15 * h, 0.08 * h + (min / 14 >> 0) * 0.5);
      }

      button(w - 0.25 * h - w / h * (w / h) * 50, 0, 0.14 * h, 0.14 * h, () => { undoMove() }, undo, undob);
      button(w - 0.13 * h - w / h * (w / h) * 20, 0, 0.14 * h, 0.14 * h, () => { setupLevel(levels[level]) }, restart, restartb);

      //button(0, 0, 0.14 * h, 0.14 * h, () => { sb = 1 }, backMini, backMinib);
      break;
    case (3):
      if(w / h > 2.6) {
        ctx.font = (h / 8 >> 0) + "px sans-serif";
        ctx.textAlign = 'right';
        ctx.fillText(steps + "/" + levels[level].stepGoals[3], 0.5 * (w - h), 0.2 * h + h / 8);

        if(levels[level].best > 0) {
          ctx.font = (h / 20 >> 0) + "px sans-serif";
          ctx.fillText("best: " + levels[level].best, 0.5 * (w - h), 0.2 * h + (h / 8) * 1.5);
        }

        ctx.textAlign = 'center';
        let SZ = 0.2 * h;
        ctx.font = (SZ / 3 >> 0) + "px sans-serif";
        for(let i = 0; i < 4; i++) {
          //ctx.drawImage(stars[i], SZ * i + 0.5 * w + 0.5 * h, 0, SZ, SZ);
          //ctx.fillText(levels[level].stepGoals[3 - i], SZ * (i + 0.5) + 0.5 * w + 0.5 * h, SZ);
        }

        //button(0.5 * w - h, 0, 0.5 * h, 0.2 * h, () => { sb = 1 }, back, backb);
        button(0.5 * w + 0.75 * h, 0.5 * h - 0.125 * h, 0.25 * h, 0.25 * h, () => { setupLevel(levels[level]) }, restart, restartb);
        button(0.5 * w + 0.5 * h, 0.5 * h - 0.125 * h, 0.25 * h, 0.25 * h, () => { undoMove() }, undo, undob);
      } else {
        ctx.font = (w / 20 >> 0) + "px sans-serif";
        ctx.textAlign = 'center';

        let SZ = Math.min(w * 0.15, (h - (0.6 * w)) * 0.8);
        if(SZ >= 0.05 * w) {
          ctx.fillText(steps + "/" + levels[level].stepGoals[3], 0.1 * w, 0.13 * w);

          ctx.font = (SZ / 3 >> 0) + "px sans-serif";
          for(let i = 0; i < 4; i++) {
            //ctx.drawImage(stars[i], SZ * i + 0.2 * w, 0, SZ, SZ);
            //ctx.fillText(levels[level].stepGoals[3 - i], SZ * (i + 0.5) + 0.2 * w, SZ);
          }

          if(levels[level].best > 0) {
            ctx.font = (w / 50 >> 0) + "px sans-serif";
            ctx.fillText("best: " + levels[level].best, 0.1 * w, 0.13 * w + (w / 20 >> 0) * 0.5);
          }
          if(mobile){
            button(0.05 * w, 0.5 * h - 0.05 * w, 0.1 * w, 0.1 * w, () => { keys[10] = !keys[10] }, grab, grabb);
          }
        } else {
          ctx.fillText(steps + "/" + levels[level].stepGoals[3], 0.1 * w, 0.2 * w);

          SZ = 0.05 * w;
          ctx.font = (SZ / 3 >> 0) + "px sans-serif";
          for(let i = 0; i < 4; i++) {
            //ctx.drawImage(stars[i], SZ * i, 0.08 * w, SZ, SZ);
            //ctx.fillText(levels[level].stepGoals[3 - i], SZ * (i + 0.5), SZ + 0.08 * w);
          }

          if(levels[level].best > 0) {
            ctx.font = (w / 50 >> 0) + "px sans-serif";
            ctx.fillText("best: " + levels[level].best, 0.1 * w, 0.21 * w + (w / 50 >> 0) * 0.75);
          }
          if(mobile){
            button(0.05 * w, 0.26 * w, 0.1 * w, 0.1 * w, () => { keys[10] = !keys[10] }, grab, grabb);
          }
        }

        button(0.85 * w, 0, 0.1 * w, 0.1 * w, () => { setupLevel(levels[level]) }, restart, restartb);
        button(0.85 * w, 0.5 * h - 0.05 * w, 0.1 * w, 0.1 * w, () => { undoMove() }, undo, undob);

        //button(0, 0, 0.2 * w, 0.08 * w, () => { sb = 1 }, back, backb);
      }
      break;
  }
  animate();
  drawBoard(levels[level], tx, ty);
  if(sb != 2){animationQueue = [];}
}
let scene = 2,
  sb = 2;
const scenes = [s0, s1, s2];
setupLevel(levels[0]);
//draw
let lt = 0;

function drawCanvas(t) {
  ctx.imageSmoothingQuality = "high";
  document.body.style.cursor = 'default';
  ctx.fillStyle = "#242729";
  ctx.fillRect(0, 0, w, h);
  /*
  target ARs:
  16:9
  1:1
  9:16
  */
  let tx = 0;
  let ty = 0;
  if(w > h) {
    tx = (w - min) / 2;
  } else {
    ty = (h - min) / 2;
  }

  scenes[scene](tx, ty);
  scene = sb;

  ctx.fillStyle = 'white';
  ctx.font = '20px sans-serif';
  ctx.textAlign = 'left';
  //ctx.fillText((1000/(t-lt)>>0)+" FPS",5,20);
  lt = t;

  if(t) {
    window.requestAnimationFrame(drawCanvas);
    counter++;
    if(counter > 127) { counter = 0; }
  }
}
window.requestAnimationFrame(drawCanvas);

//event listeners
var beatLevel = function() {
  if(levels[level].best < 0 || levels[level].best > steps) {
    levels[level].best = steps ? steps : levels[level].stepGoals[3];
  }
  if(levels[level].stepGoals[3] - steps < 0) {
    setupLevel(levels[level]);
    return;
  }
  drawCanvas(false);
  //sb = 1;
  let mm = compress(movesMade);
  if(!beat){
  document.getElementById('message').innerText = "CONGRATS! You solved the puzzle in " + movesMade.length + " moves!\n" + //"Message EFHIII#0462 on Discord with the following code to claim your prize!" +
  "\nCODE: " + mm;
  document.getElementById("msg-wrapper").style.display = "block";
    showAccess = false;
  }
  beat = true;

  console.log("moves: " + movesMade.length + "\nCODE: " + mm);
  setupLevel(levels[level]);
  inputMoves(mm);
};

window.onresize = () => {
  c.width = window.innerWidth;
  c.height = window.innerHeight;
  w = c.width;
  h = c.height;
  getARType(w / h);
}

const keyDown = (event) => {
  keys[event.keyCode] = true;
  if(scene === 2) {
    if(event.keyCode === 90) {
      undoMove();
      return;
    }
    if(event.keyCode === 82) {
      setupLevel(levels[level]);
      return;
    }
    if(event.keyCode === 32 || event.keyCode === 13 || event.keyCode === 16) {
      keys[10] = false;
      return;
    }
    //if(animationQueue.length > 4) { return; }
    let tempAnimationQueue = JSON.stringify(animationQueue);
    let tempPlayer = JSON.stringify(player);
    let tempGrid = JSON.stringify(gameGrid);
    let tempSteps = steps;
    while(animationQueue.length > 0) {
      animate(true);
    }
    if(tempSteps > 0 && steps === 0) {
      animationQueue = JSON.parse(tempAnimationQueue).concat(animationQueue);
      gameGrid = JSON.parse(tempGrid);
      player = JSON.parse(tempPlayer);
      steps = tempSteps;
      return;
    }
    var dt='';
    switch (event.keyCode) {
      case (37): //LEFT_ARROW
      case (65):
        dt="<";
        if(!movePlayer(-1, 0)) {
          if(player.facing === 1 && animationQueue.length === 0) { steps--; }
          animationQueue.unshift(["facing", 1]);
        }
        break;
      case (39): //RIGHT_ARROW
      case (68):
        dt=">";
        if(!movePlayer(1, 0)) {
          if(player.facing === 3 && animationQueue.length === 0) { steps--; }
          animationQueue.unshift(["facing", 3]);
        }
        break;
      case (38): //UP_ARROW
      case (87):
        dt="^";
        if(!movePlayer(0, -1)) {
          if(player.facing === 2 && animationQueue.length === 0) { steps--; }
          animationQueue.unshift(["facing", 2]);
        }
        break;
      case (40): //DOWN_ARROW
      case (83):
        dt="v";
        if(!movePlayer(0, 1)) {
          if(player.facing === 0 && animationQueue.length === 0) { steps--; }
          animationQueue.unshift(["facing", 0]);
        }
        break;
    }
    if(steps > tempSteps) {
      movesMade.push(dt+((keys[32] || keys[16] || keys[10] || keys[13])?"*":""));
      moveHistory.push(stateString([gameGrid, player.x, player.y, player.facing]));
    }
    animationQueue = JSON.parse(tempAnimationQueue).concat(animationQueue);
    gameGrid = JSON.parse(tempGrid);
    player = JSON.parse(tempPlayer);
  }
}

window.onkeydown = keyDown;

window.onkeyup = (event) => {
  keys[event.keyCode] = false;
}

window.onmousemove = (event) => {
  if(!mobile || mouseIsPressed) {
    mouseX = event.clientX;
    mouseY = event.clientY;
  }
}

window.onmouseup = (event) => {
  if(!mobile) {
    mouseIsPressed = true;
    last = false;
    drawCanvas(false);
    mouseIsPressed = false;
    last = true;
  }
}

window.onmouseleave = (event) => {
  mouseIsPressed = false;
  last = true;
}

let ltouch = [0, 0];
window.ontouchstart = (event) => {
  mouseX = event.touches[0].clientX;
  mouseY = event.touches[0].clientY;
  ltouch = [mouseX, mouseY];
  mouseIsPressed = true;
}
window.ontouchend = (event) => {
  if(animationQueue.length > 0) { return }
  if(scene === 2 && (mouseX - ltouch[0]) * (mouseX - ltouch[0]) + (mouseY - ltouch[1]) * (mouseY - ltouch[1]) > 200) {
    moveHistory.push(stateString([gameGrid, player.x, player.y, player.facing]));
    if((mouseX - ltouch[0]) / Math.abs(mouseY - ltouch[1]) < -2) {
      if(!movePlayer(-1, 0)) {
        if(player.facing === 1 && animationQueue.length === 0) { steps--;
          moveHistory.pop(); }
        animationQueue.splice(animationQueue.length - 1, 0, ["facing", 1]);
      }
    } else if((mouseX - ltouch[0]) / Math.abs(mouseY - ltouch[1]) > 2) {
      if(!movePlayer(1, 0)) {
        if(player.facing === 3 && animationQueue.length === 0) { steps--;
          moveHistory.pop(); }
        animationQueue.splice(animationQueue.length - 1, 0, ["facing", 3]);
      }
    } else if((mouseY - ltouch[1]) / Math.abs(mouseX - ltouch[0]) < -2) {
      if(!movePlayer(0, -1)) {
        if(player.facing === 2 && animationQueue.length === 0) { steps--;
          moveHistory.pop(); }
        animationQueue.splice(animationQueue.length - 1, 0, ["facing", 2]);
      }
    } else if((mouseY - ltouch[1]) / Math.abs(mouseX - ltouch[0]) > 2) {
      if(!movePlayer(0, 1)) {
        if(player.facing === 0 && animationQueue.length === 0) { steps--;
          moveHistory.pop(); }
        animationQueue.splice(animationQueue.length - 1, 0, ["facing", 0]);
      }
    }
  }

  mouseIsPressed = true;
  last = false;
  drawCanvas(false);
  mouseIsPressed = false;
  last = true;
  mouseX = -1;
  mouseY = -1;
}
/*
window.ontouchcancel = (event)=>{
  mouseX=-1;
  mouseY=-1;
  mouseIsPressed=false;
}*/

window.ontouchmove = (event) => {
  if(mouseIsPressed) {
    mouseX = event.touches[0].clientX;
    mouseY = event.touches[0].clientY;
  }
};

document.addEventListener('contextmenu', event => event.preventDefault());

if(code){inputMoves(code);}
