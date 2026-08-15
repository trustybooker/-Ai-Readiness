(function(){
  const ready=()=>{
    if(location.pathname==='/'||/\/index\.html$/i.test(location.pathname))document.body.classList.add('aik-home');
    const iconMap=new Map([
      ['build ai skills','spark'],['improve work','workflow'],['prepare a team','people'],
      ['assess','search'],['train','book'],['implement','workflow'],['review','shield'],
      ['resume examples','file'],['interview preparation','chat'],['practical projects','tools'],['completion recognition','badge']
    ]);
    const paths={
      spark:'<path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Z"/><path d="M5 15l.9 2.6L8.5 18l-2.6.9L5 21l-.9-2.1L2 18l2.1-.4L5 15Z"/>',
      workflow:'<rect x="3" y="4" width="7" height="6" rx="1"/><rect x="14" y="14" width="7" height="6" rx="1"/><path d="M10 7h5a3 3 0 0 1 3 3v4M14 17H9a3 3 0 0 1-3-3v-4"/>',
      people:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c.5-4 2.5-6 6-6s5.5 2 6 6M14 14c3 0 5 2 5.5 5"/>',
      search:'<circle cx="10" cy="10" r="6"/><path d="M14.5 14.5L21 21"/>',
      book:'<path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H20v17H7.5A3.5 3.5 0 0 0 4 22V5.5Z"/><path d="M4 18.5A3.5 3.5 0 0 1 7.5 15H20"/>',
      shield:'<path d="M12 3l8 3v5c0 5.5-3.2 8.7-8 10-4.8-1.3-8-4.5-8-10V6l8-3Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/>',
      file:'<path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5M9 12h6M9 16h6"/>',
      chat:'<path d="M4 4h16v12H9l-5 4V4Z"/><path d="M8 9h8M8 12h5"/>',
      tools:'<path d="M14 6a4 4 0 0 0-5 5L3 17l4 4 6-6a4 4 0 0 0 5-5l-3 3-4-4 3-3Z"/>',
      badge:'<circle cx="12" cy="9" r="6"/><path d="m8 14-1 8 5-3 5 3-1-8"/>'
    };
    document.querySelectorAll('.cards article h3,.list-grid b').forEach(h=>{
      if(h.parentElement?.querySelector(':scope > .aik-icon'))return;
      const key=iconMap.get(h.textContent.trim().toLowerCase());if(!key)return;
      const box=document.createElement('span');box.className='aik-icon';box.setAttribute('aria-hidden','true');box.innerHTML=`<svg viewBox="0 0 24 24">${paths[key]}</svg>`;h.parentElement.prepend(box);
    });
    document.querySelectorAll('.lead-box').forEach(box=>{
      const left=box.firstElementChild;if(!left||left.querySelector('.request-next'))return;
      const guide=document.createElement('div');guide.className='request-next';guide.setAttribute('aria-label','What happens after you send a request');
      guide.innerHTML='<div><b>1</b><span><strong>We review the request</strong><span>Your stated goal and selected path are used to route the request correctly.</span></span></div><div><b>2</b><span><strong>You get a relevant next step</strong><span>We recommend the smallest useful option instead of forcing a larger service.</span></span></div><div><b>3</b><span><strong>Human judgment stays available</strong><span>Use the AI receptionist for quick help or ask for a person when the situation needs one.</span></span></div>';
      left.appendChild(guide);
    });
    const menu=document.querySelector('[data-menu]');if(menu&&!menu.getAttribute('aria-label'))menu.setAttribute('aria-label','Open navigation menu');
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
