// AI Kollege Secretary widget. Public receptionist for web visitors.
(function () {
  var config = window.FIFYNOW_SITE_CONFIG || {};
  var secretaryConfig = config.secretary || {};
  if (!secretaryConfig.enabled) return;

  var ENDPOINTS = ['/.netlify/functions/secretary', '/api/secretary'];
  var history = [], busy = false, listening = false, voiceReply = false, openedTracked = false;
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var recognition = SpeechRecognition ? new SpeechRecognition() : null;
  var canSpeak = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  if (recognition) { recognition.lang = document.documentElement.lang || 'en-US'; recognition.interimResults = false; recognition.maxAlternatives = 1; }
  function track(name,params){ if(typeof window.gtag==='function')window.gtag('event',name,params||{}); if(typeof window.plausible==='function')window.plausible(name,{props:params||{}}); }

  var css = '.aik-chat-btn{position:fixed;bottom:18px;right:18px;z-index:60;background:#0d63d8;color:#fff;border:0;border-radius:999px;padding:.7rem 1.1rem;font:600 .9rem/1 inherit;cursor:pointer;box-shadow:0 8px 24px rgba(9,17,31,.35)}' +
    '.aik-chat{position:fixed;bottom:74px;right:18px;z-index:60;width:min(400px,calc(100vw - 24px));max-height:74vh;display:none;flex-direction:column;background:#0e1626;color:#eaf1fb;border:1px solid rgba(255,255,255,.14);border-radius:16px;overflow:hidden;box-shadow:0 16px 44px rgba(0,0,0,.45)}' +
    '.aik-chat.open{display:flex}.aik-chat header{padding:.75rem .9rem;background:#101d33;font-weight:700;display:flex;justify-content:space-between;align-items:center}.aik-chat header small{display:block;font-weight:400;opacity:.75}.aik-chat header button{background:none;border:0;color:#eaf1fb;font-size:1rem;cursor:pointer}' +
    '.aik-log{flex:1;overflow-y:auto;padding:.8rem;display:flex;flex-direction:column;gap:.55rem}.aik-msg{max-width:90%;padding:.6rem .75rem;border-radius:11px;font-size:.88rem;line-height:1.45;white-space:pre-wrap}.aik-msg.user{align-self:flex-end;background:#0d63d8}.aik-msg.bot{align-self:flex-start;background:#1b2a44}.aik-links{display:flex;flex-wrap:wrap;gap:.35rem;margin-top:.55rem}.aik-links a{color:#dcecff;background:#17365e;border:1px solid rgba(255,255,255,.16);padding:.35rem .5rem;border-radius:999px;text-decoration:none;font-size:.78rem}.aik-status{display:block;margin-top:.45rem;font-size:.74rem;opacity:.75}' +
    '.aik-form{display:flex;gap:.4rem;padding:.6rem;border-top:1px solid rgba(255,255,255,.12)}.aik-form input{min-width:0;flex:1;background:#101d33;border:1px solid rgba(255,255,255,.16);border-radius:8px;color:#eaf1fb;padding:.55rem .7rem;font-size:.88rem}.aik-form button{background:#0d63d8;border:0;border-radius:8px;color:#fff;padding:.55rem .7rem;cursor:pointer}.aik-form button[disabled]{opacity:.5;cursor:not-allowed}.aik-voice.active{outline:2px solid #fff}.aik-voicebar{display:flex;align-items:center;gap:.5rem;padding:0 .7rem .55rem;font-size:.72rem;opacity:.82}.aik-voicebar button{border:1px solid rgba(255,255,255,.18);background:#101d33;color:#eaf1fb;border-radius:7px;padding:.35rem .5rem;cursor:pointer}.aik-note{padding:0 .8rem .6rem;font-size:.72rem;opacity:.68}';
  var style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  var launcher = document.createElement('button'); launcher.className = 'aik-chat-btn'; launcher.type = 'button'; launcher.textContent = 'Ask AI Kollege'; launcher.setAttribute('aria-label','Open AI Kollege Secretary');
  var panel = document.createElement('div'); panel.className = 'aik-chat'; panel.setAttribute('role','dialog'); panel.setAttribute('aria-label','AI Kollege Secretary');
  panel.innerHTML = '<header><span>AI Kollege Secretary<small>Receptionist · talk or type</small></span><button type="button" data-close aria-label="Close chat">×</button></header><div class="aik-log" data-log aria-live="polite"></div><form class="aik-form" data-form><input data-input maxlength="1000" placeholder="Ask about courses, pricing, the score, booking…" aria-label="Your question"><button class="aik-voice" type="button" data-voice aria-label="Speak your question">🎙</button><button type="submit">Send</button></form><div class="aik-voicebar"><span data-voice-status>Voice is optional.</span><button type="button" data-sound aria-pressed="false">🔊 Read replies: off</button></div><p class="aik-note">I can guide you and connect you to the right page. I cannot take card details, approve discounts/refunds, or confirm appointments. Human review is used when needed.</p>';
  document.body.appendChild(launcher); document.body.appendChild(panel);

  var log = panel.querySelector('[data-log]'), input = panel.querySelector('[data-input]'), voiceButton = panel.querySelector('[data-voice]'), soundButton = panel.querySelector('[data-sound]'), voiceStatus = panel.querySelector('[data-voice-status]'), sendButton=panel.querySelector('button[type="submit"]');
  if (!recognition) { voiceButton.disabled = true; voiceButton.title = 'Voice input is not supported by this browser'; voiceStatus.textContent = 'Voice input is unavailable in this browser; typing still works.'; }
  if (!canSpeak) { soundButton.disabled = true; soundButton.textContent = '🔇 Spoken replies unavailable'; }

  function safeHref(href){ try{var u=new URL(String(href||''),location.origin);return u.origin===location.origin||u.protocol==='https:'?u.href:'';}catch(e){return '';} }
  function addMessage(role, text, links, statusText) {
    var el = document.createElement('div'); el.className = 'aik-msg ' + (role === 'user' ? 'user' : 'bot'); el.textContent = text;
    if(role==='bot'&&Array.isArray(links)&&links.length){var wrap=document.createElement('div');wrap.className='aik-links';links.forEach(function(item){var href=safeHref(item&&item.href);if(!href)return;var a=document.createElement('a');a.href=href;a.textContent=String(item.label||'Open page');if(new URL(href).origin!==location.origin){a.target='_blank';a.rel='noopener';}wrap.appendChild(a);});if(wrap.childElementCount)el.appendChild(wrap);}
    if(statusText){var s=document.createElement('span');s.className='aik-status';s.textContent=statusText;el.appendChild(s);}
    log.appendChild(el); log.scrollTop = log.scrollHeight;
  }
  function speak(text) { if (!voiceReply || !canSpeak || !text) return; window.speechSynthesis.cancel(); var utterance = new SpeechSynthesisUtterance(text); utterance.lang = document.documentElement.lang || 'en-US'; utterance.rate = 1; window.speechSynthesis.speak(utterance); }
  function removeWidget(message) { if (message) addMessage('bot', message); setTimeout(function(){ launcher.remove(); panel.remove(); }, message ? 6500 : 0); }
  async function send(message) { for (var i=0;i<ENDPOINTS.length;i++) { try { var response = await fetch(ENDPOINTS[i], {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({message:message,history:history,channel:listening?'web_voice':'web'})}); if(response.status===404) continue; var body=null;try{body=await response.json();}catch(e){}return {status:response.status,body:body}; } catch(e){} } return {status:0,body:null}; }
  async function submitMessage(message) {
    message = (message || '').trim(); if (!message || busy) return; busy=true; input.value=''; input.disabled=true; sendButton.disabled=true; addMessage('user',message);
    var result=await send(message); busy=false; input.disabled=false; sendButton.disabled=false; input.focus();
    if(result.status===429){addMessage('bot','I’m receiving too many requests at once. Please wait a moment and try again, or use the booking/request form.');return;}
    if(result.status===503){removeWidget('The receptionist is temporarily unavailable. Please use the request or booking form instead.');return;}
    if(!result.body||result.body.ok!==true){addMessage('bot','Something went wrong on my side. Please use the request or booking form and a person can follow up.');return;}
    history.push({role:'user',text:message}); history.push({role:'assistant',text:result.body.reply}); if(history.length>12) history=history.slice(-12);
    var status=result.body.handoff?(result.body.followup_saved?'Human follow-up was saved for review.':'Human review is recommended; use Booking if you want to make sure we can reach you.'):(result.body.logged?'Your follow-up details were saved privately.':'');
    addMessage('bot',result.body.reply,result.body.links||[],status); speak(result.body.reply);
    track('secretary_interaction_completed',{channel:listening?'web_voice':'web',handoff:Boolean(result.body.handoff),followup_saved:Boolean(result.body.followup_saved)});
    if(result.body.handoff)track('human_handoff_requested',{channel:listening?'web_voice':'web',followup_saved:Boolean(result.body.followup_saved)});
  }
  panel.querySelector('[data-form]').addEventListener('submit',function(event){event.preventDefault();submitMessage(input.value);});
  if (recognition) { voiceButton.addEventListener('click',function(){ if(listening){recognition.stop();return;} try{recognition.start();}catch(e){} }); recognition.onstart=function(){listening=true;voiceButton.classList.add('active');voiceStatus.textContent='Listening… speak naturally.';}; recognition.onend=function(){listening=false;voiceButton.classList.remove('active');if(voiceStatus.textContent.indexOf('Heard:')!==0) voiceStatus.textContent='Voice is ready.';}; recognition.onerror=function(event){voiceStatus.textContent=event.error==='not-allowed'?'Microphone permission was not granted. You can keep typing.':'I could not hear that clearly. Try again or type.';}; recognition.onresult=function(event){var transcript=event.results&&event.results[0]&&event.results[0][0]?event.results[0][0].transcript:''; if(!transcript)return; voiceStatus.textContent='Heard: '+transcript; submitMessage(transcript);}; }
  soundButton.addEventListener('click',function(){ if(!canSpeak)return; voiceReply=!voiceReply; soundButton.setAttribute('aria-pressed',voiceReply?'true':'false'); soundButton.textContent=voiceReply?'🔊 Read replies: on':'🔊 Read replies: off'; if(!voiceReply) window.speechSynthesis.cancel(); });
  launcher.addEventListener('click',function(){panel.classList.toggle('open');if(panel.classList.contains('open')){if(!openedTracked){openedTracked=true;track('secretary_opened',{page:location.pathname});}if(!log.childElementCount)addMessage('bot','Hi — I’m the AI Kollege receptionist. Tell me what you are trying to accomplish and I can explain the right path, pricing we publish, the free score, courses, or how to reach a person.');input.focus();}});
  panel.querySelector('[data-close]').addEventListener('click',function(){panel.classList.remove('open');if(canSpeak)window.speechSynthesis.cancel();if(recognition&&listening)recognition.stop();});
})();
