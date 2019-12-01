/*
TODO:
graphics:
asset creation
- add in blocks
- make blocks have height
- only drag things taller than you
- undo button
- animation stack
- remove side-stepping
- add tutorial
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

let version="0.2";
let level=0;
let levels=[
  {
    title:"Baby steps",
    size:{width:4,height:4},
    start:{x:0,y:0},
    board:[
      [[3,-1],[2,-1],[1,-1],[0,-1]],
      [[3,-1],[2, 1],[1,-1],[0,-2]],
      [[3,-1],[2,-1],[1,-1],[0,-1]],
      [[3,-1],[3, 2],[1, 0],[0,-1]],
    ],
    stepGoals:[12,14,15],
    best:0
  },
  {
    title:"Push",
    size:{width:4,height:4},
    start:{x:0,y:2},
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
    board:[
      [[1,-1],[1, 0],[1,-1],[0,-1]],
      [[0,-1],[0,-1],[0,-1],[0,-1]],
      [[0,-1],[0,-1],[0,-1],[0,-1]],
      [[2,-2],[2,-1],[2, 1],[0,-1]]
    ],
    stepGoals:[8,10,12],
    best:0
  },
  {
    title:"Drag",
    size:{width:3,height:3},
    start:{x:0,y:0},
    board:[
      [[0,-1],[0,-1],[0,-1]],
      [[2,-2],[1,-1],[0,-1]],
      [[2, 0],[1,-1],[0,-1]],
    ],
    stepGoals:[7,8,9],
    best:0
  },
  {
    title:"Grabbing nothing",
    size:{width:4,height:4},
    start:{x:2,y:1},
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

let steps=0;
let gameGrid=[];
const player={x:0,y:0,facing:0};

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

const tiles=[
  {
    img:groundTile,
    elevator:groundTile
  },
  {
    img:tile1,
    elevator:elevatorTile1
  },
  {
    img:tile2,
    elevator:elevatorTile2
  },
  {
    img:tile3,
    elevator:elevatorTile3
  },
  {
    img:tile4,
    elevator:elevatorTile4
  },
  {
    img:tile5,
    elevator:elevatorTile5
  },
  {
    img:tile6,
    elevator:elevatorTile6
  },
];

//x is in % of region (0-1)
function getPosX(ancor,x,tx){
  switch(ancor){
    case(0)://middle center square
      return w/2+x*minx/2>>0
    case(1)://top left
    case(3)://bottom left
    case(5)://top
    case(8)://bottom
      return x*w>>0
    case(2)://top right
    case(4)://bottom right
      return w-x*w>>0
    case(6)://left
      return x*(w-minx)/2>>0
    case(7)://right
      return w-x*(w/2-minx)>>0
  }
}

//buttons
const btns=[];
function btn(ARType,sc,f,x,y,w,h){
  this.ARType=ARType;
  this.sc=sc;
  this.f=f;//function when clicked
  this.x=x;
  this.y=y;
  this.w=w;//width
  this.h=h;//height
}
btn.prototype.draw=function(){
  if(scene!==this.sc||ARType!==this.ARType){return;}
  ctx.textAlign='center';
  ctx.fillStyle=colors[2];
  if(mouseX>this.x*w&&
    mouseX<(this.x+this.w)*w&&
    mouseY>this.y*h&&
    mouseY<(this.y+this.h)*h){
      ctx.fillStyle="rgba(0,0,0,50)";
      document.body.style.cursor='pointer';
      if(!last&&mouseIsPressed){this.f();last=true;}
  }
  ctx.strokeStyle=colors[0];
  ctx.fillRect(this.x*w>>0,this.y*h>>0,this.w*w>>0,this.h*h>>0);
}
btns.push(
    //new btn(1,0,function(){sb=1;},0.1,0.7,0.8,0.15),
    //new btn(1,2,function(){sb=1;levelScreen=0;},0.01,0.01,0.3,0.08),
    //new btn(1,1,function(){sb=0;},0.01,0.01,0.3,0.08),

    //new btn(2,0,function(){sb=1;},0.2,0.6,0.6,0.2),
    //new btn(2,2,function(){sb=1;levelScreen=0;},0.02,0.02,0.18,0.08),
    //new btn(2,1,function(){sb=0;},0.02,0.02,0.18,0.08),

    //new btn(3,0,function(){sb=1;},0.3,0.6,0.4,0.2),
    //new btn(3,2,function(){sb=1;levelScreen=0;},0.02,0.02,0.15,0.1),
    //new btn(3,1,function(){sb=0;},0.02,0.02,0.15,0.1),
    //new btn(2,function(){setupLevel(levels[level]);},130,10,50,50,""),
    //new btn(2,function(){keys[32]=!keys[32];},50,650,500,100,"Grab","100px serif"),
    //new btn(3,function(){keys[32]=!keys[32];},-150,50,100,500,"G\nr\na\nb","75px serif")
);
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

/*game Objects*/
function moveBlock(block,x,y){
  let W=levels[level].size.width;
  let H=levels[level].size.height;
  let ar=[];
  for(let i=W-1;i>=0;i--){
    for(let j=H-1;j>=0;j--){
      if(gameGrid[i][j][0]===block&&(i+x<0||j+y<0||i+x>=W||j+y>=H||gameGrid[i+x][j+y][0]&&gameGrid[i+x][j+y][0]!=block)){
        console.log("at");
        console.log([i,j]);
        console.log("move");
        console.log(block);
        console.log("over");
        console.log([x,y]);
        return;
      }
      else if (gameGrid[i][j][0]===block) {
        ar.push([i,j,gameGrid[i][j][1]]);
      }
    }
  }
  for(let i=ar.length-1;i>=0;i--){
      gameGrid[ar[i][0]][ar[i][1]]=[0,0];
  }
  for(let i=ar.length-1;i>=0;i--){
      gameGrid[ar[i][0]+x][ar[i][1]+y]=[block,ar[i][2]];
  }
  return true;
}

//game functions
function setupLevel(L){
  steps=0;
  gameGrid=[];
  player.x=L.start.x;
  player.y=L.start.y;
  player.facing=0;
  for(var i=0;i<L.size.width;i++){
    gameGrid.push([]);
    for(var j=0;j<L.size.height;j++){
      gameGrid[i].push(L.board[i][j]);
    }
  }
};
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
};
function drawPlayer(W,H,tx,ty){
  //imageInSquare(playerImg,W*(player.x+0.5),H*(player.y+1-gameGrid[player.x][player.y][0]*0.125),W,H,tx,ty);
  switch(ARType){
    case(1):
      ctx.save();
      ctx.translate(W*(player.x+0.5)*min+0.5*W*min,ty+H*(player.y+1-gameGrid[player.x][player.y][0]*0.125)*min+0.5*H*min,W*min,H*min);
      ctx.rotate(player.facing*Math.PI*0.5);
      ctx.drawImage(playerImg,-0.5*W*min,-0.5*H*min,W*min,H*min);
      ctx.restore();
    break;
    case(2):
      if(w>h*0.85){
        //ctx.drawImage(img,0.5*(w-h*0.85)+x*(h*0.85),0.15*h+y*(h*0.85),W*h*0.85,H*h*0.85);
      }
      else{
        //ctx.drawImage(img,x*min,0.15*h+y*min,W*min,H*min);
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
      //ctx.drawImage(img,px+mn*x,py+mn*y,mn*W,mn*H);
    break;
  }
  if(keys[32]||keys[10]||keys[13]){}//magnet on
};
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
          player.x+=x;
          player.y+=y;
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
        player.x+=x;
        player.y+=y;
        return true;
      }
      if(fcns[0]!==curs[0]&&fcns[0]!==0){
        steps--;
        return true;
      }
    }

    else if((keys[32]||keys[10]||keys[13])&&curs[0]>0&&nexs[0]===curs[1]){
      if(fcns[0]>0&&fcns[0]!==nexs&&moveBlock(fcns[0],x,y)){
        player.x+=x;
        player.y+=y;
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
        player.x+=x;
        player.y+=y;
        return ret;
    }
    if(nexs[0]>0&&nexs[1]===curs[0]){
      player.x+=x;
      player.y+=y;
      return ret;
    }
    if(curs[0]>0&&nexs[0]===curs[1]){
      player.x+=x;
      player.y+=y;
      return ret;
  }
  }
  if(ret){steps--;return true;}
};
function drawBoard(L,tx,ty){
  var W=1/(L.size.width+1),H=1/(L.size.height+1);
  for(var i=L.size.width-1;i>=0;i--){
    for(var j=L.size.height-1;j>=0;j--){
      //rect(50+W*i,75+H*j,W,H);
      //imageInSquare(groundTile,W*i,H*j,W,H,tx,ty);
      imageInSquare(groundTile,W*(i+0.5),H*(j+1),W,H,tx,ty);
    }
  }
  for(var j=0;j<L.size.height;j++){
    for(var i=gameGrid.length-1;i>=0;i--){
      //drawBlock(blocks[gameGrid[i][j]-1],i,j,W,H);switch(ARType){
      if(gameGrid[i][j]){
        if(gameGrid[i][j][1]>=0){
          imageInSquare(tiles[gameGrid[i][j][1]].img,W*(i+0.5),H*(j+1-gameGrid[i][j][1]*0.125),W,H*(1+gameGrid[i][j][1]*0.125),tx,ty);
          imageInSquare(tiles[gameGrid[i][j][0]].elevator,W*(i+0.5),H*(j+1-gameGrid[i][j][0]*0.125),W,H*(1+gameGrid[i][j][0]*0.125),tx,ty);
        }
        else{
          imageInSquare(tiles[gameGrid[i][j][0]].img,W*(i+0.5),H*(j+1-gameGrid[i][j][0]*0.125),W,H*(1+gameGrid[i][j][0]*0.125),tx,ty);
        }
        if(gameGrid[i][j][1]===-2){
          imageInSquare(goal,W*(i+0.5),H*(j+1-gameGrid[i][j][0]*0.125),W,H,tx,ty);
        }
      }
    }
    if(player.y===j){
      drawPlayer(W,H,tx,ty);
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
          //ctx.fillRect(0,ty,min,min);
          ctx.fillStyle='black';
          lvl=i+j*4+16*levelScreen;
          if(lvl>unlocked){
            ctx.fillRect((i*0.25)*min+1,ty+(j*0.25)*min+1,0.25*min-2,0.25*min-2);
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
          //ctx.fillRect(0.2*w,0,0.6*w,min);
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
  //if(levels[level].stepGoals[2]-steps<=0){setupLevel(levels[level]);}

  //if(levels[level].best){
  //  ctx.font=(min/10>>0)+"px sans-serif";
  //  ctx.textAlign='right';
  //  ctx.fillText("best: "+levels[level].best,0.95*w,0.1*min);
  //}

  //image(resetImg,136,16,40,40);
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
  for(let i=btns.length-1;i>=0;i--){
    btns[i].draw();
  }
  scene=sb;

  ctx.fillStyle='white';
  ctx.font='20px sans-serif';
  ctx.textAlign='left';
  ctx.fillText((1000/(t-lt)>>0)+" FPS",5,20);
  lt=t;

  //ctx.fillStyle='red';
  //ctx.fillRect(mouseX-25,mouseY-25,50,50);
  if(t){
    window.requestAnimationFrame(drawCanvas);
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
    let beforeMove=player.x+","+player.y;
    switch(event.keyCode){
      case(37)://LEFT_ARROW
      case(65):
        if(!movePlayer(-1,0)){
          if(player.facing===1&&beforeMove===player.x+","+player.y){steps--;}
          player.facing=1;
        }
      break;
      case(39)://RIGHT_ARROW
      case(68):
        if(!movePlayer(1,0)){
          if(player.facing===3&&beforeMove===player.x+","+player.y){steps--;}
          player.facing=3;
        }
      break;
      case(38)://UP_ARROW
      case(87):
        if(!movePlayer(0,-1)){
          if(player.facing===2&&beforeMove===player.x+","+player.y){steps--;}
          player.facing=2;
        }
      break;
      case(40)://DOWN_ARROW
      case(83):
        if(!movePlayer(0,1)){
          if(player.facing===0&&beforeMove===player.x+","+player.y){steps--;}
          player.facing=0;
        }
      break;
    }
    if(gameGrid[player.x][player.y][1]===-2){
      beatLevel();
    }
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
  if((mouseX-ltouch[0])*(mouseX-ltouch[0])+(mouseY-ltouch[1])*(mouseY-ltouch[1])>200){
    let beforeMove=player.x+","+player.y;
    if((mouseX-ltouch[0])/Math.abs(mouseY-ltouch[1])<-2){
      if(!movePlayer(-1,0)){
        if(player.facing===1&&beforeMove===player.x+","+player.y){steps--;}
        player.facing=1;
      }
    }
    else if((mouseX-ltouch[0])/Math.abs(mouseY-ltouch[1])>2){
      if(!movePlayer(1,0)){
        if(player.facing===3&&beforeMove===player.x+","+player.y){steps--;}
        player.facing=3;
      }
    }
    else if((mouseY-ltouch[1])/Math.abs(mouseX-ltouch[0])<-2){
      if(!movePlayer(0,-1)){
        if(player.facing===2&&beforeMove===player.x+","+player.y){steps--;}
        player.facing=2;
      }
    }
    else if((mouseY-ltouch[1])/Math.abs(mouseX-ltouch[0])>2){
      if(!movePlayer(0,1)){
        if(player.facing===0&&beforeMove===player.x+","+player.y){steps--;}
        player.facing=0;
      }
    }


    if(gameGrid[player.x][player.y][1]===-2){
      beatLevel();
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
