/* MelodyNest dashboard core: router, modal, toast, dropdowns, search, notifications. */
(function(){
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store={
  get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}},
  del(k){try{localStorage.removeItem(k)}catch(e){}}
};
const DX={$,$$,esc,store};
DX.money=n=>'₹'+Number(n||0).toLocaleString('en-IN');
DX.initials=n=>String(n||'?').trim().split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase();
DX.uid=p=>(p||'id')+Math.random().toString(36).slice(2,8);
DX.badge=(label,kind)=>`<span class="dx-badge ${kind||''}">${esc(label)}</span>`;
DX.bar=(pct,cls)=>`<div class="dx-bar ${cls||''}" role="progressbar" aria-valuenow="${Math.round(pct)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${Math.max(0,Math.min(100,pct))}%"></i></div>`;
DX.fmtDate=(d,o)=>new Date(d).toLocaleDateString('en-IN',o||{day:'2-digit',month:'short',year:'numeric'});

/* ---- Toast ---- */
DX.toast=(msg,kind)=>{
  let box=$('.dx-toasts');if(!box){box=document.createElement('div');box.className='dx-toasts';box.setAttribute('role','status');box.setAttribute('aria-live','polite');document.body.appendChild(box)}
  const t=document.createElement('div');t.className='dx-toast '+(kind||'');t.innerHTML=`<span class="ic">${kind==='err'?'!':kind==='info'?'i':'✓'}</span><span>${esc(msg)}</span>`;
  box.appendChild(t);requestAnimationFrame(()=>t.classList.add('in'));
  setTimeout(()=>{t.classList.remove('in');setTimeout(()=>t.remove(),300)},3600);
};

/* ---- Modal ---- */
DX.modal=({title,body,actions=[],wide,onClose})=>{
  const prev=document.activeElement;
  const wrap=document.createElement('div');wrap.className='dx-modal-wrap';
  wrap.innerHTML=`<div class="dx-modal${wide?' wide':''}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><header><h3>${esc(title)}</h3><button type="button" class="dx-x" aria-label="Close">✕</button></header><div class="dx-modal-body">${body||''}</div>${actions.length?'<footer></footer>':''}</div>`;
  document.body.appendChild(wrap);document.body.classList.add('dx-lock');
  const el=$('.dx-modal',wrap),foot=$('footer',wrap);
  const api={el,close(){if(!wrap.isConnected)return;wrap.remove();onClose&&onClose();if(!$('.dx-modal-wrap'))document.body.classList.remove('dx-lock');document.removeEventListener('keydown',onKey);prev&&prev.focus&&prev.focus()}};
  actions.forEach(a=>{
    const b=document.createElement('button');b.type='button';b.className='dx-btn '+(a.kind||'ghost');b.textContent=a.label;
    b.addEventListener('click',()=>{const r=a.onClick?a.onClick(api):undefined;if(r!==false)api.close()});foot.appendChild(b);
  });
  const onKey=e=>{if(e.key==='Escape'&&wrap===$$('.dx-modal-wrap').pop())api.close()};
  document.addEventListener('keydown',onKey);
  wrap.addEventListener('mousedown',e=>{if(e.target===wrap)api.close()});
  $('.dx-x',wrap).addEventListener('click',api.close);
  const form=$('form',el);
  if(form)form.addEventListener('submit',e=>{e.preventDefault();const p=$('.dx-btn.primary,.dx-btn.danger',foot);p&&p.click()});
  setTimeout(()=>{const f=$('input:not([type=hidden]),select,textarea,button.primary',el);f&&f.focus()},30);
  return api;
};
DX.confirm=(text,o={})=>new Promise(res=>{
  DX.modal({title:o.title||'Please confirm',body:`<p class="dx-muted" style="margin:0">${esc(text)}</p>`,
    actions:[{label:'Cancel',kind:'ghost',onClick:()=>res(false)},{label:o.ok||'Confirm',kind:o.danger?'danger':'primary',onClick:()=>res(true)}]});
});

/* ---- Files ---- */
DX.download=(name,text,mime)=>{
  const b=new Blob([text],{type:mime||'text/plain'}),a=document.createElement('a');
  a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);
};
DX.csv=(name,rows)=>DX.download(name,rows.map(r=>r.map(c=>'"'+String(c==null?'':c).replace(/"/g,'""')+'"').join(',')).join('\n'),'text/csv');
DX.ics=(title,start,mins,desc)=>{
  const z=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
  const end=new Date(start.getTime()+mins*60000);
  DX.download('class.ics',['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//MelodyNest//EN','BEGIN:VEVENT','UID:'+DX.uid('mn')+'@melodynest','DTSTAMP:'+z(new Date()),'DTSTART:'+z(start),'DTEND:'+z(end),'SUMMARY:'+title,'DESCRIPTION:'+(desc||''),'END:VEVENT','END:VCALENDAR'].join('\r\n'),'text/calendar');
};

/* ---- Dropdowns ---- */
function closeDD(except){$$('[data-dd].open').forEach(d=>{if(d!==except){d.classList.remove('open');const b=$('[data-dd-btn]',d);b&&b.setAttribute('aria-expanded','false')}})}
document.addEventListener('click',e=>{
  const btn=e.target.closest('[data-dd-btn]');
  if(btn){const dd=btn.closest('[data-dd]');const open=!dd.classList.contains('open');closeDD(dd);dd.classList.toggle('open',open);btn.setAttribute('aria-expanded',open);return}
  if(!e.target.closest('[data-dd] .dx-menu'))closeDD();
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDD()});

/* ---- App init ---- */
DX.init=function(cfg){
  const content=$('#dxContent'),side=$('#dxSide'),overlay=$('#dxOverlay');
  const names=Object.keys(cfg.views);let current=null;
  const setSide=o=>{side.classList.toggle('open',o);overlay.classList.toggle('on',o);document.body.classList.toggle('dx-lock',o)};
  $('#dxBurger').addEventListener('click',()=>setSide(!side.classList.contains('open')));
  overlay.addEventListener('click',()=>setSide(false));
  addEventListener('resize',()=>{if(innerWidth>980)setSide(false)});

  function route(keepScroll){
    let name=(location.hash||'').replace('#','').split('?')[0];if(!cfg.views[name])name=cfg.start;
    const v=cfg.views[name],y=scrollY;current=name;
    content.innerHTML=`<section class="dx-view" id="view-${name}" tabindex="-1">${v.render()}</section>`;
    $$('[data-nav]').forEach(a=>{const on=a.dataset.nav===name;a.classList.toggle('active',on);on?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current')});
    const t=$('#dxTitle');if(t)t.textContent=v.title;document.title=v.title+' · MelodyNest';
    v.mount&&v.mount($('.dx-view',content));
    setSide(false);
    if(keepScroll===true)scrollTo(0,y);else{scrollTo(0,0)}
  }
  DX.refresh=()=>route(true);
  DX.go=n=>{if(location.hash==='#'+n)route();else location.hash=n};
  DX.current=()=>current;
  addEventListener('hashchange',()=>route());

  /* delegated actions */
  document.addEventListener('click',e=>{
    const g=e.target.closest('[data-go]');
    if(g){e.preventDefault();DX.go(g.dataset.go);closeDD();return}
    const a=e.target.closest('[data-action]');
    if(a&&cfg.actions[a.dataset.action]){e.preventDefault();cfg.actions[a.dataset.action](a,e);closeDD()}
  });
  document.addEventListener('change',e=>{const a=e.target.closest('[data-change]');if(a&&cfg.actions[a.dataset.change])cfg.actions[a.dataset.change](a,e)});
  document.addEventListener('input',e=>{const a=e.target.closest('[data-input]');if(a&&cfg.actions[a.dataset.input])cfg.actions[a.dataset.input](a,e)});
  document.addEventListener('submit',e=>{const f=e.target.closest('[data-submit]');if(f&&cfg.actions[f.dataset.submit]){e.preventDefault();cfg.actions[f.dataset.submit](f,e)}});

  /* notifications */
  const nk='mn-notifs-'+cfg.role+'-'+cfg.user.email;
  let notifs=store.get(nk,null)||cfg.notifs.map((n,i)=>({...n,id:i,read:false}));
  const nb=$('#dxBellList'),dot=$('#dxBellDot');
  const drawNotifs=()=>{
    const unread=notifs.filter(n=>!n.read).length;
    dot.textContent=unread;dot.hidden=!unread;
    nb.innerHTML=notifs.length?notifs.map(n=>`<button type="button" class="dx-notif${n.read?'':' unread'}" data-notif="${n.id}"><span class="ic">${esc(n.icon||'♪')}</span><span><b>${esc(n.title)}</b><small>${esc(n.text)} · ${esc(n.when)}</small></span></button>`).join(''):'<p class="dx-empty-s">No notifications.</p>';
    store.set(nk,notifs);
  };
  drawNotifs();
  nb.addEventListener('click',e=>{const b=e.target.closest('[data-notif]');if(!b)return;const n=notifs.find(x=>x.id==b.dataset.notif);n.read=true;drawNotifs();if(n.go){DX.go(n.go);closeDD()}});
  $('#dxMarkRead').addEventListener('click',e=>{e.stopPropagation();notifs.forEach(n=>n.read=true);drawNotifs();DX.toast('All notifications marked as read','info')});
  DX.notify=(n)=>{notifs.unshift({...n,id:Date.now(),read:false,when:'Just now'});drawNotifs()};

  /* search */
  const inp=$('#dxSearch'),res=$('#dxResults');
  const showRes=()=>{
    const q=inp.value.trim().toLowerCase();
    if(!q){res.hidden=true;return}
    const items=cfg.searchIndex().filter(i=>(i.label+' '+(i.hint||'')).toLowerCase().includes(q)).slice(0,7);
    res.innerHTML=items.length?items.map((i,n)=>`<button type="button" class="dx-res" data-res="${n}"><b>${esc(i.label)}</b><small>${esc(i.hint||'')}</small></button>`).join(''):'<p class="dx-empty-s">No matches for “'+esc(q)+'”.</p>';
    res.hidden=false;res._items=items;
  };
  inp.addEventListener('input',showRes);inp.addEventListener('focus',showRes);
  const pick=i=>{if(!i)return;res.hidden=true;inp.value='';inp.blur();DX.go(i.go);if(i.after)setTimeout(i.after,60)};
  res.addEventListener('click',e=>{const b=e.target.closest('[data-res]');if(b)pick(res._items[b.dataset.res])});
  inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();pick(res._items&&res._items[0])}if(e.key==='Escape'){res.hidden=true;inp.blur()}});
  document.addEventListener('keydown',e=>{if(e.key==='/'&&!/input|textarea|select/i.test(document.activeElement.tagName)){e.preventDefault();inp.focus()}});
  document.addEventListener('click',e=>{if(!e.target.closest('.dx-search'))res.hidden=true});

  route();
};
window.DX=DX;
})();
