(()=>{
'use strict';
const $=s=>document.querySelector(s), stream=$('#infinite-stream'), gate=$('#music-gate'), btn=$('#audio-toggle'), crt=$('#crt-static'), gx=$('#glitch-layer');
const R=a=>a[(Math.random()*a.length)|0];
const WORD=['NOISE','SIGNAL','BODY','VOID','ERROR','MEMORY','PIXEL','BLOOD','RADIO','ARCHIVE','STATIC','DEATH GRIPS','RUIDO','SEÑAL','CUERPO','ZARATA','BRUIT','LÄRM','ノイズ','噪音','ШУМ','404','NULL','0xFF','NUL','ESC','BEL','▓','▒','░','█','╬','╪','∞','☠','♥','CTRL','VOID'];
const CP=['☺','☻','♥','♦','♣','♠','♪','♫','☼','►','◄','↑','↓','→','←','░','▒','▓','│','─','┼','╚','╗','█','▄','▀','α','Γ','π','Σ','Ω','∞','±','≥','≤','√','■'];
let n=0;
function line(){
 const k=5+((Math.random()*16)|0), a=[];
 for(let i=0;i<k;i++){
   if(Math.random()<.18){let x=(Math.random()*128)|0;a.push('0x'+x.toString(16).padStart(2,'0').toUpperCase());}
   else a.push(Math.random()<.22?R(CP):R(WORD));
 }
 return a.join(' ');
}
function add(count=12){
 const f=document.createDocumentFragment();
 for(let i=0;i<count;i++){
   const d=document.createElement('div'); d.className='stream-block';
   d.innerHTML='<span class="'+R(['mono','heavy','pixel','wide','ghost','broken'])+'">'+line()+'</span>';
   f.appendChild(d); n++;
 }
 stream&&stream.appendChild(f);
}
function grow(){
 if(!stream)return;
 const left=document.documentElement.scrollHeight-scrollY-innerHeight;
 if(left<innerHeight*20)add(24);
 // keep DOM light: recycle old blocks after a large buffer instead of infinite accumulation
 const q=stream.children;
 if(q.length>420 && scrollY>innerHeight*40){
   for(let i=0;i<60&&q.length;i++) q[0].remove();
   scrollBy(0,-innerHeight*6);
 }
}
add(80); grow();
addEventListener('scroll',grow,{passive:true});
setInterval(grow,900);

// Minimal CRT/glitch: one cheap canvas burst, no permanent animation.
if(crt){
 const c=crt.getContext('2d');
 function noise(){
  crt.width=96;crt.height=64;
  const im=c.createImageData(96,64),d=im.data;
  for(let i=0;i<d.length;i+=4){const v=Math.random()<.5?0:255;d[i]=d[i+1]=d[i+2]=v;d[i+3]=150}
  c.putImageData(im,0,0);crt.classList.add('on');setTimeout(()=>crt.classList.remove('on'),70);
 }
 setInterval(()=>{if(Math.random()>.72)noise()},1200);
}

// Small, robust audio engine for iOS/Safari.
let ac=null, master=null, sources=[], on=false;
async function startAudio(){
 try{
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
  if(!ac||ac.state==='closed'){
   ac=new AC();
   master=ac.createGain();master.gain.value=.42;master.connect(ac.destination);
   // Tiny 8-bit handheld sound: square channels + crude low-rate noise.
   const crush=ac.createWaveShaper(),cg=ac.createGain();
   const curve=new Float32Array(256);for(let i=0;i<256;i++){const x=i/127.5-1;curve[i]=Math.round(x*7)/7}
   crush.curve=curve;crush.oversample='none';cg.gain.value=.72;crush.connect(cg).connect(master);
   const o1=ac.createOscillator(),o2=ac.createOscillator(),g1=ac.createGain(),g2=ac.createGain();
   o1.type='square';o2.type='square';o1.frequency.value=110;o2.frequency.value=165;
   g1.gain.value=.11;g2.gain.value=.055;o1.connect(g1).connect(crush);o2.connect(g2).connect(crush);o1.start();o2.start();sources.push(o1,o2);
   const len=Math.max(256,(ac.sampleRate*.18)|0),b=ac.createBuffer(1,len,ac.sampleRate),d=b.getChannelData(0);
   let hold=0,v=0;for(let i=0;i<len;i++){if(!(hold++%24))v=Math.random()<.5?-1:1;d[i]=v*.65}
   const ns=ac.createBufferSource(),ng=ac.createGain();ns.buffer=b;ns.loop=true;ng.gain.value=.085;ns.connect(ng).connect(crush);ns.start();sources.push(ns);
   const notes=[55,65.41,73.42,82.41,98,110,130.81,146.83,164.81,196,220,261.63,293.66,329.63,392,440,523.25];
   setInterval(()=>{if(on&&ac&&ac.state==='running'){
     const a=R(notes),bad=Math.random()<.3?1.03:1;
     o1.frequency.setValueAtTime(a*bad,ac.currentTime);
     o2.frequency.setValueAtTime(R(notes)*(Math.random()<.35?1.015:1),ac.currentTime);
     g1.gain.setValueAtTime(.035+Math.random()*.13,ac.currentTime);
     g2.gain.setValueAtTime(.018+Math.random()*.08,ac.currentTime);
     ng.gain.setValueAtTime(.025+Math.random()*.12,ac.currentTime);
   }},110+((Math.random()*170)|0));
  }
  if(ac.state==='suspended')await ac.resume();
  on=ac.state==='running';
  if(btn)btn.textContent=on?'NOISE ON':'START NOISE';
  return on;
 }catch(e){console.log(e);return false}
}
function stopAudio(){
 if(!ac)return;
 master.gain.setTargetAtTime(.0001,ac.currentTime,.03);on=false;if(btn)btn.textContent='START NOISE';
}
async function enter(e){
 if(e)e.preventDefault();
 if(gate){gate.style.display='none';gate.classList.add('gone')}
 document.body.classList.add('music-entered');
 await startAudio();
}
if(gate){
 gate.removeAttribute('onclick');
 gate.addEventListener('click',enter,{passive:false});
 gate.addEventListener('touchend',enter,{passive:false});
}
if(btn)btn.addEventListener('click',async()=>{if(on)stopAudio();else await startAudio()});
})();