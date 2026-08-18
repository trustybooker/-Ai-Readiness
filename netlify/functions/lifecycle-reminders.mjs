import {lifecycleSnapshot,recordLifecycleEvent} from '../../lib/lifecycle-events.mjs';
import {verifyCheckoutEntitlement} from '../../lib/stripe-fulfillment.mjs';
import {sendProgressReminder} from '../../lib/transactional-email.mjs';

const LABELS={ai_starter_pass:'AI Starter Pass',ai_job_productivity_pass:'AI Job & Productivity Pass'};
const DAY=86400000;
function weekKey(date=new Date()){const start=new Date(Date.UTC(date.getUTCFullYear(),0,1));return `${date.getUTCFullYear()}-w${Math.ceil((((date-start)/DAY)+start.getUTCDay()+1)/7)}`;}
async function activeEntitlement(sessionId){const key=String(process.env.STRIPE_SECRET_KEY||'');if(!key)return false;const r=await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,{headers:{Authorization:`Bearer ${key}`}});if(!r.ok)return false;return Boolean((await verifyCheckoutEntitlement(await r.json(),key)).ok);}
export default async()=>{
  const snapshot=await lifecycleSnapshot();if(!snapshot.ok)return;
  const bySession=new Map();for(const e of snapshot.events){if(!e.session)continue;if(!bySession.has(e.session))bySession.set(e.session,[]);bySession.get(e.session).push(e);}
  const now=Date.now(),bucket=weekKey();
  for(const [session,events] of bySession){
    if(events.some(e=>e.event==='course_completed'))continue;
    const meaningful=events.filter(e=>['learner_activated','module_completed'].includes(e.event)).sort((a,b)=>Date.parse(b.occurred_at)-Date.parse(a.occurred_at));
    if(!meaningful.length)continue;const last=meaningful[0],lastAt=Date.parse(last.occurred_at);if(!Number.isFinite(lastAt)||now-lastAt<3*DAY)continue;
    if(events.some(e=>e.event==='progress_reminder_sent'&&e.module===bucket))continue;
    const email=last.email,label=LABELS[last.offer]||'AI Kollege pass';if(!email||email==='not supplied')continue;
    if(!(await activeEntitlement(session)))continue;
    const sent=await sendProgressReminder({email,label,session_id:session,progress:last.progress,reminderKey:`${session}-${bucket}`});
    if(sent.ok)await recordLifecycleEvent({session_id:session,event:'progress_reminder_sent',module:bucket,progress:last.progress});
  }
};
export const config={schedule:'@daily'};
