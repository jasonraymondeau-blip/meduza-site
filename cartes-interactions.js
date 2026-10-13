/* ============================================================
   MEDUZA, mini-interfaces animées des cartes de Services
   Fichier autonome, sans dépendance. Expose window.MeduzaViz.

   API
   - MeduzaViz.cards                 : titres / phrases / numéros des 4 cartes
   - MeduzaViz.html(i)               : renvoie le HTML de la zone animée de la carte i (0 à 3)
   - MeduzaViz.watch(card,{landed})  : joue l'animation quand la carte est visible
                                       (landed:false = carte volante, pas encore posée)
   - MeduzaViz.setLanded(card,bool)  : à appeler quand une carte volante se pose / repart
   - MeduzaViz.sync(card)            : force le recalcul (lecture ou arrêt)

   Le défilement d'une séquence est piloté par des attributs data-t-XXX="ms" :
   à ce moment (en millisecondes depuis le début), la classe XXX est ajoutée
   à l'élément. Les styles associés sont dans cartes-interactions.css.
   La boucle dure data-end ms, puis recommence tant que la carte est visible.
   prefers-reduced-motion : on affiche directement l'état final, sans animation.
   ============================================================ */
(function(){
  'use strict';
  function $(s,r){return (r||document).querySelector(s)}
  function $$(s,r){return [].slice.call((r||document).querySelectorAll(s))}
  function clamp(x,a,b){return Math.max(a,Math.min(b,x))}
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ---------- contenu des quatre cartes ---------- */
  function row(label,on,run,ok,extra){
    return '<div class="r" data-t-on="'+on+'"'+(run?' data-t-run="'+run+'"':'')+(ok?' data-t-ok="'+ok+'"':'')+'><span class="st"></span><span>'+label+'</span>'+(extra||'')+'</div>';
  }
  var CAMICON='<svg viewBox="0 0 24 24"><rect x="3" y="6" width="13" height="12" rx="3"/><path d="M16 10l5-3v10l-5-3"/></svg>';
  var HEARTICON='<svg viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-9.2-9.3C1.8 8 3.6 5 6.6 5c1.9 0 3.6 1 5.4 3 1.8-2 3.5-3 5.4-3 3 0 4.8 3 3.8 6.2-1.7 4.7-9.2 9.3-9.2 9.3z"/></svg>';
  var HEARTFILL='<svg class="hp" viewBox="0 0 24 24" data-t-pop="4500"><path d="M12 21s-8-4.9-9.8-9.9C1.2 7.6 3.2 4.5 6.4 4.5c2 0 3.8 1.1 5.6 3.2 1.8-2.1 3.6-3.2 5.6-3.2 3.2 0 5.2 3.1 4.2 6.6C20 16.1 12 21 12 21z"/></svg>';
  var CMICON='<svg viewBox="0 0 24 24"><path d="M21 12a8.5 8.5 0 0 1-12.3 7.6L3 21l1.5-5.2A8.5 8.5 0 1 1 21 12z"/></svg>';
  var SDICON='<svg viewBox="0 0 24 24"><path d="M21 3L10 14M21 3l-7 18-4-7-7-4 18-7z"/></svg>';
  var NAVICON='<svg viewBox="0 0 24 24"><path d="M12 3l7.5 17.5L12 16.5l-7.5 4z"/></svg>';
  var CHECKICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  function kbrow(keys){return '<div class="kbd-r">'+keys.map(function(k){return '<i class="kk'+(k[2]==='l'?' l':'')+'"'+(k[1]!==1?' style="--w:'+k[1]+'"':'')+(k[3]?' data-t-hot="'+k[3]+'"':'')+'>'+k[0]+'</i>'}).join('')+'</div>'}
  var KBD_KEYS=kbrow([['tab',1.8,'',0],['Q',1,'l',0],['W',1,'l',0],['E',1,'l',0],['R',1,'l',2800],['T',1,'l',0],['Y',1,'l',0],['U',1,'l',0]])+
    kbrow([['caps',2.1,'',0],['A',1,'l',0],['S',1,'l',0],['D',1,'l',0],['F',1,'l',0],['G',1,'l',0],['H',1,'l',0]])+
    kbrow([['shift',2.7,'',1900],['Z',1,'l',0],['X',1,'l',0],['C',1,'l',0],['V',1,'l',0],['B',1,'l',0],['N',1,'l',0]])+
    kbrow([['fn',1.3,'',0],['control',1.3,'',0],['option',1.3,'',0],['command',1.8,'',2350],['',3.2,'',0]]);
  var AV=['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGiEcFxgfGRQUHScdHyIjJSUlFhwpLCgkKyEkJST/2wBDAQYGBgkICREJCREkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCT/wAARCABIAEgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD5wFBGatjTSw+S8sX9vPAP64p40W/f/VwpJ/1zmRv61zWZ7pQ9qB71pf8ACN6yeV0y5b6AH+tMbw/rC/e0y6H/AACmHK+xUtYDdXMcC9ZGCg+ma9DXw9PbwIiGMIq4UZ7VgeFNCmj1H7RfW0sKRj5S6kc13Ut1bMuPtCAjjDZH8xTR0Uqel2c5JY3cQP7nP+6Qayb0OrnejL9RXYP+85Xa4/2Tn+VV5o9ylXUEe9UEoHDSPzxRW1qNhabWdYtuOhHHNFBzuLTOMIz1pNi+gp9GKz5jN00xEmmh5jllQ/7LkfyqzFr+rQDEeoXAA7F9w/WqxFGB6AVXMZunJbM0V8Za1EuWnikA7PGD/Krtv8Q58D7RYxOO5jYj+dc7dWtwihgjBScA+p9KhutPvLZVkuYXj8wbgWHUVoopo5ni6sJWUjtovHukzkebbTwH12hh+laVvrumXw2Q6kFz/Dv2n8mry8LiggKM4FHIaxzKoviSZ6ncaY90gC3ClT0yP6j/AAorzKC+urUg29xLD/uMRRRys0+v03vFl3NGaZzRzWNjbmH1NZXL2V3DdRKjPC4dQ6hlJHqD1qtzTlz60CbVjpbvSbh4BqzW8MVvLtbZCSUB5556Vi6pdXGoSKGJbHAFdtpEKXvh/Ns2oRwZKiGaUSJKR1IXaNv51i3tvFYK0ksYQ9h3rqS0PHn8RyFxbtEMuMVFuwpG0HPr2q3f3ouGO0cVTU5zSZJCzc+wNFWLaxe4JblYweW9fpRUuaRrGhOSukWiTRTcUtY6Ho8woopKTNAcx0dh421LS9HXTLURBFLYdlyRk1g3lzcX8xmuZmkc/lUeaKrmZj7ON72K8sWCMZwa1rDSQ0HmSqQrcj3qXRtM+2uZ5VzBGeR/ePpWvcIXOAMKKHN2sjajg03zy2Mm7dYIgqADAwAB0oqS6aKIEvg0VmjepvvYxcmgE0UVpY4rsMmjNFFFguGTUltBJdTpBGMvIwUUUUW0KhrJJndJbQ6fZomQkUa8Z7nuaxLm+mv5jBZQlz3xwB7k9hRRWaPVqaWiijNp8MOWvLjzGH8Kn5R/jRRRTRzVEouyR//Z','data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGiEcFxgfGRQUHScdHyIjJSUlFhwpLCgkKyEkJST/2wBDAQYGBgkICREJCREkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCT/wAARCABIAEgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD5voJoyKBjNcx7gUYoJ9KBQACgj3paTNABRRmkoACM0UUUwDNHalAFBFAhO1FKMYxRikMTmgCnYoxii4CUlOpCKAEopaKAEzzS7sUYzSYzQIltraa7lWKFC7t/nNb9t4dto1BuHeV+4Hyr/jUuhWZtLTzHX95NySey9h/WtAH1PHpVJG8YK12V10rTwP8Aj0j/ABGf60x9M03PzW0Yz/dJFWpGAU881myudxwadhuyFn0PTH4jkmhb2YMP1rMudCuYgWhZLhB/dOG/L/CrLzMCOaT7Uw70rGbaZikEEhgQR1B7UVsXRivkxIAsoHyyDr9D6iilykMxs44qfT7dru9ihCkhmBb6d61z4H1hef8ART/21/8ArVr+GvD1zpV09xerF02qqvn69qEaRpSb2Oqj0+0FspMEZbucVVm0y1cf6sD/AHeKuHUIsYaCbGOqlW/wqu91bueHZP8AfQiqudckjMn0iJv9W7qfc5FZV3o1xHkqySew4NdKQH4R0f8A3SDUUymMZYEH3pmUoI4eeGaI/PE6++KqyPjOTXW3rfIzkDGK5a8jQEkYzQctRW2KbzFTnJoqCRiCcgiimcrmPj1XUIB+6vbhB6CQ4qwvivWolz9tLAdnUGiimkZSqTitGXbf4gX6gCe3t5QO4G01pQfESzxtuLOWMnuhBoop8qFDH1l1LsHivQ7zg3CIT2mjI/WtCI296mYLh2HpFLkflRRUNWPUw1eVVe8RXGlST/KJwR/dkTB/Mf4Vjah4dvEBKR7x/sPn/wCvRRSTNp0os5m9t5oGKyoVPuMUUUVR5NWKUj//2Q==','data:image/jpeg;base64,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'];
  function avi(i){return '<i class="av" style="background-image:url('+AV[i]+')"></i>'}
  var VZ=[
    /* 1 création : le clavier arrive par la droite, trois touches, « En ligne » */
    {end:7800,html:'<div class="chip3" data-t-on="3500"><i class="dot"></i>En ligne</div><div class="kbd" data-t-ki="300">'+KBD_KEYS+'</div>'},
    /* 2 convaincre : le Reel monte, des bulles arrivent par le bas et remontent */
    {end:9000,html:'<div class="ig" data-t-on="150"><div class="ig-top"><b>Reels</b>'+CAMICON+'</div>'+HEARTFILL+
      '<div class="ig-side"><span class="ic" data-t-liked="4500">'+HEARTICON+'<em class="cnt" data-cnt="3900" data-dur="2000" data-to="1284">0</em></span><span class="ic">'+CMICON+'<em>86</em></span><span class="ic">'+SDICON+'</span></div></div>'+
      '<div class="cmts"><div class="cmt" data-t-on="600" data-t-up1="1900" data-t-up2="3200">'+avi(0)+'<span><b>lea.m</b>Comment on réserve ?</span></div><div class="cmt" data-t-on="1900" data-t-up1="3200">'+avi(1)+'<span><b>ravi_mu</b>Où je peux trouver ça ?</span></div><div class="cmt" data-t-on="3200">'+avi(2)+'<span><b>ines</b>Vous êtes où ?</span></div></div>'},
    /* 3 accompagnement & lancement : une conversation WhatsApp, un seul interlocuteur */
    {end:9200,html:'<div class="wa-h" data-t-on="150"><span class="wa-av"><i></i></span><div><b>Meduza</b><em>Votre interlocuteur unique</em></div><span class="wa-on"><i class="dot"></i>en ligne</span></div><div class="wa"><div class="wa-b" data-t-on="500"><i class="wa-d" data-t-off="1300"><i></i><i></i><i></i></i><span class="wa-tx" data-t-tx="1300">Brief validé. On démarre.</span><span class="wa-t"><span class="wa-tx" data-t-tx="1300">Jour 1</span></span></div><div class="wa-b" data-t-on="2200"><i class="wa-d" data-t-off="3000"><i></i><i></i><i></i></i><span class="wa-tx" data-t-tx="3000">Maquette prête, vous validez ?</span><span class="wa-t"><span class="wa-tx" data-t-tx="3000">Sem. 3</span></span></div><div class="wa-b me" data-t-on="3800"><span class="wa-tx" data-t-tx="4000">Validé, on lance !</span><span class="wa-t"><span class="wa-tx" data-t-tx="4000">Sem. 3</span><svg viewBox="0 0 24 24"><path d="M2 13l4 4 8-9M10 15l2 2 9-10"/></svg></span></div><div class="wa-b" data-t-on="4800"><i class="wa-d" data-t-off="5800"><i></i><i></i><i></i></i><span class="wa-tx" data-t-tx="5800">C\'est en ligne. On suit les retours avec vous.</span><span class="wa-t"><span class="wa-tx" data-t-tx="5800">Jour J</span></span></div></div>'},
    /* 4 garantie : 90 jours, trois objectifs écrits */
    {end:8800,html:'<div class="gr"><div><div class="gr-n" data-t-on="150"><b class="cnt" data-cnt="300" data-dur="3400" data-to="90">0</b><em>jours</em></div><i class="gr-l" data-t-go="300" style="margin-top:calc(var(--u,2px)*3)"><u></u></i></div>'+
      '<div>'+row('Projet en ligne',1200,1300,2000)+row('Communication lancée',2000,2100,2800)+row('100 inscrits',2800,2900,3700)+'</div></div>'}
  ];

  var CARDS=[
    {t:'Création',sub:'Conçu pour convertir',big:'01',unit:'/04'},
    {t:'Convaincre',sub:'Reels et stories',big:'02',unit:'/04'},
    {t:'Accompagnement',sub:'Un seul interlocuteur, de A à Z',big:'03',unit:'/04'},
    {t:'Garantie 90 jours',sub:'3 objectifs écrits',big:'04',unit:'/04'}
  ];

  /* ---------- contrôleur d'animation ---------- */
  /* animation des mini-interfaces : séquence pilotée par les attributs data-t-* */
  function vizCount(el,to,dur){var t0=performance.now();(function f(n){var k=clamp((n-t0)/dur,0,1);el.textContent=Math.round(to*(1-Math.pow(1-k,3))).toLocaleString('fr-FR');if(k<1)el._raf=requestAnimationFrame(f)})(t0)}
  function vizReset(v){
    $$('*',v).forEach(function(el){
      el.classList.remove('on','off','run','ok','go','hot','pop','liked');
      [].slice.call(el.attributes).forEach(function(at){if(at.name.indexOf('data-t-')===0)el.classList.remove(at.name.slice(7))});
      if(el._raf){cancelAnimationFrame(el._raf);el._raf=0}
      if(el.classList&&el.classList.contains('cnt'))el.textContent='0';
    });
  }
  function vizStop(v){(v._t||[]).forEach(clearTimeout);v._t=[]}
  function vizFinal(v){
    $$('*',v).forEach(function(el){
      if(el.hasAttribute('data-t-off')||el.hasAttribute('data-t-pop')||el.hasAttribute('data-t-sb'))return;   /* éléments passagers : absents de l'état final */
      [].slice.call(el.attributes).forEach(function(at){
        if(at.name.indexOf('data-t-')!==0||at.name==='data-t-run')return;
        el.classList.add(at.name.slice(7));
      });
      if(el.classList.contains('cnt'))el.textContent=(+el.getAttribute('data-to')).toLocaleString('fr-FR');
    });
  }
  function vizRun(v){
    vizStop(v);vizReset(v);
    if(reduce){vizFinal(v);return}
    var end=+v.getAttribute('data-end')||8000;
    $$('*',v).forEach(function(el){
      [].slice.call(el.attributes).forEach(function(at){
        if(at.name.indexOf('data-t-')!==0)return;
        var cl=at.name.slice(7),ms=+at.value;
        v._t.push(setTimeout(function(){if(cl==='ok')el.classList.remove('run');el.classList.add(cl)},ms));
      });
      if(el.hasAttribute('data-cnt')){
        v._t.push(setTimeout(function(){vizCount(el,+el.getAttribute('data-to'),+el.getAttribute('data-dur'))},+el.getAttribute('data-cnt')));
      }
    });
    v._t.push(setTimeout(function(){vizReset(v)},end));
    v._t.push(setTimeout(function(){if(v._vis)vizRun(v)},end+900));
  }
  /* une carte joue son animation seulement quand elle est posée et visible */
  function vizSync(card){
    var v=$('.viz',card);if(!v)return;
    var on=!!(card._lan&&card._int);
    if(on===!!v._vis)return;
    v._vis=on;
    if(on)vizRun(v);else{vizStop(v);vizReset(v)}
  }

  var io=('IntersectionObserver' in window)?new IntersectionObserver(function(es){
    es.forEach(function(e){e.target._int=e.isIntersecting;vizSync(e.target)});
  },{threshold:.35}):null;

  window.MeduzaViz={
    cards:CARDS,
    html:function(i){return '<div class="viz" data-v="'+i+'" data-end="'+VZ[i].end+'">'+VZ[i].html+'</div>'},
    watch:function(card,opts){
      card._lan=!(opts&&opts.landed===false);
      card._int=!io;
      if(io)io.observe(card);else vizSync(card);
    },
    setLanded:function(card,on){if(!!card._lan===!!on)return;card._lan=!!on;vizSync(card)},
    sync:vizSync
  };
})();
