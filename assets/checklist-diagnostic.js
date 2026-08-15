(async function(){
  const root=document.querySelector('[data-readiness-diagnostic]');
  if(!root)return;
  const {AREAS,CHECKS,calculateDiagnostic,percentComplete}=await import('./readiness-engine.mjs');
  const form=root.querySelector('form');
  const progress=root.querySelector('[data-diagnostic-progress]');
  const bar=root.querySelector('[data-diagnostic-bar]');
  const result=root.querySelector('[data-diagnostic-result]');
  const summary=root.querySelector('[data-diagnostic-summary]');
  const config=window.AIKOLLEGE_SITE_CONFIG||window.FIFYNOW_SITE_CONFIG||{};
  const responses={};
  let started=false;
  const track=(name,params={})=>{if(typeof window.gtag==='function')window.gtag('event',name,params);if(typeof window.plausible==='function')window.plausible(name,{props:params});};
  const escapeHtml=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  let context={};
  try{context=JSON.parse(sessionStorage.getItem('aik_checklist_context')||'{}')||{};}catch{}

  const groups=Object.fromEntries(AREAS.map(a=>[a.key,[]]));
  CHECKS.forEach(item=>groups[item[0]].push(item));
  form.innerHTML=AREAS.map((area,index)=>`<fieldset class="diagnostic-area"><legend><span>${index+1}</span>${escapeHtml(area.label)}</legend>${groups[area.key].map(([,id,text],i)=>`<div class="diagnostic-item"><p><strong>${index+1}.${i+1}</strong> ${escapeHtml(text)}</p><div class="diagnostic-options" role="radiogroup" aria-label="${escapeHtml(text)}"><label><input type="radio" name="${id}" value="yes"> Yes</label><label><input type="radio" name="${id}" value="needs_review"> Needs review</label><label><input type="radio" name="${id}" value="not_yet"> Not yet</label></div></div>`).join('')}</fieldset>`).join('')+`<div class="diagnostic-submit"><button class="btn primary" type="submit" disabled data-diagnostic-submit>See my readiness result</button><p class="note">This is an educational self-assessment, not a certification, professional diagnosis, or guarantee of outcomes.</p></div>`;

  const submit=form.querySelector('[data-diagnostic-submit]');
  function refreshProgress(){const pct=percentComplete(responses);progress.textContent=`${Object.keys(responses).length} of ${CHECKS.length} answered`;bar.style.width=`${pct}%`;submit.disabled=pct<100;if(!started&&pct>0){started=true;track('free_checklist_started',{check_count:CHECKS.length,source:'free_checklist'});}}
  form.addEventListener('change',e=>{if(!e.target.matches('input[type="radio"]'))return;responses[e.target.name]=e.target.value;refreshProgress();});

  function resolveRecommendation(rec){
    if(rec.kind==='self_serve'){
      const url=config.payments?.[rec.paymentKey];
      return {href:typeof url==='string'&&/^https:\/\//.test(url)?url:rec.fallback||'courses.html',stripe:typeof url==='string'&&/^https:\/\//.test(url)};
    }
    return {href:rec.href||'courses.html',stripe:false};
  }
  form.addEventListener('submit',e=>{
    e.preventDefault();
    if(percentComplete(responses)<100)return;
    const diagnostic=calculateDiagnostic(responses,context);
    const rec=diagnostic.recommendation;
    const destination=resolveRecommendation(rec);
    result.hidden=false;
    summary.innerHTML=`<div class="diagnostic-score"><b>${diagnostic.overall}</b><span>/100</span></div><div><p class="eyebrow">${escapeHtml(diagnostic.profile)}</p><h2>Your strongest area is ${escapeHtml(diagnostic.strongest.label)}.</h2><p>Your priority area is <strong>${escapeHtml(diagnostic.priority.label)}</strong> at ${diagnostic.priority.score}/100. The score is a self-review signal, not a credential.</p></div>`;
    root.querySelector('[data-free-actions]').innerHTML=diagnostic.freeActions.map(x=>`<li>${escapeHtml(x)}</li>`).join('');
    const recBox=root.querySelector('[data-recommendation]');
    recBox.innerHTML=`<p class="eyebrow">Recommended next step</p><h3>${escapeHtml(rec.name)}</h3><p>${escapeHtml(rec.reason)}</p>${rec.kind==='free'?'<p class="truth-note"><strong>No purchase recommended right now.</strong> Keep applying the free guidance and build real proof before buying more training.</p>':''}<div class="actions"><a class="btn primary" data-recommendation-cta href="${escapeHtml(destination.href)}">${rec.kind==='free'?'Continue free':'See this next step'}</a><a class="btn secondary" href="courses.html">Compare all paths</a></div>`;
    const cta=recBox.querySelector('[data-recommendation-cta]');
    cta.addEventListener('click',()=>{track('free_checklist_recommendation_clicked',{recommendation:rec.key,kind:rec.kind,score:diagnostic.overall,priority_area:diagnostic.priority.key});if(destination.stripe)track('stripe_checkout_started',{offer:rec.paymentKey,destination:'stripe',source:'free_checklist'});});
    try{sessionStorage.setItem('aik_readiness_result',JSON.stringify({score:diagnostic.overall,profile:diagnostic.profile,priority:diagnostic.priority.key,strongest:diagnostic.strongest.key,recommendation:rec.key,created_at:new Date().toISOString()}));}catch{}
    track('free_checklist_completed',{score:diagnostic.overall,profile:diagnostic.profile,priority_area:diagnostic.priority.key,strongest_area:diagnostic.strongest.key});
    track('recommendation_viewed',{recommendation:rec.key,kind:rec.kind,source:'free_checklist',score:diagnostic.overall});
    result.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  });
})();
