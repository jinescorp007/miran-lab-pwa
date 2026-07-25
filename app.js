'use strict';
const KEY='miranLabDataV1';
const today=()=>new Date().toLocaleDateString('sv-SE');
const nowText=()=>new Intl.DateTimeFormat('ja-JP',{dateStyle:'medium',timeStyle:'short'}).format(new Date());
const homeworkSeed=[
{id:'complete',title:'夏休みの完成',optional:false},
{id:'tests',title:'たしかめのテスト（国語・算数）',optional:false},
{id:'challenge',title:'チャレンジ漢字・計算',optional:false},
{id:'diary',title:'夏の一行日記',optional:false},
{id:'bookguide',title:'読書感想文の書き方',optional:false},
{id:'bookreport',title:'読書感想文（原稿用紙3枚・最後の行まで）',optional:false},
{id:'science',title:'理科の観察（iPadに写真）',optional:false},
{id:'picture',title:'夏休みの思い出絵日記（1枚）',optional:false},
{id:'recorder',title:'音楽・リコーダーの練習',optional:false},
{id:'tooth',title:'はみがきカレンダー',optional:false},
{id:'contest',title:'国語・図工コンクール応募',optional:true},
{id:'research',title:'自由研究',optional:true}
];
const defaultData={points:0,missions:{},daily:{},explore:[],skate:[],condition:[],homework:{},diaryEntries:[],kanjiDays:{},mathDays:{}};
let data=load(), installPrompt=null;
function load(){try{const old=JSON.parse(localStorage.getItem(KEY)||'{}');return {...structuredClone(defaultData),...old,homework:{...(old.homework||{})},diaryEntries:old.diaryEntries||[]}}catch{return structuredClone(defaultData)}}
function save(){localStorage.setItem(KEY,JSON.stringify(data));renderAll()}
function award(n){data.points=Math.max(0,(data.points||0)+n)}
function badge(p){if(p>=1000)return'ミラン研究所長';if(p>=500)return'博士';if(p>=250)return'主任研究員';if(p>=100)return'研究員';if(p>=30)return'見習い研究員';return'はじめの一歩'}
function esc(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
const missions=[
{id:'work',icon:'📚',title:'学校の宿題',text:'宿題をひとつ10分やってみる',points:10},
{id:'kanji',icon:'✏️',title:'漢字',text:'今日の5文字に挑戦する',points:10},
{id:'math',icon:'➕',title:'計算',text:'計算問題を3問やってみる',points:10}
];
const moods=[['😄','げんき'],['🙂','まあまあ'],['😐','ふつう'],['😟','しんぱい'],['😴','つかれた']];
function renderMissions(){const d=data.missions[today()]||{};missionList.innerHTML=missions.map(m=>`<article class="mission card ${d[m.id]?'done':''}"><div><div class="mission-icon">${m.icon}</div><h4>${m.title}</h4><p>${m.text}</p></div><button class="${d[m.id]?'ghost':'primary'}" data-mission="${m.id}">${d[m.id]?'できた！ ✓':`やってみた ＋${m.points}pt`}</button></article>`).join('')}
function hwProgress(id){return Number(data.homework[id]?.progress||0)}
function renderHomework(){homeworkList.innerHTML=homeworkSeed.map(h=>{const p=hwProgress(h.id);return `<article class="card homework-card"><div><h3>${h.title}${h.optional?' <small class="muted">（希望者）</small>':''}</h3><div class="mini-progress"><span style="width:${p}%"></span></div><small>${p}%</small></div><div class="homework-actions"><button class="ghost" data-hw-minus="${h.id}">−10%</button><button class="primary" data-hw-plus="${h.id}">＋10%</button><button class="ghost" data-hw-done="${h.id}">${p===100?'完了 ✓':'完了'}</button></div></article>`}).join('')}
function overall(){const required=homeworkSeed.filter(x=>!x.optional);return Math.round(required.reduce((s,h)=>s+hwProgress(h.id),0)/required.length)}
function renderProgress(){const p=overall();overallPercent.textContent=p+'%';overallBar.style.width=p+'%';progressMessage.textContent=p===100?'学校の宿題、全部達成！すばらしい！':`あと${100-p}%で必須宿題が全部完了です。`}
function renderMood(){const sel=data.daily[today()]?.mood||'';quickMood.innerHTML=moods.map(([e,t])=>`<button class="mood-button ${sel===t?'selected':''}" data-mood="${t}">${e}<small>${t}</small></button>`).join('')}
function renderDiary(){diaryEntries.innerHTML=(data.diaryEntries||[]).slice().reverse().map(x=>`<div class="entry"><strong>${esc(x.date)}</strong><div>${esc(x.note)}</div></div>`).join('')||'<p class="muted">まだ日記はありません。</p>'}
function renderExplore(){exploreEntries.innerHTML=(data.explore||[]).slice().reverse().map(x=>`<article class="card entry"><strong>${esc(x.title)}</strong><small class="muted"> ${esc(x.date)}</small><p>${esc(x.found||'')}</p>${x.photo?`<img src="${x.photo}" alt="観察写真">`:''}</article>`).join('')}
function renderStats(){const completed=homeworkSeed.filter(h=>hwProgress(h.id)===100).length;statsGrid.innerHTML=[['研究ポイント',data.points||0],['称号',badge(data.points||0)],['宿題完了',completed+' / '+homeworkSeed.length],['宿題達成率',overall()+'%'],['一行日記',(data.diaryEntries||[]).length+'日'],['観察記録',(data.explore||[]).length+'件']].map(([l,v])=>`<div class="stat"><span>${l}</span><strong>${v}</strong></div>`).join('')}
function renderAll(){todayLabel.textContent=new Intl.DateTimeFormat('ja-JP',{dateStyle:'full'}).format(new Date());pointsTotal.textContent=data.points||0;badgeName.textContent=badge(data.points||0);dailyNote.value=data.daily[today()]?.note||'';renderMissions();renderHomework();renderProgress();renderMood();renderDiary();renderExplore();renderStats()}
document.addEventListener('click',e=>{
 const nav=e.target.closest('[data-page]');if(nav){document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));document.getElementById(nav.dataset.page).classList.add('active');document.querySelectorAll('.bottom-nav button').forEach(x=>x.classList.toggle('active',x===nav));scrollTo(0,0)}
 const m=e.target.closest('[data-mission]');if(m){const d=data.missions[today()]||(data.missions[today()]={});if(!d[m.dataset.mission]){d[m.dataset.mission]=true;award(missions.find(x=>x.id===m.dataset.mission).points);save()}}
 const plus=e.target.closest('[data-hw-plus]');if(plus){const id=plus.dataset.hwPlus;const before=hwProgress(id);const after=Math.min(100,before+10);data.homework[id]={progress:after};if(after>before)award(2);save()}
 const minus=e.target.closest('[data-hw-minus]');if(minus){const id=minus.dataset.hwMinus;data.homework[id]={progress:Math.max(0,hwProgress(id)-10)};save()}
 const done=e.target.closest('[data-hw-done]');if(done){const id=done.dataset.hwDone;const before=hwProgress(id);data.homework[id]={progress:before===100?0:100};if(before<100)award(10);save()}
 const mood=e.target.closest('[data-mood]');if(mood){data.daily[today()]={...(data.daily[today()]||{}),mood:mood.dataset.mood};moodMessage.textContent=`今日は「${mood.dataset.mood}」なんだね。教えてくれてありがとう。`;save()}
});
resetToday.onclick=()=>{if(confirm('今日の3ミッションだけリセットしますか？')){data.missions[today()]={};save()}};
saveDailyNote.onclick=()=>{const note=dailyNote.value.trim();if(!note)return alert('一行日記を書いてください');const old=data.daily[today()]?.note;data.daily[today()]={...(data.daily[today()]||{}),note};if(!old){data.diaryEntries.push({date:today(),note});award(5)}else{const item=data.diaryEntries.find(x=>x.date===today());if(item)item.note=note}save();alert('一行日記を保存しました')};
const kanjis=[['橋','はし'],['鉄','てつ'],['温','あたたかい'],['調','しらべる'],['究','きわめる']];
kanjiList.innerHTML=kanjis.map(([k,r])=>`<div class="kanji-card"><strong>${k}</strong><small>${r}</small></div>`).join('');
finishKanji.onclick=()=>{if(data.kanjiDays[today()])return alert('今日はすでにポイントを受け取りました');data.kanjiDays[today()]={memo:kanjiMemo.value.trim()};award(10);save();alert('漢字チャレンジ完了！＋10ポイント')};
let answers=[];
function makeQuiz(){answers=[];quizArea.innerHTML='';for(let i=0;i<3;i++){let a=10+Math.floor(Math.random()*90),b=10+Math.floor(Math.random()*90),op=Math.random()>.45?'+':'−';if(op==='−'&&b>a)[a,b]=[b,a];answers.push(op==='+'?a+b:a-b);quizArea.insertAdjacentHTML('beforeend',`<label class="quiz-question"><strong>${a} ${op} ${b} ＝</strong><input inputmode="numeric" data-answer="${i}"></label>`)}quizResult.textContent='';checkQuiz.dataset.done=''}
newQuiz.onclick=makeQuiz;checkQuiz.onclick=()=>{let correct=0;document.querySelectorAll('[data-answer]').forEach((x,i)=>{if(Number(x.value)===answers[i])correct++});quizResult.textContent=`3問中 ${correct}問正解！ ${correct===3?'すごい！':'挑戦できたことが大成功！'}`;if(!checkQuiz.dataset.done){award(3+correct);data.mathDays[today()]={correct};checkQuiz.dataset.done='1';save()}};
async function fileToDataURL(file){if(!file)return'';if(file.size>2500000)throw new Error('写真は2.5MB以下にしてください');return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file)})}
exploreForm.onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.target);try{const photo=await fileToDataURL(explorePhoto.files[0]);data.explore.push({title:fd.get('theme'),found:fd.get('found'),date:nowText(),photo});award(8);e.target.reset();save()}catch(err){alert(err.message)}};
exportData.onclick=()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`miran-lab-backup-${today()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
importData.onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{data={...structuredClone(defaultData),...JSON.parse(r.result)};save();alert('バックアップを読み込みました')}catch{alert('読み込めないファイルです')}};r.readAsText(f)};
printReport.onclick=()=>window.print();
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;installBtn.classList.remove('hidden')});installBtn.onclick=async()=>{if(installPrompt){installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;installBtn.classList.add('hidden')}};
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));
makeQuiz();renderAll();
