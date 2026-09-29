(() => {
  const stream=document.getElementById('infinite-stream');
  const sentinel=document.querySelector('.scroll-sentinel');
  const audioBtn=document.getElementById('audio-toggle');

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
    const mark=Math.random()>.82 ? ' '+rnd(marks) : '';
    return '<span class="'+cls+'">'+prefix+text+suffix+mark+'</span>';
  }

  function makeBlock(i){
    const sentences=[];
    const count=7+Math.floor(Math.random()*10);
    for(let n=0;n<count;n++){
      sentences.push(rnd(languageLines).split(' ').map(distortWord).join(' '));
      if(Math.random()>.36) sentences.push('<span class="junk">'+rnd(noise)+' '+rnd(noise)+' '+rnd(marks)+'</span>');
      if(Math.random()>.5) sentences.push(rnd(culture));
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

  let loadingMore=false;
  function ensureInfiniteFeed(){
    if(loadingMore) return;
    const remaining=document.documentElement.scrollHeight-(window.scrollY+window.innerHeight);
    if(remaining<5000){
      loadingMore=true;
      appendBlocks(12);
      requestAnimationFrame(()=>{loadingMore=false;});
    }
  }
  ensureInfiniteFeed();

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

  audioBtn?.addEventListener('click',()=>{
    if(audioEngine.started) audioEngine.stop(); else audioEngine.start();
  });

  let ticking=false;
  addEventListener('scroll',()=>{
    if(ticking) return;
    requestAnimationFrame(()=>{
      audioEngine.updateFromScroll();
      ensureInfiniteFeed();
      ticking=false;
    });
    ticking=true;
  },{passive:true});

  addEventListener('touchmove',ensureInfiniteFeed,{passive:true});
  addEventListener('wheel',ensureInfiniteFeed,{passive:true});
  setInterval(ensureInfiniteFeed,1200);

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