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

let levelScreen=0;
let unlocked=0;

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

//scenes
function s0(tx,ty){
  ctx.drawImage(title,tx,ty,min,min);
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

  /*
  for(var i=0;i<4;i++){
          for(var j=0;j<4;j++){
              noFill();
              stroke(colors[0]);
              rect(i*130+45,j*130+80,120,120,5);
              fill(colors[0]);
              var lvl=i+j*4+16*levelScreen;
              if(lvl>unlocked){
                  image(lockedImg,i*130+45,j*130+80,120,120);
                  if(lvl<levels.length){
                      text(levels[lvl].title,i*130+105,j*130+185);
                  }
              }
              else{
                  var onL=levels[lvl];
                  if(onL.best){
                      if(onL.best<onL.stepGoals[0]){
                          image(platinumStarImg,i*130+45,j*130+75,120,120);
                      }
                      else if(onL.best<=onL.stepGoals[0]){
                          image(threeStarsImg,i*130+45,j*130+75,120,120);
                      }
                      else if(onL.best<=onL.stepGoals[1]){
                          image(twoStarsImg,i*130+45,j*130+75,120,120);
                      }
                      else{
                          image(oneStarImg,i*130+45,j*130+75,120,120);
                      }
                  }
                  else{
                      image(onImg,i*130+45,j*130+80,120,120);
                  }
                  text(onL.title,i*130+105,j*130+185);
                  if(truePos(mouseX,0)[0]>i*130+45&&truePos(mouseX,0)[0]<i*130+165&&truePos(0,mouseY)[1]>j*130+80&&truePos(0,mouseY)[1]<j*130+200){
                      cursor('pointer');
                  }
              }
          }
      }
  */

  ctx.font=(0.03*min>>0)+'px sans-serif';
  ctx.textAlign='center';
  for(var i=0;i<4;i++){
    for(var j=0;j<4;j++){
      let lvl;
      switch(ARType){
        case(1):
          //ctx.fillRect(0,ty,min,min);
          ctx.fillStyle='black';
          ctx.fillRect((i*0.25)*min+1,ty+(j*0.25)*min+1,0.25*min-2,0.25*min-2);
          lvl=i+j*4+16*levelScreen;
          if(lvl>unlocked){
              //image(lockedImg,i*130+45,j*130+80,120,120);
              //if(lvl<levels.length){
              //    text(levels[lvl].title,i*130+105,j*130+185);
              //}
          }
          ctx.fillStyle='white';
          ctx.fillText("level "+(lvl+1),((i+0.5)*0.25)*min>>0,ty+((j+0.96)*0.25)*min>>0);
        break;
        case(2):
          ctx.fillStyle='black';
          //ctx.fillRect(0,0.15*h,w,h*0.85);

          //ctx.fillRect((i*0.25+0.01)*w,0.15*h+(j*0.25+0.01)*h*0.85,0.23*w,0.23*h*0.85);
          lvl=i+j*4+16*levelScreen;

          if(w>h*0.85){
            ctx.fillRect((w-h*0.85)/2+(i*0.25)*(h*0.85)+1,0.15*h+(j*0.25)*(h*0.85)+1,0.25*(h*0.85)-2,0.25*(h*0.85)-2);
            ctx.fillStyle='white';
            ctx.fillText("level "+(lvl+1),(w-h*0.85)/2+((i+0.5)*0.25)*(h*0.85)>>0,0.15*h+((j+0.96)*0.25)*(h*0.85)>>0);
          }
          else{
            ctx.fillRect((i*0.25)*min+1,0.15*h+(j*0.25)*min+1,0.25*min-2,0.25*min-2);
            ctx.fillStyle='white';
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
          ctx.fillRect(px+(i*0.25)*mn+1,py+(j*0.25)*mn+1,0.25*mn-2,0.25*mn-2);

          lvl=i+j*4+16*levelScreen;

          ctx.fillStyle='white';
          ctx.fillText("level "+(lvl+1),px+(i*0.25)*mn+0.125*mn,py+(j*0.25)*mn+0.24*mn);
        break;
      }
    }
  }
}
let scene=0,sb=0;
const scenes=[s0,s1];

//draw
let lt=0;
function drawCanvas(t){
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
  ctx.fillText((1000/(t-lt)>>0)+" FPS",40,20);
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
  mouseIsPressed=true;
  last=false;
  drawCanvas();
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
}

window.ontouchend = (event)=>{
  mouseIsPressed=true;
  last=false;
  drawCanvas();
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
