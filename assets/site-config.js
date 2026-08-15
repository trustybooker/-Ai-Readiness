window.AIKOLLEGE_SITE_CONFIG = {
  bookingUrl: 'https://calendar.app.google/wSVv9b3k5X5GiQqf6',
  // Public customer-facing Twilio receptionist line. The private human-forward
  // destination stays server-side in Netlify/Owner Studio and is never exposed here.
  contact: {
    phoneE164: '+17726665472',
    phoneDisplay: '(772) 666-5472',
    phoneLabel: 'Call AI receptionist'
  },
  // Used only if both first-party lead-capture routes are unavailable.
  fallbackFormAction: 'https://formsubmit.co/fifynow@fifynowllc.com',
  analytics: {
    provider: 'google-analytics-4',
    googleAnalyticsId: 'G-P4TR060PFF',
    plausibleDomain: ''
  },
  payments: {
    aiStarterPass: 'https://buy.stripe.com/00w28qa1L0S89vzfjP2Nq09',
    aiJobProductivityPass: 'https://buy.stripe.com/5kQaEWfm558o7nr2x32Nq0a',
    businessAiReadinessAudit: '',
    teamTrainingDeposit: '',
    implementationReviewDeposit: '',
    aiReadinessLab: ''
  },
  secretary: {
    enabled: true
  }
};

// Keep the public phone consistent across public pages without duplicating it into every template.
document.addEventListener('DOMContentLoaded',()=>{
  const c=window.AIKOLLEGE_SITE_CONFIG?.contact||{};
  if(!/^\+[1-9]\d{7,14}$/.test(String(c.phoneE164||''))||!c.phoneDisplay)return;
  if(document.querySelector('[data-aik-public-phone]'))return;
  const footer=document.querySelector('.footer .footer-grid > div:first-child, .footer .shell > div:first-child, .footer .shell');
  if(!footer)return;
  const p=document.createElement('p');p.dataset.aikPublicPhone='true';p.className='public-phone';
  const a=document.createElement('a');a.href=`tel:${c.phoneE164}`;a.textContent=`${c.phoneLabel||'Call'}: ${c.phoneDisplay}`;a.setAttribute('aria-label',`${c.phoneLabel||'Call'} at ${c.phoneDisplay}`);
  p.appendChild(a);const note=document.createElement('span');note.textContent=' · AI receptionist; ask for a human when needed.';p.appendChild(note);footer.appendChild(p);
});
