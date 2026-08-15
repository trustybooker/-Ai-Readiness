(function(){
  if(!/\/purchase-success\.html$/i.test(location.pathname))return;
  const run=async()=>{
    const form=document.querySelector('form[name="ai-kollege-buyer-onboarding"]');
    if(!form)return;
    const note=form.querySelector('[data-note]');
    const params=new URLSearchParams(location.search),sessionId=params.get('session_id')||'',offerHint=params.get('offer')||'';
    const status=document.createElement('div');status.className='purchase-verification';status.setAttribute('role','status');status.setAttribute('aria-live','polite');form.prepend(status);
    const set=(kind,text)=>{status.className=`purchase-verification ${kind}`;status.textContent=text;};
    if(!/^cs_(?:test_|live_)?[A-Za-z0-9]+$/.test(sessionId)){
      set('neutral','Purchase verification is not available in this browser session. You may submit your start details, but paid access is matched separately before it is granted.');
      return;
    }
    set('checking','Checking your Stripe purchase securely…');
    try{
      const r=await fetch(`/api/stripe-session?session_id=${encodeURIComponent(sessionId)}`,{headers:{accept:'application/json'},cache:'no-store'});
      const d=await r.json().catch(()=>({}));
      if(!r.ok||!d.verified){set('neutral','We could not confirm this purchase automatically yet. Submit your start details and we will match the purchase before granting paid access.');return;}
      set('verified',`Purchase verified: ${d.offer}. No card details are stored by AI Kollege.`);
      const select=form.querySelector('select[name="path"]');
      if(select){const wanted=d.offer_key==='ai_starter_pass'?'AI Starter Pass':d.offer_key==='ai_job_productivity_pass'?'AI Job & Productivity Pass':'';if(wanted){const opt=[...select.options].find(o=>o.textContent.trim()===wanted);if(opt)select.value=opt.value;}}
      const hidden=document.createElement('input');hidden.type='hidden';hidden.name='verified_checkout_session';hidden.value=sessionId;form.appendChild(hidden);
      if(typeof window.gtag==='function')window.gtag('event','purchase_verified',{offer_key:d.offer_key,currency:d.currency||'usd',value:Number(d.amount_total||0)/100});
    }catch{set('neutral','Purchase verification is temporarily unavailable. Submit your start details and we will match the purchase before granting paid access.');}
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
