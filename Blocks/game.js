/*
TODO:
graphics:
asset creation
- animation stack
  - win
- undo button
- add tutorial
- add levels
*/

function cook(v){
  useCookies = v;
  document.getElementById("msg-wrapper").style.display = 'none';
}

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

let version = "0.6.6";
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
    title: "Claustrophobic",
    size: { width: 5, height: 5 },
    start: { x: 2, y: 2 },
    board: [
      [4,4,0,3,0],
      [4,0,0,3,3],
      [0,1,0,0,0],
      [1,1,0,2,2],
      [0,1,0,2,0]
    ],
    goal: [
      [1,1,0,0,1],
      [1,1,1,1,1],
      [1,1,0,0,1],
      [1,1,0,0,0],
      [0,0,0,0,0]
    ],
    best: -1
  },
  {
    title: "Tight spaces",
    size: { width: 5, height: 5 },
    start: { x: 0, y: 1 },
    board: [
      [1,0,0,4,0],
      [1,1,0,4,4],
      [0,0,0,0,0],
      [3,3,0,2,2],
      [3,0,0,2,0]
    ],
    goal: [
      [0,0,1,1,0],
      [1,1,1,0,0],
      [1,1,0,0,0],
      [1,1,1,0,0],
      [1,1,0,0,0]
    ],
    best: 0
  },
  {
    title: "A-4",// puzzle 240
    size: { width: 5, height: 5 },
    start: { x: 2, y: 2 },
    board: [
      [1,1,1,0,0],
      [0,2,2,2,0],
      [3,5,0,0,0],
      [3,4,4,0,0],
      [3,0,4,0,0]
    ],
    goal: [
      [0,0,1,1,1],
      [0,1,0,1,0],
      [1,1,0,1,0],
      [0,1,0,1,0],
      [0,0,1,1,1],
    ],
    best: 0
  },
  {
    title:"Challenge",
    size:{width:5,height:5},
    start:{x:2,y:2},
    board:[
      [1,3,3,2,2],
      [1,0,0,0,2],
      [1,0,0,0,2],
      [4,0,0,0,5],
      [4,4,0,5,5]
    ],
    goal: [
      [1,0,0,1,0],
      [1,1,1,1,1],
      [1,1,1,0,1],
      [0,0,1,1,1],
      [0,0,1,0,0]
    ],
    best:0
  }
];

let steps = 0,
  counter = 0;
let gameGrid = [];

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
const abc = "_-___________A0BCDEFGHIJKLM1NOPQRSTUVWXY2Zabcdefghijk3lmnopqrstuvw4xyzÀÁÂÃ5ÄÅÆÇ5ÈÉÊËÌÍÎÏÐÑÒÓ6ÔÕÖØÙÚÛÜÝÞßà7áâãäåæçèéêëì8íîïðñòóôõöøù!úû$&()@[]{}";

function stateString(state) {
  let w = levels[level].size.width;
  let h = levels[level].size.height;
  let t = '';
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
  let state = [[]];
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
    case ('moveBlock'):
      if(animationQueue[0][5] === 0) {
        for(let i = animationQueue[0][4].length - 1; i >= 0; i--) {
          gameGrid[animationQueue[0][4][i][0]][animationQueue[0][4][i][1]] = 0;
        }
      }

      animationQueue[0][5] += 0.2;
      if(animationQueue[0][5] >= 1) {
        for(let i = animationQueue[0][4].length - 1; i >= 0; i--) {
          gameGrid[animationQueue[0][4][i][0] + animationQueue[0][2]][animationQueue[0][4][i][1] + animationQueue[0][3]] = animationQueue[0][1];
        }
        animationQueue.shift();
        animationQueue.shift();
        if(!keep && checkBeaten()) {
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
      if(gameGrid[i][j] === block && (i + x < 0 || j + y < 0 || i + x >= W || j + y >= H || gameGrid[i + x][j + y] && gameGrid[i + x][j + y] != block)) {
        return;
      } else if(gameGrid[i][j] === block) {
        ar.push([i, j]);
      }
    }
  }

  for(var i=0; i < ar.length; i++){
    gameGrid[ar[i][0]][ar[i][1]] = 0;
  }
  for(var i=0; i < ar.length; i++){
    gameGrid[ar[i][0]+x][ar[i][1]+y] = block;
  }

  return true;
}

//game functions
function setupLevel(L) {
  keys[10] = false;
  moveHistory = [];
  animationQueue = [];
  steps = 0;
  gameGrid = [];
  for(let i = 0; i < L.size.width; i++) {
    gameGrid.push([]);
    for(let j = 0; j < L.size.height; j++) {
      gameGrid[i].push(L.board[i][j]);
    }
  }
}

let boardB = [0,0,0,0];

function imageInSquare(img, x, y, W, H, tx, ty) {
  switch (ARType) {
    case (1):
      ctx.drawImage(img, x * min, ty + y * min, W * min, H * min);
      boardB = [0,ty,min];
      break;
    case (2):
      if(w > h * 0.85) {
        ctx.drawImage(img, 0.5 * (w - h * 0.85) + x * (h * 0.85), 0.15 * h + y * (h * 0.85), W * h * 0.85, H * h * 0.85);
        boardB = [0.5 * (w - h * 0.85), 0.15 * h, (h * 0.85)];
      } else {
        ctx.drawImage(img, x * min, 0.15 * h + y * min, W * min, H * min);
        boardB = [0,h,min];
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
      boardB = [px,py,mn];
      break;
  }
}

function undoMove() {
  if(animationQueue.length === 0 && moveHistory.length > 0) {
    let state = parseState(moveHistory.pop());
    gameGrid = state[0];
    steps = moveHistory.length;
  }
}

movedBlockp = [0,0];

function drawBoard(L, tx, ty) {
  var W = 1 / (L.size.width),
    H = 1 / (L.size.height);
  for(let i = L.size.width - 1; i >= 0; i--) {
    for(let j = L.size.height - 1; j >= 0; j--) {
      imageInSquare(groundTile, W * i, H * j, W, H, tx, ty);
    }
  }

  for(let j = 0; j < L.size.height; j++) {
    for(let i = gameGrid.length - 1; i >= 0; i--) {
      if(gameGrid[i][j] > 0) {
        if(gameGrid[i][j] === moveBlockn){
          imageInSquare(tiles[gameGrid[i][j]].img, W * i + movedBlockp[0], movedBlockp[1] + H * j, W, H, tx, ty);
        }
        else{
          imageInSquare(tiles[gameGrid[i][j]].img, W * i, H * j, W, H, tx, ty);
        }
      }
    }
  }

  for(let j = 0; j < L.size.height; j++) {
    for(let i = gameGrid.length - 1; i >= 0; i--) {
      if(levels[level].goal[i][j]) {
        imageInSquare(target, W * i, H * j, W, H, tx, ty);
      }
    }
  }
}

//scenes
const stars = [stars1, stars2, stars3, stars4];

function s0(tx, ty) {
  ctx.drawImage(title, tx >> 0, ty >> 0, min >> 0, min >> 0);
  switch (ARType) {
    case (1):
      button(0.1 * w, 0.55 * h, 0.8 * w, 0.3 * w, () => { sb = 1 }, play, playb);
      if(window.innerHeight == screen.height) {
        button(0.84 * w, h - 0.16 * w, 0.15 * w, 0.15 * w, () => { document.exitFullscreen() }, exitFullscreen, exitFullscreenb);
      } else {
        button(0.75 * w, h - 0.25 * w, 0.2 * w, 0.2 * w, () => { document.body.requestFullscreen() }, fullscreen, fullscreenb);
      }
      break;
    case (2):
      button(0.2 * w, 0.6 * h, 0.6 * w, 0.2 * w, () => { sb = 1 }, play, playb);
      if(window.innerHeight == screen.height) {
        button(0.84 * w, h - 0.16 * w, 0.15 * w, 0.15 * w, () => { document.exitFullscreen() }, exitFullscreen, exitFullscreenb);
      } else {
        button(0.82 * w, h - 0.18 * w, 0.15 * w, 0.15 * w, () => { document.body.requestFullscreen() }, fullscreen, fullscreenb);
      }
      break;
    case (3):
      button(0.5 * (w - min) + min * 0.2, 0.6 * h, 0.6 * min, 0.2 * min, () => { sb = 1 }, play, playb);
      if(window.innerHeight == screen.height) {
        button(0.89 * w, h - 0.11 * w, 0.1 * w, 0.1 * w, () => { document.exitFullscreen() }, exitFullscreen, exitFullscreenb);
      } else {
        button(0.89 * w, h - 0.11 * w, 0.1 * w, 0.1 * w, () => { document.body.requestFullscreen() }, fullscreen, fullscreenb);
      }
      break;
  }
  ctx.fillStyle = colors[0];
  ctx.textAlign = 'left';
  ctx.font = (0.03 * min >> 0) + "px sans-serif";
  ctx.fillText("v" + version, 0.05 * w, h - 0.01 * min);
  ctx.textAlign = 'center';
  ctx.fillText("By Edward Haas @efhiii", w / 2, h - 0.01 * min);
}

let warpImages = {
  "start": homeImg,
  "A": plainImg,
    "A2": right,
  "B": duneImg,
  "art": artImg,
  "abc": abcImg,
    "abc2": right,
  "E": lock,
  "expert": hotImg,
  "a": AImg,
  "b": BImg,
  "c": CImg,
};

let levelSelect = {
  "start": {
    map: [
      //["art", 0, "abc", 0, "expert"],
      [0, 0, 0, 0],
      [0, 1, 2, 0],
      [0, 3, 4, 0],
      [0, 0, 0, 0],
    ],
    startX: 1,
    startY: 1
  },

  "A": {
    map: [
      ["start", 10, 14, 18, 22],
      [11, 12, 16, 20, 26],
      [13, 15, 19, 24, 30],
      [17, 21, 25, 28, 32],
      [23, 27, 29, 31, "A2"],
    ],
    startX: 0,
    startY: 0
  },

  /*"abc": {
    map: [
      [  0   ,   0  , "abc1",   0  ,   0  ],
      [  0   ,   0  ,   -1  ,   0  ,   0  ],
      ["abc2",  -1  ,"start",  -1  ,"abc3"],
      [  0   ,   0  ,   -1  ,   0  ,   0  ],
      [  0   ,   0  ,"abc4",    0  ,   0  ],
    ],
    startX: 0,
    startY: 0
  },
  "abc": {
    map: [
      ["abc",    1 + 32,  5 + 32,  9 + 32, 13 + 32],
      [ 2 + 32,  3 + 32,  7 + 32, 11 + 32, 17 + 32],
      [ 4 + 32,  6 + 32, 10 + 32, 15 + 32, 21 + 32],
      [ 8 + 32, 12 + 32, 16 + 32, 19 + 32, 23 + 32],
      [14 + 32, 18 + 32, 20 + 32, 22 + 32, "abc1b"],
    ],
    startX: 0,
    startY: 0
  },
  "abc1b": {
    map: [
      [0, 0,    0,0, 0],
      [0, 0,    0,0, 0],
      [0,57,  56,58, 0],
      [0,0,"abc1",0, 0],
      [0, 0,    0,0, 0],
    ],
    startX: 2,
    startY: 3
  },
  "abc2": {
    map: [
      ["abc",    1 + 58,  5 + 58,  9 + 58, 13 + 58],
      [ 2 + 58,  3 + 58,  7 + 58, 11 + 58, 17 + 58],
      [ 4 + 58,  6 + 58, 10 + 58, 15 + 58, 21 + 58],
      [ 8 + 58, 12 + 58, 16 + 58, 19 + 58, 23 + 58],
      [14 + 58, 18 + 58, 20 + 58, 22 + 58, "abc2b"],
    ],
    startX: 0,
    startY: 0
  },
  "abc2b": {
    map: [
      [0, 0,    0,0, 0],
      [0, 0,    0,0, 0],
      [0,83,  82,84, 0],
      [0,0,"abc2",0, 0],
      [0, 0,    0,0, 0],
    ],
    startX: 0,
    startY: 0
  },
  */
  "abc": {
    map: [
      ["start","a","b","c","d"],
      "efghi",
      "jklmn",
      "opqrs",
      ["t","u","v","w", "abc2"],
    ],
    startX: 0,
    startY: 0
  },
  "abc2": {
    map: [
      [0, 0,    0,0, 0],
      [0, 0,    0,0, 0],
      [0,"x","y","z", 0],
      [0,0,"abc",0, 0],
      [0, 0,    0,0, 0],
    ],
    startX: 2,
    startY: 3
  },
};
var mabcs="abcdefghijklmnopqrstuvwxyz";
for(var i=0;i<26;i++){
  var p = 32 + i * 24;
  levelSelect[mabcs[i]] = {
    map: [
      [i<23?"abc":"abc2", 1 + p,  5 + p,  9 + p, 13 + p],
      [ 2 + p,  3 + p,  7 + p, 11 + p, 17 + p],
      [ 4 + p,  6 + p, 10 + p, 15 + p, 21 + p],
      [ 8 + p, 12 + p, 16 + p, 19 + p, 23 + p],
      [14 + p, 18 + p, 20 + p, 22 + p, 24 + p],
    ],
    startX: 0,
    startY: 0
  };
  if(levels[p]){levels[p].best = -1;}
  if(levels[1 + p]){levels[1 + p].best = -1;}
}


let levelSelectPos = { menu: "start", x: 1, y: 1 };

function miniTile(img, mn, px, py, W, H, blockSize, i, j, k, l){
  ctx.drawImage(img,
    px + ((i * blockSize) + (W * k) * blockSize * 0.9 +blockSize * 0.05) * mn,
    py + ((j * blockSize) + (H * l) * blockSize * 0.9 +blockSize * 0.05) * mn,
    blockSize * W * mn * 0.9,
    blockSize * H * mn * 0.9);
}

function miniBoard(onL, mn, px, py, i, j, blockSize){
  var W = 1 / (onL.size.width),
    H = 1 / (onL.size.height);
  for(let k = onL.size.width - 1; k >= 0; k--) {
    for(let l = onL.size.height - 1; l >= 0; l--) {
      let params = [mn, px, py, W, H, blockSize, i, j, k, l];

      miniTile(groundTile, ...params);

      if(onL.board[k][l]) {
        miniTile(tiles[onL.board[k][l]].img, ...params);
      }

      if(onL.goal[k][l]) {
        miniTile(target, ...params);
      }
    }
  }
}

function s1(tx, ty) {
  //animate
  let levelMap = levelSelect[levelSelectPos.menu].map;
  if(animationQueue.length > 0){
    if(animationQueue[0][2] < 8){
      levelSelectPos.x += 1/8 * animationQueue[0][0];
      levelSelectPos.y += 1/8 * animationQueue[0][1];
      if(!--animationQueue[0][2]){
        animationQueue.shift();
      }
    }
    else if(levelMap[levelSelectPos.y + animationQueue[0][1]]){
      let lvl = levelMap[levelSelectPos.y + animationQueue[0][1]][levelSelectPos.x + animationQueue[0][0]];
      if(typeof lvl == "string" || lvl < 0 || (lvl > 0 && levels[lvl-1] && levels[lvl-1].best != 0)){
        levelSelectPos.x += 1/8 * animationQueue[0][0];
        levelSelectPos.y += 1/8 * animationQueue[0][1];
        if(!--animationQueue[0][2]){
          animationQueue.shift();
        }
      }
      else{
        animationQueue.shift();
      }
    }
    else{
      animationQueue.shift();
    }
  }

  // draw
  let mn = 0, px = 0, py = 0;

  if(window.innerHeight == screen.height) {
    button(0.84 * w, h - 0.16 * w, 0.15 * w, 0.15 * w, () => { document.exitFullscreen() }, exitFullscreen, exitFullscreenb);
  } else {
    button(0.75 * w, h - 0.25 * w, 0.2 * w, 0.2 * w, () => { document.body.requestFullscreen() }, fullscreen, fullscreenb);
  }

  mn = min;
  px = (w - min) / 2;
  if(h > w) {
    py = (h - w) / 2;
    if(py > 0.05 * w){
      let mpy = Math.min(0.15 * w, py);
      //button(0, 0, 2.5 * mpy, mpy, () => { sb = 0 }, back, backb);
    }
  }
  else{
    if(px > 0.125 * w){
      let mpx = Math.min(0.375 * h, px);
      //button(0, 0, mpx, mpx/2.5, () => { sb = 0 }, back, backb);
    }
  }

  let cm = levelSelect[levelSelectPos.menu].map;//current map

  let blockSize = 1/cm.length;

  let lx = px, ly = py;
  let blockPX

  ctx.font = (0.15/cm.length * min >> 0) + 'px sans-serif';
  ctx.textAlign = 'center';

  for(let i = cm.length - 1; i >= 0; i--) {
    for(let j = cm.length - 1; j >= 0; j--) {
      let imgToDraw = false;

      if(cm[j][i] < 0){
        imgToDraw = groundTile;
      }
      else if(cm[j][i] == 0){

      }
      else if(cm[j][i] > 0){
        let onL = levels[cm[j][i]-1];
        imgToDraw = lock;
        if(onL && onL.best != 0){
          imgToDraw = false;
        }

        if(onL){
          miniBoard(onL, mn, px, py, i, j, blockSize);
          if(imgToDraw){
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(
              px + ((i * blockSize) + 0.05 * blockSize) * mn,
              py + ((j * blockSize) + 0.05 * blockSize) * mn,
              blockSize * 0.9 * mn,
              blockSize * 0.9 * mn);
          }
        }
      }
      else{
        imgToDraw = warpImages[cm[j][i]];
      }

      if(imgToDraw){
        ctx.drawImage(imgToDraw,
          px + (i * blockSize) * mn,
          py + (j * blockSize) * mn,
          blockSize * mn,
          blockSize * mn);
      }
    }
  }

  if(!mobile){
    ctx.drawImage(fullscreen,
      px + ((levelSelectPos.x * blockSize) + blockSize * 0.05) * mn,
      py + ((levelSelectPos.y * blockSize) + blockSize * 0.05) * mn,
      blockSize * 0.9 * mn,
      blockSize * 0.9 * mn);
  }


  for(let i = cm.length - 1; i >= 0; i--) {
    for(let j = cm.length - 1; j >= 0; j--) {
      if(cm[i][j] > 0 && levels[cm[i][j]-1] && levels[cm[i][j]-1].best != 0){
        let myI = j;
        let myJ = i;
        let lvl = cm[i][j] - 1;
        button(px + (myI * blockSize) * mn,
          py + (myJ * blockSize) * mn,
          blockSize * mn,
          blockSize * mn, () => {
            sb = 2;
            levelSelectPos.x = myI;
            levelSelectPos.y = myJ;
            level = lvl;
            setupLevel(levels[level]);
          }, blankImg, blankImg);

      }
      else if(typeof cm[i][j] === "string"){
        let onL = cm[i][j];
        if(levelSelect[onL]){
          let myI = j;
          let myJ = i;
          button(px + (myI * blockSize) * mn,
            py + (myJ * blockSize) * mn,
            blockSize * mn,
            blockSize * mn, () => {
              levelSelect[levelSelectPos.menu].startX = myI;
              levelSelect[levelSelectPos.menu].startY = myJ;

              levelSelectPos.menu = onL;
              levelSelectPos.x = levelSelect[onL].startX;
              levelSelectPos.y = levelSelect[onL].startY;
            }, blankImg, blankImg);
        }
      }
    }
  }
}

function s2(tx, ty) {
  ctx.fillStyle = colors[0];
  switch (ARType) {
    case (1):
      if(levels[level].best > 0) {
        ctx.font = (min / 24 >> 0) + "px sans-serif";
        ctx.fillText("best: " + levels[level].best, 0.3 * w, 0.25 * (h - min) + (min / 15 >> 0) * 0.8);
      }
      if(h / w > 1.4) {
        if(mobile){
          //button(0,h-0.5*(h-min),w*0.8,0.5*(h-min),()=>{keys[10]=!keys[10]});
          //ctx.drawImage(grab,0.4*w,h-(h-min)*0.25-0.1*w,0.2*w,0.2*w);

          //button(0.8 * w, h-0.5*(h-min), 0.2 * w, 0.5*(h-min), () => { undoMove() });
          //ctx.drawImage(undo,0.8 * w, h - (h - min) * 0.25 - 0.1 * w, 0.2 * w, 0.2 * w);
        }
        else{
        //button(0.4 * w, h - (h - min) * 0.25 - 0.1 * w, 0.2 * w, 0.2 * w, () => { keys[10] = !keys[10] }, grab, grabb);
          //button(0.8 * w, h - (h - min) * 0.25 - 0.1 * w, 0.2 * w, 0.2 * w, () => { undoMove() }, undo, undob);
        }

        button(0.8 * w, (h - min) * 0.25 - 0.1 * w, 0.2 * w, 0.2 * w, () => { setupLevel(levels[level]) }, restart, restartb);
        button(0, (h - min) * 0.25 - 0.1 * w, 0.2 * w, 0.2 * w, () => { sb = 1 }, backMini, backMinib);
      } else {
        if(false){
          //button(0,h-0.5*(h-min),w*0.8,0.5*(h-min),()=>{keys[10]=!keys[10]});
          //ctx.drawImage(grab,0.5*w-0.25*(h-min),h-0.5*(h-min),0.5*(h-min),0.5*(h-min));
          button(0.8 * w, h - 0.5 * (h - min), 0.2*w, 0.5*(h-min), () => { undoMove() });
          ctx.drawImage(undo,0.9 * w - 0.25 * (h - min), h - 0.5 * (h - min), 0.5 * (h - min), 0.5 * (h - min));
        }
        else{
        //button(0.5 * w - 0.25 * (h - min), h - 0.5 * (h - min), 0.5 * (h - min), 0.5 * (h - min), () => { keys[10] = !keys[10] }, grab, grabb);
        //button(0.9 * w - 0.25 * (h - min), h - 0.5 * (h - min), 0.5 * (h - min), 0.5 * (h - min), () => { undoMove() }, undo, undob);
        }

        button(w - 0.5 * (h - min), 0, 0.5 * (h - min), 0.5 * (h - min), () => { setupLevel(levels[level]) }, restart, restartb);
        button(0, 0, 0.5 * (h - min), 0.5 * (h - min), () => { sb = 1 }, backMini, backMinib);
      }
      break;
    case (2):
      if(levels[level].best > 0) {
        ctx.textAlign = 'left';
        ctx.font = (min / 30 >> 0) + "px sans-serif";
        ctx.fillText("best: " + levels[level].best, 0.15 * h, 0.08 * h + (min / 14 >> 0) * 0.5);
      }

      //button(w - 0.25 * h - w / h * (w / h) * 50, 0, 0.14 * h, 0.14 * h, () => { undoMove() }, undo, undob);
      button(w - 0.13 * h - w / h * (w / h) * 20, 0, 0.14 * h, 0.14 * h, () => { setupLevel(levels[level]) }, restart, restartb);

      button(0, 0, 0.14 * h, 0.14 * h, () => { sb = 1 }, backMini, backMinib);
      break;
    case (3):
      if(w / h > 2.6) {
        ctx.font = (h / 8 >> 0) + "px sans-serif";
        ctx.textAlign = 'right';

        if(levels[level].best > 0) {
          ctx.font = (h / 20 >> 0) + "px sans-serif";
          ctx.fillText("best: " + levels[level].best, 0.5 * (w - h), 0.2 * h + (h / 8) * 1.5);
        }

        ctx.textAlign = 'center';

        button(0.5 * w - h, 0, 0.5 * h, 0.2 * h, () => { sb = 1 }, back, backb);
        button(0.5 * w + 0.75 * h, 0.5 * h - 0.125 * h, 0.25 * h, 0.25 * h, () => { setupLevel(levels[level]) }, restart, restartb);
        //button(0.5 * w + 0.5 * h, 0.5 * h - 0.125 * h, 0.25 * h, 0.25 * h, () => { undoMove() }, undo, undob);
      } else {
        ctx.font = (w / 20 >> 0) + "px sans-serif";
        ctx.textAlign = 'center';

        let SZ = Math.min(w * 0.15, (h - (0.6 * w)) * 0.8);
        if(SZ >= 0.05 * w) {

          if(levels[level].best > 0) {
            ctx.font = (w / 50 >> 0) + "px sans-serif";
            ctx.fillText("best: " + levels[level].best, 0.1 * w, 0.13 * w + (w / 20 >> 0) * 0.5);
          }
          if(false){
            button(0.05 * w, 0.5 * h - 0.05 * w, 0.1 * w, 0.1 * w, () => { keys[10] = !keys[10] }, grab, grabb);
          }
        } else {
          if(levels[level].best > 0) {
            ctx.font = (w / 50 >> 0) + "px sans-serif";
            ctx.fillText("best: " + levels[level].best, 0.1 * w, 0.21 * w + (w / 50 >> 0) * 0.75);
          }
          if(false){
            button(0.05 * w, 0.26 * w, 0.1 * w, 0.1 * w, () => { keys[10] = !keys[10] }, grab, grabb);
          }
        }

        button(0.85 * w, 0, 0.1 * w, 0.1 * w, () => { setupLevel(levels[level]) }, restart, restartb);
        //button(0.85 * w, 0.5 * h - 0.05 * w, 0.1 * w, 0.1 * w, () => { undoMove() }, undo, undob);

        button(0, 0, 0.2 * w, 0.08 * w, () => { sb = 1 }, back, backb);
      }
      break;
  }
  animate();
  drawBoard(levels[level], tx, ty);
  if(sb != 2){animationQueue = [];}
}
let scene = 0,
  sb = 1;
const scenes = [s0, s1, s2];

//draw
let lt = 0;

let tx = 0;
let ty = 0;

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
  tx = 0;
  ty = 0;
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
  levels[level].best = 1;
  drawCanvas(false);
  sb = 1;

  let onL = levelSelect[levelSelectPos.menu].map;
  let dirs = [[0,1],[0,-1],[1,0],[-1,0]];
  for(let i = 0; i < dirs.length; i++){
    if(onL[levelSelectPos.y + dirs[i][0]]){
      let cOnL = onL[levelSelectPos.y + dirs[i][0]][levelSelectPos.x + dirs[i][1]] - 1;
      if(cOnL >= 0 && levels[cOnL] && levels[cOnL].best === 0){
        levels[cOnL].best = -1;
      }
    }
  }
};

function checkBeaten(){
  for(let i = 0; i < gameGrid.length;i++){
    for(let j = 0; j < gameGrid[0].length;j++){
      if(levels[level].goal[i][j] && gameGrid[i][j] == 0){
        return false;
      }
    }
  }
  return true;
}

window.onresize = () => {
  c.width = window.innerWidth;
  c.height = window.innerHeight;
  w = c.width;
  h = c.height;
  getARType(w / h);
}

moveBlockn = 0;
moveBlockFrom = [0,0];

const keyDown = (event) => {
  keys[event.keyCode] = true;
  if(scene === 1){
    switch (event.keyCode) {
      case (37): //LEFT_ARROW
      case (65):
        animationQueue.push([-1, 0, 8]);
        break;
      case (39): //RIGHT_ARROW
      case (68):
        animationQueue.push([1, 0, 8]);
        break;
      case (38): //UP_ARROW
      case (87):
        animationQueue.push([0, -1, 8]);
        break;
      case (40): //DOWN_ARROW
      case (83):
        animationQueue.push([0, 1, 8]);
        break;
      case (32): //SPACE
      case (13): //ENTER
      case (16): //SHIFT
        if(levelSelectPos.x % 1 == 0 && levelSelectPos.y % 1 == 0){
          if(animationQueue.length === 0 && levelSelect[levelSelectPos.menu].map[levelSelectPos.y][levelSelectPos.x] > 0 && levels[levelSelect[levelSelectPos.menu].map[levelSelectPos.y][levelSelectPos.x]-1]){
            sb = 2;
            level = levelSelect[levelSelectPos.menu].map[levelSelectPos.y][levelSelectPos.x]-1;
            setupLevel(levels[level]);
          }
          else if(animationQueue.length === 0 && typeof levelSelect[levelSelectPos.menu].map[levelSelectPos.y][levelSelectPos.x] === "string"){
            let onL = levelSelect[levelSelectPos.menu].map[levelSelectPos.y][levelSelectPos.x];
            if(levelSelect[onL]){
              levelSelect[levelSelectPos.menu].startX = levelSelectPos.x;
              levelSelect[levelSelectPos.menu].startY = levelSelectPos.y;

              levelSelectPos.menu = onL;
              levelSelectPos.x = levelSelect[onL].startX;
              levelSelectPos.y = levelSelect[onL].startY;
            }
          }
        }
        break;
    }
    return;
  }
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
    if(animationQueue.length > 4) { return; }
    let tempAnimationQueue = JSON.stringify(animationQueue);
    let tempGrid = JSON.stringify(gameGrid);
    let tempSteps = steps;
    while(animationQueue.length > 0) {
      animate(true);
    }
    if(tempSteps > 0 && steps === 0) {
      animationQueue = JSON.parse(tempAnimationQueue).concat(animationQueue);
      gameGrid = JSON.parse(tempGrid);
      steps = tempSteps;
      return;
    }
    //this moved stuff
    animationQueue = JSON.parse(tempAnimationQueue).concat(animationQueue);
    gameGrid = JSON.parse(tempGrid);
  }
}

window.onkeydown = keyDown;

window.onkeyup = (event) => {
  keys[event.keyCode] = false;
}

function moveStuff(){

  if(scene === 2 && moveBlockn){
    let tmp = [
      (mouseX-moveBlockFrom[0])/boardB[2]*levels[level].board.length*2,
      (mouseY-moveBlockFrom[1])/boardB[2]*levels[level].board.length*2,
    ];
    if(Math.abs(tmp[0]) >= 1){
      if(moveBlock(moveBlockn,Math.min(1,Math.max(-1,tmp[0]))>>0,0)){
        moveBlockFrom[0] += (Math.min(1,Math.max(-1,tmp[0]))>>0) * (boardB[2]/levels[level].board.length);
        tmp[0] -= (Math.min(1,Math.max(-1,tmp[0]))>>0)*2;
      }
    }
    if(Math.abs(tmp[1]) >= 1){
      if(moveBlock(moveBlockn,0,Math.min(1,Math.max(-1,tmp[1]))>>0)){
        moveBlockFrom[1] += (Math.min(1,Math.max(-1,tmp[1]))>>0) * (boardB[2]/levels[level].board.length);
        tmp[1] -= (Math.min(1,Math.max(-1,tmp[1]))>>0)*2;
      }
    }
    movedBlockp = [
      (mouseX-moveBlockFrom[0])/boardB[2],
      (mouseY-moveBlockFrom[1])/boardB[2],
    ]
    if(moveBlock(moveBlockn,tmp[0]>0?1:-1,0)){
      moveBlock(moveBlockn,tmp[0]>0?-1:1,0)
    }
    else{
      movedBlockp[0]=0;
    }

    if(moveBlock(moveBlockn,0,tmp[1]>0?1:-1)){
      moveBlock(moveBlockn,0,tmp[1]>0?-1:1)
    }
    else{
      movedBlockp[1]=0;
    }

    if(movedBlockp[0] !== 0 && movedBlockp[1] !== 0){
      if(moveBlock(moveBlockn,tmp[0]>0?1:-1,tmp[1]>0?1:-1)){
        moveBlock(moveBlockn,tmp[0]>0?-1:1,tmp[1]>0?-1:1);
      }
      else if(Math.abs(movedBlockp[0]) > Math.abs(movedBlockp[1])){
        movedBlockp[1] = 0;
      }
      else{
        movedBlockp[0] = 0;
      }
    }
  }
}

window.onmousemove = (event) => {
  if(!mobile || mouseIsPressed) {
    mouseX = event.clientX;
    mouseY = event.clientY;
  }
  moveStuff();
}

function startMoving(){
  if(scene != 2){return;}
  var cs=[((mouseX-boardB[0])/(boardB[2]/gameGrid.length))>>0,((mouseY-boardB[1])/(boardB[2]/gameGrid.length))>>0];
  if(cs[0] >= 0 && cs[0] < gameGrid[0].length && cs[1] >= 0 && cs[1] < gameGrid[0].length){
    moveBlockn = gameGrid[cs[0]][cs[1]];
    moveBlockFrom = [mouseX, mouseY];
    movedBlockp = [0,0];
  }
}

window.onmousedown = (event) => {
  //console.log(boardB);
  startMoving();
}


window.onmouseup = (event) => {
  if(!mobile && !moveBlockn) {
    mouseIsPressed = true;
    last = false;
    drawCanvas(false);
    mouseIsPressed = false;
    last = true;
  }
  moveBlockn = 0;
  if(scene == 2){
    if(checkBeaten()){
      beatLevel();
    }
  }
}

window.onmouseleave = (event) => {
  mouseIsPressed = false;
  last = true;
  moveBlockn = 0;
}

let ltouch = [0, 0];
window.ontouchstart = (event) => {
  mouseX = event.touches[0].clientX;
  mouseY = event.touches[0].clientY;
  ltouch = [mouseX, mouseY];
  mouseIsPressed = true;
  startMoving();
}
window.ontouchend = (event) => {
  if(animationQueue.length > 0) { return }
  if(scene === 2 && (mouseX - ltouch[0]) * (mouseX - ltouch[0]) + (mouseY - ltouch[1]) * (mouseY - ltouch[1]) > 200) {
    moveHistory.push(stateString([gameGrid]));
    //move block
  }

  if(!moveBlockn){
    mouseIsPressed = true;
    last = false;
    drawCanvas(false);
    mouseIsPressed = false;
    last = true;
    mouseX = -1;
    mouseY = -1;
  }

  moveBlockn = 0;
  if(scene == 2){
    if(checkBeaten()){
      beatLevel();
    }
  }

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
  moveStuff();
};

document.addEventListener('contextmenu', event => event.preventDefault());
