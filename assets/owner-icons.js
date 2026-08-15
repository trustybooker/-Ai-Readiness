(()=>{
  const NS='http://www.w3.org/2000/svg';
  const icon=(name)=>{const svg=document.createElementNS(NS,'svg');svg.classList.add('ui-icon');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');const use=document.createElementNS(NS,'use');use.setAttribute('href',`/assets/ui-icons.svg#${name}`);svg.appendChild(use);return svg;};
  const apply=(el,name)=>{if(!el||el.querySelector(':scope > .ui-icon'))return;el.prepend(icon(name));};
  const byAction={priority:'spark',today:'calendar',pipeline_health:'shield',leads_summary:'chart',phone_handoffs:'phone',business_links:'link'};
  for(const [action,name] of Object.entries(byAction))apply(document.querySelector(`[data-action="${action}"]`),name);
  apply(document.querySelector('[data-unlock]'),'shield');apply(document.querySelector('[data-draft]'),'message');apply(document.querySelector('[data-mic]'),'mic');apply(document.querySelector('[data-settings-load]'),'settings');apply(document.querySelector('[data-settings-save]'),'check');
  document.querySelectorAll('.studio-shortcuts a').forEach(a=>{const h=a.getAttribute('href')||'';apply(a,/booking/.test(h)?'calendar':/courses|checklist|answers|refunds|privacy/.test(h)?'book':'link');});
  const observer=new MutationObserver(()=>{apply(document.querySelector('[data-settings-load]'),'settings');apply(document.querySelector('[data-settings-save]'),'check');apply(document.querySelector('[data-workflow-save]'),'check');});
  observer.observe(document.documentElement,{subtree:true,childList:true});
})();
