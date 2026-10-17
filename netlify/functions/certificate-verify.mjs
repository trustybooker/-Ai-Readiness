import {verifyCertificate} from '../../lib/certificate-registry.mjs';

const json=(status,body)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
export default async(req)=>{
  if(req.method!=='GET')return json(405,{ok:false,error:'method_not_allowed'});
  const id=new URL(req.url).searchParams.get('id')||'';
  try{const result=await verifyCertificate(id);return json(result.error==='invalid_certificate_id'?400:result.ok?200:500,result);}
  catch{return json(500,{ok:false,error:'certificate_verification_failed'});}
};
export const config={path:['/.netlify/functions/certificate-verify','/api/certificate-verify'],method:'GET',rateLimit:{windowLimit:60,windowSize:60,aggregateBy:['ip','domain']}};
