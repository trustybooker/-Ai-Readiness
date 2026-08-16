(function(){
  const offers={
    starter:{
      name:'AI Starter Pass',price:59,currency:'USD',paymentKey:'aiStarterPass',
      summary:'Adaptive foundation training that turns your real goal into reviewed, reusable work—not generic AI lessons.',
      value:'Build an AI boundary map, reusable prompt card, fact-check and correction evidence, privacy-safe prompt, human approval map, and a final proof project assembled into an AI Readiness Proof Pack.',
      audience:'Beginners, workers and job seekers who want a practical, safe foundation.'
    },
    job:{
      name:'AI Job & Productivity Pass',price:197,currency:'USD',paymentKey:'aiJobProductivityPass',
      summary:'Role-aware job and productivity practice that produces evidence you can use and explain truthfully.',
      value:'Build evidence-bounded resume bullets, improved interview answers, five reusable role prompts plus an escalation card, a measured before/after workflow, and a proof-of-skill case study assembled into a Job & Productivity Portfolio.',
      audience:'Job seekers and workers who want demonstrable AI-assisted productivity skills.'
    }
  };
  window.AIKOLLEGE_OFFERS=Object.freeze(offers);

  function normalize(text){return String(text||'').trim().toLowerCase().replace(/\s+/g,' ');}
  function updateCard(card,offer){
    const paras=[...card.querySelectorAll('p')].filter(p=>!p.classList.contains('price'));
    if(paras[0])paras[0].textContent=offer.summary;
    if(!card.querySelector('[data-offer-value]')){
      const value=document.createElement('p');value.dataset.offerValue='true';value.className='offer-value';value.innerHTML=`<strong>You build:</strong> ${offer.value}`;
      const cta=card.querySelector('.btn');if(cta)card.insertBefore(value,cta);else card.appendChild(value);
    }
  }
  function hydrate(){
    document.querySelectorAll('article').forEach(card=>{
      const h=card.querySelector('h2,h3');if(!h)return;const title=normalize(h.textContent);
      if(title==='ai starter pass')updateCard(card,offers.starter);
      if(title==='ai job & productivity pass'||title==='job & productivity pass')updateCard(card,offers.job);
    });
    const schema={
      '@context':'https://schema.org','@type':'ItemList',name:'AI Kollege individual paid passes',
      itemListElement:[offers.starter,offers.job].map((o,i)=>({'@type':'ListItem',position:i+1,item:{'@type':'Course',name:o.name,description:o.summary,provider:{'@type':'Organization',name:'AI Kollege',url:'https://www.aikollege.com/'},offers:{'@type':'Offer',price:String(o.price),priceCurrency:o.currency,url:'https://www.aikollege.com/courses.html',availability:'https://schema.org/InStock'}}}))
    };
    if(!document.querySelector('script[data-aik-offer-schema]')){const s=document.createElement('script');s.type='application/ld+json';s.dataset.aikOfferSchema='true';s.textContent=JSON.stringify(schema);document.head.appendChild(s);}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hydrate,{once:true});else hydrate();
})();
