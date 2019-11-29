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
const title=new Image();
title.src = 'assets/title.png';
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

//asset stuff
const colors=["white","grey","#151515","white","blue"];

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
      console.log("hover");
      ctx.fillStyle="rgba(0,0,0,50)";
      if(!mobile){
        document.body.style.cursor='pointer';
      }
      if(!last&&mouseIsPressed){this.f();last=true;}
  }
  ctx.strokeStyle=colors[0];
  ctx.fillRect(this.x*w>>0,this.y*h>>0,this.w*w>>0,this.h*h>>0);
}
btns.push(
    new btn(1,0,function(){sb=1;},0.1,0.7,0.8,0.15),
    new btn(1,2,function(){sb=1;},0.05,0.05,0.1,0.1),
    new btn(1,1,function(){sb=0;},0.05,0.05,0.1,0.1),

    new btn(2,0,function(){sb=1;},0.2,0.6,0.6,0.2),
    new btn(2,2,function(){sb=1;},0.05,0.05,0.1,0.1),
    new btn(2,1,function(){sb=0;},0.05,0.05,0.1,0.1),

    new btn(3,0,function(){sb=1;},0.3,0.6,0.4,0.2),
    new btn(3,2,function(){sb=1;},0.05,0.05,0.1,0.1),
    new btn(3,1,function(){sb=0;},0.05,0.05,0.1,0.1),
    new btn(2,function(){setupLevel(levels[level]);resetMatrix();bufImg=get(0,0,width,height);},130,10,50,50,""),
    new btn(2,function(){keys[32]=!keys[32];},50,650,500,100,"Grab","100px serif"),
    new btn(3,function(){keys[32]=!keys[32];},-150,50,100,500,"G\nr\na\nb","75px serif")
);

//scenes
function s0(tx,ty){
  ctx.drawImage(title,tx,ty,min,min);
}
function s1(tx,ty){

}
let scene=0,sb=0;
const scenes=[s0,s1];

//draw
let lt=0;
function drawCanvas(t){
  if(!mobile){
    document.body.style.cursor='default';
  }
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
  ctx.fillText((1000/(t-lt)>>0)+" FPS",40,20);
  lt=t;

  //ctx.fillStyle='red';
  //ctx.fillRect(mouseX-25,mouseY-25,50,50);

  window.requestAnimationFrame(drawCanvas);
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

window.onmousedown = (event)=>{
  mouseIsPressed=true;
  last=false;
}

window.onmouseup = (event)=>{
  mouseIsPressed=false;
  last=true;
}

window.onmouseleave = (event)=>{
  mouseIsPressed=false;
  last=true;
}

window.ontouchstart = (event)=>{
  mouseX=event.touches[0].clientX;
  mouseY=event.touches[0].clientY;
  mouseIsPressed=true;
  last=false;
  for(let i=btns.length-1;i>=0;i--){
    btns[i].draw();
  }
}

window.ontouchend = (event)=>{
  mouseIsPressed=false;
  last=true;
}

window.ontouchmove = (event) =>{
  mouseX=event.touches[0].clientX;
  mouseY=event.touches[0].clientY;
};

document.addEventListener('contextmenu', event => event.preventDefault());
