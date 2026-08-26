// ── STATE ────────────────────────────────────────────────
const state = {
  page:'home', wizardStep:1,
  profile:{
    studyArea:'', gpa:'', rigor:[], sat:'', act:'',
    extras:[], collegeType:[], regions:[], setting:[],
    campusSize:'', budgetMax:60000,
    visaStatus:'h4', homeState:'NJ',
    needMerit:true, needBased:false, okLoans:false
  },
  recommendations:[], compareList:[], activeModalId:null, modalTab:0,
  resultsFilter:'all'
};

// ── NAVIGATION ───────────────────────────────────────────
function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+id)?.classList.add('active');
  state.page=id;
  const nav=document.getElementById('main-nav');
  if(id==='home'||id==='wizard'){nav.style.display='none';}
  else{
    nav.style.display='flex';
    document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
    document.getElementById('nav-'+id)?.classList.add('active');
  }
  window.scrollTo(0,0);
  if(id==='compare') renderCompare();
  if(id==='timeline') renderTimeline();
  if(id==='visa') renderVisa();
  if(id==='satact') renderSatAct();
  if(id==='sources') renderSources();
}

function startWizard(){showPage('wizard');goToStep(1);}
function resetWizard(){state.wizardStep=1;goToStep(1);}

// ── WIZARD ───────────────────────────────────────────────
const STEPS=[
  {num:1,label:'Area of Study'},
  {num:2,label:'Academic Profile'},
  {num:3,label:'Extracurriculars'},
  {num:4,label:'College Preferences'},
  {num:5,label:'Budget & Location'},
  {num:6,label:'Family Context'}
];

function updateSidebar(){
  STEPS.forEach(s=>{
    const el=document.getElementById('ws-'+s.num);
    if(!el) return;
    el.classList.remove('done','active');
    if(s.num<state.wizardStep) el.classList.add('done');
    else if(s.num===state.wizardStep) el.classList.add('active');
    // Update inner dot content
    const dot=el.querySelector('.wiz-step-num');
    if(dot){dot.textContent=s.num<state.wizardStep?'':s.num;}
  });
}

function goToStep(n){
  if(n<1||n>6) return;
  state.wizardStep=n;
  updateSidebar();
  renderStep(n);
}

function renderStep(n){
  const body=document.getElementById('wizard-body');
  if(n===1) body.innerHTML=stepStudyArea();
  else if(n===2) body.innerHTML=stepAcademic();
  else if(n===3) body.innerHTML=stepExtras();
  else if(n===4) body.innerHTML=stepPrefs();
  else if(n===5) body.innerHTML=stepBudget();
  else if(n===6) body.innerHTML=stepFamily();
}

function nav(dir){
  if(dir===1){
    if(state.wizardStep===6){generateResults();return;}
    goToStep(state.wizardStep+1);
  } else {
    if(state.wizardStep===1){showPage('home');return;}
    goToStep(state.wizardStep-1);
  }
}

function chip(val,label,group,isArr){
  const selected=isArr?state.profile[group].includes(val):state.profile[group]===val;
  return `<div class="chip${selected?' selected':''}" onclick="toggleChip('${group}','${val}',${isArr})">${label}</div>`;
}

function toggleChip(group,val,isArr){
  if(isArr){
    const arr=state.profile[group];
    const idx=arr.indexOf(val);
    if(idx>=0) arr.splice(idx,1); else arr.push(val);
  } else {
    state.profile[group]=state.profile[group]===val?'':val;
  }
  renderStep(state.wizardStep);
}

function radioOpt(val,label,sublabel,group){
  const sel=state.profile[group]===val;
  return `<div class="radio-opt${sel?' selected':''}" onclick="state.profile['${group}']='${val}';renderStep(state.wizardStep)">
    <div class="radio-dot"></div>
    <div><div style="font-size:15px;font-weight:${sel?'600':'400'}">${label}</div>${sublabel?`<div style="font-size:13px;color:var(--text3);margin-top:2px">${sublabel}</div>`:''}</div>
  </div>`;
}

function stepStudyArea(){
  const areas=[
    ['cs','💻 Engineering / CS','Software, AI, robotics, computer systems'],
    ['premed','🏥 Health / Pre-Med / Biology','Medicine, nursing, biomedical'],
    ['business','📊 Business / Economics','Finance, marketing, accounting, econ'],
    ['arts','🎨 Arts / Design / Architecture','Fine arts, graphic design, architecture'],
    ['social','🧠 Social Sciences / Psychology','Psych, sociology, anthropology, poli sci'],
    ['education','📚 Education','Teaching, curriculum, special education'],
    ['data','📈 Data Science / AI / Math','Statistics, applied math, data analytics'],
    ['law','⚖️ Law / Public Policy','Pre-law, public policy, international relations'],
    ['undecided','🔭 Undecided / Exploratory','Not sure yet — that is perfectly fine']
  ];
  return `<div class="wiz-header"><h2>What is your student interested in studying?</h2><p>Choose one area for now — you can always change this later.</p></div>
  <div class="field-group">
    <div class="radio-grid">${areas.map(([v,l,s])=>radioOpt(v,l,s,'studyArea')).join('')}</div>
  </div>
  <div class="wiz-actions">
    <button class="btn-secondary" onclick="nav(-1)">← Back</button>
    <button class="btn-primary" onclick="nav(1)" ${!state.profile.studyArea?'disabled':''}>Next →</button>
  </div>`;
}

function stepAcademic(){
  const gpas=[['4.0','4.0 (straight A)'],['3.7-3.9','3.7–3.9 (A range)'],['3.3-3.6','3.3–3.6 (B+ range)'],['3.0-3.2','3.0–3.2 (B range)'],['below3','Below 3.0']];
  const rigors=['AP Courses','IB Program','Honors Classes','Dual Enrollment','Standard / Regular'];
  return `<div class="wiz-header"><h2>Student Academic Profile</h2><p>This helps us calibrate which schools are realistic targets. Be honest — it helps!</p></div>
  <div class="field-group">
    <label class="field-label">Unweighted GPA (approximate)</label>
    <div class="radio-grid">${gpas.map(([v,l])=>radioOpt(v,l,'','gpa')).join('')}</div>
  </div>
  <div class="field-group mt-16">
    <label class="field-label">Course Rigor (select all that apply)</label>
    <div class="chip-grid">${rigors.map(r=>chip(r,r,'rigor',true)).join('')}</div>
    <div class="field-hint">AP and IB courses show colleges the student is challenging themselves.</div>
  </div>
  <div class="field-group mt-16">
    <label class="field-label">SAT Score (if taken — leave blank if not taken yet)</label>
    <input class="field-input" type="number" min="400" max="1600" step="10" placeholder="e.g. 1350" value="${state.profile.sat||''}" oninput="state.profile.sat=this.value">
    <div class="field-hint">SAT scores range from 400–1600. Only enter if the student has taken the test.</div>
  </div>
  <div class="field-group mt-16">
    <label class="field-label">ACT Score (if taken — leave blank if not taken yet)</label>
    <input class="field-input" type="number" min="1" max="36" placeholder="e.g. 28" value="${state.profile.act||''}" oninput="state.profile.act=this.value">
  </div>
  <div class="wiz-actions">
    <button class="btn-secondary" onclick="nav(-1)">← Back</button>
    <button class="btn-primary" onclick="nav(1)" ${!state.profile.gpa?'disabled':''}>Next →</button>
  </div>`;
}

function stepExtras(){
  const cats=['Sports / Athletics','Student Government','Community Service / Volunteering','Research / Lab Work','Arts / Music / Theater','Debate / Model UN','Coding / Hackathons','Math / Science Competitions','Work Experience / Internship','Cultural / Religious Clubs','STEM Olympiads','Other Leadership'];
  return `<div class="wiz-header"><h2>Extracurricular Activities</h2><p>Colleges want to see what the student does outside the classroom. Select all that apply.</p></div>
  <div class="field-group">
    <div class="chip-grid">${cats.map(c=>chip(c,c,'extras',true)).join('')}</div>
  </div>
  <div class="field-group mt-16">
    <label class="field-label">Does the student have notable leadership, awards, or achievements?</label>
    <div class="radio-grid">
      ${radioOpt('yes','Yes — significant leadership or awards','Team captain, club president, regional/national competition placement','hasLeadership')}
      ${radioOpt('some','Some — a few activities, modest roles','Participated but not in major leadership roles','hasLeadership')}
      ${radioOpt('no','Not yet — just getting started','That is perfectly okay for a junior!','hasLeadership')}
    </div>
  </div>
  <div class="wiz-actions">
    <button class="btn-secondary" onclick="nav(-1)">← Back</button>
    <button class="btn-primary" onclick="nav(1)">Next →</button>
  </div>`;
}

function stepPrefs(){
  const types=[['public','Public University'],['private','Private University']];
  const regions=[['northeast','Northeast (NY, NJ, MA, PA, CT)'],['southeast','Southeast (NC, GA, FL, VA)'],['midwest','Midwest (OH, MI, IL, IN, WI)'],['south','South (TX, AL, TN)'],['west','West Coast (CA, WA, OR)'],['southwest','Southwest (AZ, CO, NV)'],['anywhere','Open to anywhere']];
  const settings=[['urban','Urban (big city)'],['suburban','Suburban'],['town','College town'],['rural','Rural']];
  const sizes=[['small','Small (under 5,000)'],['medium','Medium (5,000–15,000)'],['large','Large (over 15,000)'],['any','No preference']];
  return `<div class="wiz-header"><h2>College Preferences</h2><p>Help us narrow down the right kind of schools.</p></div>
  <div class="field-group">
    <label class="field-label">Type of College (select all that apply)</label>
    <div class="chip-grid">${types.map(([v,l])=>chip(v,l,'collegeType',true)).join('')}</div>
  </div>
  <div class="field-group mt-16">
    <label class="field-label">Preferred Regions (select all that apply)</label>
    <div class="chip-grid">${regions.map(([v,l])=>chip(v,l,'regions',true)).join('')}</div>
  </div>
  <div class="field-group mt-16">
    <label class="field-label">Campus Setting</label>
    <div class="chip-grid">${settings.map(([v,l])=>chip(v,l,'setting',true)).join('')}</div>
  </div>
  <div class="field-group mt-16">
    <label class="field-label">Campus Size</label>
    <div class="chip-grid">${sizes.map(([v,l])=>chip(v,l,'campusSize',false)).join('')}</div>
  </div>
  <div class="wiz-actions">
    <button class="btn-secondary" onclick="nav(-1)">← Back</button>
    <button class="btn-primary" onclick="nav(1)">Next →</button>
  </div>`;
}

function stepBudget(){
  const budgets=[['30000','Under $30,000/year'],['40000','$30,000–$40,000/year'],['55000','$40,000–$55,000/year'],['75000','$55,000–$75,000/year'],['999999','$75,000+ (or not a main concern)']];
  return `<div class="wiz-header"><h2>Budget & Cost</h2><p>This is total annual cost — tuition, housing, food, and other expenses combined.</p></div>
  <div class="field-group">
    <label class="field-label">Maximum annual budget for college (all-in)</label>
    <div class="radio-grid">${budgets.map(([v,l])=>radioOpt(v,l,'','budgetMax')).join('')}</div>
    <div class="field-hint">For families on H-1B/H-4 visas, most federal financial aid (FAFSA) is not available. Merit scholarships become very important.</div>
  </div>
  <div class="field-group mt-16">
    <label class="field-label">Scholarship priorities</label>
    <div class="chip-grid">
      ${chip('merit','Need significant merit scholarships','needMerit',false)}
      ${chip('need','Need need-based financial aid','needBased',false)}
      ${chip('loans','Comfortable with some student loans','okLoans',false)}
    </div>
  </div>
  <div class="wiz-actions">
    <button class="btn-secondary" onclick="nav(-1)">← Back</button>
    <button class="btn-primary" onclick="nav(1)" ${!state.profile.budgetMax?'disabled':''}>Next →</button>
  </div>`;
}

function stepFamily(){
  const states_list=[['CA','California'],['NY','New York'],['NJ','New Jersey'],['TX','Texas'],['IL','Illinois'],['PA','Pennsylvania'],['FL','Florida'],['GA','Georgia'],['VA','Virginia'],['WA','Washington'],['MA','Massachusetts'],['OH','Ohio'],['MI','Michigan'],['NC','North Carolina'],['Other','Other state']];
  const visas=[['h4','H-4 visa (dependent of H-1B parent)'],['h1b_in_process','H-1B holder, child on H-4'],['pr_in_process','Green card pending'],['pr','Permanent Resident (Green Card)'],['citizen','US Citizen'],['other','Other / Unsure']];
  return `<div class="wiz-header"><h2>Family Context</h2><p>This helps us tailor financial aid and residency guidance for your situation.</p></div>
  <div class="field-group">
    <label class="field-label">Student's current visa / immigration status</label>
    <div class="radio-grid">${visas.map(([v,l])=>radioOpt(v,l,'','visaStatus')).join('')}</div>
  </div>
  <div class="field-group mt-16">
    <label class="field-label">State where the family currently lives</label>
    <select class="field-select" onchange="state.profile.homeState=this.value">
      <option value="">Select your state</option>
      ${states_list.map(([v,l])=>`<option value="${v}" ${state.profile.homeState===v?'selected':''}>${l}</option>`).join('')}
    </select>
    <div class="field-hint">This affects in-state tuition eligibility and state-specific financial aid.</div>
  </div>
  <div style="background:var(--amber-lt);border-radius:var(--radius-sm);padding:16px;margin-top:16px;font-size:14px;color:var(--text2);line-height:1.6">
    <strong style="color:var(--amber)">⚠️ Important note for H-4 families:</strong><br>
    In-state tuition eligibility varies significantly by state and depends on domicile, parental tax filings, and state law. This tool provides general guidance only. Always verify with the college's registrar and consult an immigration attorney for your specific situation.
  </div>
  <div class="wiz-actions" style="margin-top:24px">
    <button class="btn-secondary" onclick="nav(-1)">← Back</button>
    <button class="btn-primary" onclick="nav(1)">Find My Colleges →</button>
  </div>`;
}

// ── RECOMMENDATION ENGINE ────────────────────────────────
function generateResults(){
  showPage('results');
  document.getElementById('results-body').innerHTML=`<div class="loading-screen"><div class="spinner"></div><p>Building your personalized college list…</p></div>`;
  setTimeout(()=>{
    state.recommendations=scoreColleges();
    renderResults();
  },1200);
}

function scoreColleges(){
  const p=state.profile;
  const gpaNum={'4.0':4.0,'3.7-3.9':3.8,'3.3-3.6':3.5,'3.0-3.2':3.1,'below3':2.8}[p.gpa]||3.5;
  const satNum=parseInt(p.sat)||0;
  const actNum=parseInt(p.act)||0;
  const budget=parseInt(p.budgetMax)||55000;
  const study=p.studyArea||'undecided';

  return COLLEGES.map(c=>{
    let score=50; let fit=c.fit;

    // GPA match
    const cgpa=parseFloat(c.gpaAvg)||3.7;
    const gpaGap=cgpa-gpaNum;
    if(gpaGap<=0.1) score+=20;
    else if(gpaGap<=0.3) score+=10;
    else if(gpaGap<=0.5) score+=0;
    else score-=15;

    // SAT match
    if(satNum>0 && c.satRange){
      const parts=c.satRange.split('–');
      const lo=parseInt(parts[0])||0, hi=parseInt(parts[1])||1600;
      const mid=(lo+hi)/2;
      if(satNum>=mid) score+=15;
      else if(satNum>=lo) score+=8;
      else score-=10;
    }

    // Budget filter
    const oos=c.totalCOA_OOS||c.totalCOA||999999;
    const is_cost=c.totalCOA_IS||c.totalCOA||999999;
    const effectiveCost=Math.min(oos, is_cost+(p.homeState===c.state?0:30000));
    let adjustedCost=oos;
    if(c.meritAid && p.needMerit) adjustedCost=oos*0.65;
    if(adjustedCost>budget+20000) score-=20;
    else if(adjustedCost<=budget) score+=15;

    // Region match
    if(p.regions.length>0 && !p.regions.includes('anywhere')){
      if(!p.regions.some(r=>c.regions.includes(r))) score-=10;
    }

    // College type match
    if(p.collegeType.length>0){
      if(!p.collegeType.includes(c.type)) score-=5;
    }

    // Major match
    const majorStr=c.majorStrength.toLowerCase();
    const studyTerms={'cs':['cs','computer','software','ai','tech'],
      'engineering':['engineering','mechanical','electrical','chemical'],
      'business':['business','finance','accounting','management'],
      'premed':['pre-med','medicine','biology','nursing','biomedical'],
      'arts':['art','design','architecture','creative'],
      'social':['psychology','sociology','political'],
      'data':['data','statistics','math','analytics'],
      'law':['law','policy','political','international'],
      'undecided':['liberal','exploratory','varied']}[study]||[];
    if(studyTerms.some(t=>majorStr.includes(t))) score+=20;

    // Fit category override based on selectivity vs student profile
    const accept=c.acceptRate||50;
    if(accept<10 && gpaNum<3.85 && (satNum<1480||satNum===0)) fit='reach';
    else if(accept<20 && gpaNum<3.75) fit='reach';
    else if(accept<35 && gpaNum>=3.85 && (satNum>=1400||satNum===0)) fit='target';
    else if(accept<35) fit='target';
    else if(accept<65 && gpaNum>=3.5) fit='likely';
    else if(accept>=65 && (c.meritAid||adjustedCost<=budget)) fit='safety';
    else fit=c.fit;

    return {...c, score, fit, adjustedCost, effectiveOOS:oos};
  }).sort((a,b)=>b.score-a.score);
}

function renderResults(){
  const p=state.profile;
  document.getElementById('results-title').textContent='Your College Shortlist';
  document.getElementById('results-subhead').textContent=
    `Based on your ${p.studyArea?MAJOR_MAP[p.studyArea]+' interest • ':''}${p.gpa?'GPA '+p.gpa+' • ':''}${p.homeState||''}`;

  // filters
  const filters=[['all','All Colleges'],['reach','Reach'],['target','Target'],['likely','Likely'],['safety','Financial Safety']];
  document.getElementById('results-filters').innerHTML=filters.map(([v,l])=>
    `<div class="filter-chip${state.resultsFilter===v?' active':''}" onclick="state.resultsFilter='${v}';renderResults()">${l}</div>`
  ).join('');

  const cats=['reach','target','likely','safety'];
  const catLabels={reach:'Reach',target:'Target',likely:'Likely / Safety',safety:'Financial Safety'};
  let html='';

  cats.forEach(cat=>{
    let list=state.recommendations.filter(c=>c.fit===cat);
    if(state.resultsFilter!=='all' && state.resultsFilter!==cat) return;
    if(list.length===0) return;
    html+=`<div class="results-section">
      <div class="section-label">
        <span class="section-badge ${cat}">${catLabels[cat]}</span>
        <span class="section-count">${list.length} college${list.length!==1?'s':''}</span>
      </div>
      <div class="college-grid">${list.map(c=>collegeCard(c)).join('')}</div>
    </div>`;
  });

  if(!html) html=`<div class="empty-state"><h3>No colleges match these filters</h3><p>Try selecting "All Colleges" above.</p></div>`;

  html+=`<div style="background:var(--amber-lt);border:1px solid var(--border);border-radius:var(--radius-sm);padding:16px 20px;font-size:13px;color:var(--text2);margin-top:12px;line-height:1.6">
    <strong>Disclaimer:</strong> Cost data is sourced from official college websites and NCES/College Scorecard as of Aug 2025. Tuition, fees, and financial aid rules change annually.
    H-4 visa holders: in-state tuition eligibility, need-based aid access, and scholarship rules vary by state and institution.
    Verify all information directly with each college before making any decision. This tool does not provide legal, immigration, or financial advice.
  </div>`;

  document.getElementById('results-body').innerHTML=html;
  updateCompareBar();
}

function collegeCard(c){
  const inCompare=state.compareList.includes(c.id);
  const cost=c.meritAid && state.profile.needMerit ? Math.round(c.adjustedCost/1000)+'k (est. w/ merit)' : '$'+Math.round((c.totalCOA_OOS||c.totalCOA)/1000)+'k/yr';
  const conf=c.confidenceScore||3;
  const dots=Array.from({length:5},(_,i)=>`<div class="conf-dot${i<conf?' filled':''}"></div>`).join('');
  const tags=MAJOR_TAGS[state.profile.studyArea||'undecided']||[];
  const matchMajors=c.majors.filter(m=>tags.some(t=>m.toLowerCase().includes(t.toLowerCase()))).slice(0,3);
  const showMajors=matchMajors.length>0?matchMajors:c.majors.slice(0,3);

  return `<div class="college-card${inCompare?' selected':''}" id="card-${c.id}">
    <div class="card-top">
      <div class="card-meta">
        <span class="card-tag ${c.type==='public'?'pub':'priv'}">${c.type==='public'?'Public':'Private'}</span>
        <span class="card-tag">${c.setting}</span>
        <span class="fit-badge ${c.fit}">${c.fit==='safety'?'Financial Safety':c.fit.charAt(0).toUpperCase()+c.fit.slice(1)}</span>
      </div>
      <div class="card-name">${c.name}</div>
      <div class="card-location">${c.city}, ${c.state}</div>
    </div>
    <div class="card-body">
      <div class="card-stats">
        <div class="stat"><div class="stat-label">Est. Annual Cost</div><div class="stat-val">${cost}</div></div>
        <div class="stat"><div class="stat-label">Acceptance Rate</div><div class="stat-val">${c.acceptRate}%</div></div>
        <div class="stat"><div class="stat-label">SAT Mid-50%</div><div class="stat-val">${c.satRange}</div></div>
        <div class="stat"><div class="stat-label">Grad Rate</div><div class="stat-val">${c.gradRate}%</div></div>
      </div>
      <div class="card-why">${c.whyFit}</div>
      <div class="card-majors">${showMajors.map(m=>`<span class="major-chip">📌 ${m}</span>`).join('')}</div>
      <div class="confidence-bar">
        <span class="conf-label">Data confidence:</span>
        <div class="conf-dots">${dots}</div>
      </div>
    </div>
    <div class="card-actions">
      <button class="card-btn" onclick="openModal('${c.id}')">Details &amp; Sources</button>
      <button class="card-btn compare-btn${inCompare?' added':''}" onclick="toggleCompare('${c.id}')">${inCompare?'✓ In Compare':'+ Compare'}</button>
    </div>
  </div>`;
}

// ── COMPARE ───────────────────────────────────────────────
function toggleCompare(id){
  const idx=state.compareList.indexOf(id);
  if(idx>=0) state.compareList.splice(idx,1);
  else {
    if(state.compareList.length>=4){alert('You can compare up to 4 colleges at a time.');return;}
    state.compareList.push(id);
  }
  updateCompareBar();
  // re-render just that card
  const c=COLLEGES.find(x=>x.id===id);
  if(c){
    const scored=state.recommendations.find(x=>x.id===id)||c;
    const el=document.getElementById('card-'+id);
    if(el) el.outerHTML=collegeCard(scored);
  }
}

function updateCompareBar(){
  const bar=document.getElementById('compare-bar');
  const preview=document.getElementById('compare-preview');
  if(state.compareList.length===0){bar.classList.remove('visible');return;}
  bar.classList.add('visible');
  preview.innerHTML=state.compareList.map(id=>{
    const c=COLLEGES.find(x=>x.id===id);
    return `<div class="compare-pill">${c?.name||id}<button onclick="toggleCompare('${id}')">×</button></div>`;
  }).join('');
}

function renderCompare(){
  const cols=state.compareList.map(id=>state.recommendations.find(x=>x.id===id)||COLLEGES.find(x=>x.id===id)).filter(Boolean);
  const el=document.getElementById('compare-content');
  if(cols.length===0){
    el.innerHTML=`<div class="empty-state"><h3>No colleges selected for comparison</h3><p>Go to My List and click "+ Compare" on up to 4 colleges, then return here.</p></div>`;
    return;
  }
  const rows=[
    ['Location','city','val=>c.city+", "+c.state'],
    ['Type','type','val=>val.charAt(0).toUpperCase()+val.slice(1)'],
    ['Setting','setting','val=>val.charAt(0).toUpperCase()+val.slice(1)'],
    ['Fit Category','fit','val=>val.charAt(0).toUpperCase()+val.slice(1)'],
    ['Acceptance Rate','acceptRate','val=>val+"%"'],
    ['SAT Mid-50%','satRange','val=>val'],
    ['ACT Mid-50%','actRange','val=>val'],
    ['Testing Policy','testPolicy','val=>val'],
    ['OOS Tuition','totalCOA_OOS','val=>"$"+(val?val.toLocaleString():"—")'],
    ['Total COA (OOS)','totalCOA_OOS','val=>val?"~$"+Math.round(val/1000)+"k/yr":"—"'],
    ['Merit Aid Available','meritAid','val=>val?"✓ Yes":"—"'],
    ['Need-Based Aid','needAid','val=>val?"✓ Yes":"Limited"'],
    ['H-4 Aid Notes','h4Aid','val=>val'],
    ['Graduation Rate','gradRate','val=>val+"%"'],
    ['Student-Faculty Ratio','sfRatio','val=>"1:"+val'],
    ['Median Earnings','medianEarnings','val=>"$"+(val/1000).toFixed(0)+"k/yr"'],
    ['Co-op / Internship','coopInternship','val=>val?"✓ Strong program":"Standard"'],
    ['Research Opportunities','researchOpp','val=>val?"✓ Yes":"—"'],
    ['Honors College','honorsCollege','val=>val?"✓ Yes":"—"'],
  ];

  let th=`<th></th>`+cols.map(c=>`<th><div style="font-size:14px;color:var(--text3);font-weight:400;margin-bottom:4px">${c.city}, ${c.state}</div>${c.name}</th>`).join('');
  let body='';
  rows.forEach(([label,key,fn])=>{
    let cells=cols.map(c=>{
      let val=key.includes('.')?key.split('.').reduce((o,k)=>o?.[k],c):c[key];
      try{val=eval('(c=>'+fn+')(c)').call(null,c);}catch(e){val=c[key];}
      const s=String(val||'—');
      return `<td title="${c.name}: ${s}">${s.length>80?s.slice(0,77)+'…':s}</td>`;
    }).join('');
    body+=`<tr><td class="row-label">${label}</td>${cells}</tr>`;
  });

  el.innerHTML=`<table class="compare-table"><thead><tr>${th}</tr></thead><tbody>${body}</tbody></table>
  <div style="font-size:12px;color:var(--text3);padding:8px 0 24px">
    All figures are estimates. Verify directly with each college before making decisions. Last updated Aug 2025.
  </div>`;
}

// ── MODAL ─────────────────────────────────────────────────
function openModal(id){
  const c=state.recommendations.find(x=>x.id===id)||COLLEGES.find(x=>x.id===id);
  if(!c) return;
  state.activeModalId=id; state.modalTab=0;
  document.getElementById('modal-overlay').classList.add('open');
  renderModal(c);
}

function closeModal(e){
  if(e.target===document.getElementById('modal-overlay'))
    document.getElementById('modal-overlay').classList.remove('open');
}

function renderModal(c){
  const cost_oos=c.totalCOA_OOS||c.totalCOA;
  const cost_is=c.totalCOA_IS;
  document.getElementById('modal-header-info').innerHTML=`
    <div class="tag-row">
      <span class="card-tag ${c.type==='public'?'pub':'priv'}">${c.type==='public'?'Public':'Private'}</span>
      <span class="fit-badge ${c.fit}">${c.fit==='safety'?'Financial Safety':c.fit.charAt(0).toUpperCase()+c.fit.slice(1)}</span>
    </div>
    <h2>${c.name}</h2>
    <div style="color:var(--text3);font-size:14px">${c.city}, ${c.state} · ${c.setting} setting</div>`;

  const tabs=['Overview','Costs & Aid','SAT / ACT','H-4 & Visa','Sources'];
  document.getElementById('modal-tabs').innerHTML=tabs.map((t,i)=>
    `<button class="mtab${i===state.modalTab?' active':''}" onclick="state.modalTab=${i};renderModal(document.getElementById?state.recommendations.find(x=>x.id===state.activeModalId)||COLLEGES.find(x=>x.id===state.activeModalId):null)">${t}</button>`
  ).join('');

  // re-wire tabs properly
  document.querySelectorAll('.mtab').forEach((btn,i)=>{
    btn.onclick=()=>{state.modalTab=i;renderModalBody(c);document.querySelectorAll('.mtab').forEach((b,j)=>b.classList.toggle('active',j===i));};
  });
  renderModalBody(c);
}

function renderModalBody(c){
  const body=document.getElementById('modal-body');
  const cost_oos=c.totalCOA_OOS||c.totalCOA;
  const cost_is=c.totalCOA_IS;
  if(state.modalTab===0){
    body.innerHTML=`
      <div class="modal-section">
        <h4>Why This May Fit</h4>
        <p style="font-size:15px;line-height:1.65;color:var(--text2)">${c.whyFit}</p>
      </div>
      <div class="modal-section">
        <h4>Tradeoffs & Concerns</h4>
        <p style="font-size:15px;line-height:1.65;color:var(--text2)">${c.tradeoffs}</p>
      </div>
      <div class="modal-section">
        <h4>At a Glance</h4>
        <div class="info-row"><span class="lbl">Acceptance Rate</span><span class="val">${c.acceptRate}%</span></div>
        <div class="info-row"><span class="lbl">Avg Admitted GPA</span><span class="val">${c.gpaAvg}</span></div>
        <div class="info-row"><span class="lbl">Graduation Rate</span><span class="val">${c.gradRate}%</span></div>
        <div class="info-row"><span class="lbl">Student-Faculty Ratio</span><span class="val">1:${c.sfRatio}</span></div>
        <div class="info-row"><span class="lbl">Median Earnings (10 yr)</span><span class="val">$${(c.medianEarnings/1000).toFixed(0)}k/yr</span></div>
        <div class="info-row"><span class="lbl">Co-op / Internship Program</span><span class="val">${c.coopInternship?'Yes — strong program':'Standard'}</span></div>
        <div class="info-row"><span class="lbl">Research Opportunities</span><span class="val">${c.researchOpp?'Yes':'Limited'}</span></div>
        <div class="info-row"><span class="lbl">Honors College</span><span class="val">${c.honorsCollege?'Yes':'No'}</span></div>
      </div>
      <div class="modal-section">
        <h4>Program Strength</h4>
        <p style="font-size:14px;color:var(--text2);line-height:1.6">${c.majorStrength}</p>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">${c.majors.map(m=>`<span class="major-chip">${m}</span>`).join('')}</div>
      </div>
      <div class="modal-section">
        <h4>Career Outcomes</h4>
        <p style="font-size:14px;color:var(--text2);line-height:1.6">${c.careerNote}</p>
      </div>`;
  } else if(state.modalTab===1){
    body.innerHTML=`
      <div class="modal-section">
        <h4>Estimated Annual Cost of Attendance</h4>
        ${cost_oos?`<div class="info-row"><span class="lbl">Out-of-State Tuition</span><span class="val">$${(c.tuitionOS||cost_oos*.7).toLocaleString()}</span></div>`:''}
        ${cost_is?`<div class="info-row"><span class="lbl">In-State Tuition</span><span class="val">$${(c.tuitionIS||c.tuitionOS||0).toLocaleString()}</span></div>`:''}
        <div class="info-row"><span class="lbl">Room &amp; Board</span><span class="val">${c.roomBoard?'$'+c.roomBoard.toLocaleString():'~$14,000'}</span></div>
        <div class="info-row"><span class="lbl">Books &amp; Personal</span><span class="val">~$3,000–4,000</span></div>
        ${cost_oos?`<div class="info-row"><span class="lbl"><strong>Est. Total OOS (per year)</strong></span><span class="val"><strong>~$${Math.round(cost_oos/1000)}k</strong></span></div>`:''}
        ${cost_is?`<div class="info-row"><span class="lbl"><strong>Est. Total In-State (per year)</strong></span><span class="val"><strong>~$${Math.round(cost_is/1000)}k</strong></span></div>`:''}
        <div class="disclaimer">Figures are estimates from official sources, last verified Aug 2025. Actual costs vary. Verify at the college's official cost-of-attendance page.</div>
      </div>
      <div class="modal-section">
        <h4>Merit Scholarships</h4>
        <p style="font-size:14px;color:var(--text2);line-height:1.6">${c.meritAid?(c.meritNote||'Merit scholarships available — check official scholarship page.'):'This college does not offer significant merit scholarships. Aid is primarily need-based.'}</p>
      </div>
      <div class="modal-section">
        <h4>Need-Based Financial Aid</h4>
        <p style="font-size:14px;color:var(--text2);line-height:1.6">${c.needAid?'Need-based aid is available.':'Need-based aid is very limited.'}</p>
        ${c.meritAid&&state.profile.needMerit?`<div class="good-box">For a student with your profile who qualifies for merit aid, the effective cost could be approximately <strong>$${Math.round(c.adjustedCost/1000)}k/yr</strong> — an estimate only.</div>`:''}
      </div>`;
  } else if(state.modalTab===2){
    const satLo=parseInt((c.satRange||'1200-1400').split('–')[0])||1200;
    const satHi=parseInt((c.satRange||'1200-1400').split('–')[1])||1400;
    const satMid=(satLo+satHi)/2;
    const studentSAT=parseInt(state.profile.sat)||0;
    let satAdvice='';
    if(c.testPolicy==='test-blind') satAdvice='This college is <strong>test-blind</strong>. Your SAT/ACT score will NOT be considered in any decision. Do not submit.';
    else if(c.testPolicy==='test-required') satAdvice='This college <strong>requires</strong> SAT or ACT. You must submit a score.';
    else if(studentSAT>satMid) satAdvice=`Your student's SAT of ${studentSAT} is <strong>above the middle 50%</strong> range (${c.satRange}). <strong>Submit your score</strong> — it strengthens the application.`;
    else if(studentSAT>satLo) satAdvice=`Your student's SAT of ${studentSAT} falls within the middle 50% range (${c.satRange}). <strong>Submitting may be neutral or slightly helpful</strong>. Consider retaking to reach ${satHi}+.`;
    else if(studentSAT>0) satAdvice=`Your student's SAT of ${studentSAT} is below the middle 50% range (${c.satRange}). Since this college is test-optional, <strong>applying without a score may be better</strong> unless you plan to retake.`;
    else satAdvice=`No SAT/ACT score entered. This college is <strong>${c.testPolicy}</strong>. ${c.testPolicy==='test-required'?'A score is required.':'If your student scores in the upper half of the range ('+c.satRange+'), submitting would strengthen the application.'}`;

    body.innerHTML=`
      <div class="modal-section">
        <h4>Testing Policy</h4>
        <div class="policy-badge ${c.testPolicy==='test-blind'?'blind':c.testPolicy==='test-required'?'req':'opt'}">
          ${c.testPolicy==='test-blind'?'Test-Blind':c.testPolicy==='test-required'?'Test-Required':'Test-Optional'}
        </div>
        <p style="font-size:13px;color:var(--text3);margin-top:6px">${c.testNote}</p>
      </div>
      <div class="modal-section">
        <h4>Score Ranges (Middle 50% of Admitted Students)</h4>
        <div class="info-row"><span class="lbl">SAT</span><span class="val">${c.satRange||'Not reported'}</span></div>
        <div class="info-row"><span class="lbl">ACT</span><span class="val">${c.actRange||'Not reported'}</span></div>
      </div>
      <div class="modal-section">
        <h4>Personalized SAT/ACT Advice</h4>
        <div class="policy-advice" style="font-size:14px;line-height:1.65">${satAdvice}</div>
      </div>
      <div class="modal-section">
        <h4>When Tests Affect Other Decisions</h4>
        <div class="info-row"><span class="lbl">Merit Scholarship Eligibility</span><span class="val">${c.meritAid?'Yes — scores often affect award level':'N/A'}</span></div>
        <div class="info-row"><span class="lbl">Honors College Admission</span><span class="val">${c.honorsCollege?'May require test scores — verify with school':'N/A'}</span></div>
      </div>`;
  } else if(state.modalTab===3){
    body.innerHTML=`
      <div class="modal-section">
        <h4>H-4 Visa: Financial Aid Guidance</h4>
        <div class="visa-note"><strong>For this college:</strong><br>${c.h4Aid}</div>
      </div>
      <div class="modal-section">
        <h4>In-State Tuition Eligibility</h4>
        <p style="font-size:14px;color:var(--text2);line-height:1.65">
          In-state tuition for H-4 holders depends on state law and the college's policies. Generally, to qualify for in-state tuition, families must establish <strong>domicile</strong> in the state — meaning they live there with intent to stay, pay state taxes, and meet residency duration requirements (often 12 months). Being on an H-1B work visa does not automatically establish domicile in all states.
        </p>
        <div class="warning-box">Always verify in-state tuition eligibility directly with the college Registrar's office before making any financial plans. Rules change and vary significantly by state.</div>
      </div>
      <div class="modal-section">
        <h4>Federal Financial Aid (FAFSA)</h4>
        <p style="font-size:14px;color:var(--text2);line-height:1.65">
          H-4 visa holders are <strong>generally not eligible for federal financial aid</strong> (Pell Grants, subsidized loans) through FAFSA. Some states have state-level aid programs with different rules. Some colleges offer institutional need-based grants to international and visa-holding students — verify with each school.
        </p>
      </div>
      <div class="modal-section">
        <h4>Strategies for H-4 Families</h4>
        <div class="info-row"><span class="lbl">Merit Scholarships</span><span class="val">Best option — not citizenship-restricted</span></div>
        <div class="info-row"><span class="lbl">Private Scholarships</span><span class="val">Many open to H-4; check eligibility per award</span></div>
        <div class="info-row"><span class="lbl">Green Card Timing</span><span class="val">PR before enrollment = more aid options</span></div>
        <div class="info-row"><span class="lbl">State DREAM Acts</span><span class="val">NY, CA, TX, IL and others — verify per state</span></div>
        <div class="disclaimer">This is educational guidance only — not legal or immigration advice. Consult a qualified immigration attorney for your specific situation.</div>
      </div>`;
  } else {
    body.innerHTML=`
      <div class="modal-section">
        <h4>Official Sources for ${c.name}</h4>
        ${c.sources.map(s=>`
          <div class="source-link">
            <span class="src-tag">${s.type}</span>
            <a href="${s.url}" target="_blank" rel="noopener">${s.label} ↗</a>
          </div>`).join('')}
        <div class="source-link">
          <span class="src-tag">OFFICIAL</span>
          <a href="https://collegescorecard.ed.gov" target="_blank" rel="noopener">College Scorecard (US Dept of Education) ↗</a>
        </div>
        <div class="source-link">
          <span class="src-tag">OFFICIAL</span>
          <a href="https://nces.ed.gov/ipeds" target="_blank" rel="noopener">IPEDS / NCES ↗</a>
        </div>
      </div>
      <div class="modal-section">
        <h4>Data Quality</h4>
        <div class="info-row"><span class="lbl">Confidence Score</span><span class="val">${c.confidenceScore}/5</span></div>
        <div class="info-row"><span class="lbl">Last Verified</span><span class="val">${c.lastChecked||'Aug 2025'}</span></div>
        <p style="font-size:13px;color:var(--text3);margin-top:12px;line-height:1.55">
          High confidence (5/5): data sourced from official college, state, or federal government pages.<br>
          Medium confidence (3–4/5): reputable third-party source with recent data.<br>
          Low confidence (1–2/5): conflicting or outdated sources — verify directly.
        </p>
      </div>`;
  }
}

// ── TIMELINE ─────────────────────────────────────────────
function renderTimeline(){
  const months=[
    {m:'August–September',title:'Junior Year Begins',tasks:['Register for the most challenging courses available (AP, IB, Honors)','Create a college exploration list — aim for 20–30 initial colleges','Take a practice SAT or ACT to establish a baseline score','Research what interests you in a major — not just a career label']},
    {m:'October',title:'Test Planning & Research',tasks:['Register for the October or November PSAT (free, at school)','Research PSAT National Merit cutoffs for your state','Attend college fairs (virtual or in-person) to meet admissions reps','Start exploring college websites and YouTube channels from actual students']},
    {m:'November–December',title:'Deepen Your Research',tasks:['Visit 2–3 local colleges to understand campus vibes','Research in-state tuition rules for your state — especially for H-4 families','Begin a personal spreadsheet tracking college names, costs, deadlines','Talk to high school counselor about course load and GPA trajectory']},
    {m:'January',title:'SAT / ACT Preparation',tasks:['Begin structured SAT/ACT prep (Khan Academy SAT is free and excellent)','Set a target score based on colleges of interest','Register for a spring SAT or ACT (March, May, or June dates)','Research if the student wants to pursue specific competitive programs like CS or Business — these may have separate requirements']},
    {m:'February–March',title:'College List Building',tasks:['Narrow initial list to 12–15 colleges across Reach, Target, and Safety categories','Verify H-4 in-state tuition eligibility for each state on your list','Research merit scholarship deadlines — many are very early (some as soon as Sept of senior year)','Request college information packs and put yourself on mailing lists']},
    {m:'April–May',title:'Campus Visits & SAT/ACT',tasks:['Take SAT or ACT (spring administration)','Schedule campus visits during spring break or summer','Shadow a student or attend accepted students days if possible','Begin thinking about Common App essay themes — no writing yet, just brainstorming']},
    {m:'June–July',title:'Summer Action',tasks:['Take SAT or ACT again if needed (June or August date)','Finalize college list to 10–14 colleges','Draft and revise Common App personal essay (650 words)','Request letters of recommendation from junior year teachers — do this in June, not September!','Research external scholarships with August–November deadlines','Visit remaining colleges on list if possible']},
    {m:'August',title:'Senior Year Preparation',tasks:['Finalize college list','Complete Common App profile and activities list','Polish personal essay','Confirm recommendation letters are committed','Check Early Action (EA) and Early Decision (ED) deadlines — typically Nov 1 or Nov 15','Review FAFSA opening (Oct 1) — even for H-4, some colleges use FAFSA for institutional aid calculations']}
  ];
  const body=document.getElementById('timeline-body');
  let html=`<button class="back-link" onclick="showPage('results')">← Back</button><h2>Junior Year Action Plan</h2><p class="timeline-sub">Month-by-month college prep — your family's roadmap from August through senior year prep.</p>`;
  months.forEach((item,i)=>{
    html+=`<div class="tl-month">
      <div class="tl-date">${item.m}</div>
      <div class="tl-line"><div class="tl-dot"></div>${i<months.length-1?'<div class="tl-rail"></div>':''}</div>
      <div class="tl-content">
        <h3>${item.title}</h3>
        <div class="tl-tasks">${item.tasks.map(t=>`<div class="tl-task">${t}</div>`).join('')}</div>
      </div>
    </div>`;
  });
  body.innerHTML=html;
}

// ── VISA PAGE ─────────────────────────────────────────────
function renderVisa(){
  const body=document.getElementById('visa-body');
  body.innerHTML=`<button class="back-link" onclick="showPage('results')">← Back</button>
  <h2>Visa, Residency &amp; Financial Aid</h2>
  <p style="color:var(--text2);margin-bottom:28px;font-size:15px">Key information for families on H-1B and H-4 visas. Always verify with each college and a qualified immigration attorney.</p>

  <div class="visa-section">
    <h3>🎓 What Is an H-4 Visa Student?</h3>
    <p>An H-4 visa is a dependent visa for spouses and children of H-1B visa holders. Children on H-4 visas are not US citizens or permanent residents. For college admissions purposes, they are typically treated as <strong>international students</strong>, which affects tuition rates and financial aid eligibility.</p>
    <div class="good-box">Good news: College <strong>admission</strong> decisions are not affected by visa status. Colleges do not discriminate based on H-4 status in the admissions process.</div>
  </div>

  <div class="visa-section">
    <h3>💰 In-State Tuition: Can We Qualify?</h3>
    <p>This is one of the most important financial questions for H-4 families. The rules vary significantly by state.</p>
    <ul>
      <li><strong>States with more flexible rules:</strong> New York (NY DREAM Act), California (AB 540), Texas (HB 1403), Illinois (RISE Act), New Jersey — students who attended high school in the state for 2+ years may qualify.</li>
      <li><strong>How domicile works:</strong> Many states grant in-state tuition if the family establishes <em>domicile</em> — living in the state with the intent to remain, filing state taxes, having a driver's license, etc. H-1B holders can often establish domicile because they intend to stay in the US.</li>
      <li><strong>What to do:</strong> Contact the Registrar's office at each college of interest and ask specifically about in-state tuition for H-4 dependent students whose parents hold H-1B visas and file taxes in the state.</li>
    </ul>
    <div class="warning-box">⚠️ Rules change frequently. In-state tuition cannot be assumed. Always verify annually and before committing to a school.</div>
  </div>

  <div class="visa-section">
    <h3>📋 Federal Financial Aid (FAFSA)</h3>
    <p>H-4 visa holders are <strong>generally not eligible</strong> for federal student aid through FAFSA — this includes Pell Grants, subsidized loans, and work-study. However:</p>
    <ul>
      <li>Some colleges use the FAFSA to calculate institutional (college-funded) aid, and may award their own grants to H-4 students.</li>
      <li>If a Green Card is approved before enrollment begins, full federal aid eligibility opens up.</li>
      <li>FAFSA opens October 1 each year. Even if federal aid is unavailable, filling it out may be required to access college-specific aid — ask each school.</li>
    </ul>
  </div>

  <div class="visa-section">
    <h3>🏆 Merit Scholarships: The Primary Path</h3>
    <p>For H-4 families, <strong>merit scholarships are the most reliable way to reduce college costs</strong>. These are awarded based on academic achievement, not citizenship or financial need.</p>
    <ul>
      <li>Most university merit scholarships do not restrict eligibility by visa status.</li>
      <li>The University of Alabama, Arizona State, Ohio State, Purdue, and many others offer substantial automatic merit awards to OOS students with strong GPAs.</li>
      <li>Apply to colleges where the student's academic profile is in the top 25% of admitted students — this maximizes merit aid leverage.</li>
      <li>Some external scholarships also have no citizenship requirements — the STEM field in particular has many such awards.</li>
    </ul>
    <div class="good-box">💡 Strategy: Include 1–2 "financial safety" schools (like University of Alabama or ASU) where large merit scholarships are near-guaranteed for strong students. This gives your family a real affordable option no matter what.</div>
  </div>

  <div class="visa-section">
    <h3>🌐 CSS Profile</h3>
    <p>Some private colleges use the CSS Profile (in addition to or instead of FAFSA) to award institutional aid. The CSS Profile is not limited by citizenship status — H-4 students can complete it. Colleges like MIT, Stanford, and Harvard use it and meet 100% of demonstrated need for admitted students regardless of visa status.</p>
  </div>

  <div class="visa-section">
    <h3>📝 State DREAM Acts</h3>
    <p>Several states have passed Dream Act legislation that extends in-state tuition and sometimes state financial aid to students who attended high school in the state, regardless of immigration status. Key states include:</p>
    <ul>
      <li><strong>New York:</strong> NY DREAM Act — in-state tuition and TAP grants for eligible students</li>
      <li><strong>California:</strong> AB 540 — in-state tuition for students who attended CA high school 3+ years</li>
      <li><strong>Texas:</strong> HB 1403 — in-state tuition for students who lived in TX for 3+ years before graduation</li>
      <li><strong>Illinois:</strong> RISE Act — in-state tuition</li>
      <li><strong>New Jersey:</strong> NJ DREAM Act — tuition equity</li>
    </ul>
    <div class="warning-box">These acts were designed primarily for undocumented students but many apply to H-4 holders as well. Verify eligibility with each state's higher education agency and the specific college.</div>
  </div>

  <div style="font-size:12px;color:var(--text3);margin-top:24px;padding:16px;background:var(--surface);border-radius:var(--radius-sm);border:1px solid var(--border)">
    <strong>Important Disclaimer:</strong> This information is for general educational purposes only. Immigration law, state residency rules, and college financial aid policies are complex and change frequently. Nothing on this page constitutes legal, immigration, or financial advice. Consult a licensed immigration attorney and each college's financial aid office for guidance specific to your situation.
  </div>`;
}

// ── SAT/ACT PAGE ──────────────────────────────────────────
function renderSatAct(){
  const body=document.getElementById('satact-body');
  const studentSAT=parseInt(state.profile.sat)||0;
  const studentACT=parseInt(state.profile.act)||0;
  let adviceHtml='';
  if(studentSAT||studentACT){
    adviceHtml=`<div style="background:var(--sage);border-radius:var(--radius-sm);padding:16px 20px;margin-bottom:28px">
      <strong>Your Student's Scores:</strong> ${studentSAT?'SAT '+studentSAT:''}${studentSAT&&studentACT?' · ':''}${studentACT?'ACT '+studentACT:''}<br>
      <span style="font-size:13px;color:var(--text2);margin-top:4px;display:block">See the SAT/ACT tab on each college card in My List for personalized advice per school.</span>
    </div>`;
  }

  const policies=[
    {name:'Test-Required',badge:'req',desc:'The college requires either SAT or ACT to complete an application. Your score will always be reviewed.',advice:'Submit your best score. If the score is weak, consider retaking before applying. Test prep is worth the investment.'},
    {name:'Test-Optional',badge:'opt',desc:'The student may choose to submit or not submit test scores. Both paths are equally valid for admission.',advice:'Submit if your score is at or above the college\'s middle 50% range. Apply without a score if your score falls below — your GPA and coursework carry more weight.'},
    {name:'Test-Blind',badge:'blind',desc:'The college will not consider SAT or ACT scores under any circumstances — not for admission, scholarships, or honors.',advice:'Do NOT submit your scores to test-blind colleges. Save the application fee. Focus on GPA, essays, and activities instead.'}
  ];

  const collegePolicies=COLLEGES.slice(0,12);
  body.innerHTML=`<button class="back-link" onclick="showPage('results')">← Back</button>
  <h2>SAT &amp; ACT Strategy Guide</h2>
  <p style="color:var(--text2);margin-bottom:8px;font-size:15px">Testing policies change often. Always verify on the college's official admissions page before applying.</p>
  ${adviceHtml}

  <h3 style="font-size:20px;margin-bottom:16px;margin-top:8px">Understanding the Three Testing Policies</h3>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;margin-bottom:36px">
    ${policies.map(p=>`<div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px">
      <div class="policy-badge ${p.badge}">${p.name}</div>
      <p style="font-size:14px;color:var(--text2);margin-bottom:10px;line-height:1.55">${p.desc}</p>
      <div class="policy-advice">${p.advice}</div>
    </div>`).join('')}
  </div>

  <h3 style="font-size:20px;margin-bottom:16px">College Testing Policies at a Glance</h3>
  <div class="policy-grid">
  ${collegePolicies.map(c=>{
    const badge=c.testPolicy==='test-blind'?'blind':c.testPolicy==='test-required'?'req':'opt';
    const label=c.testPolicy==='test-blind'?'Test-Blind':c.testPolicy==='test-required'?'Test-Required':'Test-Optional';
    return `<div class="policy-card">
      <div class="policy-badge ${badge}">${label}</div>
      <h4>${c.name}</h4>
      <div class="loc">${c.city}, ${c.state}</div>
      <div class="policy-scores">SAT: ${c.satRange} · ACT: ${c.actRange}</div>
      <div class="policy-advice">${c.testNote}</div>
    </div>`;
  }).join('')}
  </div>
  <div style="font-size:12px;color:var(--text3);margin-top:24px;padding:16px;background:var(--surface);border-radius:var(--radius-sm);border:1px solid var(--border)">
    Testing policies as of Aug 2025. Test-optional and test-blind policies are subject to change annually. Always verify on the college's official admissions website before applying.
  </div>`;
}

// ── SOURCES PAGE ──────────────────────────────────────────
function renderSources(){
  const body=document.getElementById('sources-body');
  body.innerHTML=`<button class="back-link" onclick="showPage('results')">← Back</button>
  <h2>Source Library</h2>
  <p style="color:var(--text2);margin-bottom:28px;font-size:15px">Every data point in CollegePath comes from an official or highly trusted source. Data reviewed Aug 2025.</p>

  <div class="source-group">
    <h3>Federal Government Sources</h3>
    ${[
      ['College Scorecard (US Dept of Education)','Earnings, graduation rates, student debt data','https://collegescorecard.ed.gov','GOV'],
      ['IPEDS / NCES','Institutional characteristics, enrollment, cost data','https://nces.ed.gov/ipeds','GOV'],
      ['Federal Student Aid','FAFSA, loans, grants, aid programs','https://studentaid.gov','GOV'],
      ['USCIS — H-4 Visa Information','Official immigration status guidance','https://www.uscis.gov/working-in-the-united-states/students','GOV']
    ].map(([n,d,u,t])=>`<div class="source-item"><span class="src-type">${t}</span><div><a href="${u}" target="_blank" rel="noopener">${n}</a><div style="color:var(--text3);font-size:13px;margin-top:2px">${d}</div></div></div>`).join('')}
  </div>

  <div class="source-group">
    <h3>State Sources</h3>
    ${[
      ['NY DREAM Act (HESC)','NY in-state tuition for eligible students','https://www.hesc.ny.gov/dream','STATE'],
      ['California AB 540','CA in-state tuition policy','https://admission.universityofcalifornia.edu/tuition-financial-aid/types-of-aid/ab-540.html','STATE'],
      ['Texas HB 1403','TX residency for tuition purposes','https://www.txstate.edu/admissions/applying/tuition-residency.html','STATE'],
    ].map(([n,d,u,t])=>`<div class="source-item"><span class="src-type">${t}</span><div><a href="${u}" target="_blank" rel="noopener">${n}</a><div style="color:var(--text3);font-size:13px;margin-top:2px">${d}</div></div></div>`).join('')}
  </div>

  <div class="source-group">
    <h3>College Official Sources</h3>
    <p style="font-size:14px;color:var(--text2);margin-bottom:12px">Each college page links to official admissions, tuition, and financial aid pages. Click "Details & Sources" on any college card to see institution-specific links.</p>
    ${COLLEGES.slice(0,8).map(c=>`<div class="source-item"><span class="src-type">OFFICIAL</span><div><a href="${c.sources[0]?.url}" target="_blank" rel="noopener">${c.name} — ${c.sources[0]?.label}</a></div></div>`).join('')}
  </div>

  <div class="source-group">
    <h3>Testing Policy Sources</h3>
    ${[
      ['College Board — SAT','Official SAT information and registration','https://www.collegeboard.org','OFFICIAL'],
      ['ACT, Inc.','Official ACT information and registration','https://www.act.org','OFFICIAL'],
      ['FairTest — Test-Optional Colleges List','Comprehensive list of test-optional colleges','https://www.fairtest.org','REFERENCE']
    ].map(([n,d,u,t])=>`<div class="source-item"><span class="src-type">${t}</span><div><a href="${u}" target="_blank" rel="noopener">${n}</a><div style="color:var(--text3);font-size:13px;margin-top:2px">${d}</div></div></div>`).join('')}
  </div>

  <div style="background:var(--amber-lt);border-radius:var(--radius-sm);padding:16px 20px;font-size:13px;color:var(--text2);margin-top:8px;line-height:1.6">
    <strong>Data Confidence Levels:</strong><br>
    ⬤⬤⬤⬤⬤ High (5/5) — Official college, state, or federal government source<br>
    ⬤⬤⬤⬤○ Good (4/5) — Reputable third-party or secondary official source<br>
    ⬤⬤⬤○○ Medium (3/5) — Reputable source; verify before relying on it<br>
    When sources conflict, CollegePath shows: "Sources differ — verify directly with the college."
  </div>`;
}

// ── INIT ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded',()=>{
  showPage('home');
  // Pre-populate some defaults
  state.profile.collegeType=['public','private'];
  state.profile.regions=['anywhere'];
  state.profile.budgetMax='55000';
});
