/* Admin dashboard (demo data persisted in localStorage). */
(function(){
const {$,$$,esc,store,money,badge,bar,fmtDate,uid}=DX;
const S=MNAuth.session();if(!S)return;
const KEY='mn-ad';
const pad=n=>String(n).padStart(2,'0');
const dkey=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const t12=t=>{const [h,m]=t.split(':').map(Number);return (h%12||12)+':'+pad(m)+' '+(h>=12?'PM':'AM')};
const COL={guitar:'#b59b5d',keys:'#111111',vocals:'#d4c08a',drums:'#8a8a8a'};
const mk=(id,name,course,batch,status,joined,fee)=>({id,name,email:name.toLowerCase().replace(/[^a-z]+/g,'.').replace(/\.$/,'')+'@example.com',phone:'+91 98'+Math.floor(10000000+Math.random()*89999999),course,batch,status,joined,fee});
function seed(){
  const now=new Date(),m=(n)=>dkey(new Date(now.getFullYear(),now.getMonth(),n));
  const students=[mk('s1','Aadhya R','guitar','b1','Active','2026-06-12','Paid'),mk('s2','Vihaan S','keys','b2','Active','2026-08-03','Pending'),mk('s3','Diya M','vocals','b3','Active','2026-07-21','Paid'),mk('s4','Arjun K','drums','b4','Active','2026-09-09','Paid'),mk('s5','Ishita P','guitar','b5','Active','2026-10-02','Paid'),mk('s6','Kabir N','keys','b6','Trial',m(3),'Pending'),mk('s7','Meera T','vocals','b7','Active','2026-05-17','Paid'),mk('s8','Rohan V','guitar','b1','Active','2026-04-11','Overdue'),mk('s9','Anaya B','keys','b2','Active','2026-10-19','Paid'),mk('s10','Advik L','drums','b8','Trial',m(11),'Pending'),mk('s11','Saanvi G','vocals','b3','Inactive','2026-03-05','Paid'),mk('s12','Vivaan D','guitar','b5','Active',m(6),'Paid')];
  const price={guitar:2499,keys:2499,vocals:2799,drums:2999};
  const payments=students.map((s,i)=>({id:'PAY-'+(5001+i),student:s.name,course:s.course,amount:price[s.course],date:m(1+i%9),status:s.fee,method:['UPI','Card','Cash','Net banking'][i%4]}));
  return{students,payments,
   instructors:[{id:'i1',name:'Arun Kumar',course:'Guitar',email:'arun@melodynest.example',phone:'+91 90000 11111',status:'Available'},{id:'i2',name:'Daniel Joseph',course:'Keyboard',email:'daniel@melodynest.example',phone:'+91 90000 22222',status:'Available'},{id:'i3',name:'Meera Nair',course:'Vocals',email:'meera@melodynest.example',phone:'+91 90000 33333',status:'Available'},{id:'i4',name:'Rohan Das',course:'Drums',email:'rohan@melodynest.example',phone:'+91 90000 44444',status:'On leave'},{id:'i5',name:'Sneha Iyer',course:'Music theory',email:'sneha@melodynest.example',phone:'+91 90000 55555',status:'Available'}],
   courses:[{id:'guitar',name:'Guitar',level:'All levels',price:2499,cap:10,active:true},{id:'keys',name:'Keyboard',level:'All levels',price:2499,cap:10,active:true},{id:'vocals',name:'Vocals',level:'All levels',price:2799,cap:8,active:true},{id:'drums',name:'Drums',level:'Beginner–Intermediate',price:2999,cap:6,active:true}],
   batches:[{id:'b1',course:'guitar',day:2,time:'17:00',inst:'Arun Kumar',cap:10},{id:'b2',course:'keys',day:4,time:'16:00',inst:'Daniel Joseph',cap:10},{id:'b3',course:'vocals',day:5,time:'10:00',inst:'Meera Nair',cap:8},{id:'b4',course:'drums',day:5,time:'12:00',inst:'Rohan Das',cap:6},{id:'b5',course:'guitar',day:0,time:'18:00',inst:'Arun Kumar',cap:10},{id:'b6',course:'keys',day:1,time:'17:00',inst:'Daniel Joseph',cap:10},{id:'b7',course:'vocals',day:3,time:'17:30',inst:'Meera Nair',cap:8},{id:'b8',course:'drums',day:6,time:'11:00',inst:'Rohan Das',cap:6}],
   messages:[{id:'m1',from:'Priya Raman',email:'priya@example.com',subject:'Trial class for my son (age 8)',read:false,msgs:[{me:false,text:'Hello! My son is 8 and loves rhythm. Do you have a beginner drum batch on weekends?',when:'Today, 9:12 AM'}]},
    {id:'m2',from:'Karthik S',email:'karthik@example.com',subject:'Adult guitar batch timings',read:false,msgs:[{me:false,text:'Are there evening guitar batches for adults on weekdays?',when:'Yesterday'}]},
    {id:'m3',from:'Lakshmi V',email:'lakshmi@example.com',subject:'Fee receipt request',read:true,msgs:[{me:false,text:'Could you share the receipt for November?',when:'2 days ago'},{me:true,text:'Of course — we have emailed it to you.',when:'2 days ago'}]},
    {id:'m4',from:'Nikhil A',email:'nikhil@example.com',subject:'Showcase registration',read:true,msgs:[{me:false,text:'How do I register my daughter for the Winter Showcase?',when:'3 days ago'}]}],
   settings:{academy:'MelodyNest Music Academy',email:'hello@melodynest.example',phone:'+91 98765 43210',address:'123 Music Street, Your City, India',hours:'Mon – Sat · 10:00 – 19:00',pref:{enq:true,pay:true,weekly:false}},
   revenue:[118,132,127,149,163]};
}
let D=store.get(KEY,null)||seed();const save=()=>store.set(KEY,D);
const ui={s:{q:'',course:'',status:'',sort:'name',dir:1,page:1},pf:'all',msg:'m1'};
const cn=id=>(D.courses.find(c=>c.id===id)||{name:id}).name;
const filled=bid=>D.students.filter(s=>s.batch===bid&&s.status!=='Inactive').length;
const monthPaid=()=>{const n=new Date();return D.payments.filter(p=>p.status==='Paid'&&new Date(p.date).getMonth()===n.getMonth()).reduce((a,p)=>a+p.amount,0)};
const unread=()=>D.messages.filter(m=>!m.read).length;
const sBadge=s=>badge(s,s==='Active'||s==='Available'||s==='Paid'?'ok':s==='Trial'||s==='Pending'?'warn':s==='Inactive'||s==='On leave'?'':'bad');
const ic=p=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const I={users:ic('<circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-7 7-7s7 3 7 7M17 4a4 4 0 010 8M22 21c0-3-2-5-4-6"/>'),mic:ic('<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/>'),cal:ic('<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>'),rupee:ic('<path d="M6 4h12M6 9h12M6 4c8 0 8 10 0 10l8 6"/>')};

const V={};
V.overview={title:'Overview',render(){
  const n=new Date(),newThis=D.students.filter(s=>new Date(s.joined).getMonth()===n.getMonth()&&new Date(s.joined).getFullYear()===n.getFullYear()).length;
  const rev=[...D.revenue,Math.round(monthPaid()/1000)],labels=['Jun','Jul','Aug','Sep','Oct','Nov'],mx=Math.max(...rev,1);
  const byC=D.courses.map(c=>({c,n:D.students.filter(s=>s.course===c.id).length})),tot=byC.reduce((a,x)=>a+x.n,0)||1;
  let acc=0;const grad=byC.map(x=>{const a=acc;acc+=x.n/tot*100;return `${COL[x.c.id]||'#999'} ${a}% ${acc}%`}).join(',');
  const pend=D.payments.filter(p=>p.status!=='Paid').length,today=(n.getDay()+6)%7;
  return `<div class="dx-head"><div><span class="dx-eye">ACADEMY CONTROL ROOM</span><h1>Good ${n.getHours()<12?'morning':n.getHours()<17?'afternoon':'evening'}, ${esc(S.name)}.</h1><p>A quick look at how your academy is doing.</p></div><div class="dx-row"><button class="dx-btn ghost" data-action="addBatch">+ Add batch</button><button class="dx-btn primary" data-action="addStudent">+ Add student</button></div></div>
  <div class="dx-grid g4">
   <button class="dx-stat" data-go="students"><span class="ic">${I.users}</span><small>Total students</small><strong>${D.students.length}</strong><em>+${newThis} this month</em></button>
   <button class="dx-stat" data-go="instructors"><span class="ic">${I.mic}</span><small>Instructors</small><strong>${D.instructors.length}</strong><em>Across ${D.courses.length} courses</em></button>
   <button class="dx-stat" data-go="batches"><span class="ic">${I.cal}</span><small>Active batches</small><strong>${D.batches.length}</strong><em>Running this week</em></button>
   <button class="dx-stat" data-go="payments"><span class="ic">${I.rupee}</span><small>Revenue this month</small><strong>${money(monthPaid())}</strong><em>${pend} payments need follow-up</em></button>
  </div>
  <div class="dx-grid g21 dx-sp"><div class="dx-card"><header><h3>Monthly revenue (₹ thousands)</h3><span class="dx-badge">Last 6 months</span></header><div class="dx-chart">${rev.map((v,i)=>`<div class="dx-col"><span style="height:${v/mx*100}%" data-v="${v}K"></span><small>${labels[i]}</small></div>`).join('')}</div></div>
   <div class="dx-card"><header><h3>Students by course</h3></header><div class="dx-donut" style="background:conic-gradient(${grad})"><b>${D.students.length}</b></div><div class="dx-legend dx-sp">${byC.map(x=>`<div><i style="background:${COL[x.c.id]||'#999'}"></i>${esc(x.c.name)}<span>${x.n}</span></div>`).join('')}</div></div></div>
  <div class="dx-grid g21 dx-sp"><div class="dx-card"><header><h3>Recent enrolments</h3><button class="dx-link" data-go="students">View all →</button></header><div class="dx-tw" style="border:0"><table class="dx-table"><thead><tr><th>Student</th><th>Course</th><th>Batch</th><th>Payment</th><th>Status</th></tr></thead><tbody>${[...D.students].sort((a,b)=>b.joined.localeCompare(a.joined)).slice(0,5).map(s=>{const b=D.batches.find(x=>x.id===s.batch);return `<tr style="cursor:pointer" data-action="viewStudent" data-id="${s.id}"><td><div class="dx-who"><span class="dx-av">${DX.initials(s.name)}</span><b>${esc(s.name)}</b></div></td><td>${esc(cn(s.course))}</td><td>${b?DAYS[b.day]+' · '+t12(b.time):'—'}</td><td>${sBadge(s.fee)}</td><td>${sBadge(s.status)}</td></tr>`}).join('')}</tbody></table></div></div>
   <div class="dx-grid"><div class="dx-card"><header><h3>Today’s classes</h3></header><div class="dx-list">${D.batches.filter(b=>b.day===today).map(b=>`<div class="dx-li"><div class="ic">♪</div><div><b>${esc(cn(b.course))} · ${t12(b.time)}</b><small>${esc(b.inst)} · ${filled(b.id)}/${b.cap} students</small></div></div>`).join('')||'<div class="dx-empty">No classes scheduled today.</div>'}</div></div>
    <div class="dx-card"><header><h3>Needs attention</h3></header><div class="dx-list"><button class="dx-li" data-go="messages"><div class="ic">✉</div><div><b>${unread()} new enquiries</b><small>Follow up with families</small></div></button><button class="dx-li" data-go="payments"><div class="ic">₹</div><div><b>${pend} pending / overdue fees</b><small>Send reminders</small></div></button></div></div></div></div>
  <p class="dx-note">Demo analytics saved in this browser. Real management requires secure admin authentication and backend APIs.</p>`;
}};

/* ---- Students ---- */
function stuRows(){
  const f=ui.s,q=f.q.toLowerCase();
  let r=D.students.filter(s=>(!q||(s.name+s.email+cn(s.course)).toLowerCase().includes(q))&&(!f.course||s.course===f.course)&&(!f.status||s.status===f.status));
  r.sort((a,b)=>{const x=f.sort==='course'?cn(a.course):a[f.sort],y=f.sort==='course'?cn(b.course):b[f.sort];return String(x).localeCompare(String(y))*f.dir});
  return r;
}
function drawStudents(){
  const el=$('#stuTable');if(!el)return;const f=ui.s,all=stuRows(),per=6,pages=Math.max(1,Math.ceil(all.length/per));f.page=Math.min(f.page,pages);
  const rows=all.slice((f.page-1)*per,f.page*per),th=(k,l)=>`<th class="s" data-action="ssort" data-k="${k}">${l}${f.sort===k?(f.dir>0?' ▲':' ▼'):''}</th>`;
  el.innerHTML=`<div class="dx-tw"><table class="dx-table"><thead><tr>${th('name','Student')}${th('course','Course')}<th>Batch</th>${th('joined','Joined')}<th>Payment</th><th>Status</th><th></th></tr></thead><tbody>${rows.map(s=>{const b=D.batches.find(x=>x.id===s.batch);return `<tr><td><div class="dx-who"><span class="dx-av">${DX.initials(s.name)}</span><div><b>${esc(s.name)}</b><small>${esc(s.email)}</small></div></div></td><td>${esc(cn(s.course))}</td><td>${b?DAYS[b.day]+' · '+t12(b.time):'—'}</td><td>${fmtDate(s.joined)}</td><td>${sBadge(s.fee)}</td><td>${sBadge(s.status)}</td><td><div class="acts"><button class="dx-ibtn" title="View" aria-label="View ${esc(s.name)}" data-action="viewStudent" data-id="${s.id}">👁</button><button class="dx-ibtn" title="Edit" aria-label="Edit ${esc(s.name)}" data-action="editStudent" data-id="${s.id}">✎</button><button class="dx-ibtn del" title="Delete" aria-label="Delete ${esc(s.name)}" data-action="delStudent" data-id="${s.id}">🗑</button></div></td></tr>`}).join('')||'<tr><td colspan="7" class="dx-empty">No students match your filters.</td></tr>'}</tbody></table></div>
  <div class="dx-pg"><span>Showing ${all.length?(f.page-1)*per+1:0}–${Math.min(f.page*per,all.length)} of ${all.length}</span><div class="dx-row"><button class="dx-btn ghost sm" data-action="spage" data-d="-1" ${f.page<=1?'disabled':''}>‹ Prev</button><span>Page ${f.page} / ${pages}</span><button class="dx-btn ghost sm" data-action="spage" data-d="1" ${f.page>=pages?'disabled':''}>Next ›</button></div></div>`;
}
V.students={title:'Students',mount(){drawStudents()},render(){const f=ui.s;
  return `<div class="dx-head"><div><span class="dx-eye">PEOPLE</span><h1>Students</h1><p>Search, filter, edit and export student records.</p></div><div class="dx-row"><button class="dx-btn ghost" data-action="exportStudents">Export CSV</button><button class="dx-btn primary" data-action="addStudent">+ Add student</button></div></div>
  <div class="dx-filters"><input type="search" placeholder="Search name, email or course…" value="${esc(f.q)}" data-input="sq" aria-label="Search students"><select data-change="scourse" aria-label="Course"><option value="">All courses</option>${D.courses.map(c=>`<option value="${c.id}" ${f.course===c.id?'selected':''}>${esc(c.name)}</option>`).join('')}</select><select data-change="sstatus" aria-label="Status"><option value="">All statuses</option>${['Active','Trial','Inactive'].map(s=>`<option ${f.status===s?'selected':''}>${s}</option>`).join('')}</select></div><div id="stuTable"></div>`}};

function studentForm(st){
  const e=!!st,v=st||{name:'',email:'',phone:'',course:D.courses[0].id,batch:'',status:'Active',fee:'Pending'};
  const opts=c=>D.batches.filter(b=>b.course===c).map(b=>`<option value="${b.id}" ${v.batch===b.id?'selected':''}>${DAYS[b.day]} · ${t12(b.time)} (${filled(b.id)}/${b.cap})</option>`).join('')||'<option value="">No batch</option>';
  const m=DX.modal({title:e?'Edit student':'Add student',wide:true,body:`<form><div class="dx-fg"><div class="dx-f"><label for="sf-n">Full name</label><input id="sf-n" value="${esc(v.name)}" required></div><div class="dx-f"><label for="sf-e">Email</label><input id="sf-e" type="email" value="${esc(v.email)}" required></div><div class="dx-f"><label for="sf-p">Phone</label><input id="sf-p" value="${esc(v.phone)}"></div><div class="dx-f"><label for="sf-c">Course</label><select id="sf-c">${D.courses.map(c=>`<option value="${c.id}" ${v.course===c.id?'selected':''}>${esc(c.name)}</option>`).join('')}</select></div><div class="dx-f"><label for="sf-b">Batch</label><select id="sf-b">${opts(v.course)}</select></div><div class="dx-f"><label for="sf-s">Status</label><select id="sf-s">${['Active','Trial','Inactive'].map(s=>`<option ${v.status===s?'selected':''}>${s}</option>`).join('')}</select></div></div></form>`,
   actions:[{label:'Cancel'},{label:e?'Save changes':'Add student',kind:'primary',onClick:m=>{const g=i=>$(i,m.el).value.trim(),name=g('#sf-n'),email=g('#sf-e').toLowerCase();
     if(!name||!/^\S+@\S+\.\S+$/.test(email)){DX.toast('Enter a valid name and email','err');return false}
     if(D.students.some(s=>s.email===email&&(!e||s.id!==st.id))){DX.toast('A student with this email already exists','err');return false}
     const bid=g('#sf-b'),b=D.batches.find(x=>x.id===bid);if(b&&(!e||st.batch!==bid)&&filled(bid)>=b.cap){DX.toast('That batch is full','err');return false}
     const d={name,email,phone:g('#sf-p'),course:g('#sf-c'),batch:bid,status:g('#sf-s')};
     if(e)Object.assign(st,d);else D.students.unshift({id:uid('s'),...d,joined:dkey(new Date()),fee:'Pending'});
     save();DX.toast(e?'Student updated':'Student added');DX.refresh()}}]});
  $('#sf-c',m.el).addEventListener('change',ev=>{$('#sf-b',m.el).innerHTML=opts(ev.target.value)});
}

/* ---- Instructors ---- */
V.instructors={title:'Instructors',render(){
  return `<div class="dx-head"><div><span class="dx-eye">TEAM</span><h1>Instructors</h1><p>Manage your teaching team and availability.</p></div><button class="dx-btn primary" data-action="addInst">+ Add instructor</button></div>
  <div class="dx-grid g3">${D.instructors.map(i=>`<article class="dx-card"><div class="dx-who" style="margin-bottom:14px"><span class="dx-av" style="width:56px;height:56px;font-size:1rem">${DX.initials(i.name)}</span><div><h3>${esc(i.name)}</h3><small>${esc(i.course)}</small></div></div>
   <p style="font-size:.88rem">${esc(i.email)}<br>${esc(i.phone)}</p><p style="margin:10px 0 14px;font-size:.86rem">${D.batches.filter(b=>b.inst===i.name).length} batches · ${D.batches.filter(b=>b.inst===i.name).reduce((a,b)=>a+filled(b.id),0)} students</p>
   <div class="dx-row" style="justify-content:space-between"><button class="dx-btn ghost sm" data-action="toggleInst" data-id="${i.id}" aria-label="Toggle availability">${sBadge(i.status)}</button><div class="dx-row"><button class="dx-ibtn" title="Message" aria-label="Message ${esc(i.name)}" data-action="msgInst" data-id="${i.id}">✉</button><button class="dx-ibtn" title="Edit" aria-label="Edit ${esc(i.name)}" data-action="editInst" data-id="${i.id}">✎</button><button class="dx-ibtn del" title="Remove" aria-label="Remove ${esc(i.name)}" data-action="delInst" data-id="${i.id}">🗑</button></div></div></article>`).join('')}</div>`}};
function instForm(i){
  const e=!!i,v=i||{name:'',course:'',email:'',phone:'',status:'Available'};
  DX.modal({title:e?'Edit instructor':'Add instructor',body:`<form><div class="dx-fg"><div class="dx-f"><label for="if-n">Name</label><input id="if-n" value="${esc(v.name)}" required></div><div class="dx-f"><label for="if-c">Subject</label><input id="if-c" value="${esc(v.course)}" placeholder="e.g. Guitar" required></div><div class="dx-f"><label for="if-e">Email</label><input id="if-e" type="email" value="${esc(v.email)}" required></div><div class="dx-f"><label for="if-p">Phone</label><input id="if-p" value="${esc(v.phone)}"></div></div></form>`,
  actions:[{label:'Cancel'},{label:e?'Save':'Add instructor',kind:'primary',onClick:m=>{const g=s=>$(s,m.el).value.trim(),d={name:g('#if-n'),course:g('#if-c'),email:g('#if-e'),phone:g('#if-p')};
    if(!d.name||!d.course||!/^\S+@\S+\.\S+$/.test(d.email)){DX.toast('Please complete name, subject and a valid email','err');return false}
    if(e){const old=i.name;Object.assign(i,d);D.batches.forEach(b=>{if(b.inst===old)b.inst=d.name})}else D.instructors.push({id:uid('i'),status:'Available',...d});
    save();DX.toast(e?'Instructor updated':'Instructor added');DX.refresh()}}]});
}

/* ---- Courses ---- */
V.courses={title:'Courses',render(){
  return `<div class="dx-head"><div><span class="dx-eye">CATALOGUE</span><h1>Courses</h1><p>Pricing, capacity and availability.</p></div><button class="dx-btn primary" data-action="addCourse">+ Add course</button></div>
  <div class="dx-tw"><table class="dx-table"><thead><tr><th>Course</th><th>Level</th><th>Fee / month</th><th>Batches</th><th>Students</th><th>Active</th><th></th></tr></thead><tbody>${D.courses.map(c=>`<tr><td><b>${esc(c.name)}</b></td><td>${esc(c.level)}</td><td>${money(c.price)}</td><td>${D.batches.filter(b=>b.course===c.id).length}</td><td>${D.students.filter(s=>s.course===c.id).length}</td><td><label class="dx-sw"><input type="checkbox" data-change="courseActive" data-id="${c.id}" ${c.active?'checked':''} aria-label="${esc(c.name)} active"><i></i></label></td><td><div class="acts"><button class="dx-ibtn" aria-label="Edit ${esc(c.name)}" data-action="editCourse" data-id="${c.id}">✎</button><button class="dx-ibtn del" aria-label="Delete ${esc(c.name)}" data-action="delCourse" data-id="${c.id}">🗑</button></div></td></tr>`).join('')}</tbody></table></div>`}};
function courseForm(c){
  const e=!!c,v=c||{name:'',level:'All levels',price:2499,cap:10};
  DX.modal({title:e?'Edit course':'Add course',body:`<form><div class="dx-fg"><div class="dx-f"><label for="cf-n">Course name</label><input id="cf-n" value="${esc(v.name)}" required></div><div class="dx-f"><label for="cf-l">Level</label><input id="cf-l" value="${esc(v.level)}"></div><div class="dx-f"><label for="cf-p">Fee / month (₹)</label><input id="cf-p" type="number" min="0" value="${v.price}" required></div><div class="dx-f"><label for="cf-c">Default capacity</label><input id="cf-c" type="number" min="1" value="${v.cap}" required></div></div></form>`,
  actions:[{label:'Cancel'},{label:e?'Save':'Add course',kind:'primary',onClick:m=>{const g=s=>$(s,m.el).value.trim(),d={name:g('#cf-n'),level:g('#cf-l')||'All levels',price:+g('#cf-p'),cap:+g('#cf-c')};
    if(!d.name||!(d.price>=0)||!(d.cap>=1)){DX.toast('Check the course details','err');return false}
    if(e)Object.assign(c,d);else D.courses.push({id:d.name.toLowerCase().replace(/\W+/g,'')+Math.floor(Math.random()*99),active:true,...d});save();DX.toast(e?'Course updated':'Course added');DX.refresh()}}]});
}

/* ---- Batches ---- */
V.batches={title:'Batches & schedules',render(){
  return `<div class="dx-head"><div><span class="dx-eye">TIMETABLE</span><h1>Batches &amp; schedules</h1><p>Plan timings, instructors and seat capacity.</p></div><button class="dx-btn primary" data-action="addBatch">+ Add batch</button></div>
  <div class="dx-tw"><table class="dx-table"><thead><tr><th>Course</th><th>Day &amp; time</th><th>Instructor</th><th>Seats</th><th></th></tr></thead><tbody>${[...D.batches].sort((a,b)=>a.day-b.day||a.time.localeCompare(b.time)).map(b=>{const f=filled(b.id),p=f/b.cap*100;return `<tr><td><b>${esc(cn(b.course))}</b></td><td>${DAYS[b.day]} · ${t12(b.time)}</td><td>${esc(b.inst)}</td><td style="min-width:170px"><div style="display:flex;gap:10px;align-items:center">${bar(p,p>=100?'bad':'')}<b>${f}/${b.cap}</b></div></td><td><div class="acts"><button class="dx-ibtn" aria-label="Edit batch" data-action="editBatch" data-id="${b.id}">✎</button><button class="dx-ibtn del" aria-label="Delete batch" data-action="delBatch" data-id="${b.id}">🗑</button></div></td></tr>`}).join('')}</tbody></table></div>`}};
function batchForm(b){
  const e=!!b,v=b||{course:D.courses[0].id,day:0,time:'17:00',inst:D.instructors[0].name,cap:10};
  DX.modal({title:e?'Edit batch':'Add batch',body:`<form><div class="dx-fg"><div class="dx-f"><label for="bf-c">Course</label><select id="bf-c">${D.courses.map(c=>`<option value="${c.id}" ${v.course===c.id?'selected':''}>${esc(c.name)}</option>`).join('')}</select></div><div class="dx-f"><label for="bf-i">Instructor</label><select id="bf-i">${D.instructors.map(i=>`<option ${v.inst===i.name?'selected':''}>${esc(i.name)}</option>`).join('')}</select></div><div class="dx-f"><label for="bf-d">Day</label><select id="bf-d">${DAYS.map((d,i)=>`<option value="${i}" ${v.day===i?'selected':''}>${d}</option>`).join('')}</select></div><div class="dx-f"><label for="bf-t">Time</label><input id="bf-t" type="time" value="${v.time}" required></div><div class="dx-f"><label for="bf-k">Capacity</label><input id="bf-k" type="number" min="1" value="${v.cap}" required></div></div></form>`,
  actions:[{label:'Cancel'},{label:e?'Save':'Add batch',kind:'primary',onClick:m=>{const g=s=>$(s,m.el).value,d={course:g('#bf-c'),inst:g('#bf-i'),day:+g('#bf-d'),time:g('#bf-t'),cap:+g('#bf-k')};
    if(!d.time||!(d.cap>=1)){DX.toast('Please complete the batch details','err');return false}
    if(e&&d.cap<filled(b.id)){DX.toast('Capacity cannot be below current students ('+filled(b.id)+')','err');return false}
    if(e)Object.assign(b,d);else D.batches.push({id:uid('b'),...d});save();DX.toast(e?'Batch updated':'Batch added');DX.refresh()}}]});
}

/* ---- Payments ---- */
V.payments={title:'Payments',render(){
  const sum=s=>D.payments.filter(p=>p.status===s).reduce((a,p)=>a+p.amount,0);
  const rows=D.payments.filter(p=>ui.pf==='all'||p.status===ui.pf);
  return `<div class="dx-head"><div><span class="dx-eye">FINANCE</span><h1>Payments</h1><p>Track collections and follow up on dues.</p></div><div class="dx-row"><button class="dx-btn ghost" data-action="exportPay">Export CSV</button><button class="dx-btn primary" data-action="addPay">+ Record payment</button></div></div>
  <div class="dx-grid g3"><div class="dx-card"><small class="dx-muted">Collected</small><h2 style="font-size:2rem;margin-top:6px">${money(sum('Paid'))}</h2></div><div class="dx-card"><small class="dx-muted">Pending</small><h2 style="font-size:2rem;margin-top:6px">${money(sum('Pending'))}</h2></div><div class="dx-card"><small class="dx-muted">Overdue</small><h2 style="font-size:2rem;margin-top:6px">${money(sum('Overdue'))}</h2></div></div>
  <div class="dx-row dx-sp" style="margin-bottom:14px"><div class="dx-tabs">${['all','Paid','Pending','Overdue'].map(k=>`<button class="${ui.pf===k?'on':''}" data-action="pf" data-k="${k}">${k==='all'?'All':k}</button>`).join('')}</div></div>
  <div class="dx-tw"><table class="dx-table"><thead><tr><th>ID</th><th>Student</th><th>Course</th><th>Date</th><th>Amount</th><th>Status</th><th></th></tr></thead><tbody>${rows.map(p=>`<tr><td><b>${p.id}</b></td><td>${esc(p.student)}</td><td>${esc(cn(p.course))}</td><td>${fmtDate(p.date)}</td><td>${money(p.amount)}</td><td>${sBadge(p.status)}</td><td><div class="acts">${p.status==='Paid'?`<button class="dx-btn ghost sm" data-action="payReceipt" data-id="${p.id}">Receipt</button>`:`<button class="dx-btn ghost sm" data-action="remind" data-id="${p.id}">Remind</button><button class="dx-btn primary sm" data-action="markPaid" data-id="${p.id}">Mark paid</button>`}</div></td></tr>`).join('')||'<tr><td colspan="7" class="dx-empty">No payments here.</td></tr>'}</tbody></table></div>`}};

/* ---- Messages ---- */
V.messages={title:'Messages',render(){
  const m=D.messages.find(x=>x.id===ui.msg)||D.messages[0];
  return `<div class="dx-head"><div><span class="dx-eye">INBOX</span><h1>Messages</h1><p>${unread()} unread enquiries.</p></div><button class="dx-btn primary" data-action="compose">+ New message</button></div>
  <div class="dx-msgs"><div class="dx-list" style="align-content:start">${D.messages.map(x=>`<button class="dx-li${x.id===(m&&m.id)?' sel':''}${x.read?'':' unread'}" data-action="openMsg" data-id="${x.id}"><div class="ic">${esc(x.from[0])}</div><div style="min-width:0"><b>${esc(x.from)}</b><small style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(x.subject)}</small></div></button>`).join('')||'<div class="dx-empty">Inbox is empty.</div>'}</div>
  <div class="dx-card">${m?`<header><div><h3>${esc(m.subject)}</h3><small class="dx-muted">${esc(m.from)} · ${esc(m.email)}</small></div><div class="dx-row"><button class="dx-btn ghost sm" data-action="unreadMsg" data-id="${m.id}">Mark unread</button><button class="dx-btn ghost sm" data-action="delMsg" data-id="${m.id}">Delete</button></div></header><div class="dx-thread">${m.msgs.map(x=>`<div class="dx-bub${x.me?' me':''}">${esc(x.text)}<small>${esc(x.when)}</small></div>`).join('')}</div>
   <form data-submit="reply" data-id="${m.id}" class="dx-sp"><div class="dx-f"><label for="rp">Reply</label><textarea id="rp" name="text" placeholder="Write your reply…" required></textarea></div><div class="dx-row" style="margin-top:12px"><button class="dx-btn primary" type="submit">Send reply</button></div></form>`:'<div class="dx-empty">Select a message.</div>'}</div></div>`}};

/* ---- Settings ---- */
V.settings={title:'Settings',render(){const s=D.settings;
  const sw=(k,t,d)=>`<div class="dx-opt"><div><b>${t}</b><small>${d}</small></div><label class="dx-sw"><input type="checkbox" data-change="spref" data-k="${k}" ${s.pref[k]?'checked':''} aria-label="${t}"><i></i></label></div>`;
  return `<div class="dx-head"><div><span class="dx-eye">CONFIGURE</span><h1>Settings</h1><p>Academy details, alerts and data.</p></div></div>
  <div class="dx-grid g2"><form class="dx-card" data-submit="saveSettings"><header><h3>Academy details</h3></header><div class="dx-fg"><div class="dx-f full"><label for="st-a">Academy name</label><input id="st-a" name="academy" value="${esc(s.academy)}" required></div><div class="dx-f"><label for="st-e">Email</label><input id="st-e" name="email" type="email" value="${esc(s.email)}" required></div><div class="dx-f"><label for="st-p">Phone</label><input id="st-p" name="phone" value="${esc(s.phone)}"></div><div class="dx-f full"><label for="st-ad">Address</label><input id="st-ad" name="address" value="${esc(s.address)}"></div><div class="dx-f full"><label for="st-h">Opening hours</label><input id="st-h" name="hours" value="${esc(s.hours)}"></div></div><div class="dx-row" style="margin-top:18px"><button class="dx-btn primary" type="submit">Save settings</button></div></form>
   <div class="dx-grid"><div class="dx-card"><header><h3>Notifications</h3></header>${sw('enq','New enquiry alerts','Notify me when a family writes in')}${sw('pay','Payment alerts','Overdue and received payments')}${sw('weekly','Weekly summary email','Every Monday morning')}</div>
   <div class="dx-card"><header><h3>Data</h3></header><p style="margin-bottom:14px">Everything here is saved only in this browser.</p><div class="dx-row"><button class="dx-btn ghost" data-action="exportAll">Export all data (JSON)</button><button class="dx-btn danger" data-action="resetData">Reset demo data</button></div></div></div></div>`}};

/* ---- Actions ---- */
const find=(l,id)=>l.find(x=>x.id===id);
const A={
 addStudent(){studentForm()},editStudent(el){studentForm(find(D.students,el.dataset.id))},
 viewStudent(el){const s=find(D.students,el.dataset.id),b=find(D.batches,s.batch),pays=D.payments.filter(p=>p.student===s.name);
   DX.modal({title:s.name,body:`<div class="dx-info"><div><small>Course</small><b>${esc(cn(s.course))}</b></div><div><small>Batch</small><b>${b?DAYS[b.day]+' '+t12(b.time):'—'}</b></div><div><small>Joined</small><b>${fmtDate(s.joined)}</b></div></div><p style="margin-top:14px">${esc(s.email)} · ${esc(s.phone)}</p><p style="margin-top:10px">Status: ${sBadge(s.status)} &nbsp; Fees: ${sBadge(s.fee)}</p>${pays.length?`<p style="margin-top:10px">${pays.length} payment record(s) · ${money(pays.reduce((a,p)=>a+p.amount,0))}</p>`:''}`,actions:[{label:'Close'},{label:'Edit',kind:'primary',onClick:()=>{setTimeout(()=>studentForm(s),10)}}]})},
 async delStudent(el){const s=find(D.students,el.dataset.id);if(await DX.confirm('Delete '+s.name+'? This removes their record and payments.',{title:'Delete student',ok:'Delete',danger:true})){D.students=D.students.filter(x=>x!==s);D.payments=D.payments.filter(p=>p.student!==s.name);save();DX.toast('Student deleted','info');DX.refresh()}},
 sq(el){ui.s.q=el.value;ui.s.page=1;drawStudents()},scourse(el){ui.s.course=el.value;ui.s.page=1;drawStudents()},sstatus(el){ui.s.status=el.value;ui.s.page=1;drawStudents()},
 ssort(el){const k=el.dataset.k;ui.s.dir=ui.s.sort===k?-ui.s.dir:1;ui.s.sort=k;drawStudents()},spage(el){ui.s.page+=+el.dataset.d;drawStudents()},
 exportStudents(){DX.csv('students.csv',[['Name','Email','Phone','Course','Status','Fees','Joined'],...stuRows().map(s=>[s.name,s.email,s.phone,cn(s.course),s.status,s.fee,s.joined])]);DX.toast('Students exported')},
 addInst(){instForm()},editInst(el){instForm(find(D.instructors,el.dataset.id))},
 toggleInst(el){const i=find(D.instructors,el.dataset.id);i.status=i.status==='Available'?'On leave':'Available';save();DX.refresh()},
 msgInst(el){const i=find(D.instructors,el.dataset.id);A.compose(null,null,i.email,'')},
 async delInst(el){const i=find(D.instructors,el.dataset.id);if(await DX.confirm('Remove '+i.name+' from the team?',{title:'Remove instructor',ok:'Remove',danger:true})){D.instructors=D.instructors.filter(x=>x!==i);save();DX.toast('Instructor removed','info');DX.refresh()}},
 addCourse(){courseForm()},editCourse(el){courseForm(find(D.courses,el.dataset.id))},
 courseActive(el){find(D.courses,el.dataset.id).active=el.checked;save();DX.toast('Course '+(el.checked?'activated':'deactivated'),'info')},
 async delCourse(el){const c=find(D.courses,el.dataset.id);if(D.students.some(s=>s.course===c.id)||D.batches.some(b=>b.course===c.id))return DX.toast('Remove its students and batches first','err');if(await DX.confirm('Delete course '+c.name+'?',{ok:'Delete',danger:true})){D.courses=D.courses.filter(x=>x!==c);save();DX.refresh()}},
 addBatch(){batchForm()},editBatch(el){batchForm(find(D.batches,el.dataset.id))},
 async delBatch(el){const b=find(D.batches,el.dataset.id);if(filled(b.id))return DX.toast('Move its '+filled(b.id)+' students to another batch first','err');if(await DX.confirm('Delete this batch?',{ok:'Delete',danger:true})){D.batches=D.batches.filter(x=>x!==b);save();DX.refresh()}},
 pf(el){ui.pf=el.dataset.k;DX.refresh()},
 markPaid(el){const p=find(D.payments,el.dataset.id);p.status='Paid';const s=D.students.find(x=>x.name===p.student);if(s)s.fee='Paid';save();DX.toast(p.id+' marked as paid');DX.refresh()},
 remind(el){const p=find(D.payments,el.dataset.id);DX.toast('Reminder sent to '+p.student,'info')},
 payReceipt(el){const p=find(D.payments,el.dataset.id);DX.download('receipt-'+p.id+'.txt',`MELODYNEST — RECEIPT\n${p.id}\nStudent: ${p.student}\nCourse: ${cn(p.course)}\nAmount: ${money(p.amount)}\nDate: ${fmtDate(p.date)}\nMethod: ${p.method}\n`);DX.toast('Receipt downloaded')},
 exportPay(){DX.csv('payments.csv',[['ID','Student','Course','Date','Amount','Status','Method'],...D.payments.map(p=>[p.id,p.student,cn(p.course),p.date,p.amount,p.status,p.method])]);DX.toast('Payments exported')},
 addPay(){DX.modal({title:'Record payment',body:`<form><div class="dx-fg"><div class="dx-f full"><label for="pp-s">Student</label><select id="pp-s">${D.students.map(s=>`<option value="${s.id}">${esc(s.name)} · ${esc(cn(s.course))}</option>`).join('')}</select></div><div class="dx-f"><label for="pp-a">Amount (₹)</label><input id="pp-a" type="number" min="1" required></div><div class="dx-f"><label for="pp-m">Method</label><select id="pp-m"><option>UPI</option><option>Card</option><option>Cash</option><option>Net banking</option></select></div></div></form>`,
   actions:[{label:'Cancel'},{label:'Record',kind:'primary',onClick:m=>{const s=find(D.students,$('#pp-s',m.el).value),a=+$('#pp-a',m.el).value;if(!(a>0)){DX.toast('Enter a valid amount','err');return false}
     D.payments.unshift({id:'PAY-'+(5000+D.payments.length+1+Math.floor(Math.random()*9)),student:s.name,course:s.course,amount:a,date:dkey(new Date()),status:'Paid',method:$('#pp-m',m.el).value});s.fee='Paid';save();DX.toast('Payment recorded');DX.refresh()}}]})},
 openMsg(el){ui.msg=el.dataset.id;find(D.messages,ui.msg).read=true;save();DX.refresh()},
 unreadMsg(el){find(D.messages,el.dataset.id).read=false;save();DX.toast('Marked as unread','info');DX.refresh()},
 async delMsg(el){if(await DX.confirm('Delete this conversation?',{ok:'Delete',danger:true})){D.messages=D.messages.filter(m=>m.id!==el.dataset.id);ui.msg=D.messages[0]&&D.messages[0].id;save();DX.refresh()}},
 reply(f){const m=find(D.messages,f.dataset.id),t=f.elements.text.value.trim();if(!t)return;m.msgs.push({me:true,text:t,when:'Just now'});m.read=true;save();DX.toast('Reply sent to '+m.from);DX.refresh()},
 compose(el,e,to,subj){DX.modal({title:'New message',body:`<form><div class="dx-fg"><div class="dx-f full"><label for="mc-t">To (email)</label><input id="mc-t" type="email" value="${esc(to||'')}" required></div><div class="dx-f full"><label for="mc-s">Subject</label><input id="mc-s" value="${esc(subj||'')}" required></div><div class="dx-f full"><label for="mc-b">Message</label><textarea id="mc-b" required></textarea></div></div></form>`,
   actions:[{label:'Cancel'},{label:'Send',kind:'primary',onClick:m=>{const g=s=>$(s,m.el).value.trim();if(!/^\S+@\S+\.\S+$/.test(g('#mc-t'))||!g('#mc-s')||!g('#mc-b')){DX.toast('Fill in all fields with a valid email','err');return false}
     const id=uid('m');D.messages.unshift({id,from:g('#mc-t'),email:g('#mc-t'),subject:g('#mc-s'),read:true,msgs:[{me:true,text:g('#mc-b'),when:'Just now'}]});ui.msg=id;save();DX.toast('Message sent');DX.go('messages');DX.refresh()}}]})},
 saveSettings(f){const d=Object.fromEntries(new FormData(f));Object.assign(D.settings,d);save();DX.toast('Settings saved')},
 spref(el){D.settings.pref[el.dataset.k]=el.checked;save();DX.toast('Preference saved','info')},
 exportAll(){DX.download('melodynest-admin-data.json',JSON.stringify(D,null,2),'application/json');DX.toast('Data exported')},
 async resetData(){if(await DX.confirm('Reset all admin demo data to the original sample records?',{title:'Reset demo data',ok:'Reset',danger:true})){store.del(KEY);D=seed();save();DX.toast('Demo data reset','info');DX.refresh()}}
};
$$('[data-u-name]').forEach(e=>e.textContent=S.name);$$('[data-u-ini]').forEach(e=>e.textContent=DX.initials(S.name));
DX.init({role:'admin',user:S,start:'overview',views:V,actions:A,
 notifs:[{icon:'✉',title:'New enquiry',text:'Priya Raman asked about drums',when:'Today',go:'messages'},{icon:'₹',title:'Payments need follow-up',text:'3 pending or overdue',when:'Today',go:'payments'},{icon:'★',title:'Winter Showcase',text:'Confirm performers by Friday',when:'Yesterday',go:'batches'}],
 searchIndex:()=>[...[['overview','Overview','Academy at a glance'],['students','Students','Records and enrolment'],['instructors','Instructors','Teaching team'],['courses','Courses','Pricing and capacity'],['batches','Batches & schedules','Timetable'],['payments','Payments','Fees and receipts'],['messages','Messages','Enquiries inbox'],['settings','Settings','Academy details']].map(([go,label,hint])=>({go,label,hint})),
  ...D.students.map(s=>({go:'students',label:s.name,hint:'Student · '+cn(s.course)})),...D.instructors.map(i=>({go:'instructors',label:i.name,hint:'Instructor · '+i.course})),...D.messages.map(m=>({go:'messages',label:m.subject,hint:'From '+m.from}))]});
})();
