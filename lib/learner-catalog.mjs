export const ROLE_FAMILIES={
  job_seeker:{label:'Job seeker',example:'Use AI to turn real experience into a stronger, truthful work example without inventing skills or results.'},
  admin_ops:{label:'Office / admin / operations',example:'Use AI to organize notes, draft follow-up, or improve a repeated admin workflow with human review.'},
  customer_service:{label:'Customer service',example:'Use AI to draft a response, summarize the issue, and prepare an escalation note without making unauthorized promises.'},
  healthcare_support:{label:'Healthcare support',example:'Use AI only for appropriate administrative or communication support; protect private information and keep clinical judgment with qualified humans.'},
  trades:{label:'Trades / field service',example:'Use AI for customer explanations, estimate wording, checklists, or documentation while keeping licensed and safety-critical judgment human.'},
  marketing:{label:'Marketing / content',example:'Use AI to organize research, draft an outline, or generate options, then verify claims and edit for the audience.'},
  small_business:{label:'Small-business owner / operator',example:'Use AI to improve intake, follow-up, FAQs, or workflow documentation without delegating financial, legal, hiring, or safety judgment.'},
  creative:{label:'Audio / creative work',example:'Use AI to organize feedback, edit notes, production checklists, or release planning while preserving human creative decisions.'}
};

const commonRubric=['Useful for the stated problem','Specific enough to reuse','Important claims are checked','Privacy and safety boundary is clear','Human contribution/review is visible'];

export const TRACKS={
  ai_starter_pass:{
    title:'AI Starter Pass',level:'Foundation',proofName:'AI Readiness Proof Pack',
    intro:'Build one practical AI-assisted work artifact you can explain, check, improve, and reuse.',
    modules:[
      {id:'boundaries',title:'1. AI boundaries',why:'Know what AI can assist with and what must remain human.',see:'AI can draft, summarize, organize and compare, but it can also be wrong, incomplete or overconfident.',try:'Choose one repeated task. Write what AI may assist with, what a human must review, and what should not be delegated.',check:'If the task affects people, money, safety, hiring, reputation, private data, regulated work or clinical judgment, define an explicit human checkpoint.',artifact:'AI boundary map'},
      {id:'prompt',title:'2. Problem-first prompt',why:'A reusable prompt starts with the work problem, not the tool.',see:'Problem → role → goal → context → constraints → output format → review instruction → privacy boundary → success standard.',try:'Write a prompt for your selected task. Include the output you need and how it will be reviewed.',check:'Remove unnecessary private data and make the success standard observable.',artifact:'Reusable prompt card'},
      {id:'verify',title:'3. Verification and correction',why:'Useful AI work includes checking and correcting the output.',see:'Names, numbers, dates, policies, instructions and consequential claims deserve verification.',try:'Use your prompt or review a sample AI response. Mark at least three items that need checking and verify one material claim when facts are involved.',check:'Record what changed after review instead of simply accepting the first answer.',artifact:'Fact-check and correction record'},
      {id:'privacy',title:'4. Privacy and safe inputs',why:'Good AI use minimizes sensitive data before it reaches a tool.',see:'Do not paste passwords, keys, payment data, private customer/employee data or confidential business information unless policy, consent and tool controls clearly allow it.',try:'Rewrite a work prompt to remove names, identifiers and unnecessary sensitive details.',check:'Ask whether the task can be completed with less data.',artifact:'Safe-use checklist and sanitized prompt'},
      {id:'approval',title:'5. Human approval map',why:'Define approval before automation or scale.',see:'AI may draft; a human may need to verify, approve, escalate or refuse.',try:'Map your task into Draft / Verify / Approve / Escalate or Do not automate.',check:'Make the owner of each important decision explicit.',artifact:'Human approval checkpoint map'},
      {id:'proof',title:'6. Final proof project',why:'Leave with work, not just information.',see:'A useful proof project shows the problem, AI role, human role, corrections and final artifact.',try:'Create one final work sample: email/follow-up workflow, SOP/checklist, FAQ/reply, report summary, resume bullet improvement, service explanation, small-business admin workflow, or creative review workflow.',check:'Explain what improved, what remains limited, and what you would test next.',artifact:'Final proof-of-work case study'}
    ],rubric:commonRubric
  },
  ai_job_productivity_pass:{
    title:'AI Job & Productivity Pass',level:'Applied',proofName:'Job & Productivity Portfolio',
    intro:'Turn real experience and a repeated work problem into evidence you can use in a job search or productivity conversation.',
    modules:[
      {id:'resume',title:'1. Truthful AI resume evidence',why:'Show practical AI use without inventing expertise, tools, metrics or outcomes.',see:'Real task → problem → AI assistance → human review → supported result/evidence.',try:'Draft three resume bullets using only experience you can support.',check:'Remove unsupported numbers and replace vague “AI expert” claims with accurate verbs such as drafted, reviewed, organized, summarized or improved.',artifact:'Three evidence-bounded resume bullets'},
      {id:'interview',title:'2. Interview simulator',why:'Explain how you use AI while keeping your own judgment visible.',see:'STAR-H: Situation → Task → Action → Result → Human review.',try:'Prepare two answers: “How have you used AI to improve work?” plus one role-specific scenario.',check:'Make each answer concrete and flag any result you cannot prove.',artifact:'Two improved interview answers'},
      {id:'rolepack',title:'3. Role prompt + escalation pack',why:'Reusable workflows are more valuable than random prompts.',see:'Each prompt should state inputs, privacy boundary, expected output, verification step and when not to use it.',try:'Create five prompts for your real or target role and one escalation / do-not-automate card.',check:'Make sure the prompts do not silently replace licensed, clinical, hiring, financial or safety-critical judgment.',artifact:'Five role prompts + escalation card'},
      {id:'workflow',title:'4. Measured productivity workflow',why:'A claim of productivity should be tied to observable evidence.',see:'Problem → trigger → input → current process → AI support → human review → final output → failure path → evidence.',try:'Map one repeated task before and after AI assistance. Run at least one comparison where practical.',check:'Use real observations such as steps, revisions, completeness or time estimate; never invent a savings percentage.',artifact:'Before/after workflow + evidence record'},
      {id:'case',title:'5. Proof-of-skill case study',why:'A case study makes your skill inspectable.',see:'Problem → constraints → approach → AI role → human role → safety/verification → artifact → evidence → limitation → next iteration.',try:'Build one role-relevant artifact and document the case study around it.',check:'Keep private employer/customer information out of a shareable version.',artifact:'Portfolio-ready proof-of-skill case study'},
      {id:'signal',title:'6. Opportunity signal without spam',why:'Useful communication can surface real questions and opportunities.',see:'Teach something useful first; separate observed feedback from assumptions.',try:'Create three value-first messages/posts or professional explanations and maintain a small signal log.',check:'Label expected objections as hypotheses until somebody actually expresses them.',artifact:'Three communication artifacts + signal log'}
    ],rubric:commonRubric
  }
};

const ROLE_ALIASES={trades_field_service:'trades',office_admin_operations:'admin_ops',small_business_owner_operator:'small_business',marketing_content:'marketing',audio_creative_work:'creative'};
export function normalizeRole(value=''){
  const key=String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
  const normalized=ROLE_ALIASES[key]||key;
  return ROLE_FAMILIES[normalized]?normalized:'job_seeker';
}
export function learnerPayload(offerKey,profile={}){
  const track=TRACKS[offerKey]; if(!track)return null;
  const role=normalizeRole(profile.role);
  return {offer_key:offerKey,track,role:{key:role,...ROLE_FAMILIES[role]},goal:String(profile.goal||'').slice(0,240),experience:String(profile.experience||'').slice(0,80)};
}
