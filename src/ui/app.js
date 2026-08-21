/* APEX — application shell.
   Content lives in ../content/*, pure logic in ../lib/*. */
import { T, ACCENTS, DIFF } from "../content/topics.js";
import { FEED } from "../content/feed.js";
import { ARTICLES } from "../content/articles.js";
import { WORKOUTS, SESSIONS } from "../content/train.js";
import { QUIZZES } from "../content/quizzes.js";
import { MAPS } from "../content/maps.js";
import { STORIES } from "../content/stories.js";
import { SEED_VIDEOS } from "../content/videos.js";
import { NAMES, RE, FL, TIMES } from "../content/social.js";
import { esc, fmt, mmss, timeAgo, ini, wrapLines } from "../lib/format.js";
import { hs, mul, sd, pick } from "../lib/rng.js";
import { parseVideo, searchURL, PLAT_COLOR } from "../lib/video.js";
import { levelFor, xpIn, dayKey, advanceStreak } from "../lib/progress.js";
import { steps, wMin } from "../lib/workout.js";
import { parseBackup } from "../lib/backup.js";
const $=s=>document.querySelector(s);

/* ===== TOPICS ===== */

function grad(t){const x=T[t]||T.life;return`background:linear-gradient(150deg,${x.g[0]},${x.g[1]})`}
/* real photos (deterministic by seed) with graceful gradient fallback + offline caching via SW */
function imgURL(seed,w,h){return`https://picsum.photos/seed/apex-${encodeURIComponent(seed)}/${w}/${h}`}
function imgTag(seed,w,h,cls){return`<img class="imgload ${cls||''}" loading="lazy" decoding="async" src="${imgURL(seed,w,h)}" alt="" onload="this.classList.add('ready')" onerror="this.classList.add('failed')">`}
/* history log */
function logHist(kind,id,topic,title){if(!S.history)S.history=[];S.history=S.history.filter(h=>!(h.kind===kind&&h.id===id));S.history.unshift({kind,id,topic,title,t:Date.now()});if(S.history.length>60)S.history.length=60;save()}
/* themes + accents */

function applyTheme(){const a=ACCENTS[S.accent]||ACCENTS.gold,r=document.documentElement.style;r.setProperty("--gold",a[1]);r.setProperty("--gold-2",a[0]);r.setProperty("--grad-gold",`linear-gradient(135deg,${a[0]},${a[1]} 55%,${a[2]})`);const app=document.getElementById("app");if(app)app.setAttribute("data-theme",S.theme||"dark");const tc=document.querySelector('meta[name="theme-color"]');if(tc)tc.setAttribute("content",S.theme==="light"?"#faf9f7":"#08080c")}
/* difficulty + engagement affinity */

function diffOf(t){return DIFF[t]||"core"}
function bumpAff(topic,n){if(!S.affinity)S.affinity={};S.affinity[topic]=Math.max(-8,Math.min(20,(S.affinity[topic]||0)+n))}
/* word / challenge / on-this-day */
const WORDS=[["Sonder","the realization that each passer-by is living a life as vivid as your own"],["Ataraxia","a lucid state of robust, unruffled calm"],["Eudaimonia","human flourishing; a life well-lived"],["Sisu","extraordinary grit in the face of adversity"],["Ikigai","your reason for being — what gets you up in the morning"],["Petrichor","the earthy scent after rain on dry ground"],["Numinous","feeling both tiny and awestruck before something vast"],["Kaizen","continuous improvement through tiny steps"],["Apricity","the warmth of the sun in winter"],["Meraki","doing something with soul, creativity and love"],["Wabi-sabi","beauty in imperfection and impermanence"],["Limerence","the involuntary, intoxicating early rush of infatuation"]];
const CHALLENGES=["Do the hardest task on your list first — before anything else.","Put your phone in another room for one focused hour.","Message one person you've been meaning to thank.","Take a 10-minute walk with no phone, no podcast.","Write down three things you're grateful for.","Do 20 push-ups (or as many as you can) right now.","Read one deep-read article start to finish.","Drink a glass of water before your first coffee.","Sit for 5 minutes of quiet breathing.","Teach someone one thing you learned today.","No screens for the first 20 minutes after you wake.","Tidy one small surface completely."];
const ONTHISDAY={"7-20":["1969","Apollo 11 lands the first humans on the Moon."],"8-10":["1846","The Smithsonian Institution is founded in Washington, D.C."],"11-9":["1989","The Berlin Wall falls, reuniting a divided city."],"12-17":["1903","The Wright brothers make the first powered flight."],"4-12":["1961","Yuri Gagarin becomes the first human in space."],"10-29":["1969","The first message is sent over ARPANET — the internet's ancestor."],"1-3":["1977","Apple Computer is incorporated."],"2-11":["1990","Nelson Mandela is released after 27 years in prison."],"6-6":["1944","D-Day: Allied forces land in Normandy."],"9-2":["1969","The first ATM in the U.S. opens for business."]};

/* ===== FEED ===== */


/* ===== ARTICLES ===== */


/* ===== WORKOUTS + SESSIONS ===== */
const CATW={HIIT:"#ff4d6d",Core:"#ff6a3d",Strength:"#a78bff",Mobility:"#37d68a",Mind:"#7fb0ff"};



/* ===== QUIZZES ===== */


/* ===== KNOWLEDGE MAPS ===== */


/* ===== STORIES (tap-through) ===== */


/* ===== WATCH (curated safe searches — creators open on the real platform) ===== */
const WATCH_TOPICS=["Home workout","HIIT no equipment","Ab workout","Yoga & mobility","Meditation guided","Kurzgesagt","Veritasium","Crash Course history","TED-Ed","Physics explained","Math visualized","Astronomy documentary","Ancient history","Biology basics","Economics explained","Philosophy crash course","Animal facts","Deep focus music"];
/* Curated workout & movement videos. YouTube plays inline; Instagram/TikTok open on-platform.
   Swap these links for your own favourites any time — the app parses any pasted URL. */
const SEED_V=2;


/* ===== STATE ===== */
const KEY="apex_v1",today=()=>dayKey();
let S={xp:0,streak:0,lastActive:null,reads:0,workouts:0,minutes:0,sessions:0,quizzes:0,
 likes:{},saves:{},ownComments:{},readProgress:{},done:{},videos:[],seeded:false,seedV:0,mood:"focus",
 quizBest:{},storiesSeen:{},mapsSeen:{},interests:null,onboarded:false,notify:false,
 history:[],collections:[],name:"You",avatar:"A",geminiKey:"",aiCache:{},
 affinity:{},theme:"dark",accent:"gold",apiBase:"",audioAuto:false,aiIdeas:[],lastBrief:null,points:0};
try{const r=localStorage.getItem(KEY);if(r)S=Object.assign(S,JSON.parse(r))}catch(e){}
if(Array.isArray(S.aiIdeas)&&S.aiIdeas.length)FEED.push(...S.aiIdeas);
if(S.seedV!==SEED_V){const userAdded=(S.videos||[]).filter(v=>!v.seed);S.videos=SEED_VIDEOS.concat(userAdded);S.seedV=SEED_V;S.seeded=true}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function bump(){const n=advanceStreak(S,Date.now());S.streak=n.streak;S.lastActive=n.lastActive}
function addXP(n,m){const b=levelFor(S.xp);S.xp+=n;const a=levelFor(S.xp);save();updateHUD();if(a>b)setTimeout(()=>toast(`⚡ Level ${a}!`),260);if(m)toast(m)}
function savedIds(){return Object.keys(S.saves).filter(k=>S.saves[k])}
function toast(h){const e=document.createElement("div");e.className="toast";e.innerHTML=h;$("#toasts").appendChild(e);setTimeout(()=>e.remove(),2200)}
function updateHUD(){document.querySelectorAll("[data-streak]").forEach(e=>e.textContent=S.streak);document.querySelectorAll("[data-lvl]").forEach(e=>e.textContent=levelFor(S.xp))}
function itemText(k){if(k[0]==='f'){const it=FEED[+k.slice(1)];return it?{t:it[0],x:it[2]}:null}const a=ARTICLES.find(x=>x.id===k);if(a)return{t:a.topic,x:a.title};const v=S.videos.find(x=>x.id===k);if(v)return{t:v.topic||'life',x:v.title};const st=STORIES.find(x=>x.id===k);if(st)return{t:st.topic,x:st.title+" · story"};const mp=MAPS.find(x=>x.id===k);if(mp)return{t:mp.topic,x:mp.root+" · map"};return null}

/* ===== MUSIC ENGINE (generative, royalty-free) ===== */
const Music=(function(){
 let ctx,master,playing=false,nodes=[],timer=null,mood="focus";
 const SC={calm:{root:196,scale:[0,3,5,7,10],bpm:0,pad:.09,type:"sine",cut:700},
           focus:{root:220,scale:[0,2,4,7,9],bpm:0,pad:.07,type:"triangle",cut:900},
           epic:{root:110,scale:[0,3,7,10,12],bpm:0,pad:.11,type:"sawtooth",cut:1200}};
 function ensure(){if(!ctx){ctx=new (window.AudioContext||window.webkitAudioContext)();master=ctx.createGain();master.gain.value=.0;const comp=ctx.createDynamicsCompressor();master.connect(comp);comp.connect(ctx.destination);
   // simple ambient delay for space
   const dl=ctx.createDelay();dl.delayTime.value=.38;const fb=ctx.createGain();fb.gain.value=.32;const wet=ctx.createGain();wet.gain.value=.3;master.connect(dl);dl.connect(fb);fb.connect(dl);dl.connect(wet);wet.connect(comp);}}
 function note(f,dur,when,gain,type,cut){const o=ctx.createOscillator(),g=ctx.createGain(),lp=ctx.createBiquadFilter();o.type=type;o.frequency.value=f;lp.type="lowpass";lp.frequency.value=cut;g.gain.value=0;o.connect(lp);lp.connect(g);g.connect(master);
   g.gain.setValueAtTime(0,when);g.gain.linearRampToValueAtTime(gain,when+dur*.35);g.gain.linearRampToValueAtTime(0,when+dur);o.start(when);o.stop(when+dur+.05);}
 function chord(){if(!playing)return;const cfg=SC[mood];const t=ctx.currentTime;const deg=cfg.scale;const base=cfg.root*Math.pow(2,Math.floor(Math.random()*2)-1);
   // pad chord (root, third-ish, fifth-ish)
   const picks=[deg[0],deg[2%deg.length],deg[4%deg.length]];
   picks.forEach((d,i)=>{const f=base*Math.pow(2,d/12);note(f,6,t,cfg.pad,cfg.type,cfg.cut);if(mood==="epic")note(f/2,6,t,cfg.pad*.7,"sine",600);});
   // occasional bell/arp
   if(mood!=="calm"&&Math.random()<.7){for(let i=0;i<3;i++){const d=deg[Math.floor(Math.random()*deg.length)]+12;note(base*Math.pow(2,d/12),1.4,t+.6+i*.5,.05,"sine",2200);}}
   timer=setTimeout(chord,mood==="epic"?5200:6200);}
 return{
  toggle(){ensure();if(ctx.state==="suspended")ctx.resume();playing=!playing;if(playing){master.gain.cancelScheduledValues(ctx.currentTime);master.gain.linearRampToValueAtTime(.5,ctx.currentTime+1.5);chord();}else{master.gain.linearRampToValueAtTime(0,ctx.currentTime+.8);clearTimeout(timer);}return playing},
  setMood(m){mood=m;S.mood=m;save();},
  isPlaying(){return playing},
  current(){return mood}
 };
})();
Music.setMood(S.mood||"focus");

/* ===== COMMENTS ===== */




function avaC(n){return`hsl(${hs(""+(n??""))()%360} 65% 62%)`}
function gen(id,topic,n,off){const r=sd(id+"|"+off),o=[];for(let i=0;i<n;i++){const nm=pick(r,NAMES),fl=r()<.32&&FL[topic];o.push({name:nm,txt:fl?pick(r,FL[topic]):pick(r,RE),likes:Math.floor(r()*r()*720),time:pick(r,TIMES),liked:false})}if(off===0)o.sort((a,b)=>b.likes-a.likes);return o}
function baseC(k){return 12+Math.floor(sd(k+"c")()*900)}

/* ===== HOME ===== */
function renderHome(){
 const r=sd("day"+new Date().toDateString());
 const quotes=[["The wall you hit at 40% is a door, not a stop sign.","On the SEAL 40% Rule"],["You have power over your mind — not outside events.","Marcus Aurelius"],["Discipline equals freedom.","Jocko Willink"],["Comparison is the thief of joy.","Theodore Roosevelt"],["He who has a why can bear almost any how.","Nietzsche"]];
 const q=quotes[Math.floor(r()*quotes.length)];
 const hero=ARTICLES[Math.floor(r()*ARTICLES.length)],ht=T[hero.topic];
 const hr=new Date().getHours(),g=hr<5?"Still up?":hr<12?"Good morning":hr<18?"Good afternoon":"Good evening";
 const cont=Object.keys(S.readProgress).filter(k=>S.readProgress[k]>3&&S.readProgress[k]<96).map(k=>ARTICLES.find(a=>a.id===k)).filter(Boolean);
 const pills=[["learn","Learn","🧠","Ideas that stick","learn"],["train","Train","🎖️","Body & mind","train"],["watch","Watch","🎬","Real creators","watch"],["mind","Breathe","🧘","Reset in 2 min","train"]];
 $("#v-home").innerHTML=`
  <div class="mesh"></div>
  <div class="top"><div class="brandrow"><span class="mk">${esc(S.avatar||'A')}</span><div><div class="h1">APEX</div><div class="sub">${g}, ${esc(S.name||'you')}.</div></div>
   <div class="pillrow"><button class="pill" id="homeSearch" aria-label="Search" style="border:1px solid var(--line)">🔎</button><div class="pill">🔥 <span data-streak>${S.streak}</span></div><div class="pill"><small>Lv</small> <span data-lvl>${levelFor(S.xp)}</span></div></div></div></div>
  <div class="storybar">${STORIES.map(s=>`<div class="storyav ${S.storiesSeen[s.id]?'seen':''}" data-open-story="${s.id}"><div class="ring"><div class="inr">${s.emoji}</div></div><div class="sl">${esc(s.title)}</div></div>`).join("")}</div>
  <div class="cine" id="cineHero"><canvas></canvas><div class="cov"></div>
    <div class="eb">✦ Today's word</div>
    <div class="cq">${esc(q[0])}</div><div class="cby">— ${esc(q[1])}</div>
    <button class="go" data-open-art="${hero.id}"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>Read today's piece</button></div>
  ${(()=>{const di=Math.floor(Date.now()/864e5),wod=WORDS[di%WORDS.length],chal=CHALLENGES[di%CHALLENGES.length],md=(new Date().getMonth()+1)+"-"+new Date().getDate(),otd=ONTHISDAY[md],dIdea=FEED[(di*7)%FEED.length],dt=T[dIdea[0]]||T.life;return`
  <div class="sec"><h3>🌅 Your daily brief</h3></div>
  <div style="padding:0 18px;display:flex;flex-direction:column;gap:11px">
   <div class="settingrow" data-open-feed="${(di*7)%FEED.length}" style="cursor:pointer"><span class="se">${dt.e}</span><div class="si"><b style="font-size:11px;color:var(--gold-2);text-transform:uppercase;letter-spacing:.05em">Idea of the day</b><p style="color:var(--text);font-size:14px;font-weight:650;margin-top:3px">${esc(dIdea[2])}</p></div></div>
   <div style="display:grid;grid-template-columns:1fr 1fr;gap:11px">
    <div class="settingrow" style="flex-direction:column;align-items:flex-start;gap:4px"><b style="font-size:11px;color:var(--gold-2);text-transform:uppercase;letter-spacing:.05em">📖 Word</b><div style="font-size:16px;font-weight:800">${esc(wod[0])}</div><p>${esc(wod[1])}</p></div>
    <div class="settingrow" style="flex-direction:column;align-items:flex-start;gap:4px"><b style="font-size:11px;color:var(--gold-2);text-transform:uppercase;letter-spacing:.05em">🎯 Challenge</b><p style="color:var(--text);font-size:13.5px;font-weight:600">${esc(chal)}</p></div>
   </div>
   ${otd?`<div class="settingrow"><span class="se">🏛️</span><div class="si"><b style="font-size:11px;color:var(--gold-2);text-transform:uppercase;letter-spacing:.05em">On this day · ${otd[0]}</b><p style="color:var(--text);font-size:13.5px;font-weight:600;margin-top:3px">${esc(otd[1])}</p></div></div>`:''}
  </div>`})()}
  <div class="sec"><h3>Four pillars</h3></div>
  <div class="pillars">${pills.map(p=>`<div class="pil" style="${grad(p[0])}" data-goto="${p[4]}"><span class="pe">${p[2]}</span><div class="pn">${p[1]}</div><div class="pd">${p[3]}</div></div>`).join("")}</div>
  <div class="sec"><h3>🧭 Explore by subject</h3></div>
  <div class="explore">${[["geo","Geography"],["history","History"],["physics","Physics"],["astro","Astronomy"],["bio","Biology"],["math","Math"],["econ","Economy"],["animal","Animals"],["phil","Philosophy"],["money","Money"]].map(([k,l])=>{const t=T[k]||T.life;return`<div class="xtile" data-explore="${k}">${imgTag('subject-'+k,600,360)}<div class="xov" style="${grad(k)};opacity:.5"></div><span class="xe">${t.e}</span><div class="xn">${l}</div><div class="xc">Dive in →</div></div>`}).join("")}</div>
  ${cont.length?`<div class="sec"><h3>⏳ Jump back in</h3></div><div class="hs">${cont.map(a=>`<div class="acard" data-open-art="${a.id}"><div class="th" style="${grad(a.topic)}">${imgTag(a.img||a.id,600,360,'thimg')}<div class="thov"></div><span class="em">${a.emoji}</span><span class="tp">${Math.round(S.readProgress[a.id])}% read</span></div><div class="rt">${esc(a.title)}</div><div class="rm">${a.minutes} min</div></div>`).join("")}</div>`:""}
  <div class="sec"><h3>📖 Long reads<span class="more" data-goto="learn">Feed</span></h3></div>
  <div class="hs">${ARTICLES.slice(0,8).map(a=>`<div class="acard" data-open-art="${a.id}"><div class="th" style="${grad(a.topic)}">${imgTag(a.img||a.id,600,360,'thimg')}<div class="thov"></div><span class="em">${a.emoji}</span><span class="tp">${T[a.topic].l}</span></div><div class="rt">${esc(a.title)}</div><div class="rd">${esc(a.dek)}</div><div class="rm">${a.minutes} min read</div></div>`).join("")}</div>
  <div class="sec"><h3>💡 Ideas that stick<span class="more" data-goto="learn">Enter feed</span></h3></div>
  <div class="hs">${FEED.map((f,i)=>[f,i]).filter(([f])=>["idea","quote","finance"].includes(f[1])).slice(0,12).map(([f,i])=>`<div class="fcardh" data-open-feed="${i}"><div class="ft">${esc(f[1]==='quote'?'"'+f[2]+'"':f[2])}</div><div class="fm">${T[f[0]].e} ${f[1]==='quote'?esc(f[3]):T[f[0]].l}</div></div>`).join("")}</div>
  <div class="sec"><h3>🧩 Test yourself<span class="more">${S.quizzes} taken</span></h3></div>
  <div class="hs">${QUIZZES.map(q=>{const best=S.quizBest[q.id];return`<div class="qcardh" data-open-quiz="${q.id}"><div class="qe">${q.emoji}</div><div class="qtt">${esc(q.title)}</div><div class="qmeta"><span>${q.qs.length} questions</span>${best!=null?`<span class="qbest">★ ${best}%</span>`:'<span>tap to start</span>'}</div></div>`}).join("")}</div>
  <div class="sec"><h3>🗺️ Knowledge maps<span class="more">${MAPS.length}</span></h3></div>
  <div class="hs">${MAPS.map(m=>{const t=T[m.topic]||T.life;return`<div class="acard" data-open-map="${m.id}"><div class="th" style="${grad(m.topic)}">${imgTag('map-'+m.id,600,360,'thimg')}<div class="thov"></div><span class="em">${m.emoji}</span><span class="tp">${t.l}</span></div><div class="rt">${esc(m.root)}</div><div class="rd">${esc(m.sub)}</div><div class="rm">${m.branches.length} branches · ${S.mapsSeen[m.id]?'explored':'new'}</div></div>`}).join("")}</div>
  <div class="sec"><h3>🎬 Workout videos<span class="more" data-goto="watch">Watch</span></h3></div>
  <div class="hs">${SEED_VIDEOS.slice(0,6).map(v=>{const t=T[v.topic]||T.life,ig=/instagram/.test(v.url);return`<div class="acard" data-goto="watch"><div class="th" style="${grad(v.topic||'fit')}">${imgTag('vid-'+v.id,600,360,'thimg')}<div class="thov"></div><span class="em">${ig?'📸':'▶️'}</span><span class="tp">${ig?'Instagram':'YouTube'}</span></div><div class="rt">${esc(v.title)}</div><div class="rm">${t.l}</div></div>`}).join("")}</div>
  <div class="credit">APEX · train your mind & body<br>A living library — it keeps growing.</div>`;
 wire($("#v-home"));
 $("#homeSearch").onclick=openSearch;
 $("#v-home").querySelectorAll("[data-explore]").forEach(e=>e.onclick=()=>{feedFilter={topic:e.dataset.explore,q:""};feedBuilt=false;buildFeed();$("#feed").scrollTop=0;$("#filtFab").classList.add("filtered");setTab("learn");toast("🧭 "+(T[e.dataset.explore]||T.life).l)});
 startCine($("#cineHero").querySelector("canvas"));
}
/* cinematic canvas: drifting particles/embers */
let cineRaf=null;
function startCine(cv){if(!cv)return;const x=cv.getContext("2d");let W,H,dpr,ps=[];function rs(){dpr=Math.min(2,devicePixelRatio||1);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;x.setTransform(dpr,0,0,dpr,0,0)}rs();ps=[...Array(40)].map(()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.8+.4,s:Math.random()*.4+.1,o:Math.random()}));let t=0;
 function fr(){if(!document.body.contains(cv)){cancelAnimationFrame(cineRaf);return}t++;x.clearRect(0,0,W,H);const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,"#3a2a12");g.addColorStop(.5,"#241a2e");g.addColorStop(1,"#101526");x.fillStyle=g;x.fillRect(0,0,W,H);
  ps.forEach(p=>{p.y-=p.s;p.x+=Math.sin((t+p.o*100)*.01)*.2;if(p.y<-4){p.y=H+4;p.x=Math.random()*W}x.beginPath();x.arc(p.x,p.y,p.r,0,6.28);x.fillStyle=`rgba(243,208,137,${.15+p.o*.35})`;x.fill()});
  cineRaf=requestAnimationFrame(fr)}cancelAnimationFrame(cineRaf);fr()}

/* ===== LEARN (feed) ===== */
let feedBuilt=false,feedMeta=[],feedIO=null;const counted=new Set();let feedLast=-1;
function baseL(k){return 300+Math.floor(sd(k+"L")()*38000)}
function fkey(i){return"f"+i}
function feedHTML(i,inst){const f=FEED[i],[tp,ty,tx,ex,ex2]=f,t=T[tp],k=fkey(i);const liked=!!S.likes[k],saved=!!S.saves[k],own=(S.ownComments[k]||[]).length;const r=sd(k+"h"),h=pick(r,NAMES);
 const tl={fact:"Did you know",idea:"Principle",quote:"Words to keep",finance:"Money",story:"A small story"}[ty]||"";
 let mid=ty==="quote"?`<div class="ctype">${tl}</div><h2 class="insight quote">"${esc(tx)}"</h2><div class="qauthor">${esc(ex)}<span class="role">${esc(ex2||"")}</span></div>`:`<div class="ctype">${tl}</div><h2 class="insight">${esc(tx)}</h2><p class="kicker">${esc(ex)}</p>`;
 return`<section class="card" data-key="${k}" data-i="${i}" data-inst="${inst}" data-topic="${tp}"><div class="bg hasimg" style="${grad(tp)}">${imgTag(tp+"-"+(i%8),900,1400,"cardimg")}</div><div class="grain"></div>
  <span class="ktag"><span class="dot" style="background:${t.c}"></span>${t.e} ${t.l}</span>${mid}
  <div class="meta"><div class="handle">@<span class="at">${h}</span></div><div class="source">APEX · daily</div></div>
  <div class="rail-a">
   <button class="act like ${liked?'on-like':''}" data-a="like"><span class="ico"><svg viewBox="0 0 24 24"><path d="M12 21s-8-4.9-10.3-9.6C.2 8 2 4.7 5.2 4.7c2 0 3.3 1.1 4 2.2.7-1.1 2-2.2 4-2.2 3.2 0 5 3.3 3.5 6.7C20 16.1 12 21 12 21z"/></svg></span><span class="n" data-n="like">${fmt(baseL(k)+(liked?1:0))}</span></button>
   <button class="act" data-a="comment"><span class="ico"><svg viewBox="0 0 24 24"><path d="M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H9l-5 4V5a1 1 0 0 1 1-1z"/></svg></span><span class="n" data-n="comment">${fmt(baseC(k)+own)}</span></button>
   <button class="act save ${saved?'on-save':''}" data-a="save"><span class="ico"><svg viewBox="0 0 24 24"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/></svg></span><span class="n">Save</span></button>
   <button class="act" data-a="ai"><span class="ico"><svg viewBox="0 0 24 24"><path d="M12 2l1.9 4.6L18.5 8l-3.6 3 1.2 4.8L12 13.6 7.9 15.8 9.1 11 5.5 8l4.6-1.4z"/></svg></span><span class="n">AI</span></button>
   <button class="act" data-a="listen"><span class="ico"><svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 5V4L8 9H4zm12.5 3a3.5 3.5 0 0 0-2-3.15v6.3a3.5 3.5 0 0 0 2-3.15z"/></svg></span><span class="n">Listen</span></button>
   <button class="act" data-a="share"><span class="ico"><svg viewBox="0 0 24 24"><path d="M14 9V5l7 7-7 7v-4.1C9 12 6 13 3 17c1-6 5-8 11-8z"/></svg></span><span class="n">Share</span></button>
  </div>${inst===0?'<div class="hint" id="hint"><svg viewBox="0 0 24 24"><path d="M12 4l6 7h-4v9h-4v-9H6z"/></svg>swipe up for more</div>':''}</section>`}
function fseq(){const r=mul((hs("f")()^Date.now())>>>0);
 let idx=FEED.map((_,i)=>i);const q=(feedFilter.q||"").trim().toLowerCase();
 if(feedFilter.topic!=="all")idx=idx.filter(i=>FEED[i][0]===feedFilter.topic);
 if(feedFilter.diff&&feedFilter.diff!=="all")idx=idx.filter(i=>diffOf(FEED[i][0])===feedFilter.diff);
 if(q)idx=idx.filter(i=>((FEED[i][2]||"")+" "+(FEED[i][3]||"")+" "+(FEED[i][4]||"")).toLowerCase().includes(q));
 if(idx.length===0)idx=FEED.map((_,i)=>i);
 const ints=(S.interests&&S.interests.length)?new Set(S.interests):null,aff=S.affinity||{};
 if(feedFilter.topic==="all"&&!q){const score=i=>{const tp=FEED[i][0];let s=r()*3;if(ints&&ints.has(tp))s+=4;s+=(aff[tp]||0)*0.5;return s};idx.sort((a,b)=>score(b)-score(a))}
 else{for(let i=idx.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[idx[i],idx[j]]=[idx[j],idx[i]]}}
 return idx}
function fappend(){const s=feedMeta.length,seq=fseq();let h="";seq.forEach((idx,k)=>{feedMeta.push(idx);h+=feedHTML(idx,s+k)});$("#feed").insertAdjacentHTML("beforeend",h);fobserve()}
function buildFeed(){if(feedBuilt)return;feedBuilt=true;$("#feed").innerHTML="";feedMeta=[];fappend()}
function fobserve(){if(!feedIO)feedIO=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting&&e.intersectionRatio>.65)factive(e.target)}),{root:$("#feed"),threshold:[.66]});$("#feed").querySelectorAll(".card:not([data-obs])").forEach(c=>{c.setAttribute("data-obs","1");feedIO.observe(c)})}
function factive(card){const inst=+card.dataset.inst;if(inst>=feedMeta.length-3)fappend();const fi=+card.dataset.i,ff=FEED[fi];if(ff)logHist("idea","f"+fi,ff[0],ff[2]);if(S.audioAuto&&ff)speak(ff[2]+". "+(ff[3]||""));if(!counted.has(inst)){counted.add(inst);if(feedLast>=0)S.streak+=0;bump();S.reads++;feedLast=inst;if(aiConfigured()&&S.reads%16===0)aiExpandFeed();const ms={5:"🔥 5 in a row",15:"🧠 15 read — big brain",30:"🏆 30! deep in it"}[S.reads];addXP(8,ms||`<span class="xp">+8 XP</span>`)}}
function scrollFeedTo(i){buildFeed();let c=[...$("#feed").querySelectorAll(".card")].find(x=>+x.dataset.i===i);if(!c){fappend();c=[...$("#feed").querySelectorAll(".card")].reverse().find(x=>+x.dataset.i===i)}if(c)requestAnimationFrame(()=>c.scrollIntoView())}
$("#feed").addEventListener("click",e=>{const b=e.target.closest(".act");if(!b)return;const card=b.closest(".card"),k=card.dataset.key,tp=card.dataset.topic,a=b.dataset.a;
 if(a==="like")like(k,b);else if(a==="save")sv(k,b);else if(a==="comment")openC(k,tp);else if(a==="ai"){const f=FEED[+card.dataset.i];openAI(f[2],(f[3]||f[4]||""),tp)}else if(a==="listen"){const f=FEED[+card.dataset.i];speak(f[2]+". "+(f[3]||f[4]||""));toast("🔊 reading aloud")}else if(a==="share"){const f=FEED[+card.dataset.i];openShare(f[0],f[2],f[1]==="quote"?(f[3]+(f[4]?" — "+f[4]:"")):f[3],f[1])}});
let lastTap=0;$("#feed").addEventListener("click",e=>{if(e.target.closest(".act"))return;const n=Date.now();if(n-lastTap<300){const c=e.target.closest(".card");if(c){const lb=c.querySelector(".like");if(!S.likes[c.dataset.key])lb.click();else{lb.classList.add("pop");setTimeout(()=>lb.classList.remove("pop"),400)}}}lastTap=n});
$("#feed").addEventListener("scroll",()=>{const h=$("#hint");if(h&&$("#feed").scrollTop>40){h.style.opacity=0;setTimeout(()=>h.remove(),400)}},{passive:true});
/* swipe: right = save, left = skip */
(function(){const feed=$("#feed");let sx=0,sy=0,card=null,drag=false;
 feed.addEventListener("pointerdown",e=>{if(e.target.closest(".rail-a"))return;card=e.target.closest(".card");sx=e.clientX;sy=e.clientY;drag=false});
 feed.addEventListener("pointermove",e=>{if(!card)return;const dx=e.clientX-sx,dy=e.clientY-sy;
  if(!drag){if(Math.abs(dx)>14&&Math.abs(dx)>Math.abs(dy)*1.6)drag=true;else if(Math.abs(dy)>12){card=null;return}}
  if(drag){card.style.transition="none";card.style.transform=`translateX(${dx}px) rotate(${dx*0.02}deg)`;card.style.opacity=String(Math.max(.45,1-Math.abs(dx)/520))}});
 const reset=c=>{c.style.transition="transform .25s cubic-bezier(.3,1,.4,1),opacity .25s";c.style.transform="";c.style.opacity=""};
 feed.addEventListener("pointerup",e=>{if(!card){return}const c=card;card=null;if(!drag){return}const dx=e.clientX-sx;
  if(dx>92){const k=c.dataset.key,tp=c.dataset.topic;if(!S.saves[k]){S.saves[k]=true;bumpAff(tp,3);save();const lb=c.querySelector(".save");if(lb)lb.classList.add("on-save");toast("🔖 saved")}reset(c)}
  else if(dx<-92){bumpAff(c.dataset.topic,-1);save();reset(c);const f=feed,h=f.clientHeight,cur2=Math.round(f.scrollTop/h);f.scrollTo({top:(cur2+1)*h,behavior:"smooth"});toast("⏭️ skipped")}
  else reset(c);drag=false});
 feed.addEventListener("pointercancel",()=>{if(card){card.style.transform="";card.style.opacity="";card=null}});
})();
function like(k,b){const on=!S.likes[k];S.likes[k]=on;if(b){const tp=b.closest(".card")?.dataset.topic;if(tp)bumpAff(tp,on?2:-2);b.classList.toggle("on-like",on);b.classList.add("pop");setTimeout(()=>b.classList.remove("pop"),400);const n=b.querySelector('[data-n="like"]');if(n)n.textContent=fmt(baseL(k)+(on?1:0))}save()}
function sv(k,b){const on=!S.saves[k];S.saves[k]=on;if(b){const tp=b.closest(".card")?.dataset.topic;if(tp)bumpAff(tp,on?3:-1);b.classList.toggle("on-save",on);b.classList.add("pop");setTimeout(()=>b.classList.remove("pop"),400)}toast(on?"🔖 saved":"removed");save()}
function shareT(t,s){const text=`${t}${s?"\n\n"+s:""}\n\n— via APEX`;if(navigator.share)navigator.share({text}).catch(()=>{});else if(navigator.clipboard)navigator.clipboard.writeText(text).then(()=>toast("📋 copied")).catch(()=>toast("copied"));else toast("share unavailable")}

/* ===== COMMENTS SHEET ===== */
const cs=$("#cmtSheet"),cl=$("#commentsList"),cc=$("#cmtCount");let cK=null,cT=null,cB=0,cArr=[];
function rc(c){const d=document.createElement("div");d.className="cmt";d.innerHTML=`<div class="ava" style="background:${c.own?'var(--grad-gold)':avaC(c.name)}">${c.own?'Y':ini(c.name)}</div><div class="cbody"><div class="tp"><span class="un">@${c.own?'you':esc(c.name)}</span>${c.own?'<span class="bd">you</span>':''}<span class="tm">· ${c.time}</span></div><div class="tx"></div><div class="ca"><button data-like><svg style="width:14px;height:14px;vertical-align:-2px;fill:currentColor" viewBox="0 0 24 24"><path d="M12 21s-8-4.9-10.3-9.6C.2 8 2 4.7 5.2 4.7c2 0 3.3 1.1 4 2.2.7-1.1 2-2.2 4-2.2 3.2 0 5 3.3 3.5 6.7C20 16.1 12 21 12 21z"/></svg> <span>${fmt(c.likes)}</span></button><button>Reply</button></div></div>`;d.querySelector(".tx").textContent=c.txt;const lb=d.querySelector("[data-like]");lb.onclick=()=>{c.liked=!c.liked;c.likes+=c.liked?1:-1;lb.classList.toggle("liked",c.liked);lb.querySelector("span").textContent=fmt(c.likes)};return d}
function drawC(){cl.innerHTML="";const own=(S.ownComments[cK]||[]).map(txt=>({own:true,txt,time:"now",likes:0}));[...own,...cArr].forEach(c=>cl.appendChild(rc(c)));const m=document.createElement("button");m.className="loadmore";m.textContent="load more";m.onclick=()=>{cB++;cArr=cArr.concat(gen(cK,cT,6,cB));drawC();cl.scrollTop=cl.scrollHeight-240};cl.appendChild(m);cc.textContent=fmt(baseC(cK)+own.length)+" comments"}
async function openC(k,tp){cK=k;cT=tp;cB=0;cArr=gen(k,tp,8,0);drawC();openSheet(cs);
 if(S.apiBase){try{const r=await fetch(S.apiBase+"/comments/"+encodeURIComponent(k));const j=await r.json();if(cK===k&&j&&j.items){cArr=j.items.map(c=>({name:c.name||"guest",txt:c.txt,likes:c.likes||0,time:timeAgo(c.t)})).concat(cArr).slice(0,60);drawC()}}catch(e){}}}
function myId(){if(!S.uid){S.uid="u"+Math.random().toString(36).slice(2,10);save()}return S.uid}
async function openLeaderboard(){openSearch();$("#sIn").placeholder="🏆 Leaderboard";const res=$("#sRes");res.innerHTML=`<div class="aidots" style="display:flex;justify-content:center;padding:24px"><i></i><i></i><i></i></div>`;
 try{await fetch(S.apiBase+"/leaderboard",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:myId(),name:S.name||"You",xp:S.xp,streak:S.streak})}).catch(()=>{});
  const r=await fetch(S.apiBase+"/leaderboard");const j=await r.json();const rows=(j.top||[]).sort((a,b)=>(b.xp||0)-(a.xp||0));
  if(!rows.length){res.innerHTML=`<div class="shint">No scores yet — you're first on the board! 🏆</div>`;return}
  res.innerHTML="";rows.slice(0,50).forEach((u,i)=>{const el=document.createElement("div");el.className="sr";const mine=u.id===S.uid;el.innerHTML=`<div class="srt" style="${grad('genius')};font-size:16px;font-weight:800">${i<3?["🥇","🥈","🥉"][i]:'#'+(i+1)}</div><div class="sri"><div class="srk">Lv ${levelFor(u.xp||0)} · 🔥 ${u.streak||0}${mine?' · you':''}</div><div class="srn">${esc(u.name||'Anon')} · ${u.xp||0} XP</div></div>`;res.appendChild(el)});
 }catch(e){res.innerHTML=`<div class="shint">Couldn't reach the leaderboard.<br>Check your server URL in Settings → Connect your server.</div>`}}
$("#cmtSend").onclick=postC;$("#cmtInput").addEventListener("keydown",e=>{if(e.key==="Enter")postC()});
function postC(){const i=$("#cmtInput"),v=i.value.trim();if(!v||!cK)return;if(!S.ownComments[cK])S.ownComments[cK]=[];S.ownComments[cK].unshift(v);i.value="";save();drawC();cl.scrollTop=0;toast("💬 posted");addXP(3);
 if(S.apiBase){fetch(S.apiBase+"/comments/"+encodeURIComponent(cK),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:S.name||"You",txt:v,id:myId()})}).catch(()=>{})}
 const card=$("#feed").querySelector(`.card[data-key="${cK}"]`);if(card){const n=card.querySelector('[data-n="comment"]');if(n)n.textContent=fmt(baseC(cK)+S.ownComments[cK].length)}}

/* ===== TRAIN ===== */
let trainFilter="All";
function renderTrain(){
 const items=[...WORKOUTS.map(w=>({...w,type:"workout"})),...SESSIONS.map(s=>({...s,type:"session"}))];
 const cats=["All","Mind","HIIT","Core","Strength","Mobility"];
 const list=items.filter(w=>trainFilter==="All"||w.cat===trainFilter);
 $("#v-train").innerHTML=`
  <div class="top"><div class="h1">Train</div><div class="sub">Body & mind · no equipment · works offline</div></div>
  <div class="filters">${cats.map(c=>`<div class="fchip ${c===trainFilter?'on':''}" data-f="${c}">${c}</div>`).join("")}</div>
  <div class="rowlist">${list.map(w=>{const col=CATW[w.cat]||"#e8b563";const meta=w.type==="workout"?`⏱ ${wMin(w)} min · 🔁 ${w.rounds} rounds · ${w.level}`:`${w.level}`;const sub=w.type==="workout"?w.ex.filter(e=>!/rest/i.test(e[0])).slice(0,4).map(e=>e[0]).join(" · "):w.desc;
   return`<div class="row" data-start="${w.id}" data-type="${w.type}"><div class="rth" style="background:linear-gradient(150deg,${col},#1d1d2a 130%)">${w.type==="session"?"🧘":(w.cat==="HIIT"?"🔥":w.cat==="Core"?"🎯":w.cat==="Strength"?"💪":"🧩")}</div>
    <div class="ri"><div class="rtp">${w.type==="session"?"Mindfulness":w.cat}</div><div class="rn">${esc(w.title)}</div><div class="rd">${esc(sub)}</div><div class="rm"><span>${meta}</span></div></div>
    <button class="play2" aria-label="Start"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></button></div>`}).join("")}</div>
  <div class="credit">Every timer & breathing session runs fully offline.</div>`;
 wire($("#v-train"));
 $("#v-train").querySelectorAll(".fchip").forEach(c=>c.onclick=()=>{trainFilter=c.dataset.f;renderTrain()});
 $("#v-train").querySelectorAll(".row").forEach(row=>row.onclick=()=>{const id=row.dataset.start;if(row.dataset.type==="session")startSession(id);else startWorkout(id)});
}

/* ===== WATCH ===== */
let watchPlat="YouTube";
function renderWatch(){
 const vids=S.videos;
 $("#v-watch").innerHTML=`
  <div class="top"><div class="h1">Watch</div><div class="sub">Real creators — YouTube, TikTok, Instagram</div></div>
  <div class="addbar"><input id="watchUrl" placeholder="Paste any video link…" autocomplete="off"><button id="watchAdd">Add</button></div>
  <div class="platseg">${["YouTube","TikTok","Instagram"].map(p=>`<button class="${p===watchPlat?'on':''}" data-plat="${p}">${p}</button>`).join("")}</div>
  <div class="searchchips">${WATCH_TOPICS.map(c=>`<a class="schip" data-search="${esc(c)}">🔎 ${esc(c)}</a>`).join("")}</div>
  <div class="note">💡 YouTube clips play right here in-app — tap to watch. Instagram &amp; TikTok open on their app (they don't allow embedding). Paste any link to add it to your feed.</div>
  <div class="vfeed" id="vfeed">${vids.length?vids.map(vHTML).join(""):`<div class="empty"><div class="big">🎬</div>Your feed is empty.<br>Tap a topic above to find creators, then paste a link.</div>`}</div>
  <div class="credit">Tip: on the platform, Share → Copy link → paste here.</div>`;
 wire($("#v-watch"));
 $("#v-watch").querySelectorAll("[data-plat]").forEach(b=>b.onclick=()=>{watchPlat=b.dataset.plat;renderWatch()});
 $("#v-watch").querySelectorAll("[data-search]").forEach(a=>a.onclick=()=>window.open(searchURL(watchPlat,a.dataset.search),"_blank","noopener"));
 $("#watchAdd").onclick=()=>{const v=$("#watchUrl").value,p=parseVideo(v);if(!p){toast("that link didn't parse");return}S.videos.unshift({id:"v"+Date.now(),url:v,title:"",topic:"life"});save();$("#watchUrl").value="";renderWatch();toast("✅ added")};
 $("#watchUrl").addEventListener("keydown",e=>{if(e.key==="Enter")$("#watchAdd").click()});
 $("#vfeed").querySelectorAll(".vcard").forEach(bindV);
}
function vHTML(v){const p=parseVideo(v.url)||{platform:"Link",kind:"link"},saved=!!S.saves[v.id],vert=p.vert?" vert":"";
 const inline=p.kind==="iframe"&&(p.platform==="YouTube"||p.platform==="Vimeo"||p.kind==="video");
 return`<div class="vcard" data-id="${v.id}" data-embed="${esc(p.embed||"")}" data-kind="${p.kind}" data-plat="${p.platform}" data-inline="${inline?1:0}" data-open="${esc(p.open||v.url)}"><div class="vframe${vert}"><div class="vposter" style="${grad(v.topic||'fit')}">
  <span class="plat" style="color:${PLAT_COLOR[p.platform]||'#fff'}">${p.platform}</span><button class="pbtn" aria-label="Play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></button><span class="sm">${inline?"Tap to play":"Opens on "+p.platform+" ↗"}</span></div></div>
  <div class="vmeta"><div class="vinfo"><div class="vttl">${esc(v.title||"Untitled clip")}</div><div class="vsrc">${p.platform}${v.seed?" · curated":""}</div></div>
   <div class="vact"><button data-a="save" class="${saved?'on-save':''}" aria-label="Save"><svg viewBox="0 0 24 24"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/></svg></button><button data-a="remove" aria-label="Remove"><svg viewBox="0 0 24 24"><path d="M6 7h12l-1 13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1zM9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></button></div></div></div>`}
function bindV(card){card.querySelector(".vposter").onclick=()=>{const embed=card.dataset.embed,open=card.dataset.open,inline=card.dataset.inline==="1";
  if(inline&&embed){const src=embed+(embed.includes("?")?"&":"?")+"autoplay=1";const frame=card.querySelector(".vframe");
   frame.innerHTML=`<iframe src="${esc(src)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>`;}
  else{window.open(open,"_blank","noopener")}
  const vv=(S.videos||[]).find(v=>v.id===card.dataset.id);if(vv)logHist("video",vv.id,vv.topic||"fit",vv.title||"Video");
  addXP(4);bump();save()};
 card.querySelectorAll("[data-a]").forEach(b=>b.onclick=e=>{e.stopPropagation();const id=card.dataset.id,a=b.dataset.a;if(a==="save"){S.saves[id]=!S.saves[id];b.classList.toggle("on-save",S.saves[id]);save();toast(S.saves[id]?"🔖 saved":"removed")}else{S.videos=S.videos.filter(v=>v.id!==id);save();renderWatch();toast("removed")}})}

/* ===== READER ===== */
const reader=$("#reader");
function openReader(id){const a=ARTICLES.find(x=>x.id===id);if(!a)return;const t=T[a.topic],k=a.id,liked=!!S.likes[k],saved=!!S.saves[k];
 reader.innerHTML=`<div class="rprog" id="rprog"></div><div class="rback"><button data-rback aria-label="Back"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button><span class="rbt">${a.minutes} min · ${t.e} ${t.l}</span></div>
  <div class="rhero" style="${grad(a.topic)}">${imgTag(a.img||a.id,900,500,"rhimg")}<div class="rhov"></div><span class="em">${a.emoji}</span></div>
  <article class="article"><div class="atopic">${t.e} ${t.l}</div><h1>${esc(a.title)}</h1><p class="dek">${esc(a.dek)}</p>
   <div class="byline"><div class="ba2">A</div><div><b>${esc(a.author)}</b><br><span>APEX Originals</span></div><button class="aibtn" data-rai style="margin-left:auto"><svg viewBox="0 0 24 24"><path d="M12 2l1.9 4.6L18.5 8l-3.6 3 1.2 4.8L12 13.6 7.9 15.8 9.1 11 5.5 8l4.6-1.4z"/></svg>AI</button></div>
   <div class="body">${a.body.map(b=>b[0]==="h"?`<h2>${esc(b[1])}</h2>`:b[0]==="pull"?`<div class="pull">${esc(b[1])}</div>`:`<p>${esc(b[1])}</p>`).join("")}</div>
   <div class="end"><button class="prim" data-rlike><svg viewBox="0 0 24 24"><path d="M12 21s-8-4.9-10.3-9.6C.2 8 2 4.7 5.2 4.7c2 0 3.3 1.1 4 2.2.7-1.1 2-2.2 4-2.2 3.2 0 5 3.3 3.5 6.7C20 16.1 12 21 12 21z"/></svg>${liked?'Liked':'Like'}</button><button data-rsave><svg viewBox="0 0 24 24"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/></svg>${saved?'Saved':'Save'}</button><button data-rlisten><svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 5V4L8 9H4zm12.5 3a3.5 3.5 0 0 0-2-3.15v6.3a3.5 3.5 0 0 0 2-3.15z"/></svg>Listen</button><button data-rcmt><svg viewBox="0 0 24 24"><path d="M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H9l-5 4V5a1 1 0 0 1 1-1z"/></svg>Reflect</button></div></article>`;
 reader.classList.add("show");reader.scrollTop=0;const prog=reader.querySelector("#rprog");let aw=!!S.done["r"+k];
 reader.onscroll=()=>{const mx=reader.scrollHeight-reader.clientHeight,pct=mx>0?reader.scrollTop/mx*100:0;prog.style.width=pct+"%";S.readProgress[k]=Math.max(S.readProgress[k]||0,pct);if(pct>85&&!aw){aw=true;S.done["r"+k]=true;S.reads++;bump();addXP(25,"📖 finished — <span class=xp>+25 XP</span>")}if(pct>2)save()};
 reader.querySelector("[data-rback]").onclick=closeReader;
 reader.querySelector("[data-rlike]").onclick=e=>{S.likes[k]=!S.likes[k];save();e.currentTarget.lastChild.textContent=S.likes[k]?'Liked':'Like'};
 reader.querySelector("[data-rsave]").onclick=e=>{S.saves[k]=!S.saves[k];save();e.currentTarget.lastChild.textContent=S.saves[k]?'Saved':'Save';toast(S.saves[k]?"🔖 saved":"removed")};
 reader.querySelector("[data-rcmt]").onclick=()=>openC(k,a.topic);
 reader.querySelector("[data-rlisten]").onclick=()=>{speak(a.title+". "+a.body.filter(x=>x[0]==="p").map(x=>x[1]).join(" "));toast("🔊 reading the article")};
 reader.querySelector("[data-rai]").onclick=()=>openAI(a.title,a.dek,a.topic);
 logHist("article",a.id,a.topic,a.title);
}
function closeReader(){reader.classList.remove("show");reader.onscroll=null;stopSpeak();save();if(cur==="home")renderHome()}

/* ===== TIMER + BREATHE ===== */
const timerEl=$("#timer");let TT=null,ac=null;
function beep(f,d,v){try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=f;o.connect(g);g.connect(ac.destination);g.gain.setValueAtTime(v||.2,ac.currentTime);o.start();g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+(d||.15));o.stop(ac.currentTime+(d||.15))}catch(e){}}
function startWorkout(id){const w=WORKOUTS.find(x=>x.id===id);if(!w)return;TT={w,st:steps(w),i:0,rem:0,paused:false,raf:null,last:0,rounds:w.rounds,kind:"workout"};TT.rem=TT.st[0].dur;timerEl.classList.add("show");drawTimer();tick();beep(660,.12)}
function drawTimer(){if(!TT)return;const st=TT.st[TT.i],nx=TT.st[TT.i+1],w=TT.w,pct=st.dur?TT.rem/st.dur:0,c=2*Math.PI*112;
 timerEl.className="timer show "+(st.rest?"tmr-rest rest":"tmr-work work");
 timerEl.innerHTML=`<div class="tmr-top"><button id="tc" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg></button><div class="tt">${esc(w.title)}<small>Round ${st.round}/${TT.rounds} · ${TT.i+1}/${TT.st.length}</small></div></div>
  <div class="tmr-mid"><div class="tmr-phase">${st.rest?"Rest":"Work"}</div><div class="tmr-ring"><svg viewBox="0 0 250 250"><circle cx="125" cy="125" r="112" fill="none" stroke="rgba(255,255,255,.09)" stroke-width="10"/><circle id="arc" cx="125" cy="125" r="112" fill="none" stroke="${st.rest?'#37d68a':'#ff4d6d'}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c*(1-pct)}" transform="rotate(-90 125 125)"/></svg><div class="tmr-count" id="cnt">${Math.ceil(TT.rem)}</div></div>
   <div class="tmr-ex">${esc(st.name)}</div>${st.cue?`<div class="tmr-cue">${esc(st.cue)}</div>`:""}<div class="tmr-next">${nx?"Next · "+esc(nx.name):"Last one — finish strong!"}</div></div>
  <div class="tmr-ctrl"><button class="skip" id="tp"><svg viewBox="0 0 24 24"><path d="M7 6v12M20 6l-9 6 9 6z"/></svg></button><button class="pp" id="tpp"><svg viewBox="0 0 24 24"><path d="${TT.paused?'M8 5v14l11-7z':'M7 5h4v14H7zM13 5h4v14h-4z'}"/></svg>${TT.paused?"Resume":"Pause"}</button><button class="skip" id="tn"><svg viewBox="0 0 24 24"><path d="M17 6v12M4 6l9 6-9 6z"/></svg></button></div>`;
 $("#tc").onclick=stopTimer;$("#tpp").onclick=()=>{TT.paused=!TT.paused;TT.last=performance.now();drawTimer()};$("#tn").onclick=()=>adv(1);$("#tp").onclick=()=>adv(-1)}
function tick(){if(!TT||TT.kind!=="workout")return;TT.raf=requestAnimationFrame(tick);const now=performance.now();if(!TT.last)TT.last=now;const dt=(now-TT.last)/1000;TT.last=now;if(TT.paused)return;const prev=TT.rem;TT.rem-=dt;if(Math.ceil(prev)!==Math.ceil(TT.rem)&&TT.rem>0&&TT.rem<=3.05)beep(880,.08,.25);const st=TT.st[TT.i],cnt=$("#cnt"),arc=$("#arc");if(cnt)cnt.textContent=Math.max(0,Math.ceil(TT.rem));if(arc&&st.dur){const c=2*Math.PI*112;arc.setAttribute("stroke-dashoffset",c*(1-Math.max(0,TT.rem)/st.dur))}if(TT.rem<=0){beep(st.rest?660:520,.18,.3);adv(1)}}
function adv(d){if(!TT)return;TT.i+=d;if(TT.i>=TT.st.length)return finishW();if(TT.i<0)TT.i=0;TT.rem=TT.st[TT.i].dur;TT.last=performance.now();TT.paused=false;drawTimer()}
function finishW(){const w=TT.w;cancelAnimationFrame(TT.raf);const m=wMin(w);S.workouts++;S.minutes+=m;bump();addXP(30);beep(784,.15);setTimeout(()=>beep(1046,.2),160);save();timerEl.className="timer show";timerEl.innerHTML=`<div class="tmr-done"><div class="big">🎉</div><h2>Workout complete</h2><p>${esc(w.title)} · ${m} active min · +30 XP</p><button id="td">Done</button></div>`;$("#td").onclick=()=>{stopTimer()};TT=null}
function stopTimer(){if(TT){cancelAnimationFrame(TT.raf);if(TT.btimer)clearTimeout(TT.btimer);TT=null}timerEl.classList.remove("show");setTimeout(()=>timerEl.innerHTML="",300);if(cur==="train")renderTrain();if(cur==="home")renderHome()}
/* breathing / meditation */
function startSession(id){const s=SESSIONS.find(x=>x.id===id);if(!s)return;timerEl.classList.add("show");
 if(s.kind==="breathe")runBreathe(s);else runMeditate(s)}
function runBreathe(s){const labels=["Inhale","Hold","Exhale","Hold"];let cycle=0,phase=0;TT={kind:"breathe"};
 timerEl.className="timer show breathe";
 timerEl.innerHTML=`<div class="tmr-top"><button id="tc"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg></button><div class="tt">${esc(s.title)}<small>Follow the orb · <span id="cyc">${s.cycles}</span> cycles left</small></div></div>
  <div class="tmr-mid"><div class="breathe-orb" id="orb"><span class="bl" id="bl">Ready</span></div><div class="tmr-cue" style="margin-top:26px">${esc(s.desc)}</div></div>
  <div class="tmr-ctrl"><button class="pp" id="tpp">Breathe with it</button></div>`;
 $("#tc").onclick=stopTimer;
 const orb=$("#orb"),bl=$("#bl");let running=false;
 function next(){if(!TT){return}const dur=s.pattern[phase];if(dur===0){phase=(phase+1)%4;return next()}bl.textContent=labels[phase];
  orb.style.transitionDuration=dur+"s";orb.style.transform=(phase===0)?"scale(1.35)":(phase===2)?"scale(.75)":orb.style.transform;
  if(phase===0)beep(330,.12,.12);if(phase===2)beep(247,.16,.12);
  TT.btimer=setTimeout(()=>{phase++;if(phase>3){phase=0;cycle++;const left=s.cycles-cycle;$("#cyc").textContent=Math.max(0,left);if(cycle>=s.cycles)return finishSession(s)}next()},dur*1000)}
 $("#tpp").onclick=()=>{if(running)return;running=true;$("#tpp").textContent="Breathing…";phase=0;cycle=0;next()};
}
function runMeditate(s){let rem=s.secs;TT={kind:"meditate"};timerEl.className="timer show breathe";
 const c=2*Math.PI*112;
 timerEl.innerHTML=`<div class="tmr-top"><button id="tc"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg></button><div class="tt">${esc(s.title)}<small>Just follow the breath</small></div></div>
  <div class="tmr-mid"><div class="tmr-ring"><svg viewBox="0 0 250 250"><circle cx="125" cy="125" r="112" fill="none" stroke="rgba(255,255,255,.09)" stroke-width="10"/><circle id="arc" cx="125" cy="125" r="112" fill="none" stroke="#7fb0ff" stroke-width="10" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="0" transform="rotate(-90 125 125)"/></svg><div class="tmr-count" id="cnt" style="font-size:56px">${mmss(rem)}</div></div><div class="tmr-cue">${esc(s.desc)}</div></div>
  <div class="tmr-ctrl"><button class="pp" id="tpp"><svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>Pause</button></div>`;
 $("#tc").onclick=stopTimer;let paused=false,last=performance.now();$("#tpp").onclick=()=>{paused=!paused;last=performance.now()};
 if(!Music.isPlaying()){Music.toggle();syncMusicUI()}
 function loop(){if(!TT||TT.kind!=="meditate")return;requestAnimationFrame(loop);const now=performance.now();const dt=(now-last)/1000;last=now;if(paused)return;rem-=dt;const cnt=$("#cnt"),arc=$("#arc");if(cnt)cnt.textContent=mmss(Math.max(0,rem));if(arc)arc.setAttribute("stroke-dashoffset",c*(1-rem/s.secs));if(rem<=0)finishSession(s)}
 requestAnimationFrame(loop)}
function finishSession(s){if(TT&&TT.btimer)clearTimeout(TT.btimer);TT=null;S.sessions++;bump();addXP(20);beep(660,.14);setTimeout(()=>beep(880,.18),160);save();timerEl.className="timer show";timerEl.innerHTML=`<div class="tmr-done"><div class="big">🧘</div><h2>Session complete</h2><p>${esc(s.title)} · +20 XP<br>Carry the calm with you.</p><button id="td">Done</button></div>`;$("#td").onclick=stopTimer}

/* ===== YOU ===== */
function renderYou(){const lvl=levelFor(S.xp),p=xpIn(S.xp),pct=Math.round(p.cur/p.need*100),c=2*Math.PI*33,saved=savedIds();
 const quizzesDone=Object.keys(S.quizBest).length,storiesDone=Object.keys(S.storiesSeen).length,mapsDone=Object.keys(S.mapsSeen).length,aces=Object.values(S.quizBest).filter(p=>p===100).length;
 const ach=[{e:"🌱",n:"Day one",d:"First read",g:S.reads>=1},{e:"🔥",n:"Streak x3",d:"3-day streak",g:S.streak>=3},{e:"📖",n:"Scholar",d:"Finish an article",g:Object.keys(S.done).some(k=>k[0]==="r")},{e:"🎖️",n:"Forged",d:"3 workouts",g:S.workouts>=3},{e:"🧘",n:"Still mind",d:"3 sessions",g:S.sessions>=3},{e:"🧩",n:"Quizzed",d:"Take a quiz",g:quizzesDone>=1},{e:"💯",n:"Perfect",d:"Ace a quiz",g:aces>=1},{e:"✨",n:"Storyteller",d:"Read 3 stories",g:storiesDone>=3},{e:"🗺️",n:"Cartographer",d:"Explore 3 maps",g:mapsDone>=3},{e:"💬",n:"Voice",d:"Post a reflection",g:Object.values(S.ownComments).some(a=>a.length)},{e:"🔖",n:"Curator",d:"Save 5",g:saved.length>=5},{e:"🚀",n:"Ascend",d:"Reach Lv 6",g:lvl>=6}];
 const hist=(S.history||[]).slice(0,12);
 $("#v-you").innerHTML=`<div class="prof"><div class="pring" id="pEdit"><svg viewBox="0 0 92 92"><circle cx="46" cy="46" r="33" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="6"/><circle cx="46" cy="46" r="33" fill="none" stroke="url(#gg)" stroke-width="6" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c*(1-pct/100)}" transform="rotate(-90 46 46)"/></svg><div class="pa edit">${esc(S.avatar||'A')}</div></div><div class="namerow"><div class="pn">${esc(S.name||'You')}</div><button class="editp" id="pEdit2" aria-label="Edit profile"><svg viewBox="0 0 24 24"><path d="M4 20h4L18 10l-4-4L4 16v4zM17 3l4 4"/></svg></button></div><div class="pl">Level ${lvl} · ${p.cur}/${p.need} XP to Level ${lvl+1}</div></div>
  <div class="statgrid"><div class="scell"><div class="sv">${S.streak}</div><div class="sl">Streak</div></div><div class="scell"><div class="sv">${S.reads}</div><div class="sl">Read</div></div><div class="scell"><div class="sv">${S.workouts+S.sessions}</div><div class="sl">Trained</div></div><div class="scell"><div class="sv">${saved.length}</div><div class="sl">Saved</div></div></div>
  <div class="sec"><h3>📱 Make it an app</h3></div>
  <div style="padding:0 18px"><div class="iconbox"><canvas id="appIcon" width="70" height="70"></canvas><div><div class="ibt">Install APEX</div><div class="ibd">Add APEX to your home screen for a full-screen, offline app. On iPhone: Share → “Add to Home Screen”.</div><button class="dl" id="installBtn"><svg viewBox="0 0 24 24"><path d="M12 3v10m0 0l-4-4m4 4l4-4M4 17v3h16v-3"/></svg>Install app</button></div></div></div>
  <div class="sec"><h3>⚙️ Settings</h3></div>
  <div style="padding:0 18px">
   <div class="settingrow"><span class="se">🔔</span><div class="si"><b>Daily idea reminder</b><p>A fresh idea each day to keep your streak alive.</p></div><div class="toggle ${S.notify?'on':''}" id="notifyTog" role="switch" aria-checked="${S.notify}"></div></div>
   <div class="settingrow"><span class="se">🎯</span><div class="si"><b>Your interests</b><p>${S.interests&&S.interests.length?esc(S.interests.map(k=>(T[k]||T.life).l).join(" · ")):'Not set — personalize your feed'}</p></div><button class="dl" id="editInterests" style="padding:9px 13px;font-size:13px">Edit</button></div>
   <div class="settingrow"><span class="se">✨</span><div class="si"><b>AI overview (Gemini)</b><p>${S.apiBase?'Using your server — no key needed.':S.geminiKey?'Key added — AI enabled on this device.':'Add a free Gemini key to explain any idea, quiz you, and grow the feed.'}</p></div><button class="dl" id="aiKeyBtn" style="padding:9px 13px;font-size:13px">${S.geminiKey?'Change':'Add key'}</button></div>
   <div class="settingrow"><span class="se">🌗</span><div class="si"><b>Appearance</b><p>Theme &amp; accent color</p></div><div class="toggle ${S.theme==='light'?'':'on'}" id="themeTog" role="switch" title="dark / light"></div></div>
   <div style="display:flex;gap:9px;margin:-4px 2px 8px">${Object.keys(ACCENTS).map(a=>`<button data-accent="${a}" aria-label="${a}" style="width:30px;height:30px;border-radius:50%;border:2px solid ${S.accent===a?'var(--text)':'transparent'};background:linear-gradient(135deg,${ACCENTS[a][0]},${ACCENTS[a][2]});cursor:pointer"></button>`).join("")}</div>
   <div class="settingrow"><span class="se">🔊</span><div class="si"><b>Auto read-aloud</b><p>Speak each idea as it appears in the feed.</p></div><div class="toggle ${S.audioAuto?'on':''}" id="audioTog" role="switch"></div></div>
   <div class="settingrow"><span class="se">🛰️</span><div class="si"><b>Connect your server</b><p>${S.apiBase?esc(S.apiBase):'Optional: a Cloudflare Worker for shared comments, leaderboard &amp; keyless AI.'}</p></div><button class="dl" id="apiBtn" style="padding:9px 13px;font-size:13px">${S.apiBase?'Change':'Set URL'}</button></div>
   ${S.apiBase?`<div class="settingrow"><span class="se">🏆</span><div class="si"><b>Leaderboard</b><p>See how your XP ranks.</p></div><button class="dl" id="lbBtn" style="padding:9px 13px;font-size:13px">Open</button></div>`:''}
   <div class="settingrow"><span class="se">💾</span><div class="si"><b>Backup &amp; restore</b><p>Your progress lives on this device — save a copy or move it to another.</p></div></div>
   <div class="setbtns"><button id="expBtn"><svg viewBox="0 0 24 24"><path d="M12 3v10m0 0l-4-4m4 4l4-4M4 17v3h16v-3"/></svg>Export</button><button id="impBtn"><svg viewBox="0 0 24 24"><path d="M12 21V11m0 0l-4 4m4-4l4 4M4 7V4h16v3"/></svg>Import</button></div>
   <input type="file" id="impFile" accept="application/json,.json" style="display:none">
  </div>
  <div class="sec"><h3>🏅 Achievements</h3><div class="achv">${ach.map(a=>`<div class="ba ${a.g?'':'locked'}"><div class="be">${a.e}</div><div class="bn">${a.n}</div><div class="bd">${a.d}</div></div>`).join("")}</div></div>
  <div class="sec"><h3>📁 Collections</h3></div>
  <div class="colls">${S.collections.map(c=>`<div class="coll" data-open-coll="${c.id}"><span class="ce">📁</span><div class="cn">${esc(c.name)}</div><div class="cc">${c.items.length} saved</div></div>`).join("")}<div class="coll newc" id="newColl"><div class="plus">＋</div><div class="lbl">New</div></div></div>
  <div class="sec"><h3>🔖 Your stash ${saved.length?`· ${saved.length}`:''}</h3></div>
  <div class="savewrap">${saved.length?saved.slice().reverse().map(k=>{const it=itemText(k);if(!it)return"";const t=T[it.t]||T.life;return`<div class="saveitem"><div class="st" style="background:${t.c}"></div><div style="flex:1;min-width:0" data-open-saved="${k}"><div class="sx">${esc(it.x)}</div><div class="stopic">${t.e} ${t.l}</div></div><button class="editp" data-coll="${k}" aria-label="Add to collection" style="flex:0 0 auto">📁</button></div>`}).join(""):`<div class="empty"><div class="big">🔖</div>Nothing saved yet.<br>Tap Save on anything that moves you.</div>`}</div>
  ${hist.length?`<div class="sec"><h3>🕘 History</h3></div><div class="savewrap">${hist.map(h=>{const t=T[h.topic]||T.life;return`<div class="histrow" data-open-hist="${h.kind}|${h.id}"><div class="he" style="${grad(h.topic)}">${t.e}</div><div class="hi"><div class="hk">${h.kind} · ${t.l}</div><div class="hn">${esc(h.title)}</div></div></div>`}).join("")}</div>`:""}
  <div class="credit">APEX · train your mind & body<br>Free · your data stays on your device</div>`;
 wire($("#v-you"));drawAppIcon($("#appIcon"),70);
 $("#installBtn").onclick=()=>{if(window.__apexInstall)window.__apexInstall();else toast("Use your browser menu → Add to Home Screen")};
 $("#notifyTog").onclick=toggleNotify;
 $("#editInterests").onclick=()=>{S.onboarded=false;renderOnboard()};
 $("#expBtn").onclick=exportData;$("#impBtn").onclick=()=>$("#impFile").click();$("#impFile").onchange=e=>{if(e.target.files&&e.target.files[0])importData(e.target.files[0])};
 $("#aiKeyBtn").onclick=()=>{aiCtx={title:"AI overview",context:"",topic:"life"};renderAIKey();openSheet(aiSheet)};
 $("#themeTog").onclick=()=>{S.theme=S.theme==="light"?"dark":"light";save();applyTheme();renderYou();toast(S.theme==="light"?"☀️ light":"🌙 dark")};
 $("#audioTog").onclick=()=>{S.audioAuto=!S.audioAuto;save();if(!S.audioAuto)stopSpeak();renderYou();toast(S.audioAuto?"🔊 auto read on":"🔇 auto read off")};
 $("#v-you").querySelectorAll("[data-accent]").forEach(bt=>bt.onclick=()=>{S.accent=bt.dataset.accent;save();applyTheme();renderYou()});
 $("#apiBtn").onclick=()=>{const u=prompt("Your Worker URL (e.g. https://apex-api.you.workers.dev)",S.apiBase||"");if(u==null)return;S.apiBase=u.trim().replace(/\/+$/,"");save();renderYou();toast(S.apiBase?"🛰️ connected":"cleared")};
 const lb=$("#lbBtn");if(lb)lb.onclick=openLeaderboard;
 $("#pEdit").onclick=editProfile;$("#pEdit2").onclick=editProfile;
 $("#newColl").onclick=()=>{const name=prompt("Name your collection");if(name==null)return;const nm=name.trim();if(!nm)return;S.collections.push({id:"c"+Date.now(),name:nm,items:[]});save();renderYou();toast("📁 created")};
 $("#v-you").querySelectorAll("[data-open-coll]").forEach(e=>e.onclick=()=>openCollection(e.dataset.openColl));
 $("#v-you").querySelectorAll("[data-coll]").forEach(e=>e.onclick=ev=>{ev.stopPropagation();openCollPicker(e.dataset.coll)});
 $("#v-you").querySelectorAll("[data-open-hist]").forEach(e=>e.onclick=()=>{const[kind,id]=e.dataset.openHist.split("|");if(kind==="article")openReader(id);else if(kind==="idea")openSavedKey(id);else openSavedKey(id)});
 $("#v-you").querySelectorAll("[data-open-saved]").forEach(e=>e.onclick=()=>openSavedKey(e.dataset.openSaved));
}
/* app icon */
function drawAppIcon(cv,size){if(!cv)return;const dpr=Math.min(3,devicePixelRatio||1);cv.width=size*dpr;cv.height=size*dpr;const x=cv.getContext("2d");x.scale(dpr,dpr);const r=size*.225;x.beginPath();rr(x,0,0,size,size,r);x.clip();const g=x.createLinearGradient(0,0,size,size);g.addColorStop(0,"#f3d089");g.addColorStop(.55,"#e8b563");g.addColorStop(1,"#c98f3a");x.fillStyle=g;x.fillRect(0,0,size,size);const rg=x.createRadialGradient(size*.3,size*.28,0,size*.3,size*.28,size*.8);rg.addColorStop(0,"rgba(255,255,255,.4)");rg.addColorStop(1,"rgba(255,255,255,0)");x.fillStyle=rg;x.fillRect(0,0,size,size);
 // mountain 'A' peak
 x.fillStyle="#1a1206";x.beginPath();x.moveTo(size*.5,size*.24);x.lineTo(size*.78,size*.76);x.lineTo(size*.60,size*.76);x.lineTo(size*.5,size*.55);x.lineTo(size*.40,size*.76);x.lineTo(size*.22,size*.76);x.closePath();x.fill();
 x.fillStyle="#fff";x.beginPath();x.moveTo(size*.5,size*.24);x.lineTo(size*.585,size*.40);x.lineTo(size*.5,size*.36);x.lineTo(size*.415,size*.40);x.closePath();x.fill()}
function rr(x,X,Y,W,H,r){x.moveTo(X+r,Y);x.arcTo(X+W,Y,X+W,Y+H,r);x.arcTo(X+W,Y+H,X,Y+H,r);x.arcTo(X,Y+H,X,Y,r);x.arcTo(X,Y,X+W,Y,r);x.closePath()}
function downloadIcon(){const c=document.createElement("canvas");drawAppIcon(c,1024);c.toBlob(async b=>{if(!b)return;if(window.claude&&window.claude.downloads){try{await window.claude.downloads.save({filename:"apex-icon.png",data:b});toast("✅ icon saved")}catch(e){if(e&&e.code==="declined")toast("cancelled");else fb(b)}}else fb(b)},"image/png");function fb(b){try{const u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download="apex-icon.png";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);toast("⬇️ downloaded")}catch(e){toast("unavailable here")}}}

/* ===== STORIES viewer ===== */
const storiesEl=$("#stories");let ST={idx:0,slide:0,order:[],timer:null,paused:false};
function openStories(startId){ST.order=STORIES.map(s=>s.id);const at=ST.order.indexOf(startId);ST.idx=at<0?0:at;ST.slide=0;storiesEl.classList.add("show");drawStory()}
function drawStory(){const s=STORIES.find(x=>x.id===ST.order[ST.idx]);if(!s){return closeStories()}const t=T[s.topic]||T.life,sl=s.slides[ST.slide],saved=!!S.saves[s.id];
 storiesEl.innerHTML=`<div class="sbg" style="${grad(s.topic)}"></div><div class="sgrain"></div>
  <div class="sbars">${s.slides.map((_,i)=>`<div class="sbar ${i<ST.slide?'done':''} ${i===ST.slide?'active':''}"><i style="animation-duration:6s"></i></div>`).join("")}</div>
  <div class="stop"><div class="semoji">${s.emoji}</div><div class="stt"><b>${esc(s.title)}</b><small>${t.e} ${t.l} · APEX Stories</small></div><button class="sx" id="stX" aria-label="Close">✕</button></div>
  <div class="snav"><div class="sz" id="szPrev"></div><div class="sz" id="szNext"></div></div>
  <div class="sbody"><div class="se">${sl.e}</div><div class="sh">${esc(sl.h)}</div><div class="sp">${esc(sl.p)}</div></div>
  <div class="sfoot"><button id="stSave" class="${saved?'on-save':''}"><svg viewBox="0 0 24 24"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/></svg>${saved?'Saved':'Save'}</button><button id="stShare"><svg viewBox="0 0 24 24"><path d="M14 9V5l7 7-7 7v-4.1C9 12 6 13 3 17c1-6 5-8 11-8z"/></svg>Share</button></div>`;
 $("#stX").onclick=closeStories;
 $("#szPrev").onclick=()=>stepStory(-1);$("#szNext").onclick=()=>stepStory(1);
 $("#stSave").onclick=e=>{e.stopPropagation();S.saves[s.id]=!S.saves[s.id];save();toast(S.saves[s.id]?"🔖 story saved":"removed");drawStory()};
 $("#stShare").onclick=e=>{e.stopPropagation();openShare(s.topic,sl.h,sl.p,"idea")};
 logHist("story",s.id,s.topic,s.title);
 const bar=storiesEl.querySelector(".sbar.active i");if(bar){bar.addEventListener("animationend",()=>stepStory(1),{once:true})}
 if(!S.storiesSeen[s.id]){S.storiesSeen[s.id]=true;bump();addXP(6,"✨ story · <span class=xp>+6 XP</span>");save()}
}
function stepStory(d){const s=STORIES.find(x=>x.id===ST.order[ST.idx]);if(!s)return closeStories();let n=ST.slide+d;
 if(n>=s.slides.length){if(ST.idx>=ST.order.length-1)return closeStories();ST.idx++;ST.slide=0;return drawStory()}
 if(n<0){if(ST.idx<=0){ST.slide=0;return drawStory()}ST.idx--;const p=STORIES.find(x=>x.id===ST.order[ST.idx]);ST.slide=p.slides.length-1;return drawStory()}
 ST.slide=n;drawStory()}
function closeStories(){storiesEl.classList.remove("show");setTimeout(()=>{storiesEl.innerHTML=""},260);if(cur==="home")renderHome()}

/* ===== QUIZ engine ===== */
const quizEl=$("#quiz");let QZ=null;
function openQuiz(id){const q=QUIZZES.find(x=>x.id===id);if(!q)return;QZ={q,i:0,score:0,answered:false};logHist("quiz",q.id,q.topic,q.title);quizEl.classList.add("show");drawQuiz()}
function drawQuiz(){const q=QZ.q,n=QZ.i,item=q.qs[n],t=T[q.topic]||T.life,total=q.qs.length,pct=Math.round((n)/total*100);
 quizEl.innerHTML=`<div class="qtop"><button id="qX" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg></button><div class="qbar"><i style="width:${pct}%"></i></div><span class="qn">${n+1}/${total}</span></div>
  <div class="qwrap"><div class="qcat">${t.e} ${esc(q.title)}</div><div class="qq">${esc(item.q)}</div>
   <div class="qopts" id="qopts">${item.o.map((o,i)=>`<button class="qopt" data-i="${i}"><span class="qk">${String.fromCharCode(65+i)}</span><span>${esc(o)}</span></button>`).join("")}</div>
   <div class="qexp" id="qexp"><b>Why:</b> ${esc(item.e)}</div>
   <button class="qnext" id="qnext">${n===total-1?'See results':'Next question'}</button></div>`;
 $("#qX").onclick=closeQuiz;QZ.answered=false;
 quizEl.querySelectorAll(".qopt").forEach(b=>b.onclick=()=>answerQuiz(+b.dataset.i));
 $("#qnext").onclick=()=>{if(QZ.i>=total-1)return quizResult();QZ.i++;drawQuiz()};
}
function answerQuiz(choice){if(QZ.answered)return;QZ.answered=true;const item=QZ.q.qs[QZ.i],ok=choice===item.a;if(ok)QZ.score++;
 quizEl.querySelectorAll(".qopt").forEach(b=>{const i=+b.dataset.i;b.disabled=true;if(i===item.a)b.classList.add("correct");else if(i===choice)b.classList.add("wrong");else b.classList.add("dim")});
 $("#qexp").classList.add("show");$("#qnext").classList.add("show");
 beep(ok?740:300,.12,.18);if(ok)addXP(5);
}
function quizResult(){const q=QZ.q,total=q.qs.length,pct=Math.round(QZ.score/total*100),c=2*Math.PI*66,prevBest=S.quizBest[q.id]||0,best=Math.max(prevBest,pct);
 S.quizBest[q.id]=best;S.quizzes++;bump();addXP(12);save();
 const msg=pct===100?"Flawless. You've got this cold.":pct>=75?"Strong — a couple to revisit.":pct>=50?"Decent start. Run it again to lock it in.":"Worth another pass — that's how it sticks.";
 const col=pct>=75?"var(--green)":pct>=50?"var(--gold)":"#ff6a3d";
 quizEl.innerHTML=`<div class="qtop"><button id="qX" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg></button><div class="qbar"><i style="width:100%"></i></div><span class="qn">done</span></div>
  <div class="qresult"><div class="qring"><svg viewBox="0 0 150 150"><circle cx="75" cy="75" r="66" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="11"/><circle cx="75" cy="75" r="66" fill="none" stroke="${col}" stroke-width="11" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c*(1-pct/100)}" transform="rotate(-90 75 75)"/></svg><div class="qpct"><b>${pct}%</b><small>${QZ.score}/${total}</small></div></div>
   <h2>${pct>=75?'🎉 Nailed it':pct>=50?'👏 Nice work':'💪 Keep going'}</h2><p>${esc(msg)}<br>+${12+QZ.score*5} XP earned${best>prevBest?" · new best!":""}</p>
   <div class="qbtns"><button id="qRetry">Try again</button><button class="prim" id="qDone">Done</button></div></div>`;
 $("#qX").onclick=closeQuiz;$("#qDone").onclick=closeQuiz;$("#qRetry").onclick=()=>openQuiz(q.id);
 beep(660,.14);setTimeout(()=>beep(880,.18),150);
}
function closeQuiz(){quizEl.classList.remove("show");QZ=null;setTimeout(()=>{quizEl.innerHTML=""},300);if(cur==="home")renderHome();if(cur==="you")renderYou()}

/* ===== MAP viewer ===== */
const mapEl=$("#mapview");
function openMap(id){const m=MAPS.find(x=>x.id===id);if(!m)return;const t=T[m.topic]||T.life,saved=!!S.saves[m.id];logHist("map",m.id,m.topic,m.root);
 mapEl.innerHTML=`<div class="qtop"><button id="mX" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button><div class="qbar"><i style="width:100%;background:${t.c}"></i></div><span class="qn">${t.e} map</span></div>
  <div class="mapwrap"><div class="maproot"><div class="mrbadge" style="${grad(m.topic)}">${m.emoji}</div><div class="mrt">${esc(m.root)}</div><div class="mrs">${esc(m.sub)}</div></div><div class="mstem"></div>
   ${m.branches.map((b,i)=>`<div class="mbranch" style="animation-delay:${i*.09}s"><span style="position:absolute;left:0;top:0;bottom:0;width:4px;background:${t.c}"></span>
     <div class="mbhead"><div class="mbe" style="background:${grad(m.topic).replace('background:','')}">${b.e}</div><div class="mbl">${esc(b.l)}</div></div>
     <div class="mbpts">${b.pts.map(p=>`<div class="mbpt"><span class="mdot" style="background:${t.c}"></span>${esc(p)}</div>`).join("")}</div></div>`).join("")}
   <div class="mapfoot"><button id="mSave" class="${saved?'prim':''}"><svg viewBox="0 0 24 24"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/></svg>${saved?'Saved':'Save map'}</button><button class="prim" id="mDone">Done</button></div></div>`;
 mapEl.classList.add("show");mapEl.scrollTop=0;
 $("#mX").onclick=closeMap;$("#mDone").onclick=closeMap;
 $("#mSave").onclick=()=>{S.saves[m.id]=!S.saves[m.id];save();toast(S.saves[m.id]?"🔖 map saved":"removed");openMap(m.id)};
 if(!S.mapsSeen[m.id]){S.mapsSeen[m.id]=true;bump();addXP(8,"🗺️ map explored · <span class=xp>+8 XP</span>");save()}
}
function closeMap(){mapEl.classList.remove("show");setTimeout(()=>{mapEl.innerHTML=""},300);if(cur==="home")renderHome();if(cur==="you")renderYou()}

/* ===== ONBOARDING ===== */
const onboardEl=$("#onboard");
function renderOnboard(){const keys=["discipline","mind","learn","money","health","fit","genius","psych","phil","science","life","story"];const sel=new Set(S.interests||[]);
 onboardEl.innerHTML=`<div class="omk">A</div><h1>What do you<br>want to grow?</h1><div class="osub">Pick a few. We'll tune your daily feed to match — you can change it anytime.</div>
  <div class="ochips" id="ochips">${keys.map(k=>{const t=T[k];return`<button class="ochip ${sel.has(k)?'on':''}" data-k="${k}">${t.e} ${t.l}</button>`}).join("")}</div>
  <button class="ostart" id="ostart" ${sel.size?'':'disabled'}>Start learning →</button>
  <button class="oskip" id="oskip">Skip for now</button>`;
 onboardEl.querySelectorAll(".ochip").forEach(b=>b.onclick=()=>{const k=b.dataset.k;if(sel.has(k))sel.delete(k);else sel.add(k);b.classList.toggle("on");$("#ostart").disabled=sel.size===0});
 $("#ostart").onclick=()=>{S.interests=[...sel];S.onboarded=true;save();addXP(5,"✨ feed personalized");closeOnboard()};
 $("#oskip").onclick=()=>{S.interests=[];S.onboarded=true;save();closeOnboard()};
 onboardEl.classList.add("show");
}
function closeOnboard(){onboardEl.classList.remove("show");setTimeout(()=>onboardEl.innerHTML="",320);feedBuilt=false;buildFeed();}

/* ===== SHARE-AS-IMAGE cards ===== */
function drawShareCard(cv,topic,title,sub,kind){const W=1080,H=1350,x=cv.getContext("2d"),t=T[topic]||T.life,pad=100;cv.width=W;cv.height=H;
 const g=x.createLinearGradient(0,0,W*.4,H);g.addColorStop(0,t.g[0]);g.addColorStop(.55,t.g[1]);g.addColorStop(1,"#08080c");x.fillStyle=g;x.fillRect(0,0,W,H);
 const rg=x.createRadialGradient(W*.5,H*.4,80,W*.5,H*.5,W);rg.addColorStop(0,"rgba(0,0,0,0)");rg.addColorStop(1,"rgba(0,0,0,.5)");x.fillStyle=rg;x.fillRect(0,0,W,H);
 x.textBaseline="alphabetic";x.textAlign="left";
 x.fillStyle="#f3d089";x.beginPath();rr(x,pad,108,66,66,17);x.fill();x.fillStyle="#1a1206";x.font="900 42px Georgia,serif";x.textAlign="center";x.fillText("A",pad+33,152);
 x.textAlign="left";x.fillStyle="#fff";x.font="800 36px -apple-system,'Segoe UI',Roboto,sans-serif";x.fillText("APEX",pad+86,150);
 x.fillStyle=t.c;x.font="800 27px -apple-system,'Segoe UI',Roboto,sans-serif";x.fillText(t.e+"   "+t.l.toUpperCase(),pad,290);
 const isQuote=kind==="quote",txt=isQuote?"“"+title+"”":title,big=txt.length>120?54:txt.length>70?62:72,lh=big*1.24;
 x.fillStyle="#fff";x.font=(isQuote?"italic ":"")+"600 "+big+"px Georgia,serif";
 const lines=wrapLines(t=>x.measureText(t).width,txt,W-pad*2);let ty=380+big;lines.forEach(l=>{x.fillText(l,pad,ty);ty+=lh});
 if(sub){x.fillStyle="rgba(255,255,255,.82)";x.font="500 36px Georgia,serif";const sl=wrapLines(t=>x.measureText(t).width,sub,W-pad*2);let sy=ty+34;sl.slice(0,5).forEach(l=>{x.fillText(l,pad,sy);sy+=50})}
 x.fillStyle=t.c;x.fillRect(pad,H-140,70,6);
 x.fillStyle="rgba(255,255,255,.7)";x.font="700 30px -apple-system,'Segoe UI',Roboto,sans-serif";x.fillText("APEX · train your mind & body",pad,H-92);
}
let shareCv=null;
function openShare(topic,title,sub,kind){shareCv={topic,title,sub,kind};drawShareCard($("#shCanvas"),topic,title,sub,kind);openSheet($("#shareModal"));}
function saveCanvas(cv,name){cv.toBlob(b=>{if(!b)return;if(window.claude&&window.claude.downloads){window.claude.downloads.save({filename:name,data:b}).then(()=>toast("✅ saved")).catch(()=>anchorBlob(b,name))}else anchorBlob(b,name);addXP(4)},"image/png")}
function anchorBlob(b,name){try{const u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1200);toast("⬇️ downloaded")}catch(e){toast("unavailable here")}}
function shareCanvas(cv,title){cv.toBlob(async b=>{if(!b)return;try{const file=new File([b],"apex-card.png",{type:"image/png"});if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],text:title+" — via APEX"});addXP(5);return}}catch(e){if(e&&e.name==="AbortError")return}anchorBlob(b,"apex-card.png")},"image/png")}
$("#shClose").onclick=()=>closeSheets();
$("#shDownload").onclick=()=>saveCanvas($("#shCanvas"),"apex-card.png");
$("#shShare").onclick=()=>{if(shareCv)shareCanvas($("#shCanvas"),shareCv.title)};

/* ===== FEED filter / search ===== */
let feedFilter={topic:"all",q:"",diff:"all"};
function openFilter(){const keys=["all","discipline","mind","learn","money","health","fit","genius","psych","phil","science","life","story","geo","physics","math","history","bio","econ","astro","animal"];
 const diffs=[["all","All levels"],["quick","⚡ Quick"],["core","📘 Core"],["deep","🧠 Deep"]];
 $("#filtChips").innerHTML=`<input id="filtQ" placeholder="Search ideas…" value="${esc(feedFilter.q)}" autocomplete="off" style="width:100%;height:44px;background:var(--surface);border:1px solid var(--line);border-radius:12px;color:var(--text);padding:0 14px;font-size:14px;outline:none;margin-bottom:6px">
  <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--muted-2);width:100%;margin:2px 0 -2px">Depth</div>
  ${diffs.map(d=>`<button class="fchip ${feedFilter.diff===d[0]?'on':''}" data-d="${d[0]}">${d[1]}</button>`).join("")}
  <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--muted-2);width:100%;margin:6px 0 -2px">Topic</div>
  ${keys.map(k=>{const t=k==="all"?{e:"✨",l:"All topics"}:T[k];return`<button class="fchip ${feedFilter.topic===k?'on':''}" data-t="${k}">${t.e} ${t.l}</button>`}).join("")}`;
 const qi=$("#filtQ");qi.oninput=()=>{feedFilter.q=qi.value};qi.onkeydown=e=>{if(e.key==="Enter")applyFilter()};
 $("#filtChips").querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{feedFilter.topic=b.dataset.t;applyFilter()});
 $("#filtChips").querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>{feedFilter.diff=b.dataset.d;applyFilter()});
 openSheet($("#filtSheet"));
}
function applyFilter(){closeSheets();feedBuilt=false;buildFeed();$("#feed").scrollTop=0;const on=feedFilter.topic!=="all"||!!feedFilter.q.trim()||feedFilter.diff!=="all";$("#filtFab").classList.toggle("filtered",on);if(on)toast("🔍 "+(feedFilter.topic!=="all"?T[feedFilter.topic].l:feedFilter.diff!=="all"?feedFilter.diff:'“'+feedFilter.q+'”'))}

/* ===== BACKUP / RESTORE ===== */
function exportData(){const b=new Blob([JSON.stringify(S)],{type:"application/json"}),name="apex-backup.json";if(window.claude&&window.claude.downloads){window.claude.downloads.save({filename:name,data:b}).then(()=>toast("✅ backup saved")).catch(()=>anchorBlob(b,name))}else anchorBlob(b,name)}
function importData(file){const rd=new FileReader();rd.onload=()=>{const res=parseBackup(rd.result);
  if(!res.ok){toast("⚠️ "+res.error);return}
  S=Object.assign(S,res.value);save();applyTheme();updateHUD();renderYou();
  toast(res.rejected.length?`✅ restored · ${res.rejected.length} field${res.rejected.length>1?"s":""} skipped`:"✅ progress restored")};
 rd.readAsText(file)}

/* ===== DAILY REMINDER (best-effort, no backend) ===== */
function toggleNotify(){if(S.notify){S.notify=false;save();toast("🔕 reminder off");renderYou();return}
 if(!("Notification" in window)){toast("notifications aren't supported here");return}
 Notification.requestPermission().then(p=>{if(p==="granted"){S.notify=true;save();toast("🔔 daily idea on");maybeDailyNotify(true);renderYou()}else toast("notifications were blocked")}).catch(()=>toast("couldn't enable"))}
function maybeDailyNotify(force){if(!S.notify||!("Notification" in window)||Notification.permission!=="granted")return;const t=today();if(!force&&S.notifyLast===t)return;S.notifyLast=t;save();
 const f=FEED[Math.floor(Math.random()*FEED.length)],body=f[2];
 try{if(navigator.serviceWorker&&navigator.serviceWorker.ready){navigator.serviceWorker.ready.then(reg=>{if(reg&&reg.showNotification)reg.showNotification("💡 Today's idea",{body,icon:"/icon.svg",badge:"/favicon.svg",tag:"apex-daily"});else new Notification("💡 Today's idea",{body})}).catch(()=>{try{new Notification("💡 Today's idea",{body})}catch(e){}})}else new Notification("💡 Today's idea",{body})}catch(e){}}

/* ===== AI OVERVIEW (bring-your-own Gemini key) ===== */
const aiSheet=$("#aiSheet");let aiCtx=null;
function openAI(title,context,topic){aiCtx={title,context:context||"",topic};if(!S.geminiKey){renderAIKey()}else{renderAI("simple");runAI("simple")}openSheet(aiSheet)}
function renderAIKey(){aiSheet.innerHTML=`<div class="grab"></div><h3><span>✨ AI Overview</span><span class="close" id="aiX">✕</span></h3>
  <div class="aikey"><b>Add your Gemini API key</b><p style="font-size:12.5px;color:var(--muted);margin-top:4px;line-height:1.5">Get a free key at aistudio.google.com/apikey. It's stored only on this device and powers AI explanations of any idea.</p>
   <input id="aiKeyIn" type="password" placeholder="Paste your Gemini API key" autocomplete="off">
   <div class="akrow"><button class="sec" id="aiKeyCancel">Cancel</button><button class="prim" id="aiKeySave">Save &amp; go</button></div></div>`;
 $("#aiX").onclick=closeSheets;$("#aiKeyCancel").onclick=closeSheets;
 $("#aiKeySave").onclick=()=>{const v=$("#aiKeyIn").value.trim();if(!v){toast("paste a key first");return}S.geminiKey=v;save();renderAI("simple");runAI("simple")};}
function renderAI(mode){const modes=[["simple","Explain simply"],["deep","Go deeper"],["why","Why it matters"],["example","Give an example"]];
 aiSheet.innerHTML=`<div class="grab"></div><h3><span>✨ AI Overview</span><span class="close" id="aiX">✕</span></h3>
  <div class="aichips" id="aiChips">${modes.map(m=>`<button class="aichip ${m[0]===mode?'on':''}" data-m="${m[0]}">${m[1]}</button>`).join("")}<button class="aichip" id="aiQuizBtn" style="background:linear-gradient(135deg,#8a5cff,#00c2ff);color:#fff;border:none">🧩 Quiz me</button></div>
  <div class="aibody" id="aiBody"><div class="aidots"><i></i><i></i><i></i></div></div>`;
 $("#aiX").onclick=closeSheets;aiSheet.querySelectorAll(".aichip[data-m]").forEach(b=>b.onclick=()=>{renderAI(b.dataset.m);runAI(b.dataset.m)});$("#aiQuizBtn").onclick=()=>aiQuizMe(aiCtx.title,aiCtx.context,aiCtx.topic);}
function aiPrompt(mode){const ins={simple:"Explain this idea simply and vividly in 3 short sentences.",deep:"Go deeper: explain the underlying mechanism and one surprising nuance in about 4 sentences.",why:"Explain why this matters in everyday life, in 3 sentences.",example:"Give one concrete, memorable real-world example that makes this click, in 3 sentences."}[mode]||"Explain simply.";
 return `Topic: ${aiCtx.topic}. Idea: "${aiCtx.title}".${aiCtx.context?" Context: "+aiCtx.context:""}\n\n${ins} Be concrete and engaging. Plain text, no markdown, no headings.`;}
function aiHTML(t){return t.split(/\n{2,}/).map(p=>`<p>${esc(p.trim())}</p>`).join("")}
/* one call path: your own Gemini key, or a Cloudflare Worker proxy (S.apiBase) that hides the key */
function aiConfigured(){return !!(S.apiBase||S.geminiKey)}
async function aiGenerate(prompt){
 if(S.apiBase){const r=await fetch(S.apiBase.replace(/\/+$/,"")+"/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt})});if(!r.ok)throw new Error("http"+r.status);const j=await r.json();return (j.text||"").trim()}
 if(!S.geminiKey)throw new Error("nokey");
 const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(S.geminiKey)}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:prompt}]}]})});
 if(!r.ok)throw new Error(r.status===400||r.status===403?"badkey":"http"+r.status);
 const j=await r.json();return (((j.candidates||[])[0]||{}).content||{}).parts?.map(p=>p.text||"").join("").trim()||"";}
async function runAI(mode){const body=$("#aiBody");if(!body)return;const ck=aiCtx.title+"|"+mode;
 if(S.aiCache&&S.aiCache[ck]){body.innerHTML=aiHTML(S.aiCache[ck]);return}
 body.innerHTML=`<div class="aidots"><i></i><i></i><i></i></div>`;
 try{const txt=await aiGenerate(aiPrompt(mode));if(!txt)throw new Error("empty");S.aiCache[ck]=txt;save();body.innerHTML=aiHTML(txt);addXP(3);
 }catch(e){const m=(""+e.message);const msg=m==="badkey"?"That key was rejected — check it below.":m.includes("fetch")?"No connection — AI needs the internet.":"Couldn't reach the AI right now.";
  body.innerHTML=`<p style="color:var(--muted)">${esc(msg)}</p>`;const btn=document.createElement("button");btn.className="aichip";btn.style.marginTop="8px";btn.textContent="Change API key";btn.onclick=()=>{S.geminiKey="";save();renderAIKey()};body.appendChild(btn);}}
/* AI quiz-me: turn any idea into a fresh 3-question quiz */
async function aiQuizMe(title,context,topic){openSheet(aiSheet);
 aiSheet.innerHTML=`<div class="grab"></div><h3><span>🧩 AI Quiz</span><span class="close" id="aiX">✕</span></h3><div class="aibody" id="aiBody"><div class="aidots"><i></i><i></i><i></i></div></div>`;$("#aiX").onclick=closeSheets;
 if(!aiConfigured()){renderAIKey();return}
 try{const txt=await aiGenerate(`Create 3 multiple-choice questions that test understanding of the idea: "${title}".${context?" Context: "+context:""} Return ONLY a JSON array like [{"q":"question","o":["a","b","c","d"],"a":0,"e":"one-line why"}]. Exactly 4 options each, "a" is the 0-based index of the correct one. No markdown.`);
  const m=txt.match(/\[[\s\S]*\]/);if(!m)throw 0;const qs=JSON.parse(m[0]).filter(x=>x&&x.q&&Array.isArray(x.o)&&x.o.length>=2&&typeof x.a==="number");if(!qs.length)throw 0;
  closeSheets();QZ={q:{id:"ai"+Date.now(),topic:topic||"genius",title:"Quiz · "+title.slice(0,26),emoji:"🧩",qs:qs.slice(0,4)},i:0,score:0,answered:false};quizEl.classList.add("show");drawQuiz();addXP(4);
 }catch(e){const body=$("#aiBody");if(body)body.innerHTML='<p style="color:var(--muted)">Couldn\'t generate a quiz right now. Try again in a moment.</p>'}}
/* AI-infinite feed: quietly grow the feed with fresh on-topic ideas */
let aiGenBusy=false;
async function aiExpandFeed(){if(aiGenBusy||!aiConfigured())return;aiGenBusy=true;
 try{const pool=(S.interests&&S.interests.length?S.interests:["science","history","psych","money","astro","bio","econ","phil"]);const pick=pool[Math.floor(Math.random()*pool.length)];
  const txt=await aiGenerate(`Write 6 fresh, surprising micro-ideas about ${T[pick]?T[pick].l:pick} for a bite-size learning feed. Each has a punchy one-sentence title and a 1–2 sentence explanation. Return ONLY JSON: [{"title":"...","text":"..."}] with exactly 6 items. No markdown.`);
  const m=txt.match(/\[[\s\S]*\]/);if(!m)return;const arr=JSON.parse(m[0]);const added=[];
  arr.forEach(o=>{if(o&&o.title&&o.text){const it=[pick,"idea",(""+o.title).slice(0,150),(""+o.text).slice(0,340)];FEED.push(it);added.push(it)}});
  if(added.length){S.aiIdeas=(S.aiIdeas||[]).concat(added).slice(-150);save();toast("✨ "+added.length+" fresh ideas added")}
 }catch(e){}finally{aiGenBusy=false}}
/* text-to-speech */
function speak(text){if(!("speechSynthesis"in window)){toast("audio not supported here");return}try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.rate=1;u.pitch=1;speechSynthesis.speak(u)}catch(e){}}
function stopSpeak(){try{if("speechSynthesis"in window)speechSynthesis.cancel()}catch(e){}}

/* ===== GLOBAL SEARCH ===== */
const searchEl=$("#search");
function openSearch(){searchEl.classList.add("show");
 searchEl.innerHTML=`<div class="searchbar"><input id="sIn" placeholder="Search ideas, articles, quizzes, maps…" autocomplete="off"><button class="sxc" id="sX" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg></button></div><div class="sresults" id="sRes"><div class="shint">Search everything — ideas, deep reads, quizzes, maps, stories & videos.</div></div>`;
 const inp=$("#sIn");$("#sX").onclick=closeSearch;inp.oninput=()=>doSearch(inp.value);setTimeout(()=>inp.focus(),90);}
function closeSearch(){searchEl.classList.remove("show");setTimeout(()=>searchEl.innerHTML="",220)}
function srRow(topic,kind,title,act){const t=T[topic]||T.life,el=document.createElement("div");el.className="sr";el.innerHTML=`<div class="srt" style="${grad(topic)}">${t.e}</div><div class="sri"><div class="srk">${kind} · ${t.l}</div><div class="srn">${esc(title)}</div></div>`;el.onclick=act;return el}
function doSearch(q){q=(q||"").trim().toLowerCase();const res=$("#sRes");if(!res)return;
 if(q.length<2){res.innerHTML=`<div class="shint">Search everything — ideas, deep reads, quizzes, maps, stories & videos.</div>`;return}
 const rows=[];
 FEED.forEach((f,i)=>{if(((f[2]||"")+" "+(f[3]||"")+" "+(f[4]||"")).toLowerCase().includes(q))rows.push(srRow(f[0],"Idea",f[2],()=>{closeSearch();setTab("learn");scrollFeedTo(i)}))});
 ARTICLES.forEach(a=>{if((a.title+" "+a.dek).toLowerCase().includes(q))rows.push(srRow(a.topic,"Deep read",a.title,()=>{closeSearch();openReader(a.id)}))});
 QUIZZES.forEach(z=>{if((z.title+" "+z.qs.map(x=>x.q).join(" ")).toLowerCase().includes(q))rows.push(srRow(z.topic,"Quiz",z.title,()=>{closeSearch();openQuiz(z.id)}))});
 MAPS.forEach(m=>{if((m.root+" "+m.sub).toLowerCase().includes(q))rows.push(srRow(m.topic,"Map",m.root,()=>{closeSearch();openMap(m.id)}))});
 STORIES.forEach(s=>{if((s.title+" "+s.slides.map(sl=>sl.h+sl.p).join(" ")).toLowerCase().includes(q))rows.push(srRow(s.topic,"Story",s.title,()=>{closeSearch();openStories(s.id)}))});
 (S.videos||[]).forEach(v=>{if((v.title||"").toLowerCase().includes(q))rows.push(srRow(v.topic||"fit","Video",v.title,()=>{closeSearch();setTab("watch")}))});
 if(!rows.length){res.innerHTML=`<div class="shint">No matches for “${esc(q)}”.<br>Try “space”, “money”, “rome”, or “habit”.</div>`;return}
 res.innerHTML="";rows.slice(0,50).forEach(r=>res.appendChild(r));}

/* ===== COLLECTIONS ===== */
function openSavedKey(k){if(k[0]==="f"){setTab("learn");scrollFeedTo(+k.slice(1))}else if(STORIES.some(s=>s.id===k))openStories(k);else if(MAPS.some(m=>m.id===k))openMap(k);else if(QUIZZES.some(z=>z.id===k))openQuiz(k);else if((S.videos||[]).some(v=>v.id===k))setTab("watch");else openReader(k)}
function openCollPicker(itemId){const cc=$("#collChips");
 cc.innerHTML=(S.collections.length?S.collections.map(c=>`<button class="fchip ${c.items.includes(itemId)?'on':''}" data-c="${c.id}">${c.items.includes(itemId)?'✓ ':''}${esc(c.name)}</button>`).join(""):`<div class="shint" style="padding:8px 4px 14px">No collections yet — create one below.</div>`)+`<button class="fchip" data-newc style="border-style:dashed">＋ New collection</button>`;
 cc.querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>{const c=S.collections.find(x=>x.id===b.dataset.c);if(!c)return;if(c.items.includes(itemId))c.items=c.items.filter(x=>x!==itemId);else{c.items.push(itemId);toast("added to "+c.name)}save();openCollPicker(itemId)});
 cc.querySelector("[data-newc]").onclick=()=>{const name=prompt("Name your collection");if(name==null)return;const nm=name.trim();if(!nm)return;S.collections.push({id:"c"+Date.now(),name:nm,items:[itemId]});save();toast("📁 created");openCollPicker(itemId)};
 openSheet($("#collSheet"));}
function openCollection(id){const c=S.collections.find(x=>x.id===id);if(!c)return;openSearch();$("#sIn").placeholder=c.name+" · collection";const res=$("#sRes");
 if(!c.items.length){res.innerHTML=`<div class="shint">“${esc(c.name)}” is empty.<br>Tap the 📁 on any saved item to add it here.</div>`;return}
 res.innerHTML="";c.items.forEach(k=>{const it=itemText(k);if(!it)return;res.appendChild(srRow(it.t,"Saved",it.x,()=>{closeSearch();openSavedKey(k)}))});}
function editProfile(){const n=prompt("Your name",S.name||"You");if(n!=null&&n.trim())S.name=n.trim().slice(0,24);
 const av=prompt("Pick an avatar emoji or letter",S.avatar||"A");if(av!=null&&av.trim())S.avatar=[...av.trim()][0];
 save();renderYou();toast("✅ profile updated");}

/* ===== SHEETS / MUSIC UI / ROUTER ===== */
function openSheet(s){$("#scrim").classList.add("show");s.classList.add("show")}
function closeSheets(){$("#scrim").classList.remove("show");cs.classList.remove("show");$("#filtSheet").classList.remove("show");$("#shareModal").classList.remove("show");$("#collSheet").classList.remove("show");$("#aiSheet").classList.remove("show")}
$("#scrim").onclick=closeSheets;document.querySelectorAll("[data-close],[data-closefilt]").forEach(b=>b.onclick=closeSheets);
$("#filtFab").onclick=openFilter;
function syncMusicUI(){const on=Music.isPlaying();$("#musicbar").classList.toggle("playing",on);$("#mPP").innerHTML=on?'<svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>':'<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';$("#mSub").textContent=on?"Now playing · "+Music.current():"Tap play for atmosphere";$("#mMood").querySelectorAll("button").forEach(b=>b.classList.toggle("on",b.dataset.mood===Music.current()))}
$("#mPP").onclick=()=>{Music.toggle();syncMusicUI()};
$("#mMood").querySelectorAll("button").forEach(b=>b.onclick=()=>{Music.setMood(b.dataset.mood);syncMusicUI();if(Music.isPlaying())toast("🎵 "+b.dataset.mood)});
syncMusicUI();

function wire(root){
 root.querySelectorAll("[data-open-art]").forEach(e=>e.onclick=()=>openReader(e.dataset.openArt));
 root.querySelectorAll("[data-open-feed]").forEach(e=>e.onclick=()=>{setTab("learn");scrollFeedTo(+e.dataset.openFeed)});
 root.querySelectorAll("[data-goto]").forEach(e=>e.onclick=()=>setTab(e.dataset.goto));
 root.querySelectorAll("[data-open-story]").forEach(e=>e.onclick=()=>openStories(e.dataset.openStory));
 root.querySelectorAll("[data-open-quiz]").forEach(e=>e.onclick=()=>openQuiz(e.dataset.openQuiz));
 root.querySelectorAll("[data-open-map]").forEach(e=>e.onclick=()=>openMap(e.dataset.openMap));
 root.querySelectorAll("[data-start]").forEach(e=>{if(!e.classList.contains("row"))e.onclick=()=>startWorkout(e.dataset.start)});
}
let cur="home";
function setTab(name){cur=name;document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("on",t.dataset.tab===name));document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));$("#v-"+name).classList.add("active");
 if(name==="home")renderHome();else if(name==="learn")buildFeed();else if(name==="train")renderTrain();else if(name==="watch")renderWatch();else if(name==="you")renderYou();
 $("#v-"+name).scrollTop=name==="learn"?$("#v-"+name).scrollTop:0}
document.querySelectorAll(".tab").forEach(t=>t.onclick=()=>setTab(t.dataset.tab));
window.addEventListener("keydown",e=>{if(e.key==="Escape"){if(searchEl.classList.contains("show"))closeSearch();else if(storiesEl.classList.contains("show"))closeStories();else if(quizEl.classList.contains("show"))closeQuiz();else if(mapEl.classList.contains("show"))closeMap();else if(reader.classList.contains("show"))closeReader();else if(TT)stopTimer();else closeSheets()}
 if(storiesEl.classList.contains("show")){if(e.key==="ArrowRight")stepStory(1);if(e.key==="ArrowLeft")stepStory(-1)}
 if(cur==="learn"){const f=$("#feed"),h=f.clientHeight,c=Math.round(f.scrollTop/h);if(e.key==="ArrowDown"){e.preventDefault();f.scrollTo({top:(c+1)*h,behavior:"smooth"})}if(e.key==="ArrowUp"){e.preventDefault();f.scrollTo({top:Math.max(0,(c-1)*h),behavior:"smooth"})}}});

/* boot — open straight into the scrolling feed */
applyTheme();updateHUD();setTab("learn");
if(!S.onboarded)renderOnboard();
maybeDailyNotify(false);

/* ===== PWA: offline + installable ===== */
if("serviceWorker" in navigator){window.addEventListener("load",()=>{navigator.serviceWorker.register("/sw.js").catch(()=>{})})}
let deferredPrompt=null;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;window.__apexInstall=()=>{if(deferredPrompt){deferredPrompt.prompt();deferredPrompt=null}}});