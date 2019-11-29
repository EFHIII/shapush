const c = document.getElementById("canvas");
const ctx = c.getContext("2d");
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

let w=c.width,h=c.height,mobile=isMobile();


function drawCanvas(){
  ctx.fillStyle="#323232";
  if(mobile){
    ctx.fillStyle="#f00";
  }
  ctx.fillRect(0,0,w,h);
  window.requestAnimationFrame(drawCanvas);
}
window.requestAnimationFrame(drawCanvas);

window.onresize = ()=>{
  c.width=window.innerWidth;
  c.height=window.innerHeight;
  w=c.width;
  h=c.height;
}

document.ontouchmove = (event)=>{
  event.preventDefault();
}
