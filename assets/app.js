const questions = [
  ['aiLiteracy','AI literacy','Can you explain what AI can and cannot safely do?'],
  ['jobReadiness','Job readiness','Can you prove practical AI skill for a resume, interview, or work sample?'],
  ['workflowReadiness','Workflow readiness','Can you identify repeated work that AI could help improve?'],
  ['privacyRisk','Data/privacy awareness','Do you know what information should not be entered into AI tools?'],
  ['automationOpportunity','Automation opportunity','Could better AI use save time, money, or repeated effort?'],
  ['humanJudgment','Human judgment','Do you review AI output before using it for decisions?'],
  ['implementationConfidence','Implementation confidence','Can you turn AI knowledge into a real daily process?']
];

const choices = [[1,'Not yet'],[2,'A little, but I need structure'],[3,'Yes, with some guidance'],[4,'Yes, confidently']];
let current = 0;
const answers = {};
const $ = (s) => document.querySelector(s);
const setField = (name,value) => { const field = document.querySelector(`[name="${name}"]`); if(field) field.value = value || ''; };

function hydrateCaptureFields(){
  const params = new URLSearchParams(window.location.search);
  setField('landing_page', window.location.href);
  setField('referrer', document.referrer || 'direct');
  setField('utm_source', params.get('utm_source') || '');
  setField('utm_medium', params.get('utm_medium') || '');
  setField('utm_campaign', params.get('utm_campaign') || '');
  setField('utm_term', params.get('utm_term') || '');
  setField('utm_content', params.get('utm_content') || '');
  setField('lead_source', params.get('utm_source') || document.referrer || 'direct');
}

function render(){
  const q = questions[current];
  const box = $('[data-question]');
  const progress = $('[data-progress]');
  const bar = $('[data-bar]');
  const back = $('[data-prev]');
  const next = $('[data-next]');
  progress.textContent = `Question ${current + 1} of ${questions.length}`;
  bar.style.width = `${((current + 1) / questions.length) * 100}%`;
  back.disabled = current === 0;
  next.disabled = !answers[q[0]];
  next.textContent = current === questions.length - 1 ? 'See my score' : 'Next';
  box.innerHTML = `<p class='eyebrow'>${q[1]}</p><h3>${q[2]}</h3><div class='options'>${choices.map(c => `<button class='option' type='button' data-value='${c[0]}' aria-pressed='${answers[q[0]] === c[0]}'>${c[1]}</button>`).join('')}</div>`;
  box.querySelectorAll('.option').forEach(button => button.addEventListener('click', () => { answers[q[0]] = Number(button.dataset.value); render(); }));
}

function chooseRecommendation(score){
  if(score < 42) return ['AI Starter Pass','Build foundations before jumping into advanced tools.'];
  if((answers.jobReadiness || 0) <= 2) return ['AI Job & Productivity Pass','Create proof-of-skill examples for resumes, interviews, and daily work.'];
  if((answers.workflowReadiness || 0) >= 3 && (answers.automationOpportunity || 0) >= 3) return ['Business AI Readiness Audit','Map the workflow before buying tools or automating too much.'];
  if(score >= 74 && (answers.implementationConfidence || 0) >= 3) return ['AI Implementation Partner Review','A human review should confirm scope, risk, budget, and return first.'];
  return ['AI Starter Pass','Get practical training, safe-use habits, and a clearer implementation path.'];
}

function leadTier(score){
  if(score >= 80) return 'Hot implementation lead';
  if(score >= 62) return 'Audit-ready lead';
  if(score >= 42) return 'Training lead';
  return 'Foundation lead';
}

function showResult(){
  const total = Object.values(answers).reduce((sum,value) => sum + value, 0);
  const score = Math.round((total / (questions.length * 4)) * 100);
  const [path,message] = chooseRecommendation(score);
  const tier = score >= 76 ? 'Advanced opportunity' : score >= 56 ? 'Practical builder' : score >= 40 ? 'Foundation needed' : 'High support needed';
  const sorted = [...questions].sort((a,b) => (answers[a[0]] || 0) - (answers[b[0]] || 0));
  const strongest = sorted[sorted.length - 1][1];
  const weakest = sorted[0][1];
  const crmTier = leadTier(score);
  $('#result').innerHTML = `<p class='eyebrow'>Your AI readiness profile</p><h3>${tier}</h3><div class='score'><b>${score}</b><span>/100</span></div><p><strong>Recommended path:</strong> ${path}</p><p>${message}</p><p><strong>Lead tier:</strong> ${crmTier}<br><strong>Strongest area:</strong> ${strongest}<br><strong>Riskiest gap:</strong> ${weakest}</p><a class='btn primary' href='#book' style='margin-top:1.2rem'>Request human review</a>`;
  setField('score_summary', `Score ${score}/100 | ${tier} | Lead tier: ${crmTier} | Path: ${path} | Strongest: ${strongest} | Gap: ${weakest}`);
  setField('recommended_path', path);
  setField('lead_tier', crmTier);
  setField('readiness_score', String(score));
}

$('[data-prev]').addEventListener('click', () => { if(current > 0){ current -= 1; render(); } });
$('[data-next]').addEventListener('click', () => { if(!answers[questions[current][0]]) return; if(current < questions.length - 1){ current += 1; render(); } else { showResult(); } });
$('[data-menu]')?.addEventListener('click', () => { const links = $('[data-links]'); const open = links.classList.toggle('open'); $('[data-menu]').setAttribute('aria-expanded', String(open)); });
document.querySelectorAll('[data-plan]').forEach(link => link.addEventListener('click', () => { const select = document.querySelector('select[name=path]'); if(select) select.value = link.dataset.plan; }));
$('#lead-form')?.addEventListener('submit', hydrateCaptureFields);
hydrateCaptureFields();
render();
