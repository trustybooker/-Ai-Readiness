import crypto from 'node:crypto';
import { isConfigured, runSecretary, logConversationLead, rateLimit } from '../../lib/secretary-core.mjs';

const esc = (value = '') => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
const twiml = (body) => new Response(`<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`, { status: 200, headers: { 'content-type': 'text/xml; charset=utf-8', 'cache-control': 'no-store' } });
function publicBase(){ const configured=String(process.env.PUBLIC_SITE_URL||'').trim(); if(/^https:\/\//i.test(configured)&&!configured.includes('ai-readiness-pass.netlify.app'))return configured.replace(/\/$/,''); return 'https://www.aikollege.com'; }
function voiceAction(state=''){ const base=`${publicBase()}/.netlify/functions/twilio-voice`; return state?`${base}?s=${encodeURIComponent(state)}`:base; }
function gather(prompt,{state='',timeout=4}={}){ return `<Gather input="speech dtmf" action="${esc(voiceAction(state))}" method="POST" speechTimeout="auto" timeout="${timeout}" actionOnEmptyResult="true"><Say>${esc(prompt)}</Say></Gather>`; }
function parseForm(raw){ return Object.fromEntries(new URLSearchParams(raw).entries()); }
function hmacMatches(authToken,signature,url,params){ const suffix=Object.keys(params).sort().map((key)=>key+params[key]).join(''); const expected=crypto.createHmac('sha1',authToken).update(url+suffix).digest('base64'); try{const a=Buffer.from(signature),b=Buffer.from(expected);return a.length===b.length&&crypto.timingSafeEqual(a,b);}catch{return false;} }
function validateTwilioRequest(req,params){ const authToken=process.env.TWILIO_AUTH_TOKEN; const signature=req.headers.get('x-twilio-signature')||''; if(!authToken||!signature)return false; const incoming=new URL(req.url); const candidates=new Set([incoming.toString(),`${publicBase()}${incoming.pathname}${incoming.search}`]); const forwardedHost=String(req.headers.get('x-forwarded-host')||'').split(',')[0].trim(); const forwardedProto=String(req.headers.get('x-forwarded-proto')||'https').split(',')[0].trim()||'https'; if(forwardedHost)candidates.add(`${forwardedProto}://${forwardedHost}${incoming.pathname}${incoming.search}`); for(const url of candidates){if(hmacMatches(authToken,signature,url,params))return true;} return false; }
function safeCaller(value){ return String(value||'unknown').replace(/[^+0-9A-Za-z_-]/g,'').slice(0,80)||'unknown'; }
function callerMessage(params){ const speech=String(params.SpeechResult||'').trim(); if(speech)return speech; const digits=String(params.Digits||'').trim(); if(digits==='0')return'I want a human'; if(digits)return`Caller pressed ${digits}`; return''; }
function callContact(params,caller){ const sid=String(params.CallSid||'').replace(/[^A-Za-z0-9]/g,'').slice(0,40); const status=String(params.CallStatus||'').replace(/[^A-Za-z0-9_-]/g,'').slice(0,24); return [caller,sid&&`CallSid-${sid}`,status&&`Status-${status}`].filter(Boolean).join('_').slice(0,140); }
function validTransfer(value){const v=String(value||'').trim();return /^\+[1-9]\d{7,14}$/.test(v)?v:'';}
function stateKey(){return crypto.createHash('sha256').update(String(process.env.TWILIO_AUTH_TOKEN||'')).digest();}
function encryptHistory(history=[]){if(!process.env.TWILIO_AUTH_TOKEN)return'';try{const compact=(Array.isArray(history)?history:[]).slice(-6).map(t=>({r:t.role==='assistant'?'a':'u',t:String(t.text||'').slice(0,700)}));const iv=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',stateKey(),iv),plain=Buffer.from(JSON.stringify(compact));const enc=Buffer.concat([cipher.update(plain),cipher.final()]),tag=cipher.getAuthTag();return Buffer.concat([iv,tag,enc]).toString('base64url');}catch{return'';}}
function decryptHistory(req){const token=new URL(req.url).searchParams.get('s')||'';if(!token||!process.env.TWILIO_AUTH_TOKEN)return[];try{const raw=Buffer.from(token,'base64url');if(raw.length<29)return[];const iv=raw.subarray(0,12),tag=raw.subarray(12,28),enc=raw.subarray(28),decipher=crypto.createDecipheriv('aes-256-gcm',stateKey(),iv);decipher.setAuthTag(tag);const data=JSON.parse(Buffer.concat([decipher.update(enc),decipher.final()]).toString('utf8'));return (Array.isArray(data)?data:[]).slice(-6).map(t=>({role:t.r==='a'?'assistant':'user',text:String(t.t||'').slice(0,700)}));}catch{return[];}}
function nextHistory(history,userText,assistantText){return [...history,{role:'user',text:String(userText||'').slice(0,700)},{role:'assistant',text:String(assistantText||'').slice(0,700)}].slice(-6);}

export default async (req) => {
  if(req.method!=='POST')return new Response('method_not_allowed',{status:405});
  const params=parseForm(await req.text());
  if(!validateTwilioRequest(req,params))return new Response('forbidden',{status:403});
  if(!isConfigured())return twiml('<Say>Our AI receptionist is temporarily unavailable. Please visit AI Kollege online or use the booking page.</Say><Hangup/>');
  const caller=safeCaller(params.From),contact=callContact(params,caller),history=decryptHistory(req);
  if(!rateLimit(`voice:${caller}`))return twiml('<Say>We received several requests very quickly. Please wait a moment and call again.</Say><Hangup/>');
  const message=callerMessage(params),isNewCall=!message;
  if(isNewCall)return twiml(gather('Thank you for calling AI Kollege, operated by Fify Now. I am the AI receptionist. You can speak naturally. I can explain our free readiness score, training paths, published prices, courses, completion recognition, and booking process. For a person, say human or press zero. How may I help you?')+'<Say>I did not hear anything. Please call again when you are ready.</Say><Hangup/>');
  if(/\b(human|person|representative|agent|operator)\b/i.test(message)||params.Digits==='0'){
    const result={reply:'Caller requested human follow-up.',handoff:true,lead:{name:null,email:null,need:'Human follow-up requested by phone',path:null},offer_booking:true};
    await logConversationLead({result,message,history,channel:`phone:${caller}`,contact}).catch(()=>null);
    const transfer=validTransfer(process.env.TWILIO_HUMAN_FORWARD_NUMBER);
    if(transfer)return twiml(`<Say>One moment while I try to connect you.</Say><Dial timeout="20" answerOnBridge="true">${esc(transfer)}</Dial><Say>No one was available. I have marked this call for human follow-up.</Say><Hangup/>`);
    return twiml('<Say>I have marked this call for human follow-up. Someone from AI Kollege can review it. You may also use the booking page at www dot AI Kollege dot com. Goodbye.</Say><Hangup/>');
  }
  try{
    const result=await runSecretary({message,history});
    if(result.handoff||result.lead)await logConversationLead({result,message,history,channel:`phone:${caller}`,contact}).catch(()=>null);
    const reply=String(result.reply||'I am sorry, I could not answer that safely. A human can follow up.').slice(0,1800);
    if(result.handoff){const transfer=validTransfer(process.env.TWILIO_HUMAN_FORWARD_NUMBER);if(transfer)return twiml(`<Say>${esc(reply)}</Say><Say>I will try to connect you with a person now.</Say><Dial timeout="20" answerOnBridge="true">${esc(transfer)}</Dial><Say>No one was available. Your request has been marked for human follow-up.</Say><Hangup/>`);return twiml(`<Say>${esc(reply)}</Say><Say>Your request has been marked for human follow-up. You can also use the booking page at www dot AI Kollege dot com.</Say><Hangup/>`);}
    const state=encryptHistory(nextHistory(history,message,reply));
    return twiml(`<Say>${esc(reply)}</Say>${gather('What else can I help you with? You can say human or press zero at any time.',{state})}<Say>Thank you for calling AI Kollege. Goodbye.</Say><Hangup/>`);
  }catch{return twiml('<Say>I am having trouble answering right now. Please use the booking or request form at www dot AI Kollege dot com and a person can follow up. Goodbye.</Say><Hangup/>');}
};

export const config={path:['/.netlify/functions/twilio-voice','/api/twilio-voice'],rateLimit:{windowLimit:30,windowSize:60,aggregateBy:['ip','domain']}};
