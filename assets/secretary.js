// AI Kollege Secretary widget. Renders nothing unless the owner enables it in
// assets/site-config.js AFTER configuring ANTHROPIC_API_KEY (and optionally
// LEADS_SECRET) in the host dashboard — no stubbed UI for unwired features.
(function () {
  var config = window.FIFYNOW_SITE_CONFIG || {};
  var secretaryConfig = config.secretary || {};
  if (!secretaryConfig.enabled) return;

  var ENDPOINTS = ['/.netlify/functions/secretary', '/api/secretary'];
  var history = [];
  var busy = false;

  var css = '.aik-chat-btn{position:fixed;bottom:18px;right:18px;z-index:60;background:#0d63d8;color:#fff;border:0;border-radius:999px;padding:.7rem 1.1rem;font:600 .9rem/1 inherit;cursor:pointer;box-shadow:0 8px 24px rgba(9,17,31,.35)}' +
    '.aik-chat{position:fixed;bottom:74px;right:18px;z-index:60;width:min(360px,calc(100vw - 24px));max-height:70vh;display:none;flex-direction:column;background:#0e1626;color:#eaf1fb;border:1px solid rgba(255,255,255,.14);border-radius:14px;overflow:hidden;box-shadow:0 16px 44px rgba(0,0,0,.45)}' +
    '.aik-chat.open{display:flex}' +
    '.aik-chat header{padding:.7rem .9rem;background:#101d33;font-weight:700;display:flex;justify-content:space-between;align-items:center}' +
    '.aik-chat header small{display:block;font-weight:400;opacity:.75}' +
    '.aik-chat header button{background:none;border:0;color:#eaf1fb;font-size:1rem;cursor:pointer}' +
    '.aik-log{flex:1;overflow-y:auto;padding:.8rem;display:flex;flex-direction:column;gap:.5rem}' +
    '.aik-msg{max-width:88%;padding:.55rem .75rem;border-radius:10px;font-size:.88rem;line-height:1.4;white-space:pre-wrap}' +
    '.aik-msg.user{align-self:flex-end;background:#0d63d8}' +
    '.aik-msg.bot{align-self:flex-start;background:#1b2a44}' +
    '.aik-msg.bot a{color:#8fc1ff}' +
    '.aik-form{display:flex;gap:.4rem;padding:.6rem;border-top:1px solid rgba(255,255,255,.12)}' +
    '.aik-form input{flex:1;background:#101d33;border:1px solid rgba(255,255,255,.16);border-radius:8px;color:#eaf1fb;padding:.55rem .7rem;font-size:.88rem}' +
    '.aik-form button{background:#0d63d8;border:0;border-radius:8px;color:#fff;padding:.55rem .8rem;cursor:pointer}' +
    '.aik-note{padding:0 .8rem .6rem;font-size:.72rem;opacity:.65}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var launcher = document.createElement('button');
  launcher.className = 'aik-chat-btn';
  launcher.type = 'button';
  launcher.textContent = 'Ask AI Kollege';

  var panel = document.createElement('div');
  panel.className = 'aik-chat';
  panel.innerHTML =
    '<header><span>AI Kollege Secretary<small>Answers from site info only · a human handles money & bookings</small></span><button type="button" data-close aria-label="Close chat">×</button></header>' +
    '<div class="aik-log" data-log></div>' +
    '<form class="aik-form" data-form><input data-input maxlength="1000" placeholder="Ask about paths, the score, the badge…" aria-label="Your question"><button type="submit">Send</button></form>' +
    '<p class="aik-note">No payment, pricing deals, or booking confirmations here — a human reviews those. Conversations may be saved for follow-up.</p>';

  document.body.appendChild(launcher);
  document.body.appendChild(panel);

  var log = panel.querySelector('[data-log]');
  var input = panel.querySelector('[data-input]');

  function addMessage(role, text, bookingUrl) {
    var el = document.createElement('div');
    el.className = 'aik-msg ' + (role === 'user' ? 'user' : 'bot');
    el.textContent = text;
    if (role === 'bot' && bookingUrl) {
      var link = document.createElement('a');
      link.href = bookingUrl;
      link.textContent = 'Open the booking page';
      link.target = '_blank';
      link.rel = 'noopener';
      el.appendChild(document.createElement('br'));
      el.appendChild(link);
    }
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
  }

  function removeWidget(message) {
    if (message) addMessage('bot', message);
    setTimeout(function () {
      launcher.remove();
      panel.remove();
    }, message ? 6000 : 0);
  }

  async function send(message) {
    for (var i = 0; i < ENDPOINTS.length; i++) {
      try {
        var response = await fetch(ENDPOINTS[i], {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ message: message, history: history, channel: 'web' })
        });
        if (response.status === 404) continue;
        return { status: response.status, body: await response.json() };
      } catch (e) { /* try next endpoint */ }
    }
    return { status: 0, body: null };
  }

  panel.querySelector('[data-form]').addEventListener('submit', async function (event) {
    event.preventDefault();
    var message = input.value.trim();
    if (!message || busy) return;
    busy = true;
    input.value = '';
    addMessage('user', message);

    var result = await send(message);
    busy = false;

    if (result.status === 503) {
      removeWidget('Chat is not available right now. Please use the request form on this page instead.');
      return;
    }
    if (!result.body || result.body.ok !== true) {
      addMessage('bot', 'Something went wrong on my side. Please use the request form on this page and a human will follow up.');
      return;
    }
    history.push({ role: 'user', text: message });
    history.push({ role: 'assistant', text: result.body.reply });
    if (history.length > 12) history = history.slice(-12);
    addMessage('bot', result.body.reply, result.body.offer_booking ? (result.body.booking_url || 'booking.html') : '');
  });

  launcher.addEventListener('click', function () {
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) {
      if (!log.childElementCount) {
        addMessage('bot', 'Hi — I can explain the free score, the paths, the badge, and how booking works. What problem are you trying to solve?');
      }
      input.focus();
    }
  });
  panel.querySelector('[data-close]').addEventListener('click', function () {
    panel.classList.remove('open');
  });
})();
