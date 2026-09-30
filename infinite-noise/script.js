(() => {
  const stream=document.getElementById('infinite-stream');
  const sentinel=document.querySelector('.scroll-sentinel');
  const audioBtn=document.getElementById('audio-toggle');
  const musicGate=document.getElementById('music-gate');
  const glitchLayer=document.getElementById('glitch-layer');

  // Frozen-video / early-2000s MPEG-style corruption: blocky green/pink pixels,
  // horizontal tears and short bursts that become nastier deeper in the page.
  const glitchPixels=[];
  function buildVideoGlitch(){
    if(!glitchLayer) return;
    const frag=document.createDocumentFragment();
    for(let i=0;i<96;i++){
      const p=document.createElement('i');
      p.className='glitch-pixel';
      frag.appendChild(p);
      glitchPixels.push(p);
    }
    glitchLayer.appendChild(frag);
  }
  function glitchBurst(force=1){
    if(!glitchLayer) return;
    const amount=Math.min(glitchPixels.length,8+Math.floor(Math.random()*18*force));
    const chosen=[...glitchPixels].sort(()=>Math.random()-.5).slice(0,amount);
    const palette=['green','pink','green','pink','cyan','black'];
    chosen.forEach(p=>{
      p.className='glitch-pixel '+rnd(palette)+' on';
      const macro=Math.random()>.72;
      const w=macro ? 30+Math.random()*180 : 3+Math.random()*28;
      const h=macro ? 4+Math.random()*34 : 2+Math.random()*18;
      p.style.cssText='left:'+Math.random()*100+'%;top:'+Math.random()*100+'%;width:'+w+'px;height:'+h+'px;transform:translate('+(Math.random()*70-35)+'px,'+(Math.random()*10-5)+'px)';
    });
    document.body.style.setProperty('--glitch-shift',(Math.random()*16-8)+'px');
    document.body.style.setProperty('--tear-y',(5+Math.random()*88)+'%');
    document.body.style.setProperty('--tear-y2',(5+Math.random()*88)+'%');
    document.body.style.setProperty('--tear-x',(Math.random()*90-45)+'px');
    document.body.style.setProperty('--tear-x2',(Math.random()*120-60)+'px');
    document.body.style.setProperty('--tear-h',(2+Math.random()*14)+'px');
    document.body.style.setProperty('--tear-h2',(1+Math.random()*9)+'px');
    document.body.classList.add('glitch-freeze');
    setTimeout(()=>{
      chosen.forEach(p=>{p.className='glitch-pixel';p.style.cssText='';});
      document.body.classList.remove('glitch-freeze');
    },45+Math.random()*210);
  }
  buildVideoGlitch();

  const crt=document.getElementById('crt-static');
  const crtCtx=crt?.getContext('2d',{alpha:true});
  function sizeCRT(){
    if(!crt) return;
    crt.width=Math.max(160,Math.floor(innerWidth/3));
    crt.height=Math.max(120,Math.floor(innerHeight/3));
  }
  sizeCRT();
  addEventListener('resize',sizeCRT,{passive:true});
  function drawCRT(){
    if(!crtCtx||!crt) return;
    const img=crtCtx.createImageData(crt.width,crt.height);
    const d=img.data;
    for(let i=0;i<d.length;i+=4){
      const v=Math.random()>.5?255:Math.floor(Math.random()*190);
      d[i]=v;d[i+1]=v;d[i+2]=v;d[i+3]=Math.floor(90+Math.random()*165);
    }
    crtCtx.putImageData(img,0,0);
  }
  let crtRAF=0;
  function crtBurst(duration=90+Math.random()*360){
    if(!crt) return;
    const end=performance.now()+duration;
    crt.classList.add('on');
    document.body.classList.add('crt-hit');
    const frame=()=>{
      drawCRT();
      if(performance.now()<end) crtRAF=requestAnimationFrame(frame);
      else{
        crt.classList.remove('on');
        document.body.classList.remove('crt-hit');
        cancelAnimationFrame(crtRAF);
      }
    };
    frame();
  }
  setInterval(()=>{
    if(Math.random()>.58) crtBurst();
  },650+Math.random()*1000);
  setInterval(()=>{
    const depth=Math.min(3,1+scrollY/Math.max(innerHeight,1)/18);
    if(Math.random()>.48) glitchBurst(depth);
  },180+Math.random()*220);

  const asciiControls=['NUL','SOH','STX','ETX','EOT','ENQ','ACK','BEL','BS','HT','LF','VT','FF','CR','SO','SI','DLE','DC1','DC2','DC3','DC4','NAK','SYN','ETB','CAN','EM','SUB','ESC','FS','GS','RS','US','DEL'];
  const cp437=['☺','☻','♥','♦','♣','♠','•','◘','○','◙','♂','♀','♪','♫','☼','►','◄','↕','‼','¶','§','▬','↨','↑','↓','→','←','∟','↔','▲','▼','░','▒','▓','│','┤','╡','╢','╖','╕','╣','║','╗','╝','╜','╛','┐','└','┴','┬','├','─','┼','╞','╟','╚','╔','╩','╦','╠','═','╬','╧','╨','╤','╥','╙','╘','╒','╓','╫','╪','┘','┌','█','▄','▌','▐','▀','α','ß','Γ','π','Σ','σ','µ','τ','Φ','Θ','Ω','δ','∞','φ','ε','∩','≡','±','≥','≤','⌠','⌡','÷','≈','°','∙','·','√','ⁿ','²','■'];
  function asciiPacket(){
    const n=Math.floor(Math.random()*128), hex=n.toString(16).toUpperCase().padStart(2,'0'), bin=n.toString(2).padStart(8,'0');
    const label=n<32?asciiControls[n]:(n===127?'DEL':String.fromCharCode(n));
    return rnd([
      'DEC:'+String(n).padStart(3,'0')+' HEX:0x'+hex+' BIN:'+bin+' '+label,
      '\\x'+hex+' / '+bin+' / '+label,
      'U+00'+hex+' '+label,
      rnd(asciiControls)+'::'+rnd(cp437)+'::0x'+hex,
      rnd(cp437)+rnd(cp437)+rnd(cp437)+' '+bin+' '+rnd(asciiControls)
    ]);
  }

  const noise=['000','13','23','404','808','666','999','01','10','101','NULL','ERR','▓','▒','░','//','::','[]','{}','<>','0x00','0xFF','1100101','101010','404_BODY','NO_DATA','SIG_LOSS','CACHE_MISS','FEED_LOOP','000000','RIP','ALT','CTRL','VOID'];
  const marks=['☠','👁','⌁','✂','♻','⚠','☼','🜏','⛓','⌘','☹','◼','◻','◆','◇','※'];
  const classes=['serif','heavy','mono','pixel','wide','junk','icon','broken','ghost','strike','invert','micro','drop','censor'];

  const languageLines=[
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
    '<span class="ascii">  .-.\n (x x)\n  |=|\n __|__\n/     \\\\</span>',
    '<span class="ascii">  _____\n /     \\\\n|  ☠   |\n|      |\n|______|</span>',
    '<span class="pixelboob">▓▓░░▓▓  ░▒▓▒░  ▓▓░░▓▓</span>',
    '<span class="ticket">TXN#808404 / 23:59 / VOID / CASH / NO RETURN</span>',
    '<span class="junk">████████ CENSORED BODY ████████</span>'
  ];

  function rnd(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
  function distortWord(word){
    let text=word;
    if(Math.random()>.68) text=text.slice(0,Math.max(1,Math.floor(text.length*(.34+Math.random()*.62))));
    const cls=rnd(classes);
    const prefix=Math.random()>.52 ? rnd(noise)+' ' : '';
    const suffix=Math.random()>.57 ? ' '+rnd(noise) : '';
    const ascii=Math.random()>.72 ? ' '+asciiPacket() : '';
    const mark=Math.random()>.82 ? ' '+rnd(marks) : '';
    return '<span class="'+cls+'">'+prefix+text+suffix+ascii+mark+'</span>';
  }

  function makeBlock(i){
    const sentences=[];
    const count=7+Math.floor(Math.random()*10);
    for(let n=0;n<count;n++){
      sentences.push(rnd(languageLines).split(' ').map(distortWord).join(' '));
      if(Math.random()>.36) sentences.push('<span class="junk">'+rnd(noise)+' '+rnd(noise)+' '+rnd(marks)+'</span>');
      if(Math.random()>.5) sentences.push(rnd(culture));
      if(Math.random()>.38) sentences.push('<span class="code">'+asciiPacket()+' '+asciiPacket()+'</span>');
    }
    const block=document.createElement('section');
    block.className='stream-block';
    block.innerHTML='<div class="stream-index">INFINITE_NOISE_'+String(i).padStart(7,'0')+' / TEXT_AUDIO_COUPLED / FEED_CONTINUES</div><p>'+sentences.join(' ')+'</p>';
    return block;
  }

  let blockCount=0;
  function appendBlocks(n=6){
    if(!stream) return;
    const frag=document.createDocumentFragment();
    for(let i=0;i<n;i++) frag.appendChild(makeBlock(++blockCount));
    stream.appendChild(frag);
    if(blockCount>16) document.body.classList.add('deep-noise');
    audioEngine.bump(blockCount);
  }

  appendBlocks(9);

  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{ if(entry.isIntersecting) appendBlocks(8); });
  },{rootMargin:'2200px 0px 2200px 0px'});
  if(sentinel) observer.observe(sentinel);

  const audioEngine=(()=>{
    let ctx, master, started=false, noiseNodes=[], droneNodes=[], clickTimer=null, scanTimer=null;
    let depth=0;

    function makeNoiseBuffer(seconds=2){
      const length=Math.floor(ctx.sampleRate*seconds);
      const buffer=ctx.createBuffer(1,length,ctx.sampleRate);
      const data=buffer.getChannelData(0);
      for(let i=0;i<length;i++){
        const white=Math.random()*2-1;
        const impulse=(Math.random()>.997)?(Math.random()*2-1)*3:0;
        data[i]=white*.55+impulse;
      }
      return buffer;
    }

    function addStatic(type='white'){
      const src=ctx.createBufferSource();
      src.buffer=makeNoiseBuffer(2+Math.random()*3);
      src.loop=true;
      const filter=ctx.createBiquadFilter();
      const gain=ctx.createGain();
      filter.type=type==='radio'?'bandpass':(Math.random()>.5?'highpass':'lowpass');
      filter.frequency.value=type==='radio'?900+Math.random()*2600:120+Math.random()*7000;
      filter.Q.value=type==='radio'?4+Math.random()*10:.4+Math.random()*2;
      gain.gain.value=.008+Math.random()*.028;
      src.connect(filter).connect(gain).connect(master);
      src.start();
      noiseNodes.push({src,filter,gain});
    }

    function addDrone(){
      const osc=ctx.createOscillator();
      const gain=ctx.createGain();
      const filter=ctx.createBiquadFilter();
      osc.type=rnd(['sine','triangle','sawtooth','square']);
      osc.frequency.value=rnd([49,55,60,73,82,98,110,147,196])*(.5+Math.random()*1.5);
      filter.type='lowpass';
      filter.frequency.value=220+Math.random()*1400;
      gain.gain.value=.002+Math.random()*.012;
      osc.connect(filter).connect(gain).connect(master);
      osc.start();
      droneNodes.push({osc,gain,filter});
    }

    function addHauntedLayer(){
      // Detuned guitar-like strings / uncanny harmonic cluster.
      [73.42,98,110,146.83,155.56,196,220].forEach((base,i)=>{
        const osc=ctx.createOscillator(), g=ctx.createGain(), f=ctx.createBiquadFilter();
        osc.type=i%3===0?'sawtooth':'triangle';
        osc.frequency.value=base*(1+(Math.random()-.5)*.045);
        osc.detune.value=(Math.random()-.5)*38;
        f.type='lowpass'; f.frequency.value=420+Math.random()*1500; f.Q.value=1+Math.random()*4;
        g.gain.value=.0015+Math.random()*.005;
        osc.connect(f).connect(g).connect(master); osc.start();
        droneNodes.push({osc,gain:g,filter:f});
      });
    }

    function cinematicHit(kind='door'){
      if(!started) return;
      const now=ctx.currentTime;
      const src=ctx.createBufferSource(), g=ctx.createGain(), f=ctx.createBiquadFilter();
      src.buffer=makeNoiseBuffer(kind==='thunder'?2.4:.35);
      f.type='lowpass'; f.frequency.value=kind==='thunder'?180:520;
      g.gain.setValueAtTime(.0001,now);
      g.gain.exponentialRampToValueAtTime(kind==='thunder'?.13:.075,now+.008);
      g.gain.exponentialRampToValueAtTime(.0001,now+(kind==='thunder'?1.8:.22));
      src.connect(f).connect(g).connect(master); src.start(now);
    }

    function brokenBroadcast(){
      if(!started) return;
      // Synthetic announcer-like cadence: intentionally unintelligible, as if speech
      // survived but the programme itself was destroyed by interference.
      const now=ctx.currentTime;
      const dur=1.2+Math.random()*3.2;
      const carrier=ctx.createOscillator(), wobble=ctx.createOscillator();
      const wobbleGain=ctx.createGain(), voiceGain=ctx.createGain(), bp=ctx.createBiquadFilter();
      carrier.type='sawtooth'; carrier.frequency.value=105+Math.random()*95;
      wobble.type='sine'; wobble.frequency.value=2.5+Math.random()*5; wobbleGain.gain.value=18+Math.random()*45;
      wobble.connect(wobbleGain).connect(carrier.frequency);
      bp.type='bandpass'; bp.frequency.value=850+Math.random()*1400; bp.Q.value=5;
      voiceGain.gain.value=.0001;
      carrier.connect(bp).connect(voiceGain).connect(master);
      carrier.start(now); wobble.start(now);
      for(let t=0;t<dur;t+=.08+Math.random()*.16){
        const on=Math.random()>.24;
        voiceGain.gain.setTargetAtTime(on?(.007+Math.random()*.022):.0001,now+t,.012);
        carrier.frequency.setTargetAtTime(90+Math.random()*160,now+t,.02);
      }
      voiceGain.gain.setTargetAtTime(.0001,now+dur,.02);
      carrier.stop(now+dur+.1); wobble.stop(now+dur+.1);
    }

    function feedbackSqueal(){
      if(!started) return;
      const now=ctx.currentTime, o=ctx.createOscillator(), g=ctx.createGain();
      o.type=Math.random()>.5?'sine':'square';
      o.frequency.setValueAtTime(700+Math.random()*4200,now);
      o.frequency.exponentialRampToValueAtTime(180+Math.random()*1200,now+.08+Math.random()*.7);
      g.gain.setValueAtTime(.0001,now); g.gain.exponentialRampToValueAtTime(.008+Math.random()*.025,now+.015); g.gain.exponentialRampToValueAtTime(.0001,now+.15+Math.random()*.8);
      o.connect(g).connect(master); o.start(now); o.stop(now+1);
    }

    function radioVoice(){
      if(!started) return;
      const now=ctx.currentTime;
      const osc=ctx.createOscillator(), mod=ctx.createOscillator(), mg=ctx.createGain(), g=ctx.createGain(), bp=ctx.createBiquadFilter();
      osc.type='sawtooth'; osc.frequency.value=90+Math.random()*170;
      mod.type='square'; mod.frequency.value=3+Math.random()*13; mg.gain.value=25+Math.random()*70;
      mod.connect(mg).connect(osc.frequency);
      bp.type='bandpass'; bp.frequency.value=700+Math.random()*1800; bp.Q.value=3+Math.random()*7;
      g.gain.setValueAtTime(.0001,now); g.gain.exponentialRampToValueAtTime(.012+Math.random()*.025,now+.03); g.gain.exponentialRampToValueAtTime(.0001,now+.25+Math.random()*.8);
      osc.connect(bp).connect(g).connect(master); mod.start(now); osc.start(now); mod.stop(now+1.2); osc.stop(now+1.2);
    }

    function rainBed(){
      const src=ctx.createBufferSource(), hp=ctx.createBiquadFilter(), g=ctx.createGain();
      src.buffer=makeNoiseBuffer(5); src.loop=true; hp.type='highpass'; hp.frequency.value=1800; g.gain.value=.012;
      src.connect(hp).connect(g).connect(master); src.start(); noiseNodes.push({src,filter:hp,gain:g});
    }

    function burst(){
      if(!started) return;
      const now=ctx.currentTime;
      const osc=ctx.createOscillator();
      const gain=ctx.createGain();
      osc.type=Math.random()>.5?'square':'sawtooth';
      osc.frequency.setValueAtTime(40+Math.random()*7000,now);
      osc.frequency.exponentialRampToValueAtTime(20+Math.random()*900,now+.03+Math.random()*.12);
      gain.gain.setValueAtTime(.0001,now);
      gain.gain.exponentialRampToValueAtTime(.015+Math.random()*.06,now+.005);
      gain.gain.exponentialRampToValueAtTime(.0001,now+.04+Math.random()*.22);
      osc.connect(gain).connect(master);
      osc.start(now);
      osc.stop(now+.35);
    }

    function scheduleClicks(){
      clearInterval(clickTimer);
      clickTimer=setInterval(()=>{
        if(Math.random()>.35) burst();
        if(Math.random()>.82) radioVoice();
        if(Math.random()>.90) brokenBroadcast();
        if(Math.random()>.94) feedbackSqueal();
        if(Math.random()>.94) cinematicHit(Math.random()>.45?'thunder':'door');
      },Math.max(70,430-depth*5));
    }

    function scheduleScan(){
      clearInterval(scanTimer);
      scanTimer=setInterval(()=>{
        if(!started) return;
        noiseNodes.forEach(n=>{
          const f=80+Math.random()*9000;
          n.filter.frequency.setTargetAtTime(f,ctx.currentTime,.08+Math.random()*.25);
          n.gain.gain.setTargetAtTime(.004+Math.random()*(.015+depth*.0009),ctx.currentTime,.1);
        });
        droneNodes.forEach(d=>{
          d.osc.frequency.setTargetAtTime(35+Math.random()*(140+depth*4),ctx.currentTime,.4);
        });
      },550+Math.random()*900);
    }

    function start(){
      if(started) return;
      ctx=new (window.AudioContext||window.webkitAudioContext)();
      master=ctx.createGain();
      const comp=ctx.createDynamicsCompressor();
      master.gain.value=.22;
      master.connect(comp).connect(ctx.destination);
      for(let i=0;i<4;i++) addStatic(i===0?'radio':'white');
      for(let i=0;i<3;i++) addDrone();
      addHauntedLayer();
      rainBed();
      scheduleClicks();
      scheduleScan();
      started=true;
      audioBtn?.classList.add('active');
      if(audioBtn) audioBtn.textContent='NOISE ON';
    }

    function stop(){
      if(!started) return;
      master.gain.setTargetAtTime(.0001,ctx.currentTime,.08);
      setTimeout(()=>ctx.close(),180);
      clearInterval(clickTimer);clearInterval(scanTimer);
      noiseNodes=[];droneNodes=[];started=false;
      audioBtn?.classList.remove('active');
      if(audioBtn) audioBtn.textContent='START NOISE';
    }

    function updateFromScroll(){
      if(!started) return;
      const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
      const ratio=scrollY/max;
      depth=Math.floor(ratio*100);
      master.gain.setTargetAtTime(.12+ratio*.2,ctx.currentTime,.08);
      const targetNoise=4+Math.min(8,Math.floor(depth/12));
      while(noiseNodes.length<targetNoise) addStatic(Math.random()>.7?'radio':'white');
      const targetDrones=3+Math.min(5,Math.floor(depth/20));
      while(droneNodes.length<targetDrones) addDrone();
      if(Math.random()>.9) burst();
    }

    function bump(blocks){
      depth=Math.max(depth,Math.min(100,blocks));
      if(started && Math.random()>.7) burst();
    }

    return {start,stop,updateFromScroll,bump,get started(){return started;}};
  })();

  musicGate?.addEventListener('click',()=>{
    audioEngine.start();
    musicGate.classList.add('gone');
    document.body.classList.add('music-entered');
  });

  audioBtn?.addEventListener('click',()=>{
    if(audioEngine.started) audioEngine.stop(); else audioEngine.start();
  });

  let ticking=false;
  addEventListener('scroll',()=>{
    if(ticking) return;
    requestAnimationFrame(()=>{
      audioEngine.updateFromScroll();
      if(Math.random()>.78) glitchBurst(Math.min(3,1+scrollY/Math.max(innerHeight,1)/24));
      ticking=false;
    });
    ticking=true;
  },{passive:true});

  let stage=0,timer=null;
  document.addEventListener('pointerdown',(e)=>{
    if(e.target===audioBtn) return;
    clearTimeout(timer);
    stage=(stage+1)%4;
    document.body.classList.remove('decay1','decay2','decay3');
    if(stage>0) document.body.classList.add('decay'+stage);
    timer=setTimeout(()=>{document.body.classList.remove('decay1','decay2','decay3');stage=0;},1500);
  });

  setInterval(()=>{
    document.querySelectorAll('.cutup.active span,.stream-block span').forEach(s=>{
      if(Math.random()>.996) s.classList.toggle('void');
    });
  },650);
})();