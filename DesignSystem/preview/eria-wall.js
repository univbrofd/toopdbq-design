/* WdEriaWall — 領域境界の押し出しジオメトリ生成。
   window.EriaWall.build(el, {seed,n,r,h,blds,state}) で .ew-scene を組み立てる。
   壁色はブランドの --gradient-colorful の 11 stop を一周でサンプリングし、
   暗い stop だけ輝度下限までリフトして「一周つながって見える」ようにする。   */
(function(){
const PAL=['#fff0a6','#bfcc96','#80a787','#40837f','#005f67','#60566f','#804e78','#bf4680','#ff3e88','#e86f6d','#d0a052'];
function lift(hex){let r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);const L=(.2126*r+.7152*g+.0722*b)/255;if(L>=.38)return hex;const t=(.38-L)/(1-L)*.85;const m=v=>Math.round(v+(255-v)*t).toString(16).padStart(2,'0');return '#'+m(r)+m(g)+m(b)}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

function build(el,o){
  if(!el)return;
  const rnd=mulberry32(o.seed),N=o.n,R=o.r,H=o.h,S=Math.round(R*(o.ground||3));
  const pts=[];
  for(let i=0;i<N;i++){const a=i/N*Math.PI*2-Math.PI/2;pts.push([Math.cos(a)*R,Math.sin(a)*R])}
  const uid='u'+o.seed,cleared=o.state==='cleared';
  const edge=cleared?'#4caf50':'url(#p'+uid+')';
  let h='<div class="ew-grd" style="width:'+S+'px;height:'+S+'px;margin:'+(-S/2)+'px 0 0 '+(-S/2)+'px"></div>';
  h+='<svg class="ew-svg" width="'+S+'" height="'+S+'" viewBox="'+(-S/2)+' '+(-S/2)+' '+S+' '+S+'" style="margin:'+(-S/2)+'px 0 0 '+(-S/2)+'px"><defs>'+
     '<filter id="b'+uid+'" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="'+(R/26).toFixed(1)+'"/></filter>'+
     '<linearGradient id="p'+uid+'" x1="0" y1="0" x2="1" y2="1">'+PAL.map((c,i)=>'<stop offset="'+(i/(PAL.length-1)*100).toFixed(0)+'%" stop-color="'+c+'"/>').join('')+'</linearGradient></defs>'+
     '<circle r="'+R+'" fill="'+(cleared?'rgba(76,175,80,.045)':'rgba(255,62,136,.05)')+'"/>'+
     '<circle r="'+R+'" fill="none" stroke="'+edge+'" stroke-width="'+(R/22).toFixed(1)+'" opacity="'+(o.blds>20?.30:.18)+'" filter="url(#b'+uid+')"/>'+
     '<circle r="'+R+'" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="1.2"/></svg>';
  const placed=[];
  for(let t=0;t<o.blds*14&&placed.length<o.blds;t++){
    const ang=rnd()*Math.PI*2,rad=R*.22+rnd()*(R*.66);
    const w=R*.045+rnd()*R*.085,d=R*.045+rnd()*R*.085;
    if(rad+Math.max(w,d)*.75>R-R*.07)continue;
    const x=Math.cos(ang)*rad,y=Math.sin(ang)*rad;
    if(placed.some(p=>Math.abs(p.x-x)<(p.w+w)/2+R*.02&&Math.abs(p.y-y)<(p.d+d)/2+R*.02))continue;
    placed.push({x,y,w,d,hh:H*.08+rnd()*rnd()*H*.55});
  }
  for(const b of placed){
    h+='<div class="ew-bld" style="transform:translate3d('+b.x.toFixed(1)+'px,'+b.y.toFixed(1)+'px,0)">'+
      '<i class="t" style="width:'+b.w.toFixed(1)+'px;height:'+b.d.toFixed(1)+'px;margin:'+(-b.d/2).toFixed(1)+'px 0 0 '+(-b.w/2).toFixed(1)+'px;transform:translateZ('+b.hh.toFixed(1)+'px)"></i>'+
      '<i class="s" style="width:'+b.w.toFixed(1)+'px;height:'+b.hh.toFixed(1)+'px;margin:'+(-b.hh/2).toFixed(1)+'px 0 0 '+(-b.w/2).toFixed(1)+'px;transform:translate3d(0,'+(b.d/2).toFixed(1)+'px,'+(b.hh/2).toFixed(1)+'px) rotateX(-90deg)"></i>'+
      '<i class="s2" style="width:'+b.d.toFixed(1)+'px;height:'+b.hh.toFixed(1)+'px;margin:'+(-b.hh/2).toFixed(1)+'px 0 0 '+(-b.d/2).toFixed(1)+'px;transform:translate3d('+(b.w/2).toFixed(1)+'px,0,'+(b.hh/2).toFixed(1)+'px) rotateZ(90deg) rotateX(-90deg)"></i></div>';
  }
  for(let i=0;i<N;i++){
    const a=pts[i],b=pts[(i+1)%N],dx=b[0]-a[0],dy=b[1]-a[1];
    const len=Math.hypot(dx,dy)+1,ang=Math.atan2(dy,dx)*180/Math.PI;
    const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;
    const c=cleared?'#7fd183':lift(PAL[Math.min(PAL.length-1,Math.round(i/N*(PAL.length-1)))]);
    const hh=H*(cleared?.6:1);
    const base='width:'+len.toFixed(1)+'px;margin-left:'+(-len/2).toFixed(1)+'px;';
    h+='<div class="ew-seg" style="--c:'+c+';'+base+'height:'+hh.toFixed(1)+'px;margin-top:'+(-hh/2).toFixed(1)+'px;transform:translate3d('+mx.toFixed(1)+'px,'+my.toFixed(1)+'px,0) rotateZ('+ang.toFixed(2)+'deg) rotateX(-90deg) translateY('+(-hh/2).toFixed(1)+'px)"></div>';
    h+='<div class="ew-cap" style="--c:'+c+';'+base+'height:3px;margin-top:-1.5px;transform:translate3d('+mx.toFixed(1)+'px,'+my.toFixed(1)+'px,0) rotateZ('+ang.toFixed(2)+'deg) rotateX(-90deg) translateY('+(-(hh-1.5)).toFixed(1)+'px)"></div>';
  }
  if(!cleared)h+='<div class="ew-core"></div><div class="ew-core r"></div>';
  el.querySelector('.ew-scene').innerHTML=h;
}

/* ポップアップの高さ合わせ — "Quest" の行が壁の頂点（天端リム最上部）と
   同じ高さに来るように mount の top を実測して決める。
   scale() された部分木では rect が縮尺後 px なのでローカル倍率で割る。 */
function seatPopups(){
  document.querySelectorAll('.ew-popup').forEach(p=>{
    const scope=p.parentElement;
    const stage=scope.classList.contains('ew')?scope:scope.querySelector('.ew');
    if(!stage)return;
    const caps=stage.querySelectorAll('.ew-cap');if(!caps.length)return;
    let capTop=1e9;caps.forEach(c=>{const b=c.getBoundingClientRect();if(b.top<capTop)capTop=b.top});
    const sr=stage.getBoundingClientRect(),k=(sr.width/stage.offsetWidth)||1;
    const lab=p.querySelector('.qp-mount > .qp .qp-label')||p.querySelector('.qp-label')||p;
    const lr=lab.getBoundingClientRect(),pr=p.getBoundingClientRect();
    const centerY=(pr.top+pr.height/2-sr.top)/k;
    const delta=((lr.top+lr.height/2)-capTop)/k;
    p.style.top=(centerY-delta)+'px';
  });
}

function countdown(){
  const cds=[...document.querySelectorAll('[data-countdown]')].map(e=>({e,s:+e.dataset.countdown}));
  if(!cds.length)return;
  setInterval(()=>{for(const c of cds){c.s=c.s>0?c.s-1:0;const h=Math.floor(c.s/3600),m=Math.floor(c.s%3600/60),s=c.s%60;
    c.e.textContent=String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')}},1000);
}

window.EriaWall={build,seatPopups,countdown,PAL};
addEventListener('resize',seatPopups);
})();
