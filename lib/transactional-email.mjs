import crypto from 'node:crypto';

const RESEND_API='https://api.resend.com/emails';
const SITE='https://www.aikollege.com';
const DEFAULT_FROM='AI Kollege <hello@aikollege.com>';

function clean(value='',max=500){return String(value??'').replace(/[\u0000-\u001f\u007f<>]/g,' ').trim().slice(0,max);}
function isEmail(value=''){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());}
function esc(value=''){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function keyPart(value=''){return String(value??'').replace(/[^A-Za-z0-9._:-]/g,'-').slice(0,120)||crypto.createHash('sha256').update(String(value??'')).digest('hex').slice(0,24);}
export function emailConfigured(){return Boolean(process.env.RESEND_API_KEY);}
export function sender(){return String(process.env.RESEND_FROM||DEFAULT_FROM).trim();}

export async function sendTransactionalEmail({to,subject,text,html,idempotencyKey,replyTo}={}){
  if(!emailConfigured())return{ok:false,skipped:true,error:'resend_not_configured'};
  if(!isEmail(to))return{ok:false,skipped:true,error:'invalid_recipient'};
  const body={from:sender(),to:[String(to).trim()],subject:clean(subject,180),text:String(text||'').slice(0,20000)};
  if(html)body.html=String(html).slice(0,50000);
  if(replyTo&&isEmail(replyTo))body.reply_to=replyTo;
  const headers={'Authorization':`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json','User-Agent':'ai-kollege/transactional-email'};
  if(idempotencyKey)headers['Idempotency-Key']=String(idempotencyKey).slice(0,256);
  let response;try{response=await fetch(RESEND_API,{method:'POST',headers,body:JSON.stringify(body)});}catch{return{ok:false,error:'resend_unreachable'};}
  let data={};try{data=await response.json();}catch{}
  if(!response.ok)return{ok:false,status:response.status,error:clean(data?.message||data?.name||'resend_send_failed',300)};
  return{ok:true,id:clean(data?.id,120)};
}

export async function sendLeadAcknowledgement(data={},issueNumber){
  const to=clean(data.email,254);if(!isEmail(to))return{ok:false,skipped:true,error:'invalid_recipient'};
  const booking=/booking/i.test(clean(data.request_type||data.form_name||data['form-name'],120));
  const name=clean(data.name,120)||'there',path=clean(data.path||data.recommended_path,180);
  const title=booking?'We received your AI Kollege booking request':'We received your AI Kollege request';
  const next=booking?'A person will review the request and your preferred times. An appointment is confirmed only when you receive a scheduler confirmation or calendar invitation.':'A person will review what you sent and recommend the smallest useful next step when human follow-up is needed.';
  const text=`Hi ${name},\n\n${title}. ${path?`You selected: ${path}. `:''}${next}\n\nYou can review AI Kollege options at ${SITE}/courses.html or contact us at ${SITE}/booking.html.\n\nDo not reply with passwords, card details, health information, or other sensitive data.\n\nAI Kollege — operated by Fify Now LLC`;
  const html=`<p>Hi ${esc(name)},</p><p><strong>${esc(title)}.</strong></p>${path?`<p>You selected: ${esc(path)}.</p>`:''}<p>${esc(next)}</p><p><a href="${SITE}/courses.html">Review AI Kollege options</a> · <a href="${SITE}/booking.html">Contact / booking</a></p><p><small>Do not reply with passwords, card details, health information, or other sensitive data.</small></p><p>AI Kollege — operated by Fify Now LLC</p>`;
  return sendTransactionalEmail({to,subject:title,text,html,idempotencyKey:`lead-ack/${keyPart(issueNumber||data.submission_id||to)}`});
}

export async function sendHandoffAcknowledgement({email,name,need,issueNumber}={}){
  const to=clean(email,254);if(!isEmail(to))return{ok:false,skipped:true,error:'invalid_recipient'};
  const safeName=clean(name,120)||'there',safeNeed=clean(need,300);
  const subject='Your AI Kollege human follow-up request was saved';
  const text=`Hi ${safeName},\n\nYour request for human follow-up was saved.${safeNeed?` We recorded: ${safeNeed}.`:''} A person will review it. No AI response is a binding promise, price change, refund approval, legal/compliance decision, or appointment confirmation.\n\nIf you need to choose a time, use ${SITE}/booking.html.\n\nAI Kollege — operated by Fify Now LLC`;
  const html=`<p>Hi ${esc(safeName)},</p><p>Your request for <strong>human follow-up</strong> was saved.${safeNeed?` We recorded: ${esc(safeNeed)}.`:''}</p><p>A person will review it. No AI response is a binding promise, price change, refund approval, legal/compliance decision, or appointment confirmation.</p><p><a href="${SITE}/booking.html">Choose a booking option</a></p><p>AI Kollege — operated by Fify Now LLC</p>`;
  return sendTransactionalEmail({to,subject,text,html,idempotencyKey:`handoff/${keyPart(issueNumber||to)}`});
}

export async function sendPurchaseOnboarding(purchase={}){
  const to=clean(purchase.email,254);if(!isEmail(to))return{ok:false,skipped:true,error:'purchase_email_missing'};
  const label=clean(purchase.offer?.label,160)||'AI Kollege pass';
  const session=keyPart(purchase.session_id||'purchase');
  const subject=`Your ${label} is ready`;
  const text=`Thanks for your purchase. Stripe has confirmed payment for ${label}.\n\nStart here: ${SITE}/purchase-success.html?session_id=${encodeURIComponent(purchase.session_id||'')}\n\nThat page verifies your eligible Stripe Checkout Session before opening the paid learner workspace. AI Kollege does not ask you to send card details by email.\n\nYour pass is designed around completed work, quality checks, saved artifacts, and portable proof rather than page views alone.\n\nNeed help? ${SITE}/booking.html\n\nAI Kollege — operated by Fify Now LLC`;
  const html=`<p>Thanks for your purchase. Stripe has confirmed payment for <strong>${esc(label)}</strong>.</p><p><a href="${SITE}/purchase-success.html?session_id=${encodeURIComponent(purchase.session_id||'')}"><strong>Verify purchase and start your pass</strong></a></p><p>The start page verifies your eligible Stripe Checkout Session before opening the paid learner workspace. AI Kollege does not ask you to send card details by email.</p><p>Your pass is based on completed work, quality checks, saved artifacts, and portable proof rather than page views alone.</p><p>Need help? <a href="${SITE}/booking.html">Contact AI Kollege</a></p><p>AI Kollege — operated by Fify Now LLC</p>`;
  return sendTransactionalEmail({to,subject,text,html,idempotencyKey:`purchase-onboarding/${session}`});
}
