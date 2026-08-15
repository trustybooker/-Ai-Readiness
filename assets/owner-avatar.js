(function(){
 const avatar=document.querySelector('[data-avatar]');if(!avatar)return;
 avatar.innerHTML='<div class="aik-face" aria-hidden="true"><i class="eye e1"></i><i class="eye e2"></i><i class="mouth"></i></div>';
 const style=document.createElement('style');style.textContent=`
 .avatar{overflow:hidden}.aik-face{width:44px;height:44px;border-radius:50%;position:relative;background:radial-gradient(circle at 50% 35%,#2d7cf2,#12386f 70%);box-shadow:inset 0 0 18px rgba(99,217,255,.25)}
 .eye{position:absolute;top:14px;width:5px;height:7px;border-radius:50%;background:#eaf8ff;animation:aikBlink 5.4s infinite}.e1{left:12px}.e2{right:12px}.mouth{position:absolute;left:50%;bottom:10px;width:14px;height:3px;transform:translateX(-50%);border-radius:50%;background:#dff7ff;transition:.12s}
 .avatar.speaking .mouth{animation:aikTalk .18s ease-in-out infinite alternate}.avatar.listening .aik-face{box-shadow:0 0 20px rgba(112,224,161,.45),inset 0 0 18px rgba(112,224,161,.25)}.avatar.thinking .aik-face{animation:aikThink 1.2s ease-in-out infinite}
 @keyframes aikTalk{from{height:3px;width:13px}to{height:10px;width:10px;border-radius:45%}}@keyframes aikBlink{0%,46%,49%,100%{transform:scaleY(1)}47%,48%{transform:scaleY(.08)}}@keyframes aikThink{50%{transform:translateY(-2px) scale(1.03)}}`;
 document.head.appendChild(style);
 if('speechSynthesis'in window){const original=window.speechSynthesis.speak.bind(window.speechSynthesis);window.speechSynthesis.speak=(utterance)=>{const start=utterance.onstart,end=utterance.onend,error=utterance.onerror;utterance.onstart=(e)=>{avatar.classList.add('speaking');start?.call(utterance,e)};utterance.onend=(e)=>{avatar.classList.remove('speaking');end?.call(utterance,e)};utterance.onerror=(e)=>{avatar.classList.remove('speaking');error?.call(utterance,e)};return original(utterance);};}
 if(!document.querySelector('script[data-social-ops-loader]')){const s=document.createElement('script');s.src='/assets/social-ops.js';s.defer=true;s.dataset.socialOpsLoader='true';document.head.appendChild(s);}
})();
