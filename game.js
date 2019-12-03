/*
TODO:
graphics:
asset creation
x shell bots
- animation stack
  x rotate player
  x move player
  x move block
  - move power
  - win
  - toggle grab
- better mobile dragging (don't press button after dragging)
- only drag things higher than you
- other mechanics sepcific to the new visuals
- undo button
- remove side-stepping
- add tutorial
- BUG: moving after transporting before animation is done
- fix levels
- add levels
*/

//initialize canvas
const c = document.getElementById("canvas");
const ctx = c.getContext("2d", { alpha: false });
c.style.backgroundColor="red";
c.width=window.innerWidth;
c.height=window.innerHeight;
//check for mobile
function isMobile() {
  let prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
  let mq = function(query) {
return window.matchMedia(query).matches;
  }

  if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
return true;
  }
  let query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
  return mq(query);
}

//initialize variables and constants
let w=c.width,h=c.height,mobile=isMobile(),last=true,mouseIsPressed=false;
let keys=[];
let mouseX=0,mouseY=0;
//check aspect ratio
let ARType=1,min,minx,miny;
function getARType(AR){
  if(AR<0.8){ARType=1;}
  else if(AR>1.2){ARType=3;}
  else {ARType=2;}
  min=w>h?h:w;
  minx=min;
  miny=min;
}
getARType(w/h);

let levelScreen=0;
let unlocked=0;

let version="0.2.2";
let level=0;
let levels=[
  {
    title:"Baby steps",
    size:{width:4,height:4},
    start:{x:0,y:3},
    shells:[{x:3,y:1,z:3,facing:0},{x:1,y:1,z:2,facing:0},{x:3,y:2,z:1,facing:0}],
    board:[
      [[3,-2],[2,-1],[1,-1],[0,-1]],
      [[3,-1],[2, 1],[1,-1],[0,-1]],
      [[3,-1],[2,-1],[1,-1],[0,-1]],
      [[3,-1],[3, 2],[1, 0],[0,-1]],
    ],
    stepGoals:[16,18,20],
    best:0
  },
  {
    title:"Push",
    size:{width:4,height:4},
    start:{x:0,y:2},
    shells:[{x:2,y:0,z:2,facing:0}],
    board:[
      [[2,-2],[0,-1],[0,-1],[0,-1]],
      [[2,-1],[1,-1],[1,-1],[1,-1]],
      [[2, 0],[0,-1],[0,-1],[0,-1]],
      [[2,-1],[0,-1],[0,-1],[0,-1]]
    ],
    stepGoals:[6,7,8],
    best:0
  },
  {
    title:"Pull",
    size:{width:4,height:4},
    start:{x:0,y:3},
    shells:[{x:0,y:0,z:2,facing:0},{x:1,y:2,z:1,facing:0}],
    board:[
      [[2, 1],[0,-1],[1,-1],[0,-1]],
      [[2,-1],[0,-1],[1, 0],[0,-1]],
      [[2,-2],[0,-1],[1,-1],[0,-1]],
      [[1,-1],[1,-1],[1,-1],[1,-1]]
    ],
    stepGoals:[8,10,12],
    best:0
  },
  {
    title:"Drag",
    size:{width:3,height:3},
    start:{x:0,y:0},
    shells:[{x:2,y:2,z:2,facing:0}],
    board:[
      [[0,-1],[0,-1],[0,-1]],
      [[0,-1],[1,-1],[1,-1]],
      [[0,-1],[2,-2],[2, 0]],
    ],
    stepGoals:[7,8,9],
    best:0
  },
  {
    title:"Grabbing nothing",
    size:{width:4,height:4},
    start:{x:2,y:1},
    shells:[{x:3,y:1,z:2,facing:0},{x:2,y:1,z:1,facing:0},{x:3,y:3,z:4,facing:0}],
    board:[
      [[1,-1],[1,-1],[1,-1],[1,-1]],
      [[2,-1],[0,-1],[0,-1],[0,-1]],
      [[2,-1],[3, 1],[0,-1],[4,-2]],
      [[2,-1],[3, 2],[0,-1],[4, 3]]
    ],
    stepGoals:[15,17,180],
    best:0
  },
  {
    title:"On top",
    size:{width:4,height:4},
    start:{x:3,y:3},
    shells:[],
    board:[
      [[4, 2],[4,-2],[2,-1],[0,-1]],
      [[0,-1],[0,-1],[2,-1],[0,-1]],
      [[0,-1],[0,-1],[2, 1],[1,-1]],
      [[3,-1],[3, 2],[0,-1],[1,-1]]
    ],
    stepGoals:[15,17,180],
    best:0
  },
  {
    title:"Move around",
    size:{width:6,height:6},
    start:{x:0,y:0},
    shells:[],
    board:[
      [[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1]],
      [[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1]],
      [[0,-1],[0,-1],[2, 1],[2,-1],[0,-1],[0,-1]],
      [[0,-1],[0,-1],[2,-1],[2,-2],[0,-1],[0,-1]],
      [[0,-1],[1,-1],[1,-1],[1, 0],[1,-1],[0,-1]],
      [[0,-1],[0,-1],[0,-1],[0,-1],[0,-1],[0,-1]]
    ],
    stepGoals:[14,16,20],
    best:0
  },
  {
    title:"U",
    size:{width:5,height:5},
    start:{x:2,y:4},
    shells:[],
    board:[
      [[0,-1],[0,-1],[0,-1],[0,-1],[0,-1]],
      [[2,-1],[2,-1],[3, 2],[3, 1],[0,-1]],
      [[0,-1],[0,-1],[0,-1],[3, 0],[0,-1]],
      [[1,-2],[1,-1],[3,-1],[3,-1],[0,-1]],
      [[0,-1],[0,-1],[0,-1],[0,-1],[0,-1]]
    ],
    stepGoals:[19,21,23],
    best:0
  },
  {
    title:"More complex",
    size:{width:5,height:5},
    start:{x:0,y:0},
    shells:[],
    board:[
      [[0,-1],[3,-2],[3,-1],[0,-1],[0,-1]],
      [[0,-1],[3,-1],[3, 2],[0,-1],[0,-1]],
      [[1,-1],[1,-1],[1,-1],[0,-1],[0,-1]],
      [[0,-1],[2,-1],[2,-1],[0,-1],[0,-1]],
      [[0,-1],[2,-1],[2, 0],[0,-1],[0,-1]]
    ],
    stepGoals:[24,26,28],
    best:0
  },
  {
    title:"A variation",
    size:{width:5,height:5},
    start:{x:0,y:0},
    shells:[],
    board:[
      [[0,-1],[2,-1],[2, 1],[0,-1],[0,-1]],
      [[0,-1],[0,-1],[2,-1],[0,-1],[0,-1]],
      [[3, 2],[3,-1],[3,-2],[0,-1],[0,-1]],
      [[0,-1],[0,-1],[1,-1],[0,-1],[0,-1]],
      [[0,-1],[1,-1],[1, 0],[0,-1],[0,-1]]
    ],
    stepGoals:[33,34,36],
    best:0
  },
  {
    title:"Tight spaces",
    size:{width:5,height:5},
    start:{x:0,y:1},
    shells:[],
    board:[
      [[1,-1],[0,-1],[0,-1],[4, 1],[0,-1]],
      [[1,-1],[1,-1],[0,-1],[4,-1],[4,-2]],
      [[0,-1],[0,-1],[0,-1],[0,-1],[0,-1]],
      [[3, 0],[3,-1],[0,-1],[2,-1],[2,-1]],
      [[3, 2],[0,-1],[0,-1],[2, 1],[0,-1]]
    ],
    stepGoals:[81,88,98],
    best:0
  },
];

let steps=0,counter=0;
let gameGrid=[];
let player={x:0,y:0,z:0,facing:0};
let shells=[];

//asset stuff

const colors=["white","grey","#151515","white","blue"];

const goal=new Image();
goal.src = 'assets/goal.png';

const title=new Image();
title.src = 'assets/title.png';

const groundTile=new Image();
groundTile.src = 'assets/ground-tile.png';

const playerImg=new Image();
playerImg.src = 'assets/3-powered-rumba.png';

const playerImgA=new Image();
playerImgA.src = 'assets/3-powered-rumba-on-a.png';

const playerImgB=new Image();
playerImgB.src = 'assets/3-powered-rumba-on-b.png';

const shellImg=new Image();
shellImg.src = 'assets/0-powered-rumba.png';

const wall1=new Image();
wall1.src = 'assets/wall-1.png';

const wall2=new Image();
wall2.src = 'assets/wall-2.png';

const wall3=new Image();
wall3.src = 'assets/wall-3.png';

const wall4=new Image();
wall4.src = 'assets/wall-4.png';

const wall5=new Image();
wall5.src = 'assets/wall-5.png';

const wall6=new Image();
wall6.src = 'assets/wall-6.png';

const tile1=new Image();
tile1.src = 'assets/tile-1.png';

const tile2=new Image();
tile2.src = 'assets/tile-2.png';

const tile3=new Image();
tile3.src = 'assets/tile-3.png';

const tile4=new Image();
tile4.src = 'assets/tile-4.png';

const tile5=new Image();
tile5.src = 'assets/tile-5.png';

const tile6=new Image();
tile6.src = 'assets/tile-6.png';

const elevatorTile1=new Image();
elevatorTile1.src = 'assets/elevator-tile-1.png';

const elevatorTile2=new Image();
elevatorTile2.src = 'assets/elevator-tile-2.png';

const elevatorTile3=new Image();
elevatorTile3.src = 'assets/elevator-tile-3.png';

const elevatorTile4=new Image();
elevatorTile4.src = 'assets/elevator-tile-4.png';

const elevatorTile5=new Image();
elevatorTile5.src = 'assets/elevator-tile-5.png';

const elevatorTile6=new Image();
elevatorTile6.src = 'assets/elevator-tile-6.png';

const elevator0=new Image();
elevator0.src = 'assets/elevator-0.png';

const elevator1=new Image();
elevator1.src = 'assets/elevator-1.png';

const elevator2=new Image();
elevator2.src = 'assets/elevator-2.png';

const elevator3=new Image();
elevator3.src = 'assets/elevator-3.png';

const elevator4=new Image();
elevator4.src = 'assets/elevator-4.png';

const elevator5=new Image();
elevator5.src = 'assets/elevator-5.png';

const elevator6=new Image();
elevator6.src = 'assets/elevator-6.png';

const tiles=[
  {
    img:groundTile,
    elevator:groundTile,
    elevatorTube:elevator0,
    wall:wall1
  },
  {
    img:tile1,
    elevator:elevatorTile1,
    elevatorTube:elevator1,
    wall:wall1
  },
  {
    img:tile2,
    elevator:elevatorTile2,
    elevatorTube:elevator2,
    wall:wall2
  },
  {
    img:tile3,
    elevator:elevatorTile3,
    elevatorTube:elevator3,
    wall:wall3
  },
  {
    img:tile4,
    elevator:elevatorTile4,
    elevatorTube:elevator4,
    wall:wall4
  },
  {
    img:tile5,
    elevator:elevatorTile5,
    elevatorTube:elevator5,
    wall:wall5
  },
  {
    img:tile6,
    elevator:elevatorTile6,
    elevatorTube:elevator6,
    wall:wall6
  },
];

function button(x,y,w,h,callback){
  ctx.fillStyle=colors[2];
  if(mouseX>x&&
    mouseX<x+w&&
    mouseY>y&&
    mouseY<y+h){
    ctx.fillStyle="rgba(0,0,0,50)";
    document.body.style.cursor='pointer';
    if(!last&&mouseIsPressed){
      callback();last=true;
    }
  }
  ctx.fillRect(x>>0,y>>0,w>>0,h>>0);
}

//animations
let animationQueue=[];
function animate(){
  if(animationQueue.length<=0){return;}
  switch (animationQueue[0][0]) {
    case('facing'):
      if(player.facing===0&&animationQueue[0][1]===3){
        player.facing=4;
      }
      else if(player.facing===3&&animationQueue[0][1]===0){
        player.facing=-1;
      }
      player.facing+=(animationQueue[0][1]-player.facing)*0.1;
      if(player.facing-animationQueue[0][1]<0){
        player.facing+=0.1;
      }
      else{
        player.facing-=0.1;
      }
      if(Math.abs(player.facing-animationQueue[0][1])<0.1){
        player.facing=animationQueue[0][1];
        animationQueue.shift();
      }
    break;
    case('transport'):
      let tp=[player.x,player.y,player.z,player.facing];
      let S=shells[animationQueue[0][1]];
      player.x=S.x;
      player.y=S.y;
      player.z=S.z;
      player.facing=S.facing;
      S.x=tp[0];
      S.y=tp[1];
      S.z=tp[2];
      S.facing=tp[3];
      animationQueue.shift();
    break;
    case('playerPos'):
      if(player.x-animationQueue[0][1]<0){
        player.x+=0.1;
      }
      else if(player.x-animationQueue[0][1]>0){
        player.x-=0.1;
      }
      else if(player.y-animationQueue[0][2]<0){
        player.y+=0.1;
      }
      else if(player.y-animationQueue[0][2]>0){
        player.y-=0.1;
      }
      if(Math.abs(player.x-animationQueue[0][1])<0.05&&Math.abs(player.y-animationQueue[0][2])<0.1){
        player.x=animationQueue[0][1];
        player.y=animationQueue[0][2];
        animationQueue.shift();
        if(gameGrid[player.x][player.y][1]===-2){
          beatLevel();
        }
      }
    break;
    case('moveBlock'):
      if(animationQueue[0][5]===0){
        for(let i=animationQueue[0][4].length-1;i>=0;i--){
            gameGrid[animationQueue[0][4][i][0]][animationQueue[0][4][i][1]]=[0,0];
        }
      }
      if(player.x-animationQueue[1][1]<0){
        player.x+=0.1;
      }
      else if(player.x-animationQueue[1][1]>0){
        player.x-=0.1;
      }
      else if(player.y-animationQueue[1][2]<0){
        player.y+=0.1;
      }
      else if(player.y-animationQueue[1][2]>0){
        player.y-=0.1;
      }

      animationQueue[0][5]+=0.1;
      for(let k=0;k<animationQueue[0][6].length;k++){
          shells[animationQueue[0][6][k]].x+=animationQueue[0][2]*0.1;
          shells[animationQueue[0][6][k]].y+=animationQueue[0][3]*0.1;
      }
      if(animationQueue[0][5]>=1){
        for(let i=animationQueue[0][4].length-1;i>=0;i--){
          gameGrid[animationQueue[0][4][i][0]+animationQueue[0][2]][animationQueue[0][4][i][1]+animationQueue[0][3]]=[animationQueue[0][1],animationQueue[0][4][i][2]];
        }for(let k=0;k<animationQueue[0][6].length;k++){
            shells[animationQueue[0][6][k]].x=Math.round(shells[animationQueue[0][6][k]].x);
            shells[animationQueue[0][6][k]].y=Math.round(shells[animationQueue[0][6][k]].y);
        }
        animationQueue.shift();
        player.x=animationQueue[0][1];
        player.y=animationQueue[0][2];
        animationQueue.shift();
        if(gameGrid[player.x][player.y][1]===-2){
          beatLevel();
        }
      };
    break;
  }
}

//game Objects
function moveBlock(block,x,y){
  let W=levels[level].size.width;
  let H=levels[level].size.height;
  let ar=[];
  let shellsOn=[];
  for(let i=W-1;i>=0;i--){
    for(let j=H-1;j>=0;j--){
      if(gameGrid[i][j][0]===block&&(i+x<0||j+y<0||i+x>=W||j+y>=H||gameGrid[i+x][j+y][0]&&gameGrid[i+x][j+y][0]!=block)){
        return;
      }
      else if (gameGrid[i][j][0]===block) {
        ar.push([i,j,gameGrid[i][j][1]]);
        for(let k=0;k<shells.length;k++){
          if(shells[k].x===i&&shells[k].y===j){
            shellsOn.push(k);
          }
        }
      }
    }
  }

  animationQueue.push(["moveBlock",block,x,y,ar,0,shellsOn]);
  return true;
}

//game functions
function setupLevel(L){
  animationQueue=[];
  steps=0;
  gameGrid=[];
  shells=[];
  player.x=L.start.x;
  player.y=L.start.y;
  player.facing=0;
  for(let i=0;i<L.size.width;i++){
    gameGrid.push([]);
    for(let j=0;j<L.size.height;j++){
      gameGrid[i].push(L.board[i][j]);
    }
  }
  for(let s=0;s<L.shells.length;s++){
    shells.push({x:L.shells[s].x,y:L.shells[s].y,z:L.shells[s].z,facing:L.shells[s].facing});
  }
  player.z=gameGrid[player.x][player.y][0];
}
function imageInSquare(img,x,y,W,H,tx,ty){
  switch(ARType){
    case(1):
      ctx.drawImage(img,x*min,ty+y*min,W*min,H*min);
    break;
    case(2):
      if(w>h*0.85){
        ctx.drawImage(img,0.5*(w-h*0.85)+x*(h*0.85),0.15*h+y*(h*0.85),W*h*0.85,H*h*0.85);
      }
      else{
        ctx.drawImage(img,x*min,0.15*h+y*min,W*min,H*min);
      }
    break;
    case(3):
      let mn=0,px=0,py=0;
      if(min>0.6*w){
        mn=0.6*w;
        px=(w-0.6*w)/2;
        py=(h-0.6*w)/2;
      }
      else{
        mn=min;
        px=(w-min)/2;
      }
      ctx.drawImage(img,px+mn*x,py+mn*y,mn*W,mn*H);
    break;
  }
}
function drawPlayer(x,y,z,facing,W,H,tx,ty,playerImg,clpx,clp){
  switch(ARType){
    case(1):
      ctx.save();
      ctx.translate(W*(x+0.5)*min+0.5*W*min,ty+H*(y+1-z*0.125)*min+0.5*H*min);
      if(clp){
        ctx.beginPath();
        ctx.moveTo(-0.5*min*W,-0.5*min*H-(y%1-1)*min*H);
        ctx.lineTo(0.5*min*W,-0.5*min*H-(y%1-1)*min*H);
        ctx.lineTo(0.5*min*W,0.5*min*H-(y%1-1)*min*H);
        ctx.lineTo(-0.5*min*W,0.5*min*H-(y%1-1)*min*H);
        ctx.closePath();
        ctx.clip();
      }
      if(clpx){
        ctx.beginPath();
        ctx.moveTo(-0.5*min*W+(-x%1)*min*W,-0.5*min*H);
        ctx.lineTo(0.5*min*W+(-x%1)*min*W,-0.5*min*H);
        ctx.lineTo(0.5*min*W+(-x%1)*min*W,0.5*min*H);
        ctx.lineTo(-0.5*min*W+(-x%1)*min*W,0.5*min*H);
        ctx.closePath();
        ctx.clip();
      }
      ctx.rotate(facing*Math.PI*0.5);
      ctx.drawImage(playerImg,-0.5*W*min,-0.5*H*min,W*min,H*min);
      ctx.restore();
    break;
    case(2):
      if(w>h*0.85){
        ctx.save();
        ctx.translate(0.5*(w-h*0.85)+W*(x+0.5)*h*0.85+0.5*W*h*0.85,
        0.15*h+H*(y+1-z*0.125)*h*0.85+0.5*H*h*0.85);
        if(clp){
          ctx.beginPath();
          ctx.moveTo(-0.5*0.85*W*h,-0.5*0.85*H*h-(y%1-1)*0.85*H*h);
          ctx.lineTo(0.5*0.85*W*h,-0.5*0.85*H*h-(y%1-1)*0.85*H*h);
          ctx.lineTo(0.5*0.85*W*h,0.5*0.85*H*h-(y%1-1)*0.85*H*h);
          ctx.lineTo(-0.5*0.85*W*h,0.5*0.85*H*h-(y%1-1)*0.85*H*h);
          ctx.closePath();
          ctx.clip();
        }
        if(clpx){
          ctx.beginPath();
          ctx.moveTo(-0.5*0.85*W*h+(-x%1)*0.85*W*h,-0.5*0.85*H*h);
          ctx.lineTo(0.5*0.85*W*h+(-x%1)*0.85*W*h,-0.5*0.85*H*h);
          ctx.lineTo(0.5*0.85*W*h+(-x%1)*0.85*W*h,0.5*0.85*H*h);
          ctx.lineTo(-0.5*0.85*W*h+(-x%1)*0.85*W*h,0.5*0.85*H*h);
          ctx.closePath();
          ctx.clip();
        }
        ctx.rotate(facing*Math.PI*0.5);
        ctx.drawImage(playerImg,-0.5*W*h*0.85,-0.5*H*h*0.85,W*h*0.85,H*h*0.85);
        ctx.restore();
      }
      else{
        ctx.save();
        ctx.translate(W*(x+0.5)*min+0.5*W*min,0.15*h+H*(y+1-z*0.125)*min+0.5*H*min);
        if(clp){
          ctx.beginPath();
          ctx.moveTo(-0.5*min*W,-0.5*min*H-(y%1-1)*min*H);
          ctx.lineTo(0.5*min*W,-0.5*min*H-(y%1-1)*min*H);
          ctx.lineTo(0.5*min*W,0.5*min*H-(y%1-1)*min*H);
          ctx.lineTo(-0.5*min*W,0.5*min*H-(y%1-1)*min*H);
          ctx.closePath();
          ctx.clip();
        }
        if(clpx){
          ctx.beginPath();
          ctx.moveTo(-0.5*min*W+(-x%1)*min*W,-0.5*min*H);
          ctx.lineTo(0.5*min*W+(-x%1)*min*W,-0.5*min*H);
          ctx.lineTo(0.5*min*W+(-x%1)*min*W,0.5*min*H);
          ctx.lineTo(-0.5*min*W+(-x%1)*min*W,0.5*min*H);
          ctx.closePath();
          ctx.clip();
        }
        ctx.rotate(facing*Math.PI*0.5);
        ctx.drawImage(playerImg,-0.5*W*min,-0.5*H*min,W*min,H*min);
        ctx.restore();
      }
    break;
    case(3):
      let mn=0,px=0,py=0;
      if(min>0.6*w){
        mn=0.6*w;
        px=(w-0.6*w)/2;
        py=(h-0.6*w)/2;
      }
      else{
        mn=min;
        px=(w-min)/2;
      }
      ctx.save();
      ctx.translate(px+W*(x+0.5)*mn+0.5*mn*W,py+H*(y+1-z*0.125)*mn+0.5*mn*H);
      if(clp){
        ctx.beginPath();
        ctx.moveTo(-0.5*mn*W,-0.5*mn*H-(y%1-1)*mn*H);
        ctx.lineTo(0.5*mn*W,-0.5*mn*H-(y%1-1)*mn*H);
        ctx.lineTo(0.5*mn*W,0.5*mn*H-(y%1-1)*mn*H);
        ctx.lineTo(-0.5*mn*W,0.5*mn*H-(y%1-1)*mn*H);
        ctx.closePath();
        ctx.clip();
      }
      if(clpx){
        ctx.beginPath();
        ctx.moveTo(-0.5*mn*W+(-x%1)*mn*W,-0.5*mn*H);
        ctx.lineTo(0.5*mn*W+(-x%1)*mn*W,-0.5*mn*H);
        ctx.lineTo(0.5*mn*W+(-x%1)*mn*W,0.5*mn*H);
        ctx.lineTo(-0.5*mn*W+(-x%1)*mn*W,0.5*mn*H);
        ctx.closePath();
        ctx.clip();
      }
      ctx.rotate(facing*Math.PI*0.5);
      ctx.drawImage(playerImg,-0.5*mn*W,-0.5*mn*H,mn*W,mn*H);
      ctx.restore();
    break;
  }
}
function movePlayer(x,y){
  steps++;
  let ret=false;
  let curs=gameGrid[player.x][player.y];
  let nexs=[0,0];
  if(player.x+x>=0&&player.x+x<levels[level].size.width&&
    player.y+y>=0&&player.y+y<levels[level].size.height){
    nexs=gameGrid[player.x+x][player.y+y];
    var fc=[0,0];
    switch(player.facing){
        case(0):
            fc=[0,1];
        break;case(1):
            fc=[-1,0];
        break;case(2):
            fc=[0,-1];
        break;case(3):
            fc=[1,0];
        break;
    }
    let fcns=[0,0];
    if(player.x+fc[0]>=0&&player.y+fc[1]>=0&&player.x+fc[0]<gameGrid.length&&player.y+fc[1]<gameGrid[0].length){
      fcns=gameGrid[player.x+fc[0]][player.y+fc[1]];
    }
    let rmp=curs[1]>0;
    if((keys[32]||keys[10]||keys[13])&&(player.x+fc[0]<0||player.y+fc[1]<0||player.x+fc[0]>=levels[level].size.width||player.y+fc[1]>=levels[level].size.height)){
      ret=true;
    }
    else if((keys[32]||keys[10]||keys[13])&&(curs[0]===nexs[0]||(fcns[0]===nexs[0]&&(rmp||!curs[0]))||!nexs[0]&&(!curs[0]||rmp))){
      ret=true;
      if(player.x+fc[0]>=0&&player.y+fc[1]>=0&&player.x+fc[0]<levels[level].size.width&&player.y+fc[1]<levels[level].size.height){
        if(fcns[0]>0&&fcns[0]!==curs[0]&&moveBlock(fcns[0],x,y)){
          animationQueue.push(['playerPos',player.x+x,player.y+y]);
          return true;
        }
        if(fcns[0]!==curs[0]&&fcns[0]!==0){
          steps--;
          return true;
        }
      }
    }
    else if((keys[32]||keys[10]||keys[13])&&nexs[0]>0&&nexs[1]===curs[0]){
      if(fcns[0]>0&&(x!==fc[0]||y!==fc[1])&&fcns[0]!==curs&&moveBlock(fcns[0],x,y)){
        animationQueue.push(['playerPos',player.x+x,player.y+y]);
        return true;
      }
      if(fcns[0]!==curs[0]&&fcns[0]!==0){
        steps--;
        return true;
      }
    }

    else if((keys[32]||keys[10]||keys[13])&&curs[0]>0&&nexs[0]===curs[1]){
      if(fcns[0]>0&&fcns[0]!==nexs&&moveBlock(fcns[0],x,y)){
        animationQueue.push(['playerPos',player.x+x,player.y+y]);
        return true;
      }
      if(fcns[0]!==nexs[0]&&fcns[0]!==0){
        steps--;
        return true;
      }
    }
    if(keys[32]||keys[10]||keys[13]){ret=true;}
    if(player.x+x<0||player.x+x>=levels[level].size.width||
    player.y+y<0||player.y+y>=levels[level].size.height){
      if(ret){steps--;return true;}
      return;
    }
    if(curs[0]===nexs[0]){
        animationQueue.push(['playerPos',player.x+x,player.y+y]);
        return ret;
    }
    if(nexs[0]>0&&nexs[1]===curs[0]){
      animationQueue.push(['playerPos',player.x+x,player.y+y]);
      return ret;
    }
    if(curs[0]>0&&nexs[0]===curs[1]){
      animationQueue.push(['playerPos',player.x+x,player.y+y]);
      return ret;
  }
  }
  if(ret){steps--;return true;}
}
function movePlayer(x,y){
  steps++;
  let curs=gameGrid[player.x][player.y];
  let nexs=[0,0],ret=false;
  if(keys[32]||keys[10]||keys[13]){ret=true;}
  var fc=[0,0];
  switch(player.facing){
      case(0):
          fc=[0,1];
      break;case(1):
          fc=[-1,0];
      break;case(2):
          fc=[0,-1];
      break;case(3):
          fc=[1,0];
      break;
  }
  let fcns=[0,0];
  if(player.x+fc[0]>=0&&player.y+fc[1]>=0&&player.x+fc[0]<gameGrid.length&&player.y+fc[1]<gameGrid[0].length){
    fcns=gameGrid[player.x+fc[0]][player.y+fc[1]];
  }
  if(player.x+x>=0&&player.x+x<levels[level].size.width&&
    player.y+y>=0&&player.y+y<levels[level].size.height){
    nexs=gameGrid[player.x+x][player.y+y];
    if(nexs[1]===player.z){
      nexs=[nexs[1],-1];
    }
  }
  else{
    return ret;
  }

  if(ret&&(player.z===nexs[0]||(fcns[0]===nexs[0]&&!player.z))){
    if(player.x+fc[0]>=0&&player.y+fc[1]>=0&&player.x+fc[0]<levels[level].size.width&&player.y+fc[1]<levels[level].size.height){
      if(fcns[0]>0&&fcns[0]!==curs[0]&&moveBlock(fcns[0],x,y)){
        animationQueue.push(['playerPos',player.x+x,player.y+y]);
        return true;
      }
      if(fcns[0]!==curs[0]&&fcns[0]!==0){
        steps--;
        return true;
      }
    }
  }
  if(player.z===nexs[0]||player.z===nexs[1]){
      animationQueue.push(['playerPos',player.x+x,player.y+y]);
      return ret;
  }
  return ret;
}
function drawBoard(L,tx,ty){
  var W=1/(L.size.width+1),H=1/(L.size.height+1);
  for(let i=L.size.width-1;i>=0;i--){
    for(let j=L.size.height-1;j>=0;j--){
      imageInSquare(groundTile,W*(i+0.5),H*(j+1),W,H,tx,ty);
    }
  }
  for(let j=0;j<L.size.height;j++){
    let bots=[];
    let clp=false;
    for(let i=gameGrid.length-1;i>=0;i--){
      bots.push([]);
    }
    for(let sl=0;sl<shells.length;sl++){
      if(Math.ceil(shells[sl].y)===j||Math.floor(shells[sl].y)===j){
        bots[shells[sl].x].push([shells[sl].x,shells[sl].y,shells[sl].z,shells[sl].facing,W,H,tx,ty,shellImg]);
      }
    }
    if(Math.ceil(player.y)===j||Math.floor(player.y)===j){
      if(Math.floor(player.y)!==j){
        clp=true;
      }
      if((keys[32]||keys[10]||keys[13])&&counter%4<2){
        bots[Math.ceil(player.x)].push([player.x,player.y,player.z,player.facing,W,H,tx,ty,playerImgA]);
        if(Math.ceil(player.x)!==player.x){
          bots[Math.floor(player.x)].push([player.x,player.y,player.z,player.facing,W,H,tx,ty,playerImgA,true]);
        }
      }
      else if(keys[32]||keys[10]||keys[13]){
        bots[Math.ceil(player.x)].push([player.x,player.y,player.z,player.facing,W,H,tx,ty,playerImgB]);
        if(Math.ceil(player.x)!==player.x){
          bots[Math.floor(player.x)].push([player.x,player.y,player.z,player.facing,W,H,tx,ty,playerImgB,true]);
        }
      }
      else{
        bots[Math.ceil(player.x)].push([player.x,player.y,player.z,player.facing,W,H,tx,ty,playerImg]);
        if(Math.ceil(player.x)!==player.x){
          bots[Math.floor(player.x)].push([player.x,player.y,player.z,player.facing,W,H,tx,ty,playerImg,true]);
        }
      }
    }
    for(let i=gameGrid.length-1;i>=0;i--){
      let nd=-1;
      if(animationQueue.length>0&&animationQueue[0][0]==='moveBlock'){
        for(let k=0;k<animationQueue[0][4].length;k++){
          if(animationQueue[0][4][k][0]===i&&animationQueue[0][4][k][1]===j){
            if(animationQueue[0][4][k][2]>=0){
              if(animationQueue[0][4][k][2]>0){
                  imageInSquare(tiles[animationQueue[0][4][k][2]].img,W*(i+animationQueue[0][2]*animationQueue[0][5]+0.5),H*(j+animationQueue[0][3]*animationQueue[0][5]+1-animationQueue[0][4][k][2]*0.125),W,H*(1+animationQueue[0][4][k][2]*0.125),tx,ty);
                  imageInSquare(tiles[animationQueue[0][1]].wall,W*(i+animationQueue[0][2]*animationQueue[0][5]+0.5),H*(j+animationQueue[0][3]*animationQueue[0][5]+2-animationQueue[0][4][k][2]*0.125),W,H*(animationQueue[0][4][k][2]*0.125),tx,ty);
              }
              for(let s=0;s<bots[i].length;s++){
                if(bots[i][s][2]<animationQueue[0][1]){
                  drawPlayer(...bots[i][s]);
                  bots[i].splice(s,1);
                  s--;
                }
                else if(bots[i][s][1]+animationQueue[0][5]===1||bots[i][s][1]===animationQueue[0][5]){
                  nd=s;
                }
              }
              imageInSquare(tiles[animationQueue[0][4][k][2]].elevatorTube,W*(i+animationQueue[0][2]*animationQueue[0][5]+0.5),H*(j+animationQueue[0][3]*animationQueue[0][5]+1-animationQueue[0][1]*0.125),W,H,tx,ty);
              imageInSquare(tiles[animationQueue[0][1]].elevator,W*(i+animationQueue[0][2]*animationQueue[0][5]+0.5),H*(j+animationQueue[0][3]*animationQueue[0][5]+1-animationQueue[0][1]*0.125),W,H*(1+animationQueue[0][1]*0.125),tx,ty);
            }
            else{
              imageInSquare(tiles[animationQueue[0][1]].img,W*(i+animationQueue[0][2]*animationQueue[0][5]+0.5),H*(j+animationQueue[0][3]*animationQueue[0][5]+1-animationQueue[0][1]*0.125),W,H*(1+animationQueue[0][1]*0.125),tx,ty);
            }
            if(animationQueue[0][4][k][2]===-2){
              imageInSquare(goal,W*(i+animationQueue[0][2]*animationQueue[0][5]+0.5),H*(j+animationQueue[0][3]*animationQueue[0][5]+1-animationQueue[0][1]*0.125),W,H,tx,ty);
            }
          }
        }
      }
      if(nd>=0){
        drawPlayer(...bots[i][nd]);
        bots[i].splice(nd,1);
      }
      if(gameGrid[i][j][0]){
        if(gameGrid[i][j][1]>=0){
          imageInSquare(tiles[gameGrid[i][j][1]].img,W*(i+0.5),H*(j+1-gameGrid[i][j][1]*0.125),W,H*(1+gameGrid[i][j][1]*0.125),tx,ty);
          imageInSquare(tiles[gameGrid[i][j][0]].wall,W*(i+0.5),H*(j+2-gameGrid[i][j][1]*0.125),W,H*(gameGrid[i][j][1]*0.125),tx,ty);
            for(let s=0;s<bots[i].length;s++){
              if(bots[i][s][2]<gameGrid[i][j][0]){
                drawPlayer(...bots[i][s]);
                bots[i].splice(s,1);
                s--;
              }
            }
          imageInSquare(tiles[gameGrid[i][j][1]].elevatorTube,W*(i+0.5),H*(j+1-gameGrid[i][j][0]*0.125),W,H,tx,ty);
          imageInSquare(tiles[gameGrid[i][j][0]].elevator,W*(i+0.5),H*(j+1-gameGrid[i][j][0]*0.125),W,H*(1+gameGrid[i][j][0]*0.125),tx,ty);
        }
        else{
          imageInSquare(tiles[gameGrid[i][j][0]].img,W*(i+0.5),H*(j+1-gameGrid[i][j][0]*0.125),W,H*(1+gameGrid[i][j][0]*0.125),tx,ty);
        }
      }
      if(gameGrid[i][j][1]===-2){
        imageInSquare(goal,W*(i+0.5),H*(j+1-gameGrid[i][j][0]*0.125),W,H,tx,ty);
      }

      for(let s=0;s<bots[i].length;s++){
        drawPlayer(...bots[i][s],clp,clp);
      }
    }
  }
}

//scenes
function s0(tx,ty){
  ctx.drawImage(title,tx>>0,ty>>0,min>>0,min>>0);
  switch(ARType){
    case(1):
      button(0.1*w,0.55*h,0.8*w,0.3*w,()=>{sb=1});
      if( window.innerHeight == screen.height) {
        button(0.84*w,h-0.16*w,0.15*w,0.15*w,()=>{document.exitFullscreen()});
      }
      else{
        button(0.75*w,h-0.25*w,0.2*w,0.2*w,()=>{document.body.requestFullscreen()});
      }
    break;
    case(2):
      button(0.2*w,0.6*h,0.6*w,0.2*w,()=>{sb=1});
      if( window.innerHeight == screen.height) {
        button(0.84*w,h-0.16*w,0.15*w,0.15*w,()=>{document.exitFullscreen()});
      }
      else{
        button(0.82*w,h-0.18*w,0.15*w,0.15*w,()=>{document.body.requestFullscreen()});
      }
    break;
    case(3):
      button(0.5*(w-min)+min*0.2,0.6*h,0.6*min,0.2*min,()=>{sb=1});
      if( window.innerHeight == screen.height) {
        button(0.89*w,h-0.11*w,0.1*w,0.1*w,()=>{document.exitFullscreen()});
      }
      else{
        button(0.89*w,h-0.11*w,0.1*w,0.1*w,()=>{document.body.requestFullscreen()});
      }
    break;
  }
  ctx.fillStyle=colors[0];
  ctx.textAlign='left';
  ctx.font=(0.03*min>>0)+"px sans-serif";
  ctx.fillText("v"+version,0.05*w,h-0.01*min);
  ctx.textAlign='center';
  ctx.fillText("By Edward Haas @efhiii",w/2,h-0.01*min);
}
function s1(tx,ty){
  switch(ARType){
    case(1):
      if(h/w>1.4){
        button(0.1*w,h-((h-min)*0.25+0.1*w),0.2*w,0.2*w,()=>{});
        button(0.7*w,h-((h-min)*0.25+0.1*w),0.2*w,0.2*w,()=>{});

        button(0,(h-min)*0.25-0.1*w,0.5*w,0.2*w,()=>{sb=0});
      }
      else{
        button(0.1*w,h-0.5*(h-min),0.5*(h-min),0.5*(h-min),()=>{});
        button(w-w*0.1-0.5*(h-min),h-0.5*(h-min),0.5*(h-min),0.5*(h-min),()=>{});

        button(0,0,1.25*(h-min),0.5*(h-min),()=>{sb=0});
      }
    break;
    case(2):
      button(w-0.25*h-w/h*(w/h)*100,0,0.14*h,0.14*h,()=>{});
      button(w-0.14*h-w/h*(w/h)*20,0,0.14*h,0.14*h,()=>{});

      button(0,0,0.4*h,0.14*h,()=>{sb=0});
    break;
    case(3):
      button(0.05*w,0.5*h-0.05*w,0.1*w,0.1*w,()=>{});
      button(0.85*w,0.5*h-0.05*w,0.1*w,0.1*w,()=>{});

      button(0,0,0.2*w,0.08*w,()=>{sb=0});
    break;
  }

  ctx.font=(0.03*min>>0)+'px sans-serif';
  ctx.textAlign='center';
  for(let i=0;i<4;i++){
    for(let j=0;j<4;j++){
      let lvl,onL;
      switch(ARType){
        case(1):
          ctx.fillStyle='black';
          lvl=i+j*4+16*levelScreen;
          if(lvl>unlocked){
            ctx.fillRect((i*0.25)*min+1,ty+(j*0.25)*min+1,0.25*min-2,0.25*min-2);
          }
          else{
            onL=levels[lvl];
            if(onL.best){
              if(onL.best<onL.stepGoals[0]){
                //image(platinumStarImg,i*130+45,j*130+75,120,120);
              }
              else if(onL.best<=onL.stepGoals[0]){
                //image(threeStarsImg,i*130+45,j*130+75,120,120);
              }
              else if(onL.best<=onL.stepGoals[1]){
                //image(twoStarsImg,i*130+45,j*130+75,120,120);
              }
              else{
                //image(oneStarImg,i*130+45,j*130+75,120,120);
              }
            }
            else{
              //image(onImg,i*130+45,j*130+80,120,120);
            }
            button((i*0.25)*min+1,ty+(j*0.25)*min+1,0.25*min-2,0.25*min-2,()=>{
              sb=2;
              level=i+j*4+16*levelScreen;
              setupLevel(levels[level]);
            });
          }
          ctx.fillStyle='white';
          ctx.fillText(lvl<levels.length?levels[lvl].title:"",((i+0.5)*0.25)*min>>0,ty+((j+0.96)*0.25)*min>>0);
        break;
        case(2):
          ctx.fillStyle='black';

          lvl=i+j*4+16*levelScreen;

          if(lvl>unlocked){
            if(w>h*0.85){
              ctx.fillRect((w-h*0.85)/2+(i*0.25)*(h*0.85)+1,0.15*h+(j*0.25)*(h*0.85)+1,0.25*(h*0.85)-2,0.25*(h*0.85)-2);
            }
            else{
              ctx.fillRect((i*0.25)*min+1,0.15*h+(j*0.25)*min+1,0.25*min-2,0.25*min-2);
            }
            //image(lockedImg,i*130+45,j*130+80,120,120);
          }
          else{
            onL=levels[lvl];
            if(onL.best){
              if(onL.best<onL.stepGoals[0]){
                //image(platinumStarImg,i*130+45,j*130+75,120,120);
              }
              else if(onL.best<=onL.stepGoals[0]){
                //image(threeStarsImg,i*130+45,j*130+75,120,120);
              }
              else if(onL.best<=onL.stepGoals[1]){
                //image(twoStarsImg,i*130+45,j*130+75,120,120);
              }
              else{
                //image(oneStarImg,i*130+45,j*130+75,120,120);
              }
            }
            else{
              //image(onImg,i*130+45,j*130+80,120,120);
            }

            if(w>h*0.85){
              button((w-h*0.85)/2+(i*0.25)*(h*0.85)+1,0.15*h+(j*0.25)*(h*0.85)+1,0.25*(h*0.85)-2,0.25*(h*0.85)-2,()=>{
                sb=2;
                level=i+j*4+16*levelScreen;
                setupLevel(levels[level]);
              });
            }
            else{
              button((i*0.25)*min+1,0.15*h+(j*0.25)*min+1,0.25*min-2,0.25*min-2,()=>{
                sb=2;
                level=i+j*4+16*levelScreen;
                setupLevel(levels[level]);
              });
            }
          }

          ctx.fillStyle='white';
          if(w>h*0.85){
            ctx.fillText(lvl<levels.length?levels[lvl].title:"",(w-h*0.85)/2+((i+0.5)*0.25)*(h*0.85)>>0,0.15*h+((j+0.96)*0.25)*(h*0.85)>>0);
          }
          else{
            ctx.fillText(lvl<levels.length?levels[lvl].title:"",(i*0.25)*min+0.125*min>>0,0.15*h+((j+0.96)*0.25)*min>>0);
          }

        break;
        case(3):
          ctx.fillStyle='black';
          let mn=0,px=0,py=0;
          if(min>0.6*w){
            mn=0.6*w;
            px=(w-0.6*w)/2;
            py=(h-0.6*w)/2;
          }
          else{
            mn=min;
            px=(w-min)/2;
          }

          lvl=i+j*4+16*levelScreen;

          if(lvl>unlocked){
            ctx.fillRect(px+(i*0.25)*mn+1,py+(j*0.25)*mn+1,0.25*mn-2,0.25*mn-2);
            //image(lockedImg,i*130+45,j*130+80,120,120);
          }
          else{
            onL=levels[lvl];
            if(onL.best){
              if(onL.best<onL.stepGoals[0]){
                //image(platinumStarImg,i*130+45,j*130+75,120,120);
              }
              else if(onL.best<=onL.stepGoals[0]){
                //image(threeStarsImg,i*130+45,j*130+75,120,120);
              }
              else if(onL.best<=onL.stepGoals[1]){
                //image(twoStarsImg,i*130+45,j*130+75,120,120);
              }
              else{
                //image(oneStarImg,i*130+45,j*130+75,120,120);
              }
            }
            else{
              //image(onImg,i*130+45,j*130+80,120,120);
            }
            button(px+(i*0.25)*mn+1,py+(j*0.25)*mn+1,0.25*mn-1,0.25*mn-2,()=>{
              sb=2;
              level=i+j*4+16*levelScreen;
              setupLevel(levels[level]);
            });
          }
          ctx.fillStyle='white';
          ctx.fillText(lvl<levels.length?levels[lvl].title:"",px+(i*0.25)*mn+0.125*mn,py+(j*0.25)*mn+0.24*mn);
        break;
      }
    }
  }
}
function s2(tx,ty){
  ctx.fillStyle=colors[0];
  switch(ARType){
    case(1):
      ctx.font=(min/10>>0)+"px sans-serif";
      ctx.textAlign='center';
      ctx.fillText(steps+"/"+levels[level].stepGoals[2],0.5*w,0.1*(h-min)+min/16);

      if(levels[level].best){
        ctx.font=(min/20>>0)+"px sans-serif";
        ctx.fillText("best: "+levels[level].best,0.5*w,0.25*(h-min)+min/16);
      }
      if(h/w>1.4){
        //button(0.1*w,h-((h-min)*0.25+0.1*w),0.2*w,0.2*w,()=>{});
        //button(0.7*w,h-((h-min)*0.25+0.1*w),0.2*w,0.2*w,()=>{});

        if(mobile){
          button(0.2*w,h-0.5*(h-min),0.8*w,0.5*(h-min),()=>{keys[10]=!keys[10]});
          button(0,h-0.5*(h-min),0.2*w,0.5*(h-min),()=>{});
        }
        else{
          button(0.4*w,h-(h-min)*0.25-0.1*w,0.2*w,0.2*w,()=>{});
        }

        button(0.8*w,(h-min)*0.25-0.1*w,0.2*w,0.2*w,()=>{});
        button(0,(h-min)*0.25-0.1*w,0.2*w,0.2*w,()=>{sb=1});
      }
      else{
        //button(0.1*w,h-0.5*(h-min),0.5*(h-min),0.5*(h-min),()=>{});
        //button(w-w*0.1-0.5*(h-min),h-0.5*(h-min),0.5*(h-min),0.5*(h-min),()=>{});

        if(mobile){
          button(0.2*w,h-0.5*(h-min),0.8*w,0.5*(h-min),()=>{});
          button(0,h-0.5*(h-min),0.2*w,0.5*(h-min),()=>{});
        }
        else{
          button(0.5*w-0.25*(h-min),h-0.5*(h-min),0.5*(h-min),0.5*(h-min),()=>{});
        }

        button(w-0.5*(h-min),0,0.5*(h-min),0.5*(h-min),()=>{});
        button(0,0,0.5*(h-min),0.5*(h-min),()=>{sb=1});
      }
    break;
    case(2):
      ctx.font=(min/8>>0)+"px sans-serif";
      ctx.textAlign='left';
      ctx.fillText(steps+"/"+levels[level].stepGoals[2],0.3*w,0.11*h);

      button(w-0.25*h-w/h*(w/h)*50,0,0.14*h,0.14*h,()=>{});
      button(w-0.13*h-w/h*(w/h)*20,0,0.14*h,0.14*h,()=>{});

      button(0,0,0.14*h,0.14*h,()=>{sb=1});
    break;
    case(3):
      ctx.font=(w/20>>0)+"px sans-serif";
      ctx.textAlign='center';
      ctx.fillText(steps+"/"+levels[level].stepGoals[2],0.1*w,0.13*w);

      button(0.05*w,0.5*h-0.05*w,0.1*w,0.1*w,()=>{keys[10]=!keys[10]});
      button(0.85*w,0.5*h-0.05*w,0.1*w,0.1*w,()=>{});

      button(0,0,0.2*w,0.08*w,()=>{sb=1});
    break;
  }
  drawBoard(levels[level],tx,ty);
  animate();
}
let scene=0,sb=0;
const scenes=[s0,s1,s2];

//draw
let lt=0;
function drawCanvas(t){
  ctx.imageSmoothingQuality = "high";
  document.body.style.cursor='default';
  ctx.fillStyle="#242729";
  ctx.fillRect(0,0,w,h);
  /*
  target ARs:
  16:9
  1:1
  9:16
  */
  let tx=0;
  let ty=0;
  if(w>h){
    tx=(w-min)/2;
  }
  else{
    ty=(h-min)/2;
  }

  scenes[scene](tx,ty);
  scene=sb;

  ctx.fillStyle='white';
  ctx.font='20px sans-serif';
  ctx.textAlign='left';
  ctx.fillText((1000/(t-lt)>>0)+" FPS",5,20);
  lt=t;

  if(t){
    window.requestAnimationFrame(drawCanvas);
    counter++;
    if(counter>127){counter=0;}
  }
}
window.requestAnimationFrame(drawCanvas);

//event listeners
var beatLevel=function(){
  if(levels[level].stepGoals[2]-steps<0){setupLevel(levels[level]);return;}
  drawCanvas(false);
  if(!levels[level].best||levels[level].best>steps){
    levels[level].best=steps?steps:levels[level].stepGoals[2];
  }
  sb=1;

  if(level===unlocked&&unlocked+1<levels.length){unlocked++;}
};

window.onresize = ()=>{
  c.width=window.innerWidth;
  c.height=window.innerHeight;
  w=c.width;
  h=c.height;
  getARType(w/h);
}

window.onkeydown = (event)=>{
  keys[event.keyCode]=true;
  if(scene===2){
    let tempAnimationQueue=JSON.stringify(animationQueue);
    let tempPlayer=JSON.stringify(player);
    let tempGrid=JSON.stringify(gameGrid);
    while(animationQueue.length>0){
      animate();
    }
    switch(event.keyCode){
      case(90)://Z
        for(let i=0;i<shells.length;i++){
          if(shells[i].x===player.x&&shells[i].y===player.y){
            animationQueue.push(["transport",i,player.z,shells[i].z]);
            steps++;
          }
        }
      break;
      case(37)://LEFT_ARROW
      case(65):
        if(!movePlayer(-1,0)){
          if(player.facing===1&&animationQueue.length===0){steps--;}
          animationQueue.unshift(["facing",1]);
        }
      break;
      case(39)://RIGHT_ARROW
      case(68):
        if(!movePlayer(1,0)){
          if(player.facing===3&&animationQueue.length===0){steps--;}
          animationQueue.unshift(["facing",3]);
        }
      break;
      case(38)://UP_ARROW
      case(87):
        if(!movePlayer(0,-1)){
          if(player.facing===2&&animationQueue.length===0){steps--;}
          animationQueue.unshift(["facing",2]);
        }
      break;
      case(40)://DOWN_ARROW
      case(83):
        if(!movePlayer(0,1)){
          if(player.facing===0&&animationQueue.length===0){steps--;}
          animationQueue.unshift(["facing",0]);
        }
      break;
    }
    animationQueue=JSON.parse(tempAnimationQueue).concat(animationQueue);
    gameGrid=JSON.parse(tempGrid);
    player=JSON.parse(tempPlayer);
  }
}

window.onkeyup = (event)=>{
  keys[event.keyCode]=false;
}

window.onmousemove = (event)=>{
  mouseX=event.clientX;
  mouseY=event.clientY;
}

window.onmouseup = (event)=>{
  if(!mobile){
    mouseIsPressed=true;
    last=false;
    drawCanvas(false);
    mouseIsPressed=false;
    last=true;
  }
}

window.onmouseleave = (event)=>{
  mouseIsPressed=false;
  last=true;
}

let ltouch=[0,0];
window.ontouchstart = (event)=>{
  mouseX=event.touches[0].clientX;
  mouseY=event.touches[0].clientY;
  ltouch=[mouseX,mouseY];
}
window.ontouchend = (event)=>{
  if(animationQueue.length>0){return}
  if((mouseX-ltouch[0])*(mouseX-ltouch[0])+(mouseY-ltouch[1])*(mouseY-ltouch[1])>200){
    if((mouseX-ltouch[0])/Math.abs(mouseY-ltouch[1])<-2){
      if(!movePlayer(-1,0)){
        if(player.facing===1&&animationQueue.length===0){steps--;}
        animationQueue.splice(animationQueue.length-1,0,["facing",1]);
      }
    }
    else if((mouseX-ltouch[0])/Math.abs(mouseY-ltouch[1])>2){
      if(!movePlayer(1,0)){
        if(player.facing===3&&animationQueue.length===0){steps--;}
        animationQueue.splice(animationQueue.length-1,0,["facing",3]);
      }
    }
    else if((mouseY-ltouch[1])/Math.abs(mouseX-ltouch[0])<-2){
      if(!movePlayer(0,-1)){
        if(player.facing===2&&animationQueue.length===0){steps--;}
        animationQueue.splice(animationQueue.length-1,0,["facing",2]);
      }
    }
    else if((mouseY-ltouch[1])/Math.abs(mouseX-ltouch[0])>2){
      if(!movePlayer(0,1)){
        if(player.facing===0&&animationQueue.length===0){steps--;}
        animationQueue.splice(animationQueue.length-1,0,["facing",0]);
      }
    }
  }

  mouseIsPressed=true;
  last=false;
  drawCanvas(false);
  mouseIsPressed=false;
  last=true;
  mouseX=-1;
  mouseY=-1;
}

window.ontouchmove = (event) =>{
  mouseX=event.touches[0].clientX;
  mouseY=event.touches[0].clientY;
};

document.addEventListener('contextmenu', event => event.preventDefault());
