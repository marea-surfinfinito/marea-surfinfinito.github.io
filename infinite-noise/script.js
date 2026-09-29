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
    loadingMore=true;

    let guard=0;
    const minAhead=Math.max(window.innerHeight*8,12000);

    while(
      document.documentElement.scrollHeight-(window.scrollY+window.innerHeight) < minAhead
      && guard < 12
    ){
      appendBlocks(10);
      guard++;
    }

    requestAnimationFrame(()=>{loadingMore=false;});
  }

  ensureInfiniteFeed();

  addEventListener('scroll',()=>{
    if(ticking) return;
    requestAnimationFrame(()=>{
      audioEngine.updateFromScroll();
      ensureInfiniteFeed();
      ticking=false;
    });
    ticking=true;
  },{passive:true});

  addEventListener('resize',ensureInfiniteFeed,{passive:true});

  addEventListener('wheel',ensureInfiniteFeed,{passive:true});
  setInterval(ensureInfiniteFeed,500);

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