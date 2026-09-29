(() => {
  const stream = document.getElementById('infinite-stream');
  const audioBtn = document.getElementById('audio-toggle');

  const noise=['000','13','23','404','808','666','999','01','10','101','NULL','ERR','▓','▒','░','//','::','[]','{}','<>','0x00','0xFF','1100101','101010','404_BODY','NO_DATA','SIG_LOSS','CACHE_MISS','FEED_LOOP','000000','RIP','ALT','CTRL','VOID'];
  const marks=['☠','👁','⌁','✂','♻','⚠','☼','🜏','⛓','⌘','☹','◼','◻','◆','◇','※'];
  const classes=['serif','heavy','mono','pixel','wide','junk','icon','broken','ghost','strike','invert','micro','drop','censor'];
  const lines=[
    'NOISE EATS TEXT TEXT KEEPS SCREAMING',
    'RUIDO COME TEXTO TEXTO SIGUE GRITANDO',
    'LE BRUIT MANGE LE TEXTE',
    'DER LÄRM FRISST DEN TEXT',
    'IL RUMORE MANGIA IL TESTO',
    '噪音吞噬文字但文字仍在尖叫',
    'ノイズはテキストを食べる',
    '소음은 텍스트를 먹는다',
    'الضجيج يلتهم النص',
    'ШУМ ПОЖИРАЕТ ТЕКСТ',
    'Ο ΘΟΡΥΒΟΣ ΤΡΩΕΙ ΤΟ ΚΕΙΜΕΝΟ',
    'ZARATAK TESTUA JATEN DU',
    'EL SOROLL DEVORA EL TEXT'
  ];
  const culture=[
    '<span class="mono">BLACKSTAR / LAZARUS / ★ / 2016</span>',
    '<span class="mono">YEEZUS / 808s / POWER / STATIC</span>',
    '<span class="score">E|--12--12/15--12--|| G|--14b16~~~--12--| B|--12h15p12--|</span>',
    '<span class="receipt">HUEVOS 02<br>TOMATE 04<br>PAN 01<br>LECHUGA 01<br>TOTAL 8.47</span>',
    '<span class="barcode">||| |||||| ||| | ||||||| || |||</span>',
    '<span class="ticket">TXN#808404 / 23:59 / VOID / CASH / NO RETURN</span>',
    '<span class="junk">████████ CENSORED BODY ████████</span>'
  ];

  const rnd = a => a[Math.floor(Math.random()*a.length)];
  function distortWord(word){
    let text=word;
    if(Math.random()>.68) text=text.slice(0,Math.max(1,Math.floor(text.length*(.34+Math.random()*.62))));
    return '<span class="'+rnd(classes)+'">'+
      (Math.random()>.52 ? rnd(noise)+' ' : '')+
      text+
      (Math.random()>.57 ? ' '+rnd(noise) : '')+
      (Math.random()>.82 ? ' '+rnd(marks) : '')+
      '</span>';
  }

  let serial=0;
  function makeBlock(){
    serial++;
    const parts=[];
    const count=7+Math.floor(Math.random()*10);
    for(let n=0;n<count;n++){
      parts.push(rnd(lines).split(' ').map(distortWord).join(' '));
      if(Math.random()>.36) parts.push('<span class="junk">'+rnd(noise)+' '+rnd(noise)+' '+rnd(marks)+'</span>');
      if(Math.random()>.5) parts.push(rnd(culture));
    }
    const el=document.createElement('section');
    el.className='stream-block';
    el.innerHTML='<div class="stream-index">INFINITE_NOISE_'+String(serial).padStart(7,'0')+' / RECYCLED_FEED / NO_END</div><p>'+parts.join(' ')+'</p>';
    return el;
  }

  function append(n){
    const frag=document.createDocumentFragment();
    for(let i=0;i<n;i++) frag.appendChild(makeBlock());
    stream.appendChild(frag);
  }

  // Enough initial content that the user never sees an empty runway.
  append(48);

  const MAX_BLOCKS=64;
  const RECYCLE=16;
  let busy=false;
  let lastY=window.scrollY;

  function recycleIfNeeded(){
    if(busy || !stream) return;
    busy=true;

    const viewportBottom=window.scrollY+window.innerHeight;
    const docHeight=document.documentElement.scrollHeight;
    const remaining=docHeight-viewportBottom;

    // Always extend well before the physical end.
    if(remaining < window.innerHeight*6){
      append(RECYCLE);
    }

    const blocks=stream.querySelectorAll('.stream-block');
    if(blocks.length > MAX_BLOCKS && window.scrollY > window.innerHeight*4){
      // Measure the exact height being removed.
      const victims=Array.from(blocks).slice(0,RECYCLE);
      const firstTop=victims[0].getBoundingClientRect().top;
      const lastBottom=victims[victims.length-1].getBoundingClientRect().bottom;
      const removedHeight=lastBottom-firstTop;

      victims.forEach(el=>el.remove());

      // Keep the same visual content under the finger/cursor.
      window.scrollBy(0,-removedHeight);

      // Replace what was deleted at the bottom.
      append(RECYCLE);
    }

    lastY=window.scrollY;
    requestAnimationFrame(()=>{ busy=false; });
  }

  window.addEventListener('scroll',recycleIfNeeded,{passive:true});
  window.addEventListener('touchmove',recycleIfNeeded,{passive:true});
  window.addEventListener('wheel',recycleIfNeeded,{passive:true});
  window.addEventListener('resize',recycleIfNeeded,{passive:true});

  // iOS Safari safety net: keep checking even if scroll events are coalesced.
  setInterval(recycleIfNeeded,200);


  // Keep visible text travelling with the user through the enormous virtual depth.
  // The DOM stays small; the stream is translated downward as scroll advances.
  let virtualBase=0;
  const CHUNK_PX=window.innerHeight*6;

  function followVirtualDepth(){
    if(!stream) return;
    const y=window.scrollY;
    const desiredBase=Math.max(0, Math.floor(y/CHUNK_PX)*CHUNK_PX);

    if(desiredBase!==virtualBase){
      virtualBase=desiredBase;
      stream.style.transform='translateY('+virtualBase+'px)';

      // Refresh a portion of the visible feed so it keeps mutating as depth increases.
      const blocks=stream.querySelectorAll('.stream-block');
      const replaceCount=Math.min(12,blocks.length);
      for(let i=0;i<replaceCount;i++){
        blocks[i].replaceWith(makeBlock());
      }
    }
  }

  window.addEventListener('scroll',followVirtualDepth,{passive:true});
  window.addEventListener('resize',followVirtualDepth,{passive:true});
  followVirtualDepth();


  // 100M-character procedural layer: generated in chunks, never all resident in memory.
  const CHAR_TARGET=100000000;
  const CHARSET='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{};:,.<>/?\\|~░▒▓█☠⌁※';
  let generatedChars=0;

  function randomChars(n){
    let out='';
    const step=2048;
    for(let i=0;i<n;i+=step){
      const len=Math.min(step,n-i);
      let chunk='';
      for(let j=0;j<len;j++) chunk+=CHARSET[Math.floor(Math.random()*CHARSET.length)];
      out+=chunk;
    }
    return out;
  }

  function makeCharBlock(size=12000){
    const el=document.createElement('section');
    el.className='stream-block char-noise';
    const n=Math.min(size,CHAR_TARGET-generatedChars);
    generatedChars+=n;
    el.innerHTML='<div class="stream-index">CHAR_STREAM '+generatedChars.toLocaleString('en-US')+' / 100,000,000</div><p class="mono">'+randomChars(n)+'</p>';
    return el;
  }

  function injectCharNoise(){
    if(!stream || generatedChars>=CHAR_TARGET) return;
    const batches=3;
    for(let i=0;i<batches && generatedChars<CHAR_TARGET;i++){
      stream.appendChild(makeCharBlock(12000));
    }
  }

  // Seed the first character field immediately.
  injectCharNoise();

  window.addEventListener('scroll',()=>{
    const remaining=document.documentElement.scrollHeight-(window.scrollY+window.innerHeight);
    if(remaining<window.innerHeight*10) injectCharNoise();
  },{passive:true});

  // Restore language switch.
  document.querySelectorAll('.lang').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.lang').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('.cutup').forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      document.querySelector('.cutup.'+btn.dataset.lang)?.classList.add('active');
    });
  });

  // Lightweight generative audio; starts only after user gesture.
  let ctx, master, osc, noiseNode;
  function startAudio(){
    if(ctx) return;
    const AudioCtx=window.AudioContext||window.webkitAudioContext;
    if(!AudioCtx) return;
    ctx=new AudioCtx();
    master=ctx.createGain();
    master.gain.value=.08;
    master.connect(ctx.destination);

    osc=ctx.createOscillator();
    const g=ctx.createGain();
    osc.type='sawtooth';
    osc.frequency.value=43;
    g.gain.value=.035;
    osc.connect(g).connect(master);
    osc.start();

    const buffer=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);
    const data=buffer.getChannelData(0);
    for(let i=0;i<data.length;i++) data[i]=Math.random()*2-1;
    noiseNode=ctx.createBufferSource();
    noiseNode.buffer=buffer;
    noiseNode.loop=true;
    const ng=ctx.createGain();
    ng.gain.value=.05;
    noiseNode.connect(ng).connect(master);
    noiseNode.start();

    audioBtn.textContent='NOISE ON';
  }

  audioBtn?.addEventListener('click',async()=>{
    startAudio();
    if(ctx?.state==='suspended') await ctx.resume();
  });

  window.addEventListener('scroll',()=>{
    if(!ctx || !osc || !master) return;
    const v=Math.min(1,Math.abs(window.scrollY-lastY)/600);
    osc.frequency.setTargetAtTime(35+v*120,ctx.currentTime,.05);
    master.gain.setTargetAtTime(.055+v*.09,ctx.currentTime,.05);
  },{passive:true});
})();

/* EXTREME_VISUAL_MODE */
(() => {
  const stream=document.getElementById('infinite-stream');
  if(!stream) return;

  const glyphs='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789░▒▓█<>[]{}//\\|!?#$%&*+=-_:;.,☠※⌁◼◻◆◇';
  let lastDepth=-1;

  function gibberish(n){
    let s='';
    for(let i=0;i<n;i++) s+=glyphs[(Math.random()*glyphs.length)|0];
    return s;
  }

  function mutateByDepth(){
    const depth=Math.floor(window.scrollY/Math.max(1,window.innerHeight));
    if(depth===lastDepth) return;
    lastDepth=depth;

    document.documentElement.style.setProperty('--depth',String(depth));

    // Add a limited but very dense chunk as the viewer moves deeper.
    if(depth%2===0){
      const block=document.createElement('section');
      block.className='stream-block char-noise extreme';
      block.innerHTML='<div class="stream-index">DEPTH_'+depth+' / SIGNAL_OVERLOAD</div><p class="mono">'+gibberish(6000)+'</p>';
      stream.appendChild(block);
    }

    // Keep DOM bounded while making the content feel increasingly corrupted.
    const blocks=stream.querySelectorAll('.stream-block');
    if(blocks.length>110){
      for(let i=0;i<20;i++) blocks[i]?.remove();
    }

    const victims=stream.querySelectorAll('.stream-block span');
    for(let i=0;i<Math.min(80,victims.length);i++){
      const el=victims[(Math.random()*victims.length)|0];
      if(!el) continue;
      if(Math.random()>.5) el.classList.toggle('void');
      if(Math.random()>.72) el.style.letterSpacing=(Math.random()*18-6).toFixed(1)+'px';
      if(Math.random()>.8) el.style.transform='skew('+(Math.random()*24-12).toFixed(1)+'deg)';
    }
  }

  addEventListener('scroll',mutateByDepth,{passive:true});
  addEventListener('touchmove',mutateByDepth,{passive:true});
  mutateByDepth();
})();


/* PUNK_ASSAULT_MODE */
(() => {
  const stream=document.getElementById('infinite-stream');
  if(!stream) return;

  const slogans=[
    'NO FUTURE / NO FEED / NO OWNER',
    'MAKE NOISE / BREAK FORMAT',
    'COPY / DAMAGE / REPEAT',
    'SIGNAL AGAINST SIGNAL',
    'NOTHING CLEAN SURVIVES',
    'RIP THE PAGE OPEN',
    'STATIC IS A WEAPON',
    'FEED THE MACHINE TRASH'
  ];

  let last=-1;

  function addPunkHit(depth){
    const hit=document.createElement('div');
    hit.className='punk-hit';
    hit.textContent=slogans[(Math.random()*slogans.length)|0];
    hit.style.setProperty('--rot',((Math.random()*16)-8).toFixed(1)+'deg');
    hit.style.setProperty('--x',((Math.random()*30)-15).toFixed(1)+'vw');
    stream.appendChild(hit);

    const stamp=document.createElement('div');
    stamp.className='punk-stamp';
    stamp.textContent=['VOID','NOISE','CTRL','RIP','ERROR','ANTI'][depth%6];
    stream.appendChild(stamp);
  }

  function punkify(){
    const depth=Math.floor(window.scrollY/Math.max(1,window.innerHeight));
    if(depth===last) return;
    last=depth;

    if(depth%3===0) addPunkHit(depth);

    document.body.classList.toggle('punk-invert',depth%7===0);
    document.body.classList.toggle('punk-crush',depth%5===0);

    const blocks=stream.querySelectorAll('.stream-block');
    const count=Math.min(18,blocks.length);
    for(let i=0;i<count;i++){
      const el=blocks[(Math.random()*blocks.length)|0];
      if(!el) continue;
      el.style.setProperty('--r',((Math.random()*8)-4).toFixed(1)+'deg');
      el.style.setProperty('--dx',((Math.random()*40)-20).toFixed(1)+'px');
      el.classList.toggle('punk-block',Math.random()>.35);
    }

    // Keep assault elements bounded.
    const hits=stream.querySelectorAll('.punk-hit,.punk-stamp');
    if(hits.length>40){
      for(let i=0;i<hits.length-40;i++) hits[i].remove();
    }
  }

  addEventListener('scroll',punkify,{passive:true});
  addEventListener('touchmove',punkify,{passive:true});
  punkify();
})();


/* FULLSCREEN_GLYPH_STREAM */
(() => {
  const stream=document.getElementById('infinite-stream');
  if(!stream) return;

  const glyphs=['A','X','0','1','?','!','▓','█','░','▒','☠','※','⌁','◆','◇','◼','◻','/','\\','+','-','=','[',']','{','}','<','>','#','%','&','*'];
  let glyphIndex=0;
  let lastDepth=-1;

  function addGlyphScreen(){
    const el=document.createElement('section');
    el.className='glyph-screen';
    const glyph=glyphs[(Math.random()*glyphs.length)|0];
    el.textContent=glyph;
    el.style.setProperty('--rot',((Math.random()*18)-9).toFixed(1)+'deg');
    el.style.setProperty('--scale',(0.85+Math.random()*0.55).toFixed(2));
    el.style.setProperty('--shift',((Math.random()*24)-12).toFixed(1)+'vw');
    stream.appendChild(el);
    glyphIndex++;
  }

  function deepenGlyphStream(){
    const depth=Math.floor(window.scrollY/Math.max(1,window.innerHeight));
    if(depth===lastDepth) return;
    lastDepth=depth;

    if(depth%2===0){
      addGlyphScreen();
      if(depth%6===0) addGlyphScreen();
    }

    const screens=stream.querySelectorAll('.glyph-screen');
    if(screens.length>36){
      for(let i=0;i<screens.length-36;i++) screens[i].remove();
    }
  }

  for(let i=0;i<12;i++) addGlyphScreen();
  addEventListener('scroll',deepenGlyphStream,{passive:true});
  addEventListener('touchmove',deepenGlyphStream,{passive:true});
  deepenGlyphStream();
})();
