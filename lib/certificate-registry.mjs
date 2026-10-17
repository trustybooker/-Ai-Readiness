import {privateStoreGate} from './owner-settings.mjs';

const MARKER='<!-- AIK_CERTIFICATE_RECORD -->';
const PAGE_SIZE=100, MAX_PAGES=50;
const clean=(v,max=300)=>String(v??'').replace(/[\\u0000-\\u001f\\u007f<>]/g,' ').trim().slice(0,max);
const headers=()=>({
  Accept:'application/vnd.github+json',
  'X-GitHub-Api-Version':'2022-11-28',
  'User-Agent':'ai-kollege-certificates',
  'Content-Type':'application/json',
  Authorization:`Bearer ${process.env.LEADS_SECRET||''}`
});
const parse=(issue)=>{
  const body=String(issue?.body||'');
  const pick=(name)=>(body.match(new RegExp(`^- ${name}:\\\\s*(.*)$`,'mi'))||[])[1]?.trim()||'';
  return {id:pick('Certificate ID'),status:pick('Status')||'valid',offer:pick('Offer key'),label:pick('Track'),issued_at:pick('Issued at'),version:pick('Version'),issue_number:issue?.number};
};
async function list(repo){
  const all=[];
  for(let page=1;page<=MAX_PAGES;page++){
    const r=await fetch(`https://api.github.com/repos/${repo}/issues?state=all&labels=certificate-issued&per_page=${PAGE_SIZE}&page=${page}&sort=created&direction=desc`,{headers:headers()});
    if(!r.ok)throw new Error(`certificate_list_${r.status}`);
    const batch=(await r.json()).filter(i=>!i.pull_request); all.push(...batch);
    if(batch.length<PAGE_SIZE)break;
  }
  return all;
}
async function idFor(purchase){
  const input=`${purchase.session_id}|${purchase.offer.key}`;
  const data=new TextEncoder().encode(input); const digest=await crypto.subtle.digest('SHA-256',data);
  const hex=[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('').slice(0,12).toUpperCase();
  return `AIK-${hex}`;
}
export async function issueCertificate(purchase){
  const gate=await privateStoreGate(); if(!gate.ok)return gate;
  const id=await idFor(purchase), existing=(await list(gate.repo)).map(parse).find(x=>x.id===id);
  if(existing)return {ok:true,duplicate:true,certificate:existing};
  const issuedAt=new Date().toISOString();
  const body=`${MARKER}
# AI Kollege completion record

- Certificate ID: ${id}
- Status: valid
- Track: ${clean(purchase.offer.label,180)}
- Offer key: ${clean(purchase.offer.key,120)}
- Session: ${clean(purchase.session_id,160)}
- Issued at: ${issuedAt}
- Version: 1
- Basis: verified paid learner completion event

Private operational record. Do not store learner artifacts or sensitive personal data here.`;
  const r=await fetch(`https://api.github.com/repos/${gate.repo}/issues`,{method:'POST',headers:headers(),body:JSON.stringify({title:`[Certificate] ${id} — ${clean(purchase.offer.label,120)}`,body,labels:['certificate-issued','ai-kollege']})});
  if(!r.ok)return{ok:false,error:`certificate_write_${r.status}`};
  return{ok:true,duplicate:false,certificate:parse(await r.json())};
}
export async function verifyCertificate(id){
  const value=clean(id,40).toUpperCase(); if(!/^AIK-[A-F0-9]{12}$/.test(value))return{ok:false,error:'invalid_certificate_id'};
  const gate=await privateStoreGate(); if(!gate.ok)return gate;
  const found=(await list(gate.repo)).map(parse).find(x=>x.id===value);
  if(!found)return{ok:true,found:false,certificate_id:value};
  return{ok:true,found:true,certificate:{certificate_id:found.id,status:found.status,track:found.label,issued_at:found.issued_at,version:found.version}};
}
