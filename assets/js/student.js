/* Student dashboard (demo data persisted in localStorage per account). */
(function(){
const {$,$$,esc,store,money,badge,bar,fmtDate}=DX;
const S=MNAuth.session();if(!S)return;
const KEY='mn-sd-'+S.email;
const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],DAYFULL=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const pad=n=>String(n).padStart(2,'0');
const dkey=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const sow=d=>{const x=new Date(d);x.setHours(0,0,0,0);x.setDate(x.getDate()-((x.getDay()+6)%7));return x};
const addD=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const at=(d,t)=>{const [h,m]=t.split(':');const x=new Date(d);x.setHours(+h,+m,0,0);return x};
const t12=t=>{const [h,m]=t.split(':').map(Number);return (h%12||12)+':'+pad(m)+' '+(h>=12?'PM':'AM')};
const CATALOG={
 guitar:{name:'Guitar basics',inst:'Arun Kumar',topics:['Holding & tuning','Open chords','Strumming patterns','Chord changes','Fingerpicking intro','Simple songs','Reading tabs','Barre chord prep','Rhythm games','Mini performance'],skills:{Chords:70,Rhythm:62,Songs:48,Theory:40}},
 keys:{name:'Keyboard foundations',inst:'Daniel Joseph',topics:['Posture & notes','Right-hand melodies','Left-hand basics','Scales','Chords','Hand coordination','Reading notation','Simple songs','Dynamics','Mini performance'],skills:{Reading:45,Technique:38,Songs:40,Scales:50}},
 vocals:{name:'Vocal studio',inst:'Meera Nair',topics:['Breathing','Warm-ups','Pitch matching','Posture & tone','Simple songs','Phrasing','Range building','Mic technique','Expression','Mini performance'],skills:{Pitch:50,Breath:45,Tone:40,Confidence:55}},
 drums:{name:'Drum lab',inst:'Rohan Das',topics:['Grip & posture','Basic beats','Rudiments','Fills','Timing & metronome','Rock grooves','Ghost notes','Play-alongs','Dynamics','Mini performance'],skills:{Timing:50,Coordination:42,Grooves:45,Fills:35}},
 violin:{name:'Violin starters',inst:'Kavya Menon',topics:['Posture & hold','Open strings','Bow control','First position','Simple songs','Intonation','Rhythm','Slurs','Dynamics','Mini performance'],skills:{Bowing:40,Intonation:35,Songs:38,Rhythm:45}}
};
const lessonsOf=id=>CATALOG[id].topics.flatMap(t=>[t+' · learn',t+' · practise']);
function seed(){
  const demo=S.email==='student@melodynest.demo';
  const u=(JSON.parse(localStorage.getItem('mn-users')||'[]').find(x=>x.email===S.email))||{};
  const map={Guitar:'guitar',Keyboard:'keys',Vocals:'vocals',Drums:'drums'};
  const c=demo?null:(map[u.course]||'guitar');
  const now=new Date();
  const d={
    courses:demo?[{id:'guitar',level:'Beginner',status:'active',done:Array.from({length:13},(_,i)=>i),skills:CATALOG.guitar.skills},{id:'keys',level:'Beginner',status:'active',done:Array.from({length:8},(_,i)=>i),skills:CATALOG.keys.skills}]
      :[{id:c,level:'Beginner',status:'active',done:[],skills:Object.fromEntries(Object.keys(CATALOG[c].skills).map(k=>[k,0]))}],
    classes:demo?[{id:'c1',course:'guitar',title:'Chord changes & rhythm',day:2,time:'17:00',mins:60,room:'Studio 2'},{id:'c2',course:'keys',title:'Scales & hand coordination',day:4,time:'16:00',mins:60,room:'Keys Room'},{id:'c3',course:'guitar',title:'Group jam session',day:5,time:'10:00',mins:90,room:'Stage Room'}]
      :[{id:'c1',course:c,title:'Intro class — '+CATALOG[c].name,day:2,time:'17:00',mins:60,room:'Studio 1'}],
    attendance:demo?[100,100,67,100,100,100,67,100]:[],
    invoices:demo?[{id:'INV-1020',desc:'Monthly fee · September',issued:'2026-09-01',due:'2026-09-07',amt:2499,status:'paid',paidOn:'2026-09-02'},{id:'INV-1031',desc:'Monthly fee · October',issued:'2026-10-01',due:'2026-10-07',amt:2499,status:'paid',paidOn:'2026-10-03'},{id:'INV-1042',desc:'Monthly fee · November',issued:'2026-11-01',due:'2026-11-07',amt:2499,status:'paid',paidOn:'2026-11-02'},{id:'INV-1050',desc:'Monthly fee · December',issued:'2026-11-25',due:'2026-12-01',amt:2499,status:'due'}]
      :[{id:'INV-'+(2000+Math.floor(Math.random()*900)),desc:'Registration & first month',issued:dkey(now),due:dkey(addD(now,7)),amt:1499,status:'due'}],
    feedback:demo?[{who:'Arun Kumar',course:'Guitar',date:'2026-11-18',text:'Great progress on chord changes. Keep practising G to C slowly with a metronome.'},{who:'Daniel Joseph',course:'Keyboard',date:'2026-11-14',text:'Left-hand timing is improving. Next week we start two-hand coordination.'}]:[],
    milestones:demo?[{t:'First chord played',d:'Done',done:true},{t:'Smooth three-chord changes',d:'Done',done:true},{t:'Play a complete beginner song',d:'In progress',done:false},{t:'Perform at the Winter Showcase',d:'14 Dec',done:false}]
      :[{t:'Attend your first class',d:'Upcoming',done:false},{t:'Learn your first piece',d:'Next',done:false},{t:'Perform at a showcase',d:'Later',done:false}],
    practice:{},reminders:[false,false,false],requests:[],enrol:[],
    profile:{phone:u.phone||(demo?'+91 98765 43210':''),guardian:demo?'Ravi R':'',address:demo?'12 Lake View Road, Chennai':'',emergency:demo?'Ravi R · +91 98765 00000':'',pref:{reminders:true,email:true,sms:false,news:false}},
    since:demo?'2026-06-12':dkey(now)
  };
  return d;
}
let D=store.get(KEY,null)||seed();
const save=()=>store.set(KEY,D);
D.profile=D.profile||{pref:{}};D.requests=D.requests||[];D.enrol=D.enrol||[];D.practice=D.practice||{};
const ui={ctab:'all',week:0,sview:'week',pfilter:'all'};
const first=()=>S.name.split(' ')[0];
const cname=id=>CATALOG[id]?CATALOG[id].name:id,cinst=id=>CATALOG[id]?CATALOG[id].inst:'';
const pct=c=>Math.round(c.done.length/20*100);
const wk=d=>dkey(sow(d));

/* classes -> concrete occurrences */
function occurrences(from,weeks){
  const out=[],start=sow(from);
  for(let w=0;w<weeks;w++)D.classes.forEach(c=>{const date=addD(start,w*7+c.day),when=at(date,c.time);out.push({...c,date,when,wk:dkey(sow(date))})});
  return out.sort((a,b)=>a.when-b.when);
}
const reqFor=(cid,date)=>D.requests.find(r=>r.cid===cid&&r.orig===dkey(date)&&r.status!=='Cancelled');
function upcoming(n){const now=new Date();return occurrences(addD(now,-1),6).filter(o=>o.when>now).slice(0,n)}
const dueSoon=()=>D.invoices.filter(i=>i.status==='due').sort((a,b)=>a.due.localeCompare(b.due))[0];
const overdue=i=>i.status==='due'&&new Date(i.due+'T23:59:59')<new Date();
const attAvg=()=>D.attendance.length?Math.round(D.attendance.reduce((a,b)=>a+b,0)/D.attendance.length):null;
const ic={
 grid:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
 note:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
 cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>',
 chart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 6-7"/></svg>',
 card:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>'
};

/* ---------- Views ---------- */
const V={};
V.overview={title:'Overview',render(){
  const h=new Date().getHours(),g=h<12?'Good morning':h<17?'Good afternoon':'Good evening';
  const nx=upcoming(1)[0],week=occurrences(new Date(),1).filter(o=>wk(o.date)===wk(new Date())).length;
  const att=attAvg(),due=dueSoon(),od=D.invoices.some(overdue);
  const pr=D.practice[wk(new Date())]||Array(7).fill(false),todayIdx=(new Date().getDay()+6)%7,prDone=pr.filter(Boolean).length;
  return `<div class="dx-head"><div><span class="dx-eye">STUDENT SPACE</span><h1>${g}, ${esc(first())}! ✨</h1><p>Here’s what’s happening with your music this week.</p></div><button class="dx-btn primary" data-action="enrol">+ Enrol in a course</button></div>
  <div class="dx-grid g4">
   <button class="dx-stat" data-go="courses"><span class="ic">${ic.note}</span><small>My courses</small><strong>${pad(D.courses.length)}</strong><em>Currently learning</em></button>
   <button class="dx-stat" data-go="schedule"><span class="ic">${ic.cal}</span><small>Classes this week</small><strong>${pad(week)}</strong><em>${nx?'Next: '+DAYFULL[(nx.when.getDay()+6)%7]:'No upcoming class'}</em></button>
   <button class="dx-stat" data-go="progress"><span class="ic">${ic.chart}</span><small>Attendance</small><strong>${att==null?'—':att+'%'}</strong><em>${att==null?'Starts after your first class':att>=90?'Great consistency':'Room to improve'}</em></button>
   <button class="dx-stat" data-go="payments"><span class="ic">${ic.card}</span><small>Fee status</small><strong>${od?'Overdue':due?'Paid':'Paid'}</strong><em>${due?'Next due: '+fmtDate(due.due,{day:'numeric',month:'short'}):'All clear'}</em></button>
  </div>
  ${nx?`<div class="dx-hero dx-sp"><div><span class="tag">YOUR NEXT CLASS · ${esc(cname(nx.course).toUpperCase())}</span><h2>${esc(nx.title)}</h2><p>${DAYFULL[(nx.when.getDay()+6)%7]}, ${fmtDate(nx.when,{day:'numeric',month:'short'})} · ${t12(nx.time)} · With ${esc(cinst(nx.course))} · ${esc(nx.room)}</p></div><div class="dx-row"><button class="dx-btn gold" data-action="ics" data-cid="${nx.id}" data-date="${dkey(nx.date)}">Add to calendar</button><button class="dx-btn ghost" style="color:#fff!important;border-color:#555" data-action="resched" data-cid="${nx.id}" data-date="${dkey(nx.date)}">Request reschedule</button></div></div>`:''}
  <div class="dx-grid g21 dx-sp">
   <div class="dx-card"><header><h3>My courses</h3><button class="dx-link" data-go="courses">View all →</button></header>
    <div class="dx-tw" style="border:0"><table class="dx-table"><thead><tr><th>Course</th><th>Instructor</th><th>Progress</th><th>Next class</th></tr></thead><tbody>${D.courses.map(c=>{const n=upcoming(20).find(o=>o.course===c.id);return `<tr style="cursor:pointer" data-action="course" data-id="${c.id}"><td><b>${esc(cname(c.id))}</b></td><td>${esc(cinst(c.id))}</td><td style="min-width:150px"><div style="display:flex;gap:10px;align-items:center">${bar(pct(c))}<b>${pct(c)}%</b></div></td><td>${n?DAYS[(n.when.getDay()+6)%7]+', '+t12(n.time):'—'}</td></tr>`}).join('')}</tbody></table></div></div>
   <div class="dx-card"><header><h3>This week’s practice</h3><span class="dx-badge">${prDone}/3 days goal</span></header>
    <div class="dx-days">${DAYS.map((d,i)=>`<button class="dx-day${pr[i]?' done':''}${i===todayIdx?' today':''}" data-action="practice" data-i="${i}" aria-pressed="${!!pr[i]}" aria-label="${DAYFULL[i]} practice"><span>${d}</span><i>✓</i></button>`).join('')}</div>
    <p style="margin-top:14px;font-size:.86rem">Tap a day when you practise 15+ minutes. Goal: 3 days a week.</p>${bar(Math.min(100,prDone/3*100),prDone>=3?'ok':'')}</div>
  </div>
  <div class="dx-grid g2 dx-sp">
   <div class="dx-card"><header><h3>Coming up</h3><button class="dx-link" data-go="schedule">Full schedule →</button></header><div class="dx-list">${upcoming(4).map(o=>`<button class="dx-li" data-action="class" data-cid="${o.id}" data-date="${dkey(o.date)}"><div class="dx-date"><b>${o.date.getDate()}</b><small>${DAYS[(o.date.getDay()+6)%7].toUpperCase()}</small></div><div><b>${esc(o.title)}</b><small>${t12(o.time)} · ${esc(cinst(o.course))}</small></div><div class="r">${reqFor(o.id,o.date)?badge('Reschedule requested','warn'):badge('Confirmed','ok')}</div></button>`).join('')||'<div class="dx-empty">No upcoming classes.</div>'}</div></div>
   <div class="dx-card"><header><h3>Helpful reminders</h3></header><div>${['Bring your notebook to the next class','Check the schedule if a batch update arrives','Ask your instructor if a practice task feels difficult'].map((t,i)=>`<div class="dx-opt"><div><b>${t}</b></div><label class="dx-sw"><input type="checkbox" data-change="remind" data-i="${i}" ${D.reminders[i]?'checked':''} aria-label="${esc(t)}"><i></i></label></div>`).join('')}</div></div>
  </div><p class="dx-note">Demo dashboard with sample data saved in this browser. Connect a backend for real student records.</p>`;
}};

V.courses={title:'My courses',render(){
  const list=D.courses.filter(c=>ui.ctab==='all'||(ui.ctab==='progress'&&c.status==='active'&&pct(c)<100)||(ui.ctab==='done'&&pct(c)>=100)||(ui.ctab==='pending'&&c.status==='pending'));
  const owned=D.courses.map(c=>c.id),more=Object.keys(CATALOG).filter(k=>!owned.includes(k));
  return `<div class="dx-head"><div><span class="dx-eye">LEARNING</span><h1>My courses</h1><p>Track lessons, message teachers and download materials.</p></div>
   <div class="dx-tabs" role="tablist">${[['all','All'],['progress','In progress'],['done','Completed'],['pending','Pending']].map(([k,l])=>`<button class="${ui.ctab===k?'on':''}" data-action="ctab" data-k="${k}">${l}</button>`).join('')}</div></div>
  <div class="dx-grid g2">${list.map(c=>{const n=upcoming(30).find(o=>o.course===c.id);return `<article class="dx-card"><header><div class="dx-who"><span class="dx-av">${esc(cname(c.id)[0])}</span><div><h3>${esc(cname(c.id))}</h3><small>${esc(cinst(c.id))} · ${esc(c.level)}</small></div></div>${c.status==='pending'?badge('Pending approval','warn'):pct(c)>=100?badge('Completed','ok'):badge('Active')}</header>
    <div style="display:flex;gap:12px;align-items:center">${bar(pct(c))}<b>${pct(c)}%</b></div><p style="margin:10px 0 16px;font-size:.88rem">${c.done.length} of 20 lessons · ${n?'Next class '+DAYS[(n.when.getDay()+6)%7]+' '+t12(n.time):'No class scheduled'}</p>
    <div class="dx-row"><button class="dx-btn primary sm" data-action="course" data-id="${c.id}">Continue lessons</button><button class="dx-btn ghost sm" data-action="materials" data-id="${c.id}">Materials</button><button class="dx-btn ghost sm" data-action="msg" data-id="${c.id}">Message teacher</button></div></article>`}).join('')||'<div class="dx-card dx-empty" style="grid-column:1/-1">No courses in this tab yet.</div>'}</div>
  ${more.length?`<div class="dx-sp"><h3 style="margin-bottom:14px">Explore more courses</h3><div class="dx-grid dx-more" style="--cols:${more.length%3===0?3:(more.length%2===0?2:(more.length===1?1:3))}">${more.map(k=>`<div class="dx-card dx-more-card"><h3>${esc(CATALOG[k].name)}</h3><p style="margin:6px 0 14px;font-size:.88rem">With ${esc(CATALOG[k].inst)}</p><button class="dx-btn ghost sm" data-action="enrol" data-id="${k}">Enrol →</button></div>`).join('')}</div></div>`:''}`;
}};

V.schedule={title:'Class schedule',render(){
  const start=addD(sow(new Date()),ui.week*7),end=addD(start,6),now=new Date();
  const occ=occurrences(start,1);
  const head=`<div class="dx-head"><div><span class="dx-eye">SCHEDULE</span><h1>Class schedule</h1><p>${fmtDate(start,{day:'numeric',month:'short'})} – ${fmtDate(end,{day:'numeric',month:'short',year:'numeric'})}</p></div>
   <div class="dx-row"><div class="dx-tabs"><button class="${ui.sview==='week'?'on':''}" data-action="sview" data-k="week">Week</button><button class="${ui.sview==='list'?'on':''}" data-action="sview" data-k="list">List</button></div>
   <button class="dx-ib" data-action="wk" data-d="-1" aria-label="Previous week">‹</button><button class="dx-btn ghost sm" data-action="wk" data-d="0">Today</button><button class="dx-ib" data-action="wk" data-d="1" aria-label="Next week">›</button></div></div>`;
  const body=ui.sview==='week'?`<div class="dx-cal">${DAYS.map((d,i)=>{const dt=addD(start,i),ev=occ.filter(o=>o.day===i);return `<div class="dx-cd${dkey(dt)===dkey(now)?' today':''}"><b>${d.toUpperCase()}<span>${dt.getDate()}</span></b>${ev.map(o=>`<button class="dx-ev${reqFor(o.id,o.date)?' req':''}" data-action="class" data-cid="${o.id}" data-date="${dkey(o.date)}">${t12(o.time)}<small>${esc(o.title)}</small></button>`).join('')||'<small class="dx-muted" style="font-size:.74rem">Free day</small>'}</div>`}).join('')}</div>`
  :`<div class="dx-list">${occurrences(addD(now,-1),8).filter(o=>o.when>now).slice(0,12).map(o=>`<button class="dx-li" data-action="class" data-cid="${o.id}" data-date="${dkey(o.date)}"><div class="dx-date"><b>${o.date.getDate()}</b><small>${DAYS[(o.date.getDay()+6)%7].toUpperCase()}</small></div><div><b>${esc(o.title)}</b><small>${t12(o.time)} · ${esc(cname(o.course))} · ${esc(o.room)}</small></div><div class="r">${reqFor(o.id,o.date)?badge('Requested','warn'):badge('Confirmed','ok')}</div></button>`).join('')||'<div class="dx-empty">No upcoming classes.</div>'}</div>`;
  const rq=D.requests.filter(r=>r.status!=='Cancelled');
  return head+body+`<div class="dx-card dx-sp"><header><h3>Reschedule requests</h3></header>${rq.length?`<div class="dx-list">${rq.map(r=>`<div class="dx-li"><div class="ic">↻</div><div><b>${esc(r.title)}</b><small>${fmtDate(r.orig)} → ${fmtDate(r.date)} at ${t12(r.time)}${r.reason?' · '+esc(r.reason):''}</small></div><div class="r">${badge(r.status,'warn')} <button class="dx-btn ghost sm" data-action="cancelReq" data-id="${r.id}">Cancel</button></div></div>`).join('')}</div>`:'<div class="dx-empty">No requests. Open a class to request a new time.</div>'}</div>`;
}};

V.progress={title:'My progress',render(){
  const streak=Object.values(D.practice).reduce((a,w)=>a+w.filter(Boolean).length,0);
  return `<div class="dx-head"><div><span class="dx-eye">GROWTH</span><h1>My progress</h1><p>Small wins add up. Here’s how you’re doing.</p></div></div>
  <div class="dx-grid g3"><div class="dx-card dx-score"><div class="dx-donut" style="width:96px;height:96px;background:conic-gradient(var(--g) ${attAvg()||0}%,var(--ln) 0)"><b style="font-size:1rem">${attAvg()==null?'—':attAvg()+'%'}</b></div><div><b style="font-size:1rem">Attendance</b><p>Last ${D.attendance.length||0} weeks</p></div></div>
   <div class="dx-card dx-score"><b>${streak}</b><div><b style="font-size:1rem">Practice days</b><p>Logged in total</p></div></div>
   <div class="dx-card dx-score"><b>${D.courses.reduce((a,c)=>a+c.done.length,0)}</b><div><b style="font-size:1rem">Lessons done</b><p>Across all courses</p></div></div></div>
  <div class="dx-grid g2 dx-sp"><div class="dx-card"><header><h3>Skills by course</h3></header>${D.courses.map(c=>`<h4 style="margin:8px 0 14px">${esc(cname(c.id))}</h4>${Object.entries(c.skills).map(([k,v])=>`<div class="dx-skill"><div><span>${esc(k)}</span><span>${v}%</span></div>${bar(v)}</div>`).join('')}`).join('')}</div>
   <div class="dx-card"><header><h3>Weekly attendance</h3></header>${D.attendance.length?`<div class="dx-chart">${D.attendance.map((v,i)=>`<div class="dx-col"><span style="height:${v}%" data-v="${v}%"></span><small>W${i+1}</small></div>`).join('')}</div>`:'<div class="dx-empty">Your attendance chart appears after your first classes.</div>'}</div></div>
  <div class="dx-grid g2 dx-sp"><div class="dx-card"><header><h3>Milestones</h3></header><ol class="dx-tl">${D.milestones.map((m,i)=>`<li class="${m.done?'done':''}"><span class="d">${m.done?'✓':i+1}</span><div><b>${esc(m.t)}</b><small>${esc(m.d)}</small></div></li>`).join('')}</ol></div>
   <div class="dx-card"><header><h3>Teacher feedback</h3></header><div class="dx-list">${D.feedback.map(f=>`<div class="dx-li" style="align-items:flex-start"><div class="ic">${esc(f.who[0])}</div><div><b>${esc(f.who)} · ${esc(f.course)}</b><small>${fmtDate(f.date)}</small><p style="margin-top:6px;font-size:.9rem">${esc(f.text)}</p></div></div>`).join('')||'<div class="dx-empty">Feedback from your teachers will appear here.</div>'}</div></div></div>`;
}};

V.payments={title:'Fee payments',render(){
  const paid=D.invoices.filter(i=>i.status==='paid').reduce((a,i)=>a+i.amt,0),out=D.invoices.filter(i=>i.status==='due').reduce((a,i)=>a+i.amt,0),nx=dueSoon();
  const rows=D.invoices.filter(i=>ui.pfilter==='all'||(ui.pfilter==='paid'&&i.status==='paid')||(ui.pfilter==='due'&&i.status==='due'));
  return `<div class="dx-head"><div><span class="dx-eye">BILLING</span><h1>Fee payments</h1><p>Invoices, receipts and upcoming dues.</p></div><div class="dx-tabs">${[['all','All'],['paid','Paid'],['due','Due']].map(([k,l])=>`<button class="${ui.pfilter===k?'on':''}" data-action="pfilter" data-k="${k}">${l}</button>`).join('')}</div></div>
  <div class="dx-grid g3"><div class="dx-card"><small class="dx-muted">Total paid</small><h2 style="font-size:2rem;margin-top:6px">${money(paid)}</h2></div><div class="dx-card"><small class="dx-muted">Outstanding</small><h2 style="font-size:2rem;margin-top:6px">${money(out)}</h2></div><div class="dx-card"><small class="dx-muted">Next due date</small><h2 style="font-size:2rem;margin-top:6px">${nx?fmtDate(nx.due,{day:'numeric',month:'short'}):'—'}</h2></div></div>
  <div class="dx-tw dx-sp"><table class="dx-table"><thead><tr><th>Invoice</th><th>Description</th><th>Due</th><th>Amount</th><th>Status</th><th></th></tr></thead><tbody>${rows.map(i=>`<tr><td><b>${i.id}</b></td><td>${esc(i.desc)}</td><td>${fmtDate(i.due)}</td><td>${money(i.amt)}</td><td>${i.status==='paid'?badge('Paid','ok'):overdue(i)?badge('Overdue','bad'):badge('Due','warn')}</td><td><div class="acts">${i.status==='paid'?`<button class="dx-btn ghost sm" data-action="receipt" data-id="${i.id}">Receipt</button>`:`<button class="dx-btn primary sm" data-action="pay" data-id="${i.id}">Pay now</button>`}</div></td></tr>`).join('')||'<tr><td colspan="6" class="dx-empty">No invoices here.</td></tr>'}</tbody></table></div>`;
}};

V.profile={title:'My profile',render(){
  const p=D.profile,pf=p.pref||{};
  const sw=(k,t,s)=>`<div class="dx-opt"><div><b>${t}</b><small>${s}</small></div><label class="dx-sw"><input type="checkbox" data-change="pref" data-k="${k}" ${pf[k]?'checked':''} aria-label="${t}"><i></i></label></div>`;
  return `<div class="dx-head"><div><span class="dx-eye">ACCOUNT</span><h1>My profile</h1><p>Keep your details up to date.</p></div></div>
  <div class="dx-grid g12"><div class="dx-card" style="text-align:center"><span class="dx-av" style="width:92px;height:92px;font-size:1.9rem;margin:6px auto 14px">${esc(DX.initials(S.name))}</span><h3>${esc(S.name)}</h3><p>${esc(S.email)}</p><p style="margin-top:6px">${S.id?'Student ID: <b>'+esc(S.id)+'</b>':''}</p><p style="margin:6px 0 16px">Member since ${fmtDate(D.since)}</p><div class="dx-row" style="justify-content:center">${D.courses.map(c=>badge(cname(c.id))).join('')}</div>
    <hr style="border:0;border-top:1px solid var(--ln);margin:20px 0"><div class="dx-row" style="justify-content:center"><button class="dx-btn ghost sm" data-action="export">Download my data</button><button class="dx-btn danger sm" data-logout>Log out</button></div></div>
   <div class="dx-grid"><form class="dx-card" data-submit="saveProfile"><header><h3>Personal details</h3></header><div class="dx-fg">
     <div class="dx-f"><label for="pf-n">Full name</label><input id="pf-n" name="name" value="${esc(S.name)}" required></div>
     <div class="dx-f"><label for="pf-e">Email</label><input id="pf-e" value="${esc(S.email)}" disabled></div>
     <div class="dx-f"><label for="pf-p">Phone</label><input id="pf-p" name="phone" type="tel" value="${esc(p.phone)}" placeholder="+91"></div>
     <div class="dx-f"><label for="pf-g">Parent / guardian</label><input id="pf-g" name="guardian" value="${esc(p.guardian)}"></div>
     <div class="dx-f full"><label for="pf-a">Address</label><input id="pf-a" name="address" value="${esc(p.address)}"></div>
     <div class="dx-f full"><label for="pf-x">Emergency contact</label><input id="pf-x" name="emergency" value="${esc(p.emergency)}"></div></div>
     <div class="dx-row" style="margin-top:18px"><button class="dx-btn primary" type="submit">Save changes</button></div></form>
    <div class="dx-card"><header><h3>Notifications</h3></header>${sw('reminders','Class reminders','A nudge the day before each class')}${sw('email','Email updates','Schedule changes and invoices')}${sw('sms','SMS alerts','Last-minute changes only')}${sw('news','Newsletter','Tips and showcase invites')}</div>
    <form class="dx-card" data-submit="changePw"><header><h3>Change password</h3></header><div class="dx-fg"><div class="dx-f full"><label for="cp-o">Current password</label><input id="cp-o" name="old" type="password" required autocomplete="current-password"></div><div class="dx-f"><label for="cp-n">New password</label><input id="cp-n" name="nw" type="password" minlength="8" required autocomplete="new-password"></div><div class="dx-f"><label for="cp-c">Confirm new password</label><input id="cp-c" name="cf" type="password" minlength="8" required autocomplete="new-password"></div></div><div class="dx-row" style="margin-top:18px"><button class="dx-btn primary" type="submit">Update password</button></div></form></div></div>`;
}};

/* ---------- Actions ---------- */
function openClass(cid,date){
  const c=D.classes.find(x=>x.id===cid);if(!c)return;const d=new Date(date+'T00:00:00'),when=at(d,c.time),rq=reqFor(cid,d);
  const m=DX.modal({title:c.title,body:`<div class="dx-info" style="grid-template-columns:1fr 1fr"><div><small>Course</small><b>${esc(cname(c.course))}</b></div><div><small>Teacher</small><b>${esc(cinst(c.course))}</b></div><div><small>When</small><b>${DAYFULL[(d.getDay()+6)%7]}, ${fmtDate(d,{day:'numeric',month:'short'})}</b></div><div><small>Time · Room</small><b>${t12(c.time)} · ${esc(c.room)}</b></div></div><p style="margin-top:14px">${rq?'Reschedule requested for '+fmtDate(rq.date)+' at '+t12(rq.time)+'.':'Bring your instrument and notebook.'}</p>`,
    actions:[{label:'Add to calendar',kind:'ghost',onClick:()=>{DX.ics(c.title+' – '+cname(c.course),when,c.mins,'MelodyNest class with '+cinst(c.course));DX.toast('Calendar file downloaded');return false}},{label:'Request reschedule',kind:'primary',onClick:()=>{setTimeout(()=>A.resched(null,null,cid,date),10)}}]});
}
const A={
 enrol(el){const id=el&&el.dataset.id;
   const mk=k=>{const m=DX.modal({title:'Enrol in '+CATALOG[k].name,body:`<p>Send an enrolment request for <b>${esc(CATALOG[k].name)}</b> with ${esc(CATALOG[k].inst)}. The academy will confirm your batch within one working day.</p>`,actions:[{label:'Cancel'},{label:'Send request',kind:'primary',onClick:()=>{D.courses.push({id:k,level:'Beginner',status:'pending',done:[],skills:Object.fromEntries(Object.keys(CATALOG[k].skills).map(x=>[x,0]))});save();DX.toast('Request sent for '+CATALOG[k].name);DX.notify({icon:'✓',title:'Enrolment requested',text:CATALOG[k].name,when:'Just now',go:'courses'});DX.go('courses');DX.refresh()}}]})};
   if(id)return mk(id);
   const more=Object.keys(CATALOG).filter(k=>!D.courses.some(c=>c.id===k));
   if(!more.length)return DX.toast('You are enrolled in every course!','info');
   DX.modal({title:'Choose a course',body:`<div class="dx-list">${more.map(k=>`<button class="dx-li" data-pick="${k}"><div class="ic">${esc(CATALOG[k].name[0])}</div><div><b>${esc(CATALOG[k].name)}</b><small>With ${esc(CATALOG[k].inst)}</small></div></button>`).join('')}</div>`,actions:[{label:'Close'}]}).el.addEventListener('click',e=>{const b=e.target.closest('[data-pick]');if(b){b.closest('.dx-modal-wrap').querySelector('.dx-x').click();mk(b.dataset.pick)}});},
 course(el){const c=D.courses.find(x=>x.id===el.dataset.id);if(!c)return;const L=lessonsOf(c.id);
   const m=DX.modal({title:cname(c.id),wide:true,onClose:()=>DX.refresh(),body:`<div style="display:flex;gap:12px;align-items:center"><div style="flex:1" id="lp">${bar(pct(c))}</div><b id="lpt">${pct(c)}%</b></div><p style="margin-top:6px">Tick lessons as you complete them.</p><div class="dx-lessons">${L.map((t,i)=>`<label><input type="checkbox" data-l="${i}" ${c.done.includes(i)?'checked':''}> ${i+1}. ${esc(t)}</label>`).join('')}</div>`,actions:[{label:'Done',kind:'primary'}]});
   m.el.addEventListener('change',e=>{const i=+e.target.dataset.l;c.done=e.target.checked?[...new Set([...c.done,i])]:c.done.filter(x=>x!==i);save();$('#lp',m.el).innerHTML=bar(pct(c));$('#lpt',m.el).textContent=pct(c)+'%'})},
 materials(el){const id=el.dataset.id;DX.download(cname(id).replace(/\s+/g,'-').toLowerCase()+'-materials.txt',`${cname(id)} — Practice guide\nTeacher: ${cinst(id)}\n\nLessons:\n${lessonsOf(id).map((t,i)=>(i+1)+'. '+t).join('\n')}\n\nTip: practise 15 minutes, 3 times a week.\n`);DX.toast('Practice guide downloaded')},
 msg(el){const id=el.dataset.id;DX.modal({title:'Message '+cinst(id),body:`<div class="dx-f"><label for="mt">Your message</label><textarea id="mt" placeholder="Ask a question about ${esc(cname(id))}…"></textarea></div>`,actions:[{label:'Cancel'},{label:'Send',kind:'primary',onClick:m=>{const v=$('#mt',m.el).value.trim();if(!v){DX.toast('Please write a message first','err');return false}DX.toast('Message sent to '+cinst(id))}}]})},
 ctab(el){ui.ctab=el.dataset.k;DX.refresh()},sview(el){ui.sview=el.dataset.k;DX.refresh()},pfilter(el){ui.pfilter=el.dataset.k;DX.refresh()},
 wk(el){const d=+el.dataset.d;ui.week=d===0?0:ui.week+d;DX.refresh()},
 class(el){openClass(el.dataset.cid,el.dataset.date)},
 ics(el){const c=D.classes.find(x=>x.id===el.dataset.cid),d=new Date(el.dataset.date+'T00:00:00');DX.ics(c.title,at(d,c.time),c.mins,'MelodyNest class');DX.toast('Calendar file downloaded')},
 resched(el,e,cid,date){cid=cid||el.dataset.cid;date=date||el.dataset.date;const c=D.classes.find(x=>x.id===cid);const min=dkey(new Date());
   DX.modal({title:'Request reschedule',body:`<p style="margin-bottom:14px">${esc(c.title)} · ${fmtDate(date)} at ${t12(c.time)}</p><form><div class="dx-fg"><div class="dx-f"><label for="rd">New date</label><input id="rd" type="date" min="${min}" required></div><div class="dx-f"><label for="rt">Preferred time</label><select id="rt">${['10:00','12:00','15:00','16:00','17:00','18:00'].map(t=>`<option value="${t}">${t12(t)}</option>`).join('')}</select></div><div class="dx-f full"><label for="rr">Reason (optional)</label><textarea id="rr" placeholder="e.g. School exam"></textarea></div></div></form>`,
   actions:[{label:'Cancel'},{label:'Send request',kind:'primary',onClick:m=>{const nd=$('#rd',m.el).value;if(!nd){DX.toast('Please choose a new date','err');return false}
     D.requests.push({id:DX.uid('rq'),cid,orig:date,date:nd,time:$('#rt',m.el).value,reason:$('#rr',m.el).value.trim(),title:c.title,status:'Requested'});save();DX.toast('Reschedule request sent');DX.notify({icon:'↻',title:'Reschedule requested',text:c.title,when:'Just now',go:'schedule'});DX.refresh()}}]})},
 cancelReq(el){const r=D.requests.find(x=>x.id===el.dataset.id);if(r){r.status='Cancelled';save();DX.toast('Request cancelled','info');DX.refresh()}},
 practice(el){const k=wk(new Date()),i=+el.dataset.i;D.practice[k]=D.practice[k]||Array(7).fill(false);D.practice[k][i]=!D.practice[k][i];save();DX.refresh()},
 remind(el){D.reminders[+el.dataset.i]=el.checked;save()},
 pay(el){const inv=D.invoices.find(i=>i.id===el.dataset.id);
   DX.modal({title:'Pay '+money(inv.amt),body:`<p style="margin-bottom:14px">${esc(inv.id)} · ${esc(inv.desc)}</p><form><div class="dx-f"><label for="pm">Payment method</label><select id="pm"><option value="UPI">UPI</option><option value="Card">Credit / debit card</option><option value="Net banking">Net banking</option></select></div><p style="margin-top:14px;font-size:.84rem">Demo payment — no real money is charged.</p></form>`,
   actions:[{label:'Cancel'},{label:'Pay '+money(inv.amt),kind:'primary',onClick:m=>{inv.status='paid';inv.paidOn=dkey(new Date());inv.method=$('#pm',m.el).value;save();DX.toast('Payment successful · '+inv.id);DX.notify({icon:'₹',title:'Payment received',text:inv.id+' · '+money(inv.amt),when:'Just now',go:'payments'});DX.refresh()}}]})},
 receipt(el){const i=D.invoices.find(x=>x.id===el.dataset.id);DX.download('receipt-'+i.id+'.txt',`MELODYNEST MUSIC ACADEMY — RECEIPT\n\nInvoice: ${i.id}\nStudent: ${S.name}\nDescription: ${i.desc}\nAmount: ${money(i.amt)}\nPaid on: ${fmtDate(i.paidOn||i.due)}\nMethod: ${i.method||'UPI'}\n\nThank you!\n`);DX.toast('Receipt downloaded')},
 saveProfile(f){const d=Object.fromEntries(new FormData(f));if(!d.name.trim())return DX.toast('Name is required','err');
   D.profile={...D.profile,phone:d.phone,guardian:d.guardian,address:d.address,emergency:d.emergency};S.name=d.name.trim();save();MNAuth.updateProfile(S.email,{name:S.name,phone:d.phone});drawUser();DX.toast('Profile saved');DX.refresh()},
 pref(el){D.profile.pref[el.dataset.k]=el.checked;save();DX.toast('Preference saved','info')},
 changePw(f){const d=Object.fromEntries(new FormData(f));if(d.nw!==d.cf)return DX.toast('New passwords do not match','err');const r=MNAuth.changePassword(S.email,d.old,d.nw);if(!r.ok)return DX.toast(r.error,'err');f.reset();DX.toast('Password updated')},
 export(){DX.download('my-melodynest-data.json',JSON.stringify({account:{name:S.name,email:S.email},...D},null,2),'application/json');DX.toast('Data downloaded')}
};
function drawUser(){$$('[data-u-name]').forEach(e=>e.textContent=S.name);$$('[data-u-first]').forEach(e=>e.textContent=first());$$('[data-u-ini]').forEach(e=>e.textContent=DX.initials(S.name))}
drawUser();
DX.init({role:'student',user:S,start:'overview',views:V,actions:A,
 notifs:[{icon:'♪',title:'Class tomorrow',text:'Guitar · 5:00 PM',when:'Today',go:'schedule'},{icon:'₹',title:'December fee due soon',text:'₹2,499 due 1 Dec',when:'2 days ago',go:'payments'},{icon:'★',title:'New teacher feedback',text:'Arun Kumar left a note',when:'3 days ago',go:'progress'}],
 searchIndex:()=>[...[['overview','Overview','Your week at a glance'],['courses','My courses','Lessons and materials'],['schedule','Class schedule','Calendar and reschedule'],['progress','My progress','Skills, attendance, feedback'],['payments','Fee payments','Invoices and receipts'],['profile','My profile','Details, password, notifications']].map(([go,label,hint])=>({go,label,hint})),
  ...D.courses.map(c=>({go:'courses',label:cname(c.id),hint:'Course · '+cinst(c.id)})),...D.invoices.map(i=>({go:'payments',label:i.id,hint:i.desc})),...D.classes.map(c=>({go:'schedule',label:c.title,hint:'Class · '+DAYFULL[c.day]}))]});
})();
