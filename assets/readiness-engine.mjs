export const AREAS = Object.freeze([
  {key:'literacy',label:'AI literacy'},
  {key:'privacy',label:'Privacy & safety'},
  {key:'proof',label:'Practical proof'},
  {key:'workflow',label:'Workflow readiness'},
  {key:'responsibility',label:'Human responsibility'}
]);

export const CHECKS = Object.freeze([
  ['literacy','l1','I can explain useful AI capabilities without treating AI output as automatically true.'],
  ['literacy','l2','I can write a prompt with a clear goal, context, constraints, and output format.'],
  ['literacy','l3','I know when an AI answer needs source checking or subject-matter review.'],
  ['literacy','l4','I can identify a task where AI is helpful and a task where human judgment should lead.'],
  ['privacy','p1','I avoid entering passwords, payment credentials, medical details, or confidential client data into unapproved AI tools.'],
  ['privacy','p2','I know which workplace or business information is restricted or sensitive.'],
  ['privacy','p3','I review generated content before sharing it externally.'],
  ['privacy','p4','I know when legal, HR, clinical, financial, or other qualified review is needed.'],
  ['proof','r1','I have at least one AI-assisted work sample I can explain honestly.'],
  ['proof','r2','I can describe what AI did, what I changed, and what a human verified.'],
  ['proof','r3','I can describe a real time, quality, or clarity improvement without exaggerating it.'],
  ['proof','r4','I can turn my AI use into a resume, interview, portfolio, or internal-work example when relevant.'],
  ['workflow','w1','I can name one repeated task worth improving before buying another AI tool.'],
  ['workflow','w2','I understand that task’s current trigger, inputs, owner, output, and failure points.'],
  ['workflow','w3','I can identify where AI may assist and where approval must remain human.'],
  ['workflow','w4','I would test a small pilot and measure whether it actually helps before scaling it.'],
  ['responsibility','h1','A named person remains accountable for important decisions.'],
  ['responsibility','h2','Money, refunds, legal commitments, hiring, safety, and sensitive messages receive appropriate human review.'],
  ['responsibility','h3','There is a practical way to stop, correct, or roll back an AI-assisted process.'],
  ['responsibility','h4','People can tell when they are interacting with AI rather than a human when that matters.']
]);

const VALUE = Object.freeze({not_yet:0,needs_review:1,yes:2});
const clamp = (n,min,max)=>Math.max(min,Math.min(max,n));

export function calculateDiagnostic(responses={},context={}){
  const scores={};
  for(const area of AREAS){
    const ids=CHECKS.filter(x=>x[0]===area.key).map(x=>x[1]);
    const earned=ids.reduce((sum,id)=>sum+(VALUE[responses[id]]??0),0);
    scores[area.key]=Math.round((earned/(ids.length*2))*100);
  }
  const overall=Math.round(Object.values(scores).reduce((a,b)=>a+b,0)/AREAS.length);
  const ordered=[...AREAS].sort((a,b)=>scores[a.key]-scores[b.key]);
  const priority=ordered[0],strongest=ordered[ordered.length-1];
  const recommendation=chooseRecommendation(scores,overall,context);
  return {
    overall,
    profile: overall>=85?'Strong foundation':overall>=70?'Ready to apply':overall>=50?'Building readiness':'Foundation first',
    scores,
    strongest:{...strongest,score:scores[strongest.key]},
    priority:{...priority,score:scores[priority.key]},
    recommendation,
    freeActions:freeActionsFor(priority.key),
    completed:Object.keys(responses).filter(k=>k in Object.fromEntries(CHECKS.map(x=>[x[1],true]))).length
  };
}

function chooseRecommendation(scores,overall,context={}){
  const audience=String(context.audience||'').toLowerCase();
  if(overall>=85&&Math.min(...Object.values(scores))>=75){
    return {key:'continue_free',name:'Keep applying and building proof',kind:'free',href:'answers.html',reason:'Your answers show a strong base across all five areas. You may not need to buy a course right now; keep applying the skills and build evidence from real work.'};
  }
  if(audience.includes('team')||audience.includes('organization')){
    return {key:'team_training',name:'Team Training Sprint review',kind:'review',href:'booking.html?path=Team%20Training%20Sprint',reason:'Your context involves a team, so shared expectations, safe-use rules, and human accountability matter more than a generic individual course.'};
  }
  if(audience.includes('business')){
    return {key:'business_audit',name:'Business AI Readiness Audit review',kind:'review',href:'booking.html?path=Business%20AI%20Readiness%20Audit',reason:'Your context is a business. A scoped workflow review is safer and more useful than buying tools or automating before the process and risks are clear.'};
  }
  if(scores.literacy<60||scores.privacy<60||scores.responsibility<60){
    return {key:'ai_starter_pass',name:'AI Starter Pass',kind:'self_serve',paymentKey:'aiStarterPass',fallback:'courses.html',reason:'Your biggest gaps are in foundations, safe use, or human review. The Starter Pass directly teaches those skills before more advanced workflow or career claims.'};
  }
  if(scores.proof<70||audience.includes('job')){
    return {key:'ai_job_productivity_pass',name:'AI Job & Productivity Pass',kind:'self_serve',paymentKey:'aiJobProductivityPass',fallback:'courses.html',reason:'You have enough foundation to focus on proof: work examples, resume/interview evidence, role prompts, and a practical productivity workflow.'};
  }
  if(scores.workflow<70){
    return {key:'business_audit',name:'Workflow review before automation',kind:'review',href:'booking.html?path=Business%20AI%20Readiness%20Audit',reason:'Your main gap is workflow clarity. A human review can help map the process and approval points before additional automation.'};
  }
  return {key:'ai_job_productivity_pass',name:'AI Job & Productivity Pass',kind:'self_serve',paymentKey:'aiJobProductivityPass',fallback:'courses.html',reason:'Your fundamentals are reasonably strong; the next useful step is turning AI use into repeatable work and evidence you can explain.'};
}

function freeActionsFor(area){
  const map={
    literacy:['Pick one real task and write the goal before choosing an AI tool.','Ask AI to list assumptions and uncertainty, then verify any important claim.','Rewrite one prompt using goal, context, constraints, output format, and review instructions.'],
    privacy:['List the data you would never paste into an unapproved AI tool.','Replace real names, account numbers, or confidential details with safe placeholders in one practice prompt.','Identify one situation where qualified professional review is required.'],
    proof:['Create one small AI-assisted work sample from a real task.','Write down what AI produced, what you changed, and what you verified.','Turn that example into one honest resume bullet or interview story if relevant.'],
    workflow:['Map one repeated task as trigger → input → AI support → human review → output.','Name one failure mode and one stop/rollback condition before automating.','Choose one measurable pilot outcome such as time saved, errors reduced, or clarity improved.'],
    responsibility:['Name the human owner for one AI-assisted process.','Mark which actions involving money, people, safety, or commitments require approval.','Write a simple correction/stop procedure for when AI output is wrong.']
  };
  return map[area]||map.literacy;
}

export function percentComplete(responses={}){
  const valid=new Set(CHECKS.map(x=>x[1]));
  return clamp(Math.round((Object.keys(responses).filter(k=>valid.has(k)&&VALUE[responses[k]]!==undefined).length/CHECKS.length)*100),0,100);
}
