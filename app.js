(function(){
  'use strict';
  /* ============ À MODIFIER ============ */
  var WA_NUMBER='';   // numéro WhatsApp au format international, sans le +, ex. '23057000000'
  var WA_TEXT="Bonjour Meduza, j'ai un projet de site ou d'application et j'aimerais en parler.";
  var IMAGES={'about-1':'assets/about-1.jpg',avatar:'assets/avatar.jpg',whyus:'assets/whyus.jpg',hero:'assets/hero.jpg','hero-wide':'assets/hero-wide.jpg','project-1':'assets/projet-zafer.jpg','project-2':'assets/projet-boun-portrait.webp','project-3':'assets/projet-coutant.jpg'};      // ex. {hero:'images/hero.jpg','about-1':'images/about-1.jpg'} (clés = data-slot) — project-1 : test temporaire
  /* ==================================== */

  function clamp(x,a,b){return Math.max(a,Math.min(b,x))}
  function sm(t){t=clamp(t,0,1);return t*t*(3-2*t)}
  function sm2(t){t=clamp(t,0,1);return t*t*t*(t*(t*6-15)+10)}   /* départ et arrivée plus doux */
  function lerp(a,b,t){return a+(b-a)*t}
  function $(s,r){return (r||document).querySelector(s)}
  function $$(s,r){return [].slice.call((r||document).querySelectorAll(s))}
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var W=document.documentElement.clientWidth,H=window.innerHeight,mobile=W<700,docH=0;

  var tr=$('.marq .track');if(tr){tr.innerHTML+=tr.innerHTML}
  $$('[data-slot]').forEach(function(el){
    var u=IMAGES[el.getAttribute('data-slot')];if(el.getAttribute('data-slot')==='hero'&&W>=860&&IMAGES['hero-wide'])u=IMAGES['hero-wide'];
    if(u){var im=document.createElement('img');im.src=u;im.alt=el.getAttribute('data-alt')||'';im.loading=(el.getAttribute('data-slot')==='hero'?'eager':'lazy');el.appendChild(im);el.classList.add('has-img')}
  });
  var waHref='https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent(WA_TEXT);
  $$('[data-wa]').forEach(function(a){a.href=waHref;a.target='_blank';a.rel='noopener'});


  /* séquence des cartes */
  var DATA=[
    {w:'Créations',t:'Création',sub:'Conçu pour convertir',big:'01',unit:'/04'},
    {w:'Convaincre',t:'Convaincre',sub:'Reels et stories',big:'02',unit:'/04'},
    {t:'Accompagnement',sub:'Un seul interlocuteur, de A à Z',big:'03',unit:'/04'},
    {t:'Garantie 90 jours',sub:'3 objectifs écrits',big:'04',unit:'/04'}
  ];
  function kcard(i){
    var d=DATA[i];
    return '<div class="kt"><div><h3>'+d.t+'</h3><p>'+d.sub+'</p></div></div>'+
      MeduzaViz.html(i)+
      '<div class="kb"><span class="big">'+d.big+'<small>'+d.unit+'</small></span></div>';
  }
  var layer=$('#layer'),text=$('#text'),msg=$('#msg'),words=$$('.w',msg);
  var dw=[$('#d0'),$('#d1')],slots=[$('#s0'),$('#s1')],msgFS=40;
  var statics=[2,3].map(function(i){var e=$('#st'+i);e.innerHTML='<div class="detail">'+kcard(i)+'</div>';MeduzaViz.watch(e);return {el:e}});
  var fl=[0,1].map(function(i){
    var c=document.createElement('div');c.className='card fc spot';
    c.innerHTML='<div class="detail">'+kcard(i)+'</div>';layer.appendChild(c);
    var fw=document.createElement('div');fw.className='fw';fw.textContent=DATA[i].w;layer.appendChild(fw);
    return {i:i,el:c,fw:fw,h3:$('h3',c)};
  });
  /* une fois arrivées, les cartes 01 et 02 sont posées dans leur emplacement (elles défilent avec la page) */
  fl.forEach(function(f,i){
    var sc=document.createElement('div');sc.className='card sc dkc spot';
    sc.innerHTML='<div class="detail">'+kcard(i)+'</div>';
    slots[i].appendChild(sc);f.sc=sc;
    MeduzaViz.watch(sc,{landed:false});
  });
  var cur=[null,null],last=0,running=false;
  function kick(){var n=performance.now();if(running&&n-last>250)running=false;fl.forEach(function(f){var T=f.tgt;if(T&&T.te>=.995&&T.dd<=1){f.el.style.opacity=0;f.fw.style.opacity=0;f.sc.style.opacity=1;f.sc.classList.add('go');MeduzaViz.setLanded(f.sc,true)}});if(!running){running=true;last=n;var d2=false,go2=function(t){if(d2)return;d2=true;step(t||performance.now())};requestAnimationFrame(go2);setTimeout(go2,120)}}
  function step(now){
    var dt=Math.min(.05,(now-last)/1000),moving=false;last=now;
    fl.forEach(function(f){
      var T=f.tgt;if(!T)return;
      if(T.te>=.995&&T.dd<=1){
        /* arrivée : la carte flottante disparaît, la carte posée dans l'emplacement prend le relais */
        cur[f.i]={x:T.x,y:T.y,w:T.w,h:T.h,rot:T.rot};
        f.el.style.opacity=0;f.fw.style.opacity=0;f.sc.style.opacity=1;f.sc.classList.add('go');MeduzaViz.setLanded(f.sc,true);return;
      }
      f.sc.style.opacity=0;f.sc.classList.remove('go');MeduzaViz.setLanded(f.sc,false);
      var c=cur[f.i];if(!c){c=cur[f.i]={x:T.x,y:T.y,w:T.w,h:T.h,rot:T.rot}}
      var a=reduce?1:1-Math.exp(-dt*7);
      a=a+(1-a)*sm((T.te-.5)/.4);
      ['x','y','w','h','rot'].forEach(function(k){c[k]+=(T[k]-c[k])*a;if(Math.abs(T[k]-c[k])>.2)moving=true});
      apply(f,c,T);
    });
    if(moving){requestAnimationFrame(step)}else{running=false}
  }
  /* les cartes flottantes sont blanches sur le noir, puis passent au gris foncé en arrivant dans Services */
  var LP={bg:[255,255,255],title:[34,34,34],sub:[119,119,119],pbg:[238,238,238],pfg:[85,85,85],num:[17,17,17],unit:[153,153,153],tri:[17,17,17],tbg:[238,238,238],tnum:[85,85,85],tlab:[17,17,17]};
  var DP={bg:[29,9,12],title:[244,244,244],sub:[140,140,140],pbg:[42,15,20],pfg:[201,201,201],num:[246,246,246],unit:[110,110,110],tri:[242,242,242],tbg:[42,15,20],tnum:[184,184,184],tlab:[242,242,242]};
  function rgbm(a,b,m){return 'rgb('+Math.round(lerp(a[0],b[0],m))+','+Math.round(lerp(a[1],b[1],m))+','+Math.round(lerp(a[2],b[2],m))+')'}
  function setTheme(el,m){
    var st=el.style;
    st.background=rgbm(LP.bg,DP.bg,m);st.borderColor='rgba(255,255,255,'+(.09*m).toFixed(3)+')';
    st.setProperty('--k-title',rgbm(LP.title,DP.title,m));st.setProperty('--k-sub',rgbm(LP.sub,DP.sub,m));
    st.setProperty('--k-pill-bg',rgbm(LP.pbg,DP.pbg,m));st.setProperty('--k-pill-fg',rgbm(LP.pfg,DP.pfg,m));
    st.setProperty('--k-num',rgbm(LP.num,DP.num,m));st.setProperty('--k-unit',rgbm(LP.unit,DP.unit,m));
    st.setProperty('--k-tri',rgbm(LP.tri,DP.tri,m));st.setProperty('--k-tile-bg',rgbm(LP.tbg,DP.tbg,m));
    st.setProperty('--k-tile-num',rgbm(LP.tnum,DP.tnum,m));st.setProperty('--k-tile-lab',rgbm(LP.tlab,DP.tlab,m));
  }
  function apply(f,c,T){
    var el=f.el,w=c.w,h=c.h,cy=c.y+(1-T.A)*70;
    el.style.width=w+'px';el.style.height=h+'px';
    el.style.transform='translate('+(c.x-w/2)+'px,'+(cy-h/2)+'px) rotate('+c.rot+'deg)';
    el.style.opacity=T.A;el.style.zIndex=T.z;
    setTheme(el,1);
    /* lueur de lumière pendant l'arrivée et le déplacement : elle balaie la carte comme le ferait la souris */
    var v=Math.hypot(T.x-c.x,T.y-c.y),glow=clamp(4*T.A*(1-T.A)+4*T.te*(1-T.te)+clamp(v/30,0,.6),0,1),lp=T.te>.002?T.te:T.A*.4;
    el.style.setProperty('--glow',glow.toFixed(3));
    el.style.setProperty('--mx',(w*lerp(.15,.85,lp))+'px');el.style.setProperty('--my',(h*lerp(.1,.8,lp))+'px');
    el.style.setProperty('--u',(w/100)+'px');
    el.style.borderRadius=(w*.05)+'px';
    var arr=T.Wp;
    f.h3.style.opacity=arr>=.999?1:0;   /* le titre n'apparaît qu'une fois le mot posé */
    if(arr>.002){
      /* le mot quitte le texte et va directement à sa place dans le titre de la carte, incliné comme elle */
      var hr=f.h3.getBoundingClientRect(),hx=hr.left+hr.width/2,hy=hr.top+hr.height/2;
      var hs=parseFloat(getComputedStyle(f.h3).fontSize)||16;
      var x=lerp(T.wx,hx,arr),y=lerp(T.wy,hy,arr),fs=lerp(msgFS,hs,arr),rot=lerp(0,c.rot,sm(clamp(arr/.25,0,1)));
      var fw=f.fw;
      if(!f.fwInit){var t0=DATA[f.i].t,w0=DATA[f.i].w||t0,tl0=(w0.toLowerCase().indexOf(t0.toLowerCase())===0)?w0.slice(t0.length):'';fw.innerHTML='<span class="fl"><span class="lo">'+t0.charAt(0).toLowerCase()+'</span><span class="up">'+t0.charAt(0)+'</span></span><span>'+t0.slice(1)+'</span><span class="tl">'+tl0+'</span>';f.fwInit=1;f.flo=fw.querySelector('.lo');f.fup=fw.querySelector('.up');f.ftl=fw.querySelector('.tl');fw.style.fontFamily='var(--serif)';fw.style.fontWeight=500}
      var pp=clamp(arr/.3,0,1);pp=pp*pp*(3-2*pp);
      f.flo.style.opacity=0;f.fup.style.opacity=1;f.ftl.style.opacity=1-pp;f.ftl.style.fontSize=((1-pp)*100)+'%';
      fw.style.textShadow='0 0 '+(22*Math.sin(Math.PI*clamp(arr,0,1)))+'px rgba(255,255,255,.4)';
      fw.style.fontSize=fs+'px';fw.style.color='#f4f4f4';
      fw.style.transform='translate('+x+'px,'+y+'px) translate(-50%,-50%) rotate('+rot+'deg)';
      fw.style.opacity=arr>=.999?0:1;fw.style.zIndex=5;
    }else{f.fw.style.opacity=0}
  }
  function seq(){
    var tt=text.getBoundingClientRect().top/(W<700?.7:1);
    /* le texte reste épinglé et s'allume mot par mot sur une longue distance de défilement */
    var u=clamp(-tt/(H*.9),0,1),th=[0,.09,.18,.27,.36,.45,.54,.63,.72],tq=tt+H*1.25;
    /* les deux mots clés s'éclairent, comme les cartes, avant que le reste du texte disparaisse */
    var gl=0;
    /* 1. le texte se floute et disparaît */
    var b=reduce?0:sm((H*.30-tq)/(H*.14));
    /* 2. les cartes arrivent et, en même temps, les mots vont directement à leur place dans les titres */
    var A=reduce?[1,1]:[sm2((H*.15-tq)/(H*.24)),sm2((H*.12-tq)/(H*.24))];
    /* les mots glissent plus lentement vers leur carte, juste après le début de l'arrivée des cartes */
    var WP=reduce?[1,1]:[sm2((H*.09-tq)/(H*.58)),sm2((H*.05-tq)/(H*.58))];
    words.forEach(function(w,i){
      var t=sm((u-th[i])/.22),k=dw.indexOf(w),o;
      if(reduce)t=1;
      var base=lerp(.14,1,t);
      if(k>-1){o=WP[k]>.002?0:base;w.style.filter='none';w.style.textShadow=(WP[k]>.002||gl<.01)?'none':'0 0 '+(gl*26).toFixed(1)+'px rgba(255,255,255,'+(gl*.6).toFixed(2)+'),0 0 '+(gl*7).toFixed(1)+'px rgba(255,255,255,'+(gl*.4).toFixed(2)+')'}
      else{o=base*(1-b);w.style.filter=b>.002?'blur('+(b*14)+'px)':'none'}
      w.style.opacity=o;
    });
    var r0=slots[0].getBoundingClientRect(),r1=slots[1].getBoundingClientRect();
    var w0=r0.width,h0=r0.height,w1=r1.width,h1=r1.height;
    var g=Math.max(-40,Math.min(mobile?20:64,W-w0-w1-(mobile?48:32))),x0=(W-(w0+g+w1))/2;
    var cfg=[{x:x0+w0/2,y:H*.62,r:-8,w:w0,h:h0,lag:0},{x:x0+w0+g+w1/2,y:H*.615,r:8,w:w1,h:h1,lag:.012}];
    fl.forEach(function(f,i){
      var k=cfg[i],wr=dw[i].getBoundingClientRect(),rc=slots[i].getBoundingClientRect();
      var sx=rc.left+rc.width/2,sy=rc.top+rc.height/2;
      var dd=sy-k.y+H*k.lag,tl=reduce?1:(function(t){return t*t*t*(t*(t*6-15)+10)})(1-clamp(dd/(H*.78),0,1)),te=tl;
      f.tgt={x:lerp(k.x,sx,te),y:Math.min(lerp(k.y,sy,te),k.y),w:lerp(k.w,rc.width,te),h:lerp(k.h,rc.height,te),rot:lerp(k.r,0,te),
        A:A[i],Wp:WP[i],te:te,dd:dd,wx:wr.left+wr.width/2,wy:wr.top+wr.height/2,z:2-i};
    });
    kick();
    statics.forEach(function(s){var r=s.el.getBoundingClientRect();s.el.style.setProperty('--u',(r.width/100)+'px')});
    slots.forEach(function(s){var r=s.getBoundingClientRect();s.style.setProperty('--u',(r.width/100)+'px')});
  }

  /* qui sommes-nous : cartes qui s'ouvrent, onglets qui suivent le défilement */
  var qas=$$('#faq .qa'),tabs=$$('.tab'),fimgs=$$('.faq-img .img'),fCur=0;
  function fitQa(){qas.forEach(function(q){var b=$('.qb',q);b.style.maxHeight=q.classList.contains('open')?b.scrollHeight+'px':'0px'})}
  qas.forEach(function(q){
    $('.qh',q).addEventListener('click',function(){
      var op=!q.classList.contains('open');q.classList.toggle('open',op);
      $('.qh',q).setAttribute('aria-expanded',op?'true':'false');fitQa();
    });
  });
  function setTab(i){
    if(i===fCur)return;fCur=i;
    tabs.forEach(function(t,k){t.classList.toggle('on',k===i);t.setAttribute('aria-selected',k===i?'true':'false')});
    fimgs.forEach(function(m,k){m.classList.toggle('on',k===i)});
  }
  function spyFaq(){}
  tabs.forEach(function(t){t.addEventListener('click',function(){
    var k=+t.getAttribute('data-t');setTab(k);var first=qas.filter(function(q){return +q.getAttribute('data-t')===k})[0];
    window.scrollTo({top:first.getBoundingClientRect().top+window.pageYOffset-H*.3,behavior:'smooth'});
  })});

  /* formulaire (à brancher plus tard) */
  var form=$('#form'),fmsg=$('#fmsg');
  if(form)form.addEventListener('submit',function(e){
    e.preventDefault();
    if(form.hp.value)return;
    if(!form.checkValidity()){form.reportValidity();return}
    fmsg.textContent='Merci, nous revenons vers vous.';
    form.reset();
    /* TODO : envoyer les données (e-mail, base de données) ici */
  });


  /* ============ Fond et texte : le changement se déclenche à un seuil et va jusqu'au bout (noir ou blanc) ============ */
  (function(){var t=document.querySelector('.cmp');if(!t)return;var rows=t.querySelectorAll('.cmp-row');if(!('IntersectionObserver' in window)){t.classList.add('in');rows.forEach(function(r){r.classList.add('on')});return}var hl=null;function upd(){if(!hl)return;var b=0,all=true;rows.forEach(function(r){if(r.classList.contains('on'))b=Math.max(b,r.offsetTop+r.offsetHeight);else all=false});var H=t.offsetHeight;hl.style.clipPath='inset(0 0 '+(all?0:(b?Math.max(0,H-b-8):H))+'px 0 round 16px)'}addEventListener('resize',upd);var o=new IntersectionObserver(function(es){es.forEach(function(e){var hh=(e.rootBounds?e.rootBounds.height:innerHeight);if(e.isIntersecting){e.target.classList.add('on');if(e.target===rows[0])t.classList.add('in')}else if(e.boundingClientRect.top>hh*.5){e.target.classList.remove('on');if(e.target===rows[0])t.classList.remove('in')}});upd()},{threshold:.6,rootMargin:'0px 0px -14% 0px'});rows.forEach(function(r){o.observe(r)})})();
  (function(){var b=document.getElementById('burger'),m=document.getElementById('menu');if(!b||!m)return;function set(o){b.setAttribute('aria-expanded',o?'true':'false');m.classList.toggle('open',o)}b.addEventListener('click',function(e){e.stopPropagation();set(!m.classList.contains('open'))});m.addEventListener('click',function(e){if(e.target.closest('a'))set(false)});document.addEventListener('click',function(e){if(!m.contains(e.target))set(false)});document.addEventListener('keydown',function(e){if(e.key==='Escape')set(false)})})();
  (function(){var h=document.querySelector('.hands');if(!h)return;function fit(){var W=document.documentElement.clientWidth,z=W<700?1.24:1,w=Math.round(W*z);h.style.marginLeft='0px';h.style.width=w+'px';h.style.marginLeft=(-h.getBoundingClientRect().left-(w-W)/2)+'px'}fit();addEventListener('resize',fit);addEventListener('load',fit)})();
  (function(){var it=document.getElementById('intro'),ps=document.getElementById('pts'),im=document.querySelector('.why .img');if(!it||!ps||!im)return;function pick(){im=document.querySelector(window.innerWidth>=1024?'.whyimg .img':'.why .img')||im}function fit(){pick();var sy=window.pageYOffset,pst=document.querySelector('.pstack');it.style.marginTop='0px';pst.style.marginTop='0px';var ir=im.getBoundingClientRect();var hold=document.getElementById('ihold');if(0){hold.style.height='';ps.style.marginTop='0px';pst.style.marginTop=-(ir.height-40)+'px';var nt=pst.getBoundingClientRect().top+sy;ps.style.marginTop=Math.max(40,(ir.bottom+sy+200)-(nt+it.offsetHeight))+'px'}else{hold.style.height='';ps.style.marginTop='';var nat=pst.getBoundingClientRect().top+sy;var t1=it.querySelector('.t1');it.style.marginTop=Math.min(0,-(nat-(ir.top+sy+ir.height-t1.offsetHeight+(window.innerWidth>=1024?-30:8))))+'px'}ps.style.top=(parseFloat(getComputedStyle(it).top)+it.offsetHeight+(window.innerWidth>=1024?150:70))+'px'}var gr=document.querySelector('.why-grid'),cm=document.querySelector('.why .cmp'),w2=it.querySelector('.w');function place(){pick();if(!gr||!cm)return;im.style.marginTop='0px';if(getComputedStyle(gr).gridTemplateColumns.split(' ').length>1){var g=gr.getBoundingClientRect(),t=cm.getBoundingClientRect();im.style.marginTop=Math.max(0,t.top+t.height*.35-g.top)+'px'}else im.style.marginTop=''}function clip(){pick();if(!w2)return;var a=im.getBoundingClientRect(),b=it.getBoundingClientRect();if(a.bottom<=b.top||a.top>=b.bottom||a.right<=b.left||a.left>=b.right){w2.style.clipPath='inset(100%)';return}w2.style.clipPath='inset('+Math.max(0,a.top-b.top)+'px '+Math.max(0,b.right-a.right)+'px '+Math.max(0,b.bottom-a.bottom)+'px '+Math.max(0,a.left-b.left)+'px round 22px)'}function slide(){var H2=window.innerHeight;if(window.innerWidth<1024){it.style.transform='';clip();return}var nt=document.querySelector('.pstack').getBoundingClientRect().top,p=Math.max(0,Math.min(1,(H2*.9-nt)/(H2*.9-96)));p=p*p*(3-2*p);var t1h=it.querySelector('.t1').offsetHeight,ir=im.getBoundingClientRect(),D=Math.max(0,ir.height*.5-t1h/2-30);it.style.transform='translateY('+(-D*(1-p)).toFixed(1)+'px)';clip()}function all(){place();fit();slide()}all();addEventListener('resize',all);addEventListener('load',all);addEventListener('scroll',slide,{passive:true});var c0=document.querySelector('.pcard');function hid(){if(!c0)return;ps.style.opacity=(c0.getBoundingClientRect().top<=ps.getBoundingClientRect().top+12)?'0':'1'}hid();addEventListener('scroll',hid,{passive:true});addEventListener('resize',hid);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(all)})();
  var COL={msg:[28,5,8],light:[249,247,244],d1:[28,5,8],d2:[27,7,10],d3:[56,6,11]};
  /* position (en fraction de la hauteur d'écran) à laquelle le haut de chaque section déclenche son thème */
  var TRIG={'pourquoi-nous':.4,'about':.2};
  var secs=$$('[data-bg]'),themeEl=$('meta[name="theme-color"]'),root=document.documentElement,hdr=$('#hdr'),themeIdx=-1;
  function lum(c){return .299*c[0]+.587*c[1]+.114*c[2]}
  function applyTheme(c){
    var light=lum(c)>128;
    root.classList.toggle('is-light',light);
    root.style.setProperty('--pbg','rgb('+c[0]+','+c[1]+','+c[2]+')');
    root.style.setProperty('--fg',light?'#111111':'#fafafa');
    root.style.setProperty('--fg2',light?'#666666':'#a8a8a8');
    root.style.setProperty('--fgline',light?'rgba(17,17,17,.28)':'rgba(250,250,250,.28)');
    root.style.setProperty('--zebra',light?'rgba(0,0,0,.022)':'rgba(255,255,255,.05)');
    root.style.setProperty('--ctat',light?'#ffffff':'#111111');
    if(themeEl)themeEl.setAttribute('content','rgb('+c[0]+','+c[1]+','+c[2]+')');
  }
  function wash(){
    var idx=0,i;
    for(i=1;i<secs.length;i++){
      var th=TRIG[secs[i].id]!==undefined?TRIG[secs[i].id]:.8;
      if(secs[i].getBoundingClientRect().top<=H*th)idx=i;
    }
    if(idx!==themeIdx){themeIdx=idx;applyTheme(COL[secs[idx].getAttribute('data-bg')])}
    hdr.classList.toggle('solid',text.getBoundingClientRect().top<-H*.9*(W<700?.7:1));
  }

  /* contact : la photo et « Vous » se rapprochent quand le pointeur approche du bouton */
  (function(){var btn=document.querySelector('.dk-contact .cbtn'),me=document.querySelector('.dk-contact .pair .me'),you=document.querySelector('.dk-contact .pair .you');if(!btn||!me||!you)return;var t=0,tgt=0,raf=0;function paint(){me.style.transform='translateX('+(t*64).toFixed(1)+'px)';you.style.transform='translateX('+(-t*64).toFixed(1)+'px)'}function step(){t+=(tgt-t)*.06;if(Math.abs(tgt-t)<.001)t=tgt;paint();raf=t!==tgt?requestAnimationFrame(step):0}document.addEventListener('pointermove',function(e){var r=btn.getBoundingClientRect(),d=Math.hypot(e.clientX-(r.left+r.width/2),e.clientY-(r.top+r.height/2));var q=Math.max(0,Math.min(1,(170-d)/140)),n=q*q*(3-2*q);if(n!==tgt){tgt=n;if(!raf)raf=requestAnimationFrame(step)}},{passive:true})})();

  /* lumière qui suit la souris sur les cartes de Services */
  document.addEventListener('pointermove',function(e){
    var el=e.target&&e.target.closest?e.target.closest('.spot'):null;
    if(!el)return;
    var r=el.getBoundingClientRect();
    el.style.setProperty('--mx',(e.clientX-r.left)+'px');el.style.setProperty('--my',(e.clientY-r.top)+'px');
  },{passive:true});

  /* boucle principale */
  function layout(){
    W=document.documentElement.clientWidth;H=window.innerHeight;mobile=W<700;
    msgFS=parseFloat(getComputedStyle(msg).fontSize);
    docH=document.documentElement.scrollHeight;
    fitQa();
  }
  function update(){
    wash();
    spyFaq();
    seq();
  }
  var tick=false;
  function onS(){if(!tick){tick=true;var done=false,run=function(){if(done)return;done=true;tick=false;update()};requestAnimationFrame(run);setTimeout(run,120)}}
  function init(){layout();update()}
  window.addEventListener('scroll',onS,{passive:true});
  window.addEventListener('resize',init);
  window.addEventListener('load',init);
  init();
})();

/* Cache le texte intro dès que la première carte arrive à l'écran */
(function(){
  var it=document.getElementById('intro');
  var c0=document.querySelector('.pcard');
  if(!it||!c0)return;
  it.style.transition='opacity .35s ease';
  function syncIntro(){
    it.style.opacity=c0.getBoundingClientRect().top<=200?'0':'';
  }
  window.addEventListener('scroll',syncIntro,{passive:true});
  window.addEventListener('resize',syncIntro);
  syncIntro();
})();

/* Animation smoke — tous les textes du site */
(function(){
  var SEL='h2:not(.w),h3,p.p,.pts li,blockquote,.who,.avail,.cmini,.ah p,.faq-l h3,.fgrid p';
  document.querySelectorAll(SEL).forEach(function(el){
    if(el.closest('#top,#text,.cmp,.hdr'))return;
    el.classList.add('fx');
  });
  // stagger pour .pts li
  document.querySelectorAll('.pts li').forEach(function(el,i){
    if(i>0)el.setAttribute('data-d',String(i));
  });
  var all=document.querySelectorAll('.fx');
  if(!all.length)return;
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){e.target.classList.add('on');io.unobserve(e.target)}
    });
  },{threshold:.12,rootMargin:'0px 0px -2% 0px'});
  all.forEach(function(el){io.observe(el)});
})();

/* Rotation sticky sur mobile : les cartes arrivent droites puis pivotent une fois collées */
(function(){
  var cards=document.querySelectorAll('.pcard');
  if(!cards.length)return;
  function upd(){
    if(window.innerWidth>=1024){cards.forEach(function(c){c.classList.remove('stuck')});return}
    cards.forEach(function(c){
      var top=parseFloat(getComputedStyle(c).top);
      c.classList.toggle('stuck',c.getBoundingClientRect().top<=top+4);
    });
  }
  addEventListener('scroll',upd,{passive:true});
  addEventListener('resize',upd);
  upd();
})();
