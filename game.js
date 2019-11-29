const c = document.getElementById("canvas");
const ctx = c.getContext("2d", { alpha: false });
c.style.backgroundColor="red";
c.width=window.innerWidth;
c.height=window.innerHeight;

function isMobile() {
  var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
  var mq = function(query) {
return window.matchMedia(query).matches;
  }

  if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
return true;
  }
  var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
  return mq(query);
}

let w=c.width,h=c.height,mobile=isMobile(),ARType=1;
let min=w>h?h:w;
const title=new Image();
title.src = 'assets/title.png';

function getARType(AR){
  if(AR<0.8){ARType=1;return;}
  if(AR>1.2){ARType=3;return;}
  ARType=2;
}
getARType();

function s0(){
  let tx=0;
  let ty=0;
  if(w>h){
    tx=(w-min)/2;
  }
  else{
    ty=(h-min)/2;
  }
  ctx.drawImage(title,tx,ty,min,min);
}
function s1(){

}

scene=0;
scenes=[s0,s1];
function drawCanvas(){
  ctx.fillStyle="#242729";
  ctx.fillRect(0,0,w,h);
  /*
  target ARs:
  16:9
  1:1
  9:16
  */
  scenes[scene]();
  window.requestAnimationFrame(drawCanvas);
}

window.requestAnimationFrame(drawCanvas);

window.onresize = ()=>{
  c.width=window.innerWidth;
  c.height=window.innerHeight;
  w=c.width;
  h=c.height;
  min=w>h?h:w;
  getARType();
}

document.ontouchmove = (event)=>{
  event.preventDefault();
}
