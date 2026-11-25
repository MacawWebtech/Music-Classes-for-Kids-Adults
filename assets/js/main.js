(()=>{
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const html=document.documentElement;
const store={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};

/* ---- Theme ---- */
const themeBtns=$$('[data-theme-toggle]');
const setTheme=t=>{document.body.classList.toggle('dark',t==='dark');document.documentElement.classList.toggle('dark-root',t==='dark');store.set('music-theme',t);themeBtns.forEach(b=>b.textContent=t==='dark'?'☀':'☾')};
setTheme(store.get('music-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'));
themeBtns.forEach(b=>b.addEventListener('click',()=>setTheme(document.body.classList.contains('dark')?'light':'dark')));

/* ---- Header: mobile menu, sticky shadow, active link ---- */
const header=$('.mn-header'), burger=$('.mn-burger'), nav=$('.mn-nav');
const syncOffset=()=>{if(header){const top=$('.mn-topbar');const h=header.getBoundingClientRect().bottom;document.documentElement.style.setProperty('--mn-head-h-live',Math.max(h,0)+'px')}};
const closeMenu=()=>{if(!nav)return;nav.classList.remove('open');document.body.classList.remove('mn-lock');burger&&burger.setAttribute('aria-expanded','false')};
if(burger&&nav){
  burger.addEventListener('click',()=>{syncOffset();const o=nav.classList.toggle('open');document.body.classList.toggle('mn-lock',o);burger.setAttribute('aria-expanded',o)});
  $$('a',nav).forEach(a=>a.addEventListener('click',closeMenu));
  addEventListener('resize',()=>{if(innerWidth>1100)closeMenu();syncOffset()});
  addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
}
const onScroll=()=>{header&&header.classList.toggle('is-stuck',scrollY>8);syncOffset()};
addEventListener('scroll',onScroll,{passive:true});onScroll();
const here=(location.pathname.split('/').pop()||'index.html').toLowerCase();
$$('.mn-nav a[href]').forEach(a=>{
  const h=a.getAttribute('href').toLowerCase();
  const isHome=(here==='index.html'||here==='home2.html'||here==='')&&a.closest('.mn-dd')&&a.parentElement.classList.contains('mn-dd');
  if(h===here||isHome){(a.parentElement.classList.contains('mn-dd')?a.parentElement:a).classList.add('active')}
});

/* ---- RTL / Arabic ---- */
const swapArrows=rtl=>{
  const map=rtl?{'→':'←','↗':'↖'}:{'←':'→','↖':'↗'};
  const re=rtl?/[→↗]/g:/[←↖]/g;
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  const nodes=[];while(w.nextNode())nodes.push(w.currentNode);
  nodes.forEach(n=>{
    if(!re.test(n.nodeValue)){re.lastIndex=0;return}re.lastIndex=0;
    const p=n.parentElement;if(!p||p.closest('script,style'))return;
    if(p.closest('.btn,.card-link,.mn-cta,a,button')){n.nodeValue=n.nodeValue.replace(re,c=>map[c])}
  });
};
const applyDir=(dir,persist)=>{
  /* RTL button = mirror the layout only. Text stays in English (no translation). */
  const rtl=dir==='rtl';
  html.setAttribute('dir',dir);
  document.body.classList.toggle('is-rtl',rtl);
  swapArrows(rtl);
  $$('[data-rtl-toggle]').forEach(b=>b.setAttribute('aria-pressed',rtl));
  if(persist)store.set('music-dir',dir);
  syncOffset();
};
$$('[data-rtl-toggle]').forEach(b=>b.addEventListener('click',()=>applyDir(html.getAttribute('dir')==='rtl'?'ltr':'rtl',true)));
if(store.get('music-dir')==='rtl')applyDir('rtl',false);
else $$('[data-rtl-toggle]').forEach(b=>b.setAttribute('aria-pressed','false'));

/* ---- Existing behaviours (filters, demo forms) ---- */
$$('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{const f=btn.dataset.filter;$$('[data-filter]').forEach(b=>b.classList.toggle('active',b===btn));$$('[data-category]').forEach(card=>card.hidden=!(f==='all'||card.dataset.category===f))}));
$$('form[data-demo-form]').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const n=$('.notice',form)||$('.notice',form.parentElement);if(n){n.style.display='block';n.textContent=false?'':'Thank you! Your information has been received in this demo.'}form.reset()}));
$$('[data-demo-action]').forEach(b=>b.addEventListener('click',()=>alert('This is a front-end demo. Connect a backend to enable this feature.')));

/* ---- Count-up numbers + reveal on scroll ---- */
const fmt=n=>n.toLocaleString('en-US');
const runCount=el=>{
  const end=+el.dataset.count,dur=1400,t0=performance.now();
  const tick=t=>{const p=Math.min((t-t0)/dur,1),e=1-Math.pow(1-p,3);el.firstChild.nodeValue=fmt(Math.round(end*e));if(p<1)requestAnimationFrame(tick)};
  requestAnimationFrame(tick);
};
if('IntersectionObserver' in window){
  const io=new IntersectionObserver(es=>es.forEach(e=>{
    if(!e.isIntersecting)return;
    e.target.classList.add('in');
    $$('[data-count]',e.target).forEach(runCount);
    if(e.target.matches('[data-count]'))runCount(e.target);
    io.unobserve(e.target);
  }),{threshold:.15});
  $$('.mx-rv').forEach(el=>io.observe(el));
  $$('[data-count]').forEach(el=>{if(!el.closest('.mx-rv'))io.observe(el)});
}else{$$('.mx-rv').forEach(el=>el.classList.add('in'))}
})();
