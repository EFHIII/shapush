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
        goal:{x:1,y:3},
        blocks:[
            {
                ramps:[[3,0],[1,2]],
                squares:[[0,1],[1,1],[2,1],[3,1]]
            },
            {
                ramps:[],
                squares:[[0,2],[1,2],[2,2],[3,2]]
            },
            {
                ramps:[[3,2]],
                squares:[[0,3],[1,3],[2,3],[3,3]]
            },
        ],
        stepGoals:[12,14,15],
        best:0
    },
    {
        title:"Push",
        size:{width:4,height:4},
        start:{x:0,y:0},
        goal:{x:3,y:1},
        blocks:[
            {
                ramps:[[1,0]],
                squares:[[3,1],[3,2],[3,3]],
            },
            {
                ramps:[],
                squares:[[0,1],[1,1],[2,1]],
            },
        ],
        stepGoals:[6,7,8],
        best:0
    },
    {
        title:"Pull",
        size:{width:4,height:4},
        start:{x:0,y:0},
        goal:{x:3,y:2},
        blocks:[
            {
                ramps:[[1,0]],
                squares:[[1,0],[1,1],[1,2],[0,3],[1,3],[2,3],[3,3]],
            },
            {
                ramps:[[0,1]],
                squares:[[3,0],[3,1],[3,2]],
            },
        ],
        stepGoals:[8,10,12],
        best:0
    },
    {
        title:"Drag",
        size:{width:3,height:3},
        start:{x:0,y:0},
        goal:{x:2,y:1},
        blocks:[
            {
                ramps:[[1,0]],
                squares:[[2,1],[2,2]]
            },
            {
                ramps:[],
                squares:[[1,1],[1,2]]
            },
        ],
        stepGoals:[7,8,9],
        best:0
    },
    {
        title:"On top",
        size:{width:4,height:4},
        start:{x:0,y:0},
        goal:{x:0,y:3},
        blocks:[
            {
                ramps:[[3,0],[2,2]],
                squares:[[0,1],[1,1],[2,1],[3,1]]
            },
            {
                ramps:[],
                squares:[[0,2],[1,2]]
            },
            {
                ramps:[[3,2]],
                squares:[[0,3],[1,3],[2,3],[3,3]]
            },
        ],
        stepGoals:[15,17,18],
        best:0
    },
    {
        title:"Move around",
        size:{width:6,height:6},
        start:{x:0,y:0},
        goal:{x:3,y:3},
        blocks:[
            {
                ramps:[[0,2]],
                squares:[[2,2],[3,2],[2,3],[3,3]]
            },
            {
                ramps:[[2,0]],
                squares:[[4,1],[4,2],[4,3],[4,4]]
            }
        ],
        stepGoals:[14,16,20],
        best:0
    },
    {
        title:"U",
        size:{width:5,height:5},
        start:{x:2,y:4},
        goal:{x:3,y:0},
        blocks:[
            {
                ramps:[],
                squares:[[1,0],[1,1]],
            },
            {
                ramps:[],
                squares:[[3,0],[3,1]],
            },
            {
                ramps:[[0,1],[2,2],[3,0]],
                squares:[[1,2],[3,2],[1,3],[2,3],[3,3]],
            },
        ],
        stepGoals:[19,21,23],
        best:0
    },
    {
        title:"More complex",
        size:{width:5,height:5},
        start:{x:0,y:0},
        goal:{x:0,y:1},
        blocks:[
            {
                ramps:[],
                squares:[[2,0],[2,1],[2,2]]
            },
            {
                ramps:[[3,3]],
                squares:[[0,1],[1,1],[0,2],[1,2]]
            },
            {
                ramps:[[3,0]],
                squares:[[3,1],[4,1],[3,2],[4,2]]
            },
        ],
        stepGoals:[24,26,28],
        best:0
    },
    {
        title:"A variation",
        size:{width:5,height:5},
        start:{x:0,y:0},
        goal:{x:2,y:2},
        blocks:[
            {
                ramps:[[0,2]],
                squares:[[2,0],[2,1],[2,2]]
            },
            {
                ramps:[[1,3]],
                squares:[[0,1],[0,2],[1,2]]
            },
            {
                ramps:[[2,0]],
                squares:[[4,1],[3,2],[4,2]]
            },
        ],
        stepGoals:[33,34,36],
        best:0
    },
    {
        title:"Tight spaces",
        size:{width:5,height:5},
        start:{x:0,y:1},
        goal:{x:1,y:4},
        blocks:[
            {
                ramps:[],
                squares:[[0,0],[1,0],[1,1]],
            },
            {
                ramps:[[0,0],[1,4]],
                squares:[[3,0],[4,0],[3,1]],
            },
            {
                ramps:[[0,1]],
                squares:[[0,3],[1,3],[1,4]],
            },
            {
                ramps:[[1,1]],
                squares:[[3,3],[4,3],[3,4]],
            },
        ],
        stepGoals:[81,88,98],
        best:0
    },
];

let steps=0;
let gameGrid=[];
let blocks=[];
const player={x:0,y:0,facing:0};

//asset stuff
const colors=["white","grey","#151515","white","blue"];

const title=new Image();
title.src = 'assets/title.png';

const groundTile=new Image();
groundTile.src = 'assets/ground-tile.png';

const tile=new Image();
tile.src = 'assets/tile.png';

function getPosX(ancor,x,tx){//x is in % of region (0-1)
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
function block(data,id){
  this.ramps=data.ramps;
  this.goal=-1;
  this.squares=data.squares;
  this.offset={x:0,y:0};
  //this.c=bColors[id];
  this.id=id;
  for(let i=this.squares.length-1;i>=0;i--){
    if(levels[level].goal.x===this.squares[i][0]&&levels[level].goal.y===this.squares[i][1]){
      this.goal=i;
    }
    gameGrid[this.squares[i][0]][this.squares[i][1]]=id+1;
  }
};
block.prototype.move=function(x,y){
  for(var i=0;i<this.squares.length;i++){
    let X=this.squares[i][0]+this.offset.x+x;
    let Y=this.squares[i][1]+this.offset.y+y;
    if(X<0||Y<0||X>=levels[level].size.width||Y>=levels[level].size.height){
      return false;
    }
    let checking=gameGrid[X][Y];
    if(checking!==0&&checking!==this.id+1){
      return false;
    }
  }
  for(let i=0;i<this.squares.length;i++){
    gameGrid[this.squares[i][0]+this.offset.x][this.squares[i][1]+this.offset.y]=0;
  }
  for(let i=0;i<this.squares.length;i++){
    gameGrid[this.squares[i][0]+this.offset.x+x][this.squares[i][1]+this.offset.y+y]=this.id+1;
  }
  this.offset.x+=x;
  this.offset.y+=y;
  return true;
};

//game functions
var setupLevel=function(L){
  steps=0;
  gameGrid=[];
  blocks=[];
  player.x=L.start.x;
  player.y=L.start.y;
  player.facing=0;
  for(var i=0;i<L.size.width;i++){
    gameGrid.push([]);
    for(var j=L.size.height;j>0;j--){
      gameGrid[i].push(0);
    }
  }
  for(var i=0;i<L.blocks.length;i++){
    blocks.push(new block(L.blocks[i],i));
  }
};
function drawBoard(L,tx,ty){
  var W=1/L.size.width,H=1/L.size.height;
  for(var i=L.size.width-1;i>=0;i--){
    for(var j=L.size.height-1;j>=0;j--){
      //rect(50+W*i,75+H*j,W,H);
      switch(ARType){
        case(1):
          ctx.drawImage(groundTile,(i*0.25)*min,ty+(j*0.25)*min,0.25*min,0.25*min);
        break;
        case(2):
          if(w>h*0.85){
            ctx.drawImage(groundTile,0.5*(w-h*0.85)+(W*i)*(h*0.85),0.15*h+(H*j)*(h*0.85),W*h*0.85,H*h*0.85);
          }
          else{
            ctx.drawImage(groundTile,(W*i)*min,0.15*h+(H*j)*min,W*min,H*min);
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
          ctx.drawImage(groundTile,px+mn*W*i,py+mn*H*j,mn*W,mn*H);
          break;
      }
    }
  }
  for(var i=gameGrid.length-1;i>=0;i--){
    for(var j=gameGrid[i].length-1;j>=0;j--){
      if(gameGrid[i][j]){
        //drawBlock(blocks[gameGrid[i][j]-1],i,j,W,H);switch(ARType){
        switch(ARType){
          case(1):
            ctx.drawImage(tile,(i*0.25)*min,ty+(j*0.25)*min,0.25*min,0.25*min);
          break;
          case(2):
            if(w>h*0.85){
              ctx.drawImage(tile,0.5*(w-h*0.85)+(W*i)*(h*0.85),0.15*h+(H*j)*(h*0.85),W*h*0.85,H*h*0.85);
            }
            else{
              ctx.drawImage(tile,(W*i)*min,0.15*h+(H*j)*min,W*min,H*min);
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
            ctx.drawImage(tile,px+mn*W*i,py+mn*H*j,mn*W,mn*H);
          break;
        }
      }
    }
  }
  //drawPlayer(W,H);
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
          ctx.fillText("level "+(lvl+1),((i+0.5)*0.25)*min>>0,ty+((j+0.96)*0.25)*min>>0);
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
            ctx.fillText("level "+(lvl+1),(w-h*0.85)/2+((i+0.5)*0.25)*(h*0.85)>>0,0.15*h+((j+0.96)*0.25)*(h*0.85)>>0);
          }
          else{
            ctx.fillText("level "+(lvl+1),(i*0.25)*min+0.125*min>>0,0.15*h+((j+0.96)*0.25)*min>>0);
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
          ctx.fillText("level "+(lvl+1),px+(i*0.25)*mn+0.125*mn,py+(j*0.25)*mn+0.24*mn);
        break;
      }
    }
  }
}
function s2(tx,ty){
  ctx.fillStyle=colors[0];
  switch(ARType){
    case(1):
      ctx.font=(min/8>>0)+"px sans-serif";
      ctx.textAlign='center';
      ctx.fillText(steps+"/"+levels[level].stepGoals[2],0.5*w,0.2*(h-min)+min/16);
      if(h/w>1.4){
        //button(0.1*w,h-((h-min)*0.25+0.1*w),0.2*w,0.2*w,()=>{});
        //button(0.7*w,h-((h-min)*0.25+0.1*w),0.2*w,0.2*w,()=>{});

        if(mobile){
          button(0.2*w,h-0.5*(h-min),0.8*w,0.5*(h-min),()=>{});
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

      button(0.05*w,0.5*h-0.05*w,0.1*w,0.1*w,()=>{});
      button(0.85*w,0.5*h-0.05*w,0.1*w,0.1*w,()=>{});

      button(0,0,0.2*w,0.08*w,()=>{sb=1});
    break;
  }
  drawBoard(levels[level],tx,ty);
  //if(levels[level].stepGoals[2]-steps<=0){setupLevel(levels[level]);}
  if(levels[level].best){
    ctx.font=(min/10>>0)+"px sans-serif";
    ctx.textAlign='right';
    text("best: "+levels[level].best,0.95*w,0.1*min);
  }
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
window.onresize = ()=>{
  c.width=window.innerWidth;
  c.height=window.innerHeight;
  w=c.width;
  h=c.height;
  getARType(w/h);
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

window.ontouchstart = (event)=>{
  mouseX=event.touches[0].clientX;
  mouseY=event.touches[0].clientY;
}

window.ontouchend = (event)=>{
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
