/* MelodyNest demo authentication (front-end only).
   Passwords are never stored in plain text: a salted SHA-256 hash is kept in localStorage.
   Replace with a real backend / auth provider before production. */
(function(){
  /* DEMO MODE: when true, the Log in button always opens the dashboard (known demo accounts keep their role;
     any other email/ID signs in as a student). Set to false and connect a real backend before going live. */
  var DEMO_ACCEPT_ANY=true;
  var SK='mn-session', UK='mn-users';
  var PAGES={student:'student-dashboard.html',admin:'admin-dashboard.html'};
  var DEMO=[
    {id:'MN-2041',email:'student@melodynest.demo',name:'Aadhya R',role:'student',salt:'mn-demo',hash:'51bc3837b8d59eb22b4b6eafba166d168d4ce1642e9b3fbb87d5f5674d31e7bf'},
    {id:'MN-ADMIN',email:'admin@melodynest.demo',name:'Admin',role:'admin',salt:'mn-demo',hash:'b6936d97ff44b103ca17f54eca471a4c09bc701797717d7b059834e90d78e670'}
  ];
  /* ---- SHA-256 (pure JS, synchronous) ---- */
  var K=[],H0=[];(function(){var p=2,n=0;while(n<64){var ok=true;for(var i=2;i*i<=p;i++)if(p%i===0){ok=false;break}
    if(ok){if(n<8)H0[n]=(Math.pow(p,.5)%1*4294967296)|0;K[n]=(Math.pow(p,1/3)%1*4294967296)|0;n++}p++}})();
  function sha256(str){
    var u=unescape(encodeURIComponent(str)),l=u.length,len=(((l+8)>>6)+1)*16,w=new Array(len).fill(0),i,j;
    for(i=0;i<l;i++)w[i>>2]|=u.charCodeAt(i)<<(24-(i%4)*8);
    w[l>>2]|=0x80<<(24-(l%4)*8);w[len-1]=l*8;
    var h=H0.slice();
    for(j=0;j<len;j+=16){
      var W=new Array(64);
      for(i=0;i<64;i++){
        if(i<16)W[i]=w[j+i]|0;
        else{var a1=W[i-15],b1=W[i-2];
          var s0=(a1>>>7|a1<<25)^(a1>>>18|a1<<14)^(a1>>>3),s1=(b1>>>17|b1<<15)^(b1>>>19|b1<<13)^(b1>>>10);
          W[i]=(W[i-16]+s0+W[i-7]+s1)|0}
      }
      var a=h[0],b=h[1],c=h[2],d=h[3],e=h[4],f=h[5],g=h[6],hh=h[7];
      for(i=0;i<64;i++){
        var S1=(e>>>6|e<<26)^(e>>>11|e<<21)^(e>>>25|e<<7),ch=(e&f)^(~e&g),t1=(hh+S1+ch+K[i]+W[i])|0;
        var S0=(a>>>2|a<<30)^(a>>>13|a<<19)^(a>>>22|a<<10),mj=(a&b)^(a&c)^(b&c),t2=(S0+mj)|0;
        hh=g;g=f;f=e;e=(d+t1)|0;d=c;c=b;b=a;a=(t1+t2)|0}
      h=[h[0]+a|0,h[1]+b|0,h[2]+c|0,h[3]+d|0,h[4]+e|0,h[5]+f|0,h[6]+g|0,h[7]+hh|0];
    }
    return h.map(function(x){return('00000000'+(x>>>0).toString(16)).slice(-8)}).join('');
  }
  function hashPw(salt,pw){return sha256(salt+':'+pw)}
  function jget(s,k,d){try{var v=s.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
  function jset(s,k,v){try{s.setItem(k,JSON.stringify(v))}catch(e){}}
  function users(){return jget(localStorage,UK,[])}
  function session(){return jget(localStorage,SK,null)||jget(sessionStorage,SK,null)}
  function file(){return(location.pathname.split('/').pop()||'index.html').toLowerCase()}

  var Auth={
    PAGES:PAGES,
    session:session,
    dashboardFor:function(r){return PAGES[r]||PAGES.student},
    findUser:function(id){
      id=String(id||'').trim().toLowerCase();
      var all=DEMO.concat(users());
      for(var i=0;i<all.length;i++){var u=all[i];if(u.email.toLowerCase()===id||(u.id&&u.id.toLowerCase()===id))return u}
      return null;
    },
    login:function(id,pw,remember){
      var u=Auth.findUser(id);
      if(!u||hashPw(u.salt,pw)!==u.hash){
        if(!DEMO_ACCEPT_ANY)return{ok:false,error:'Incorrect email / ID or password.'};
        var raw=String(id||'').trim();
        var nm=raw.indexOf('@')>0?raw.split('@')[0].replace(/[._-]+/g,' '):raw;
        nm=nm.replace(/\b\w/g,function(c){return c.toUpperCase()})||'Student';
        u={email:raw.toLowerCase(),name:nm,role:'student',id:''};
      }
      var s={email:u.email,name:u.name,role:u.role,id:u.id||'',t:Date.now()};
      jset(remember?localStorage:sessionStorage,SK,s);
      if(!remember)localStorage.removeItem(SK);
      return{ok:true,user:s};
    },
    register:function(d){
      if(Auth.findUser(d.email))return{ok:false,error:'An account with this email already exists. Please log in.'};
      var salt=Math.random().toString(36).slice(2,12);
      var list=users(),id='MN-'+(3000+list.length+1);
      list.push({id:id,email:d.email,name:d.name,phone:d.phone||'',course:d.course||'',age:d.age||'',role:'student',salt:salt,hash:hashPw(salt,d.password),created:Date.now()});
      jset(localStorage,UK,list);
      return Auth.login(d.email,d.password,true);
    },
    updateProfile:function(email,patch){
      var list=users(),i;for(i=0;i<list.length;i++)if(list[i].email===email){for(var k in patch)list[i][k]=patch[k]}
      jset(localStorage,UK,list);
      var s=session();if(s&&s.email===email){for(var k2 in patch)if(k2==='name')s.name=patch[k2];jset(localStorage.getItem(SK)?localStorage:sessionStorage,SK,s)}
    },
    changePassword:function(email,oldPw,newPw){
      var u=Auth.findUser(email);if(!u)return{ok:false,error:'Account not found.'};
      if(hashPw(u.salt,oldPw)!==u.hash)return{ok:false,error:'Current password is incorrect.'};
      var list=users(),found=false;
      for(var i=0;i<list.length;i++)if(list[i].email===email){list[i].hash=hashPw(list[i].salt,newPw);found=true}
      if(!found)return{ok:false,error:'Demo accounts cannot change their password. Create your own account to try this.'};
      jset(localStorage,UK,list);return{ok:true};
    },
    logout:function(){try{localStorage.removeItem(SK);sessionStorage.removeItem(SK)}catch(e){}},
    safeNext:function(next,role){
      var ok={'student-dashboard.html':'student','admin-dashboard.html':'admin'};
      return(next&&ok[next]===role)?next:Auth.dashboardFor(role);
    }
  };
  window.MNAuth=Auth;

  /* ---- Page guard for dashboards (runs immediately) ---- */
  var root=document.documentElement;
  document.addEventListener('DOMContentLoaded',function(){
    var guard=document.body.getAttribute('data-guard');
    var s=session();
    if(guard){
      if(!s){location.replace('login.html?next='+encodeURIComponent(file()));return}
      if(guard!=='any'&&s.role!==guard){location.replace(Auth.dashboardFor(s.role));return}
      document.body.classList.add('auth-ok');
    }
    /* header login icon: login portal when signed out, dashboard when signed in */
    document.querySelectorAll('.mn-login').forEach(function(a){
      if(s){a.setAttribute('href',Auth.dashboardFor(s.role));a.setAttribute('title','Open dashboard ('+s.name+')');a.setAttribute('aria-label','Open your dashboard');a.classList.add('is-in')}
      else{a.setAttribute('href','login.html');a.setAttribute('title','Log in');a.setAttribute('aria-label','Log in to your account')}
    });
    initLogin(s);initRegister(s);
  });

  document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-logout]');if(b){e.preventDefault();Auth.logout();location.href='login.html?out=1'}});
  function msg(box,text,kind){if(!box)return;box.textContent=text;box.className='auth-msg '+(kind||'');box.style.display=text?'block':'none'}
  function qs(k){return new URLSearchParams(location.search).get(k)}

  function initLogin(s){
    var form=document.getElementById('loginForm');if(!form)return;
    var box=document.getElementById('authMsg');
    if(qs('out'))msg(box,'You have been signed out.','ok');
    if(qs('next')&&!s)msg(box,'Please log in to continue to your dashboard.','info');
    var banner=document.getElementById('signedIn');
    if(s&&banner){banner.hidden=false;banner.querySelector('[data-who]').textContent=s.name;banner.querySelector('[data-dash]').setAttribute('href',Auth.dashboardFor(s.role))}
    var pw=form.elements.password,tg=document.getElementById('pwToggle');
    if(tg)tg.addEventListener('click',function(){var h=pw.type==='password';pw.type=h?'text':'password';tg.textContent=h?'Hide':'Show';tg.setAttribute('aria-pressed',h)});
    document.querySelectorAll('[data-fill]').forEach(function(b){b.addEventListener('click',function(){
      var r=b.getAttribute('data-fill');form.elements.identity.value=r==='admin'?'admin@melodynest.demo':'student@melodynest.demo';
      pw.value=r==='admin'?'Admin@123':'Student@123';msg(box,'Demo credentials filled in — press Log in.','info')})});
    form.addEventListener('submit',function(e){
      e.preventDefault();if(!form.reportValidity())return;
      var r=Auth.login(form.elements.identity.value,pw.value,form.elements.remember.checked);
      if(!r.ok){msg(box,r.error,'err');pw.value='';pw.focus();return}
      msg(box,'Welcome back, '+r.user.name+'! Redirecting to your dashboard…','ok');
      var btn=form.querySelector('[type=submit]');btn.disabled=true;
      setTimeout(function(){location.href=Auth.safeNext(qs('next'),r.user.role)},700);
    });
    var fp=document.getElementById('forgotForm');
    if(fp)fp.addEventListener('submit',function(e){e.preventDefault();if(!fp.reportValidity())return;
      msg(document.getElementById('forgotMsg'),'If an account exists for that email, a reset link would be sent. (Demo — no email is sent.)','ok');fp.reset()});
  }

  function initRegister(s){
    var form=document.getElementById('registerForm');if(!form)return;
    var box=document.getElementById('authMsg');
    form.addEventListener('submit',function(e){
      e.preventDefault();if(!form.reportValidity())return;
      var f=form.elements;
      if(f.password.value.length<8){msg(box,'Password must be at least 8 characters.','err');return}
      if(f.password.value!==f.confirm.value){msg(box,'Passwords do not match.','err');return}
      var r=Auth.register({name:f.name.value.trim(),email:f.email.value.trim(),phone:f.phone.value,age:f.age.value,course:f.course.value,password:f.password.value});
      if(!r.ok){msg(box,r.error,'err');return}
      msg(box,'Account created! Taking you to your dashboard…','ok');
      form.querySelector('[type=submit]').disabled=true;
      setTimeout(function(){location.href=Auth.dashboardFor('student')},800);
    });
  }
})();
