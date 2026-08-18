(function(){
  const MAP={aiStarterPass:'ai_starter_pass',aiJobProductivityPass:'ai_job_productivity_pass'};
  async function apply(){let r,d;try{r=await fetch('/.netlify/functions/offer-status',{headers:{accept:'application/json'},cache:'no-store'});d=await r.json();}catch{return;}if(!r.ok||!d?.ok)return;document.querySelectorAll('[data-payment-key]').forEach(link=>{const offer=MAP[link.dataset.paymentKey];if(!offer)return;const state=d.offers?.[offer];if(!state||state.selfServeEnabled!==false)return;link.dataset.checkoutReady='false';link.dataset.ownerPaused='true';link.href='/booking.html';link.removeAttribute('target');link.removeAttribute('rel');link.textContent='Request access';link.setAttribute('aria-label','Self-serve checkout is temporarily paused; request help');});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();
