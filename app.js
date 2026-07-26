'use strict';
const KEY='miranLabDataV1';
const today=()=>new Date().toLocaleDateString('sv-SE');
const nowText=()=>new Intl.DateTimeFormat('ja-JP',{dateStyle:'medium',timeStyle:'short'}).format(new Date());
const homeworkSeed=[
{id:'complete',title:'夏休みの完成',optional:false,level:'later'},
{id:'tests',title:'たしかめのテスト（国語・算数）',optional:false,level:'review'},
{id:'challenge',title:'チャレンジ漢字・計算',optional:false,level:'review'},
{id:'diary',title:'夏の一行日記',optional:false,level:'easy'},
{id:'bookguide',title:'読書感想文の書き方',optional:false,level:'later'},
{id:'bookreport',title:'読書感想文（原稿用紙3枚・最後の行まで）',optional:false,level:'later'},
{id:'science',title:'理科の観察（iPadに写真）',optional:false,level:'easy'},
{id:'picture',title:'夏休みの思い出絵日記（1枚）',optional:false,level:'easy'},
{id:'recorder',title:'音楽・リコーダーの練習',optional:false,level:'easy'},
{id:'tooth',title:'はみがきカレンダー',optional:false,level:'easy'},
{id:'contest',title:'国語・図工コンクール応募',optional:true,level:'later'},
{id:'research',title:'自由研究',optional:true,level:'later'}
];
const defaultData={points:0,missions:{},daily:{},explore:[],skate:[],condition:[],homework:{},diaryEntries:[],kanjiDays:{},mathDays:{},reviewDays:{}};
let data=load(), installPrompt=null, currentReview=[];
function cloneDefault(){return JSON.parse(JSON.stringify(defaultData))}
function load(){try{const old=JSON.parse(localStorage.getItem(KEY)||'{}');return {...cloneDefault(),...old,homework:{...(old.homework||{})},diaryEntries:old.diaryEntries||[],reviewDays:old.reviewDays||{}}}catch{return cloneDefault()}}
function save(){localStorage.setItem(KEY,JSON.stringify(data));renderAll()}
function award(n){data.points=Math.max(0,(data.points||0)+n)}
function badge(p){if(p>=1000)return'ミラン研究所長';if(p>=500)return'博士';if(p>=250)return'主任研究員';if(p>=100)return'研究員';if(p>=30)return'見習い研究員';return'はじめの一歩'}
function esc(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function showPage(id){document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));const page=document.getElementById(id);if(page)page.classList.add('active');document.querySelectorAll('.bottom-nav button').forEach(x=>x.classList.toggle('active',x.dataset.page===id));scrollTo(0,0)}
const missions=[
{id:'review',icon:'✅',title:'1・2年生の復習',text:'国語と算数を5問やってみる',points:10},
{id:'easyHomework',icon:'📚',title:'やさしい宿題',text:'一行日記・歯みがき・観察などを1つ',points:10},
{id:'play',icon:'🛹',title:'体を動かす',text:'スケボーや散歩を楽しむ',points:5}
];
const moods=[['😄','げんき'],['🙂','まあまあ'],['😐','ふつう'],['😟','しんぱい'],['😴','つかれた']];
function renderMissions(){const d=data.missions[today()]||{};missionList.innerHTML=missions.map(m=>`<article class="mission card ${d[m.id]?'done':''}"><div><div class="mission-icon">${m.icon}</div><h4>${m.title}</h4><p>${m.text}</p></div><button class="${d[m.id]?'ghost':'primary'}" data-mission="${m.id}">${d[m.id]?'できた！ ✓':`やってみた ＋${m.points}pt`}</button></article>`).join('')}
function hwProgress(id){return Number(data.homework[id]?.progress||0)}
function levelLabel(level){return level==='easy'?'<span class="task-tag easy">今すぐできる</span>':level==='review'?'<span class="task-tag review">復習から</span>':'<span class="task-tag later">あとで挑戦</span>'}
function homeworkLink(h){if(h.id==='tests')return '<button class="primary" data-open-page="review">復習テストを開く</button>';if(h.id==='challenge')return '<button class="primary" data-open-page="review">国語・算数を復習</button>';if(h.id==='diary')return '<button class="primary" data-open-page="home">一行日記を書く</button>';if(h.id==='science')return '<button class="primary" data-open-page="explore">観察を記録</button>';return ''}
function renderHomework(){homeworkList.innerHTML=homeworkSeed.map(h=>{const p=hwProgress(h.id);return `<article class="card homework-card"><div><div class="homework-title-row"><h3>${h.title}${h.optional?' <small class="muted">（希望者）</small>':''}</h3>${levelLabel(h.level)}</div><div class="mini-progress"><span style="width:${p}%"></span></div><small>${p}%</small></div><div class="homework-actions">${homeworkLink(h)}<button class="ghost" data-hw-minus="${h.id}">−10%</button><button class="primary" data-hw-plus="${h.id}">＋10%</button><button class="ghost" data-hw-done="${h.id}">${p===100?'完了 ✓':'完了'}</button></div></article>`}).join('')}
function overall(){const required=homeworkSeed.filter(x=>!x.optional);return Math.round(required.reduce((s,h)=>s+hwProgress(h.id),0)/required.length)}
function renderProgress(){const p=overall();overallPercent.textContent=p+'%';overallBar.style.width=p+'%';progressMessage.textContent=p===100?'学校の宿題、全部達成！すばらしい！':`急がなくて大丈夫。まずは簡単な宿題と1・2年生の復習を進めよう。`}
function renderMood(){const sel=data.daily[today()]?.mood||'';quickMood.innerHTML=moods.map(([e,t])=>`<button class="mood-button ${sel===t?'selected':''}" data-mood="${t}">${e}<small>${t}</small></button>`).join('')}
function renderDiary(){diaryEntries.innerHTML=(data.diaryEntries||[]).slice().reverse().map(x=>`<div class="entry"><strong>${esc(x.date)}</strong><div>${esc(x.note)}</div></div>`).join('')||'<p class="muted">まだ日記はありません。</p>'}
function renderExplore(){exploreEntries.innerHTML=(data.explore||[]).slice().reverse().map(x=>`<article class="card entry"><strong>${esc(x.title)}</strong><small class="muted"> ${esc(x.date)}</small><p>${esc(x.found||'')}</p>${x.photo?`<img src="${x.photo}" alt="観察写真">`:''}</article>`).join('')}
function renderStats(){const completed=homeworkSeed.filter(h=>hwProgress(h.id)===100).length;const reviewCount=Object.keys(data.reviewDays||{}).length;statsGrid.innerHTML=[['研究ポイント',data.points||0],['称号',badge(data.points||0)],['宿題完了',completed+' / '+homeworkSeed.length],['宿題達成率',overall()+'%'],['復習した日',reviewCount+'日'],['観察記録',(data.explore||[]).length+'件']].map(([l,v])=>`<div class="stat"><span>${l}</span><strong>${v}</strong></div>`).join('')}
function renderReviewHistory(){const entries=Object.entries(data.reviewDays||{}).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,7);reviewHistory.innerHTML='<h3>復習の記録</h3>'+(entries.length?entries.map(([date,v])=>`<div class="entry"><strong>${date}</strong>　${esc(v.gradeLabel)}・${esc(v.subjectLabel)}　${v.correct}/${v.total}問正解</div>`).join(''):'<p class="muted">まだ復習記録はありません。</p>')}
function renderAll(){todayLabel.textContent=new Intl.DateTimeFormat('ja-JP',{dateStyle:'full'}).format(new Date());pointsTotal.textContent=data.points||0;badgeName.textContent=badge(data.points||0);dailyNote.value=data.daily[today()]?.note||'';renderMissions();renderHomework();renderProgress();renderMood();renderDiary();renderExplore();renderStats();renderReviewHistory()}

const reviewBank={
'1':{
 japanese:[
 {q:'「いぬ」の はじめの もじは？',choices:['い','ぬ','う'],a:'い'},
 {q:'「さかな」は なんもじ？',choices:['2もじ','3もじ','4もじ'],a:'3もじ'},
 {q:'「大きい」の はんたいは？',choices:['小さい','長い','白い'],a:'小さい'},
 {q:'「あさ」の つぎに くるのは？',choices:['ひる','よる','きのう'],a:'ひる'},
 {q:'「ねこ」が する ことは？',choices:['なく','とぶ','およぐ'],a:'なく'}],
 math:[
 {q:'3＋4＝',choices:['6','7','8'],a:'7'},
 {q:'9−5＝',choices:['3','4','5'],a:'4'},
 {q:'10より 1大きい かずは？',choices:['9','10','11'],a:'11'},
 {q:'2、4、6、つぎは？',choices:['7','8','9'],a:'8'},
 {q:'5こ あるうち 2こ たべました。のこりは？',choices:['2','3','4'],a:'3'}]
},
'2':{
 japanese:[
 {q:'「空」の よみかたは？',choices:['そら','かわ','もり'],a:'そら'},
 {q:'「春」の よみかたは？',choices:['はる','なつ','ふゆ'],a:'はる'},
 {q:'「走る」の よみかたは？',choices:['はしる','あるく','とまる'],a:'はしる'},
 {q:'「うれしい」に 近い ことばは？',choices:['たのしい','かなしい','くらい'],a:'たのしい'},
 {q:'「学校」で べんきょうする人は？',choices:['先生と子ども','魚','車'],a:'先生と子ども'}],
 math:[
 {q:'24＋13＝',choices:['37','36','47'],a:'37'},
 {q:'50−18＝',choices:['22','32','42'],a:'32'},
 {q:'3×4＝',choices:['7','12','14'],a:'12'},
 {q:'1時間は 何分？',choices:['30分','60分','100分'],a:'60分'},
 {q:'100円玉2まいは？',choices:['100円','200円','300円'],a:'200円'}]
},
'3easy':{
 japanese:[
 {q:'「研究」の よみかたは？',choices:['けんきゅう','けんこう','きゅうけい'],a:'けんきゅう'},
 {q:'「海」の 音読みは？',choices:['カイ','ウミ','ミズ'],a:'カイ'},
 {q:'文の終わりにつけるものは？',choices:['。','、','「'],a:'。'},
 {q:'「調べる」に近い意味は？',choices:['くわしく見る','すぐ忘れる','ねる'],a:'くわしく見る'},
 {q:'「今日は晴れです。」の主な話題は？',choices:['今日の天気','昨日のごはん','明日の学校'],a:'今日の天気'}],
 math:[
 {q:'125＋34＝',choices:['149','159','169'],a:'159'},
 {q:'81−26＝',choices:['45','55','65'],a:'55'},
 {q:'6×7＝',choices:['36','42','48'],a:'42'},
 {q:'24÷4＝',choices:['5','6','8'],a:'6'},
 {q:'1mは何cm？',choices:['10cm','100cm','1000cm'],a:'100cm'}]
}}
function sample(arr,n){return [...arr].sort(()=>Math.random()-.5).slice(0,n)}
function makeReview(){const grade=reviewGrade.value,subject=reviewSubject.value;let pool=[];const grades=grade==='mix'?['1','2']:[grade];grades.forEach(g=>{const bank=reviewBank[g];if(!bank)return;if(subject==='mix')pool.push(...bank.japanese.map(x=>({...x,sub:'国語'})),...bank.math.map(x=>({...x,sub:'算数'})));else pool.push(...bank[subject].map(x=>({...x,sub:subject==='japanese'?'国語':'算数'})));});currentReview=sample(pool,5);reviewQuiz.classList.remove('hidden');reviewQuiz.innerHTML=`<h3>やさしい復習 5問</h3>${currentReview.map((x,i)=>`<fieldset class="review-question"><legend><span>${i+1}</span>${x.sub}：${x.q}</legend>${x.choices.map(c=>`<label><input type="radio" name="rq${i}" value="${esc(c)}"> ${esc(c)}</label>`).join('')}</fieldset>`).join('')}<button id="checkReview" class="primary full">答えあわせ</button><p id="reviewResult" class="result"></p>`;document.getElementById('checkReview').onclick=checkReview}
function checkReview(){let correct=0;currentReview.forEach((x,i)=>{const picked=document.querySelector(`input[name="rq${i}"]:checked`);if(picked&&picked.value===x.a)correct++});const gradeLabels={'1':'1年生','2':'2年生','mix':'1・2年生','3easy':'3年生おためし'};const subjectLabels={mix:'国語・算数',japanese:'国語',math:'算数'};reviewResult.textContent=`5問中 ${correct}問正解！ ${correct<=2?'できた問題を大切にしよう。':correct<5?'よくがんばりました！':'全問正解、すごい！'}`;const key=today();const prev=data.reviewDays[key];data.reviewDays[key]={correct,total:5,gradeLabel:gradeLabels[reviewGrade.value],subjectLabel:subjectLabels[reviewSubject.value]};if(!prev){award(10+correct);const d=data.missions[key]||(data.missions[key]={});d.review=true}else award(correct);save();document.getElementById('checkReview').disabled=true}

// Basic interactions
document.addEventListener('click',e=>{
 const nav=e.target.closest('[data-page]');if(nav)showPage(nav.dataset.page);
 const opener=e.target.closest('[data-open-page]');if(opener)showPage(opener.dataset.openPage);
 const m=e.target.closest('[data-mission]');if(m){const d=data.missions[today()]||(data.missions[today()]={});if(!d[m.dataset.mission]){d[m.dataset.mission]=true;award(missions.find(x=>x.id===m.dataset.mission).points);save()}}
 const plus=e.target.closest('[data-hw-plus]');if(plus){const id=plus.dataset.hwPlus;const before=hwProgress(id),after=Math.min(100,before+10);data.homework[id]={progress:after};if(after>before)award(2);save()}
 const minus=e.target.closest('[data-hw-minus]');if(minus){const id=minus.dataset.hwMinus;data.homework[id]={progress:Math.max(0,hwProgress(id)-10)};save()}
 const done=e.target.closest('[data-hw-done]');if(done){const id=done.dataset.hwDone,before=hwProgress(id);data.homework[id]={progress:before===100?0:100};if(before<100)award(10);save()}
 const mood=e.target.closest('[data-mood]');if(mood){data.daily[today()]={...(data.daily[today()]||{}),mood:mood.dataset.mood};moodMessage.textContent=`今日は「${mood.dataset.mood}」なんだね。教えてくれてありがとう。`;save()}
});
resetToday.onclick=()=>{if(confirm('今日の3ミッションだけリセットしますか？')){data.missions[today()]={};save()}};
saveDailyNote.onclick=()=>{const note=dailyNote.value.trim();if(!note)return alert('一行日記を書いてください');const old=data.daily[today()]?.note;data.daily[today()]={...(data.daily[today()]||{}),note};if(!old){data.diaryEntries.push({date:today(),note});award(5)}else{const item=data.diaryEntries.find(x=>x.date===today());if(item)item.note=note}save();alert('一行日記を保存しました')};
const kanjis=[['一','いち'],['二','に'],['上','うえ'],['下','した'],['空','そら']];
kanjiList.innerHTML=kanjis.map(([k,r])=>`<div class="kanji-card"><strong>${k}</strong><small>${r}</small></div>`).join('');
finishKanji.onclick=()=>{if(data.kanjiDays[today()])return alert('今日はすでにポイントを受け取りました');data.kanjiDays[today()]={memo:kanjiMemo.value.trim()};award(10);save();alert('漢字チャレンジ完了！＋10ポイント')};
let answers=[];
function makeQuiz(){answers=[];quizArea.innerHTML='';for(let i=0;i<3;i++){let a=5+Math.floor(Math.random()*46),b=1+Math.floor(Math.random()*30),op=Math.random()>.45?'+':'−';if(op==='−'&&b>a)[a,b]=[b,a];answers.push(op==='+'?a+b:a-b);quizArea.insertAdjacentHTML('beforeend',`<label class="quiz-question"><strong>${a} ${op} ${b} ＝</strong><input inputmode="numeric" data-answer="${i}"></label>`)}quizResult.textContent='';checkQuiz.dataset.done=''}
newQuiz.onclick=makeQuiz;checkQuiz.onclick=()=>{let correct=0;document.querySelectorAll('[data-answer]').forEach((x,i)=>{if(Number(x.value)===answers[i])correct++});quizResult.textContent=`3問中 ${correct}問正解！ ${correct===3?'すごい！':'挑戦できたことが大成功！'}`;if(!checkQuiz.dataset.done){award(3+correct);data.mathDays[today()]={correct};checkQuiz.dataset.done='1';save()}};
startReview.onclick=makeReview;
async function fileToDataURL(file){if(!file)return'';if(file.size>2500000)throw new Error('写真は2.5MB以下にしてください');return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file)})}
exploreForm.onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.target);try{const photo=await fileToDataURL(explorePhoto.files[0]);data.explore.push({title:fd.get('theme'),found:fd.get('found'),date:nowText(),photo});award(8);e.target.reset();save()}catch(err){alert(err.message)}};
exportData.onclick=()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`miran-lab-backup-${today()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
importData.onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{data={...cloneDefault(),...JSON.parse(r.result)};save();alert('バックアップを読み込みました')}catch{alert('読み込めないファイルです')}};r.readAsText(f)};
printReport.onclick=()=>window.print();
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;installBtn.classList.remove('hidden')});installBtn.onclick=async()=>{if(installPrompt){installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;installBtn.classList.add('hidden')}};
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));
makeQuiz();renderAll();
