/* Customly portal app. Onboarding first, then the portal. All data comes from Data (data.js). */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const app = $('#app');
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const firstName = (n) => (n || '').trim().split(/\s+/)[0] || '';
  const initials = (n) => (n || '?').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const LOGO = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M23.8 8.2A11 11 0 1 0 23.8 23.8" fill="none" stroke="#0284C7" stroke-width="3.2" stroke-linecap="round"/><path d="M20.2 11.8A6 6 0 1 0 20.2 20.2" fill="none" stroke="#38BDF8" stroke-width="3.2" stroke-linecap="round"/><circle cx="16" cy="16" r="2.4" fill="#0284C7"/></svg>';
  const brand = (sub) => `<a class="brand" href="#/home">${LOGO}Customly${sub ? `<small>${sub}</small>` : ''}</a>`;
  const I = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>',
    leads: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M17 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6.3"/></svg>',
    jobs: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 15l2.5 2.5L16 13"/></svg>',
    try: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 10 17 19 7.5"/></svg>',
    send: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    back: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
    phone: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M12 8v6M9 11h6"/></svg>',
    user: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>'
  };

  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2800);
  }
  /* ---------- Add to home screen ---------- */
  let installEvt = null;
  const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; });
  window.addEventListener('appinstalled', () => { installEvt = null; toast('Customly is on your home screen'); $$('[data-install-wrap]').forEach(x => x.remove()); });
  if ('serviceWorker' in navigator && window.isSecureContext) navigator.serviceWorker.register('sw.js').catch(() => {});
  const installBtn = (cls) => isStandalone() ? '' : `<button type="button" class="btn ${cls || ''}" data-install>${I.phone} Add to home screen</button>`;
  function wireInstall(root) {
    $$('[data-install]', root || document).forEach(b => b.addEventListener('click', async () => {
      if (installEvt) {
        installEvt.prompt();
        const r = await installEvt.userChoice; installEvt = null;
        if (r.outcome === 'accepted') toast('Customly is on your home screen');
        return;
      }
      openInstallHelp();
    }));
  }
  function openInstallHelp() {
    const ios = isIOS();
    const share = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-4px"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>';
    const steps = ios
      ? [`Tap the Share button ${share} at the bottom of Safari.`, 'Scroll down and tap <strong>Add to Home Screen</strong>.', 'Tap <strong>Add</strong>. Customly shows up with your other apps.']
      : /android/i.test(navigator.userAgent)
        ? ['Tap the <strong>⋮</strong> menu at the top right of Chrome.', 'Tap <strong>Add to Home screen</strong> or <strong>Install app</strong>.', 'Tap <strong>Install</strong>. Customly shows up with your other apps.']
        : ['Open this same link on your phone.', 'Tap <strong>Add to home screen</strong> in your portal.', 'Customly shows up with your other apps.'];
    const wrap = document.createElement('div');
    wrap.innerHTML = `<div class="drawer-bg"></div><aside class="sheet" role="dialog" aria-label="Add to home screen">
      <div style="display:flex;gap:16px;align-items:center;margin-bottom:16px"><img src="icon-192.png" alt="" width="56" height="56" style="border-radius:14px;border:1px solid var(--line)"><div><h2 style="font-size:20px">Add Customly to your home screen</h2><p class="muted" style="font-size:14px">Open your portal in one tap, like an app.</p></div></div>
      <div class="steps-next" style="margin:0 0 24px">${steps.map((s, i) => `<div><b>${i + 1}</b><p>${s}</p></div>`).join('')}</div>
      <button class="btn" data-x style="width:100%">Got it</button></aside>`;
    document.body.appendChild(wrap);
    const close = () => wrap.remove();
    wrap.querySelector('.drawer-bg').addEventListener('click', close);
    wrap.querySelector('[data-x]').addEventListener('click', close);
  }

  function when(ts) {
    const d = new Date(ts), now = new Date();
    const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    if (d.toDateString() === now.toDateString()) return time;
    const y = new Date(now); y.setDate(now.getDate() - 1);
    if (d.toDateString() === y.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  function dayLabel(ts) {
    const d = new Date(ts), now = new Date();
    if (d.toDateString() === now.toDateString()) return 'Today';
    const y = new Date(now); y.setDate(now.getDate() - 1);
    if (d.toDateString() === y.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  }

  /* =================================================================
     ONBOARDING
     Part 1 (steps 1 to 3): texting registration, sent to Pat the moment step 3 is done.
     Part 2 (steps 4 and 5): how the agent works. Step 6: review and submit.
     ================================================================= */
  const TRADES = {
    'Concrete': ['Driveways', 'Patios', 'Sidewalks', 'Stamped concrete', 'Slabs and foundations', 'Concrete repair'],
    'Lawn care': ['Mowing', 'Edging', 'Leaf cleanup', 'Mulch', 'Fertilizing'],
    'Pressure washing': ['House washing', 'Driveway cleaning', 'Deck cleaning', 'Roof soft wash'],
    'Roofing': ['Roof repair', 'Roof replacement', 'Inspections', 'Gutters'],
    'HVAC': ['AC repair', 'Heating repair', 'New systems', 'Maintenance plans'],
    'Plumbing': ['Leak repair', 'Water heaters', 'Drain cleaning', 'Repiping'],
    'Painting': ['Interior painting', 'Exterior painting', 'Cabinets', 'Decks and fences'],
    'Fencing': ['Wood fences', 'Vinyl fences', 'Chain link', 'Fence repair'],
    'Landscaping': ['Landscape design', 'Sod', 'Hardscapes', 'Irrigation'],
    'Cleaning': ['House cleaning', 'Deep cleaning', 'Move out cleaning'],
    'Other': []
  };
  const TIMES = ['5 AM', '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM'];
  const PART1 = 'Get your texting number approved';
  const STEPS = [
    { t: 'Your business', part: PART1, d: 'Phone carriers require every business that texts customers to register first. Approval usually takes 1 to 2 weeks, so we start this right away.' },
    { t: 'Contact and website', part: PART1, d: 'Who carriers can contact, and a quick check of your website. Carriers look at it during review.' },
    { t: 'Phone and leads', part: PART1, d: 'Which number your agent texts from and where your customers come from.' },
    { t: 'Your work', part: 'Set up your agent', d: 'What you do, where you do it and when you\'re open.' },
    { t: 'Your agent', part: 'Set up your agent', d: 'How it should sound and when to hand leads to you.' },
    { t: 'Review and submit', part: 'Almost done', d: 'Take a quick look. You can change anything later.' }
  ];
  const REG_FIELDS = ['no_ein', 'legal_name', 'dba', 'business_type', 'ein', 'ein_date', 'ein_letter_name', 'business_address', 'website', 'trade', 'contact_name', 'contact_title', 'contact_email', 'contact_phone', 'authorized', 'privacy_has', 'privacy_url', 'terms_has', 'terms_url', 'web_editor_name', 'web_editor_email', 'number_choice', 'forward_missed', 'phone_carrier', 'forwarding_login', 'rings', 'lead_sources', 'missed_per_week'];
  const WORK_FIELDS = ['services', 'service_area', 'weekday_open', 'weekday_close', 'saturday', 'sunday', 'avg_job_value', 'current_tools', 'agent_name', 'tone', 'always_mention', 'never_say', 'handoff', 'after_hours'];
  const RERENDER = ['no_ein', 'number_choice', 'privacy_has', 'terms_has', 'trade'];
  let draft = {};
  let saveTimer;
  let pendingFile = null; // EIN letter picked but not uploaded yet

  const input = (name, label, o = {}) => `
    <div class="field ${o.full ? 'full' : ''}" data-f="${name}">
      <label for="f_${name}">${label}${o.opt ? ' <span class="opt">(optional)</span>' : ''}</label>
      <input id="f_${name}" name="${name}" type="${o.type || 'text'}" value="${esc(draft[name] || '')}" placeholder="${esc(o.ph || '')}" ${o.req ? 'data-req' : ''} ${o.check ? `data-check="${o.check}"` : ''} ${o.mode ? `inputmode="${o.mode}"` : ''} autocomplete="${o.ac || 'off'}">
      ${o.hint ? `<div class="hint">${o.hint}</div>` : ''}
      <div class="err">${o.err || 'Please fill this in.'}</div>
    </div>`;
  const textarea = (name, label, o = {}) => `
    <div class="field full" data-f="${name}">
      <label for="f_${name}">${label}${o.opt ? ' <span class="opt">(optional)</span>' : ''}</label>
      <textarea id="f_${name}" name="${name}" placeholder="${esc(o.ph || '')}">${esc(draft[name] || '')}</textarea>
      ${o.hint ? `<div class="hint">${o.hint}</div>` : ''}
    </div>`;
  const select = (name, label, opts, o = {}) => `
    <div class="field ${o.full ? 'full' : ''}" data-f="${name}">
      <label for="f_${name}">${label}${o.opt ? ' <span class="opt">(optional)</span>' : ''}</label>
      <select id="f_${name}" name="${name}" ${o.req ? 'data-req' : ''}>
        <option value="">Choose one</option>
        ${opts.map(x => `<option ${(draft[name] || o.def) === x ? 'selected' : ''}>${esc(x)}</option>`).join('')}
      </select>
      ${o.hint ? `<div class="hint">${o.hint}</div>` : ''}
      <div class="err">Please choose one.</div>
    </div>`;
  const choices = (name, label, opts, o = {}) => `
    <div class="field full" data-f="${name}" ${o.req ? 'data-reqradio' : ''}>
      <span class="lbl">${label}</span>
      <div class="choices ${o.two ? 'two' : ''}">
        ${opts.map(([v, t, sub]) => `<label class="choice"><input type="radio" name="${name}" value="${v}" ${draft[name] === v ? 'checked' : ''}><span>${t}${sub ? `<em>${sub}</em>` : ''}</span></label>`).join('')}
      </div>
      <div class="err">Please pick one.</div>
    </div>`;
  const checkbox = (name, label, o = {}) => `
    <div class="field full" data-f="${name}" ${o.req ? 'data-reqcheck' : ''}>
      <label class="toggle-later" style="margin:0"><input type="checkbox" name="${name}" ${draft[name] === 'yes' ? 'checked' : ''}> ${label}</label>
      <div class="err">${o.err || 'Please check this box to continue.'}</div>
    </div>`;
  const multi = (name, label, opts) => {
    const cur = (draft[name] || '').split(', ');
    return `<div class="field full" data-f="${name}"><span class="lbl">${label}</span>
      <div class="chips">${opts.map(o => `<label class="chip ${cur.includes(o) ? 'on' : ''}" style="cursor:pointer"><input type="checkbox" class="sr" name="${name}" value="${o}" ${cur.includes(o) ? 'checked' : ''}>${o}</label>`).join('')}</div></div>`;
  };
  function einAgeWarning() {
    if (!draft.ein_date) return '';
    const days = (Date.now() - new Date(draft.ein_date + 'T12:00:00').getTime()) / 86400000;
    if (days >= 15) return '';
    return `<div class="note full" style="background:var(--amber-soft);border-color:#FDE68A;margin:0"><span>⏳</span><div><b>Your EIN is brand new.</b> Carriers reject EINs less than 15 days old, so we'll hold your registration until it's old enough. Everything else keeps moving.</div></div>`;
  }

  function stepBody(n) {
    if (n === 1) {
      const noEin = draft.no_ein === 'yes';
      const letter = draft.ein_letter_name ? `<div class="hint" style="color:var(--green);font-weight:600">Uploaded: ${esc(draft.ein_letter_name)}. Pick a new file to replace it.</div>` : '';
      return `<div class="grid">
        ${checkbox('no_ein', 'I don\'t have an EIN')}
        ${noEin ? `<div class="note full" style="margin:0"><span>👤</span><div>No problem. We'll register you as a <b>sole proprietor</b>. We just need your name, email, mobile number and address. One mobile number can only be used for a few sole proprietor registrations.</div></div>
          ${input('dba', 'Name customers know you by', { req: true, full: true, ph: 'Your Concrete Co.' })}`
        : `${input('legal_name', 'Legal business name', { req: true, full: true, ph: 'Your Concrete Co. LLC', hint: 'Must match your IRS EIN letter (CP 575) exactly, including LLC or Inc. This is the most common reason carriers say no.' })}
          ${input('dba', 'Name customers know you by', { opt: true, full: true, ph: 'Your Concrete Co.', hint: 'Only if it\'s different from your legal name.' })}
          ${select('business_type', 'Business type', ['Sole proprietor', 'LLC', 'Corporation', 'Partnership', 'Nonprofit'], { req: true })}
          ${input('ein', 'EIN', { req: true, ph: '12-3456789', mode: 'numeric', check: 'ein', err: 'Please enter your 9 digit EIN, like 12-3456789.' })}
          ${input('ein_date', 'Date the EIN was issued', { req: true, type: 'date', hint: 'It\'s printed at the top of your EIN letter.' })}
          <div class="field" data-f="ein_letter" ${draft.ein_letter_name ? '' : 'data-reqfile'}>
            <label for="f_ein_letter">Upload your IRS EIN letter</label>
            <input id="f_ein_letter" type="file" accept=".pdf,image/*" style="padding:10px 12px;height:auto">
            ${letter || '<div class="hint">PDF or a phone photo is fine. Pat checks it before anything is sent.</div>'}
            <div class="err">Please upload your EIN letter.</div>
          </div>
          <div id="einwarn" class="full" style="display:contents">${einAgeWarning()}</div>`}
        ${input('business_address', 'Physical business address', { req: true, full: true, ph: 'Street, city, state, ZIP', ac: 'street-address', hint: 'No P.O. boxes.', check: 'pobox', err: 'Please use a street address. Carriers don\'t accept P.O. boxes.' })}
        ${input('website', 'Website', { opt: true, mode: 'url', ph: 'yourcompany.com', hint: 'Carriers look at this. No website? Leave it blank and we\'ll sort it out.' })}
        ${select('trade', 'Industry', Object.keys(TRADES), { req: true })}
      </div>`;
    }
    if (n === 2) return `<div class="grid">
        <div class="full"><h3 style="font-size:17px">Authorized contact</h3><p class="muted" style="font-size:14px">The person carriers can reach about this registration. Usually the owner.</p></div>
        ${input('contact_name', 'Full name', { req: true, ac: 'name', ph: 'First and last' })}
        ${select('contact_title', 'Title', ['Owner', 'CEO', 'General Manager', 'Other'], { req: true })}
        ${input('contact_email', 'Email', { req: true, type: 'email', mode: 'email', ac: 'email', ph: 'you@yourcompany.com', err: 'Please enter a valid email.' })}
        ${input('contact_phone', 'Mobile phone', { req: true, type: 'tel', mode: 'tel', ac: 'tel', ph: '706 555 0123', hint: 'Your agent also sends you new leads here.', err: 'Please enter a 10 digit phone number.' })}
        ${checkbox('authorized', 'I\'m authorized to register this business for business texting.', { req: true })}
        <div class="full" style="margin-top:16px"><h3 style="font-size:17px">Website check</h3><p class="muted" style="font-size:14px">Carriers check your website during review.</p></div>
        <div class="note full" style="margin:0"><span>✅</span><div>If you don't have these, <b>we'll add them for you.</b></div></div>
        ${choices('privacy_has', 'Does your website have a privacy policy page?', [['yes', 'Yes'], ['no', 'No'], ['unsure', 'Not sure']])}
        ${draft.privacy_has === 'yes' ? input('privacy_url', 'Privacy policy link', { full: true, mode: 'url', ph: 'yourcompany.com/privacy' }) : ''}
        ${choices('terms_has', 'Does it have a terms page?', [['yes', 'Yes'], ['no', 'No'], ['unsure', 'Not sure']])}
        ${draft.terms_has === 'yes' ? input('terms_url', 'Terms page link', { full: true, mode: 'url', ph: 'yourcompany.com/terms' }) : ''}
        ${input('web_editor_name', 'Who can edit your website?', { opt: true, ph: 'Name' })}
        ${input('web_editor_email', 'Their email', { opt: true, type: 'email', ph: 'name@email.com' })}
      </div>`;
    if (n === 3) {
      const isNew = draft.number_choice === 'new';
      return `<div class="grid">
        ${choices('number_choice', 'Which number should your agent text from?', [['existing', 'Our business number', 'Text enable the number customers already have'], ['new', 'A new local number', 'Get a new number just for texting']], { req: true, two: true })}
        ${isNew ? `${choices('forward_missed', 'Forward missed calls from your main line so they trigger a text back?', [['yes', 'Yes'], ['no', 'No']], { two: true })}
          ${input('phone_carrier', 'Your phone carrier', { opt: true, ph: 'Verizon, AT&T, T Mobile...' })}
          ${input('forwarding_login', 'Who can log in to change call forwarding?', { opt: true, ph: 'Name' })}` : ''}
        ${select('rings', 'How many rings before a call counts as missed?', ['2', '3', '4', '5', '6'], { def: '4' })}
        ${select('missed_per_week', 'Roughly how many calls do you miss in a week?', ['0 to 5', '6 to 15', '16 to 30', 'More than 30', 'Not sure'], { req: true })}
        ${multi('lead_sources', 'Where do most new customers reach you?', ['Phone calls', 'Texts', 'Website form', 'Google', 'Facebook', 'Referrals', 'Other'])}
        <div class="note full" style="margin:0"><span>📨</span><div>When you hit Continue, your registration details go straight to Pat so we can submit them today.</div></div>
      </div>`;
    }
    if (n === 4) {
      const sug = TRADES[draft.trade] || [];
      const cur = (draft.services || '').split(',').map(s => s.trim().toLowerCase());
      const hOpt = (name, def) => `<select name="${name}" id="f_${name}">${TIMES.map(t => `<option ${(draft[name] || def) === t ? 'selected' : ''}>${t}</option>`).join('')}</select>`;
      return `<div class="grid">
        <div class="field full" data-f="services">
          <label for="f_services">Services you offer</label>
          <input id="f_services" name="services" value="${esc(draft.services || '')}" placeholder="Driveways, patios, sidewalks" data-req>
          ${sug.length ? `<div class="hint">Tap to add:</div><div class="chips">${sug.map(s => `<button type="button" class="chip ${cur.includes(s.toLowerCase()) ? 'on' : ''}" data-svc="${esc(s)}">${esc(s)}</button>`).join('')}</div>` : '<div class="hint">Separate each one with a comma.</div>'}
          <div class="err">Add at least one service.</div>
        </div>
        ${input('service_area', 'Where do you work?', { req: true, full: true, ph: 'Augusta, Evans, Martinez and North Augusta', hint: 'Cities or counties you cover.' })}
        <div class="field full"><span class="lbl">Hours, Monday to Friday</span>
          <div class="row2">${hOpt('weekday_open', '7 AM')}<span>to</span>${hOpt('weekday_close', '5 PM')}</div></div>
        ${choices('saturday', 'Saturday', [['closed', 'Closed'], ['half', 'Mornings'], ['full', 'Full day']])}
        ${choices('sunday', 'Sunday', [['closed', 'Closed'], ['open', 'By appointment']], { two: true })}
        ${input('avg_job_value', 'Average job value', { req: true, ph: '$4,500', mode: 'decimal', hint: 'A rough number is fine. It helps us show what each lead is worth to you.' })}
        ${select('current_tools', 'What do you use to run jobs now?', ['Jobber', 'Housecall Pro', 'ServiceTitan', 'GoHighLevel', 'Pen and paper', 'Other', 'Nothing yet'], { opt: true })}
      </div>`;
    }
    if (n === 5) return `<div class="grid">
      ${input('agent_name', 'What should your agent call itself?', { opt: true, ph: 'Riley', hint: 'It will introduce itself by this name, from your business.', full: true })}
      ${choices('tone', 'How should it sound?', [['friendly', 'Friendly', 'Warm and upbeat'], ['professional', 'Professional', 'Polished and clear'], ['casual', 'Casual', 'Short and laid back']], { req: true })}
      ${textarea('always_mention', 'Anything it should always mention?', { opt: true, ph: 'Free estimates. Licensed and insured. 10 years in business.' })}
      ${textarea('never_say', 'Anything it should never say or promise?', { opt: true, ph: 'Never give exact prices over text. Never promise a start date.' })}
      ${choices('handoff', 'When a new lead comes in, tell me by', [['text', 'Text'], ['email', 'Email'], ['both', 'Both']], { req: true })}
      ${choices('after_hours', 'After hours, your agent should', [['book', 'Answer and book', 'Book the estimate right away'], ['hold', 'Answer and hold', 'Say you\'ll call in the morning']], { req: true, two: true })}
    </div>`;
    // review
    const sec = (title, step, rows) => `<section><h3>${title}<button type="button" class="link" data-go="${step}">Edit</button></h3><dl>${rows.filter(r => r[1]).map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl></section>`;
    const tone = { friendly: 'Friendly', professional: 'Professional', casual: 'Casual' }[draft.tone];
    const yn = (v) => ({ yes: 'Yes', no: 'No', unsure: 'Not sure' }[v] || '');
    const noEin = draft.no_ein === 'yes';
    return `<div class="review">
      ${sec('Your business', 1, noEin ? [['Registration', 'Sole proprietor, no EIN'], ['Name customers know', draft.dba], ['Address', draft.business_address], ['Website', draft.website], ['Industry', draft.trade]]
        : [['Legal name', draft.legal_name], ['Known as', draft.dba], ['Type', draft.business_type], ['EIN', draft.ein], ['EIN issued', draft.ein_date], ['EIN letter', draft.ein_letter_name || (pendingFile && pendingFile.name)], ['Address', draft.business_address], ['Website', draft.website], ['Industry', draft.trade]])}
      ${sec('Contact and website', 2, [['Contact', [draft.contact_name, draft.contact_title].filter(Boolean).join(', ')], ['Email', draft.contact_email], ['Mobile', draft.contact_phone], ['Privacy page', [yn(draft.privacy_has), draft.privacy_url].filter(Boolean).join(', ')], ['Terms page', [yn(draft.terms_has), draft.terms_url].filter(Boolean).join(', ')], ['Website editor', [draft.web_editor_name, draft.web_editor_email].filter(Boolean).join(', ')]])}
      ${sec('Phone and leads', 3, [['Texts from', draft.number_choice === 'new' ? 'A new local number' : 'Our business number'], ['Forward missed calls', draft.number_choice === 'new' ? yn(draft.forward_missed) : ''], ['Rings before missed', draft.rings || '4'], ['Missed calls a week', draft.missed_per_week], ['Customers come from', draft.lead_sources]])}
      ${sec('Your work', 4, [['Services', draft.services], ['Area', draft.service_area], ['Hours', Data.hoursText(draft)], ['Average job', draft.avg_job_value], ['Tools now', draft.current_tools]])}
      ${sec('Your agent', 5, [['Name', draft.agent_name || 'Riley'], ['Sounds', tone], ['Always mention', draft.always_mention], ['Never say', draft.never_say], ['Tell me by', { text: 'Text', email: 'Email', both: 'Text and email' }[draft.handoff]], ['After hours', draft.after_hours === 'book' ? 'Answer and book' : 'Answer and hold']])}
    </div>`;
  }

  function renderOnboarding(n) {
    draft = Object.assign({ saturday: 'closed', sunday: 'closed', weekday_open: '7 AM', weekday_close: '5 PM', rings: '4', tone: 'friendly' }, Data.profile() || {});
    const editing = Data.submitted();
    const pct = Math.round((n / STEPS.length) * 100);
    const s = STEPS[n - 1];
    const firstScreen = n === 1 && !editing;
    app.innerHTML = `<div class="ob">
      <div class="ob-top">${brand('Client portal')}${editing ? '<a class="link" href="#/home">Back to portal</a>' : ''}</div>
      <form class="ob-card" novalidate>
        <div class="progress"><div class="progress-meta"><span>Step ${n} of ${STEPS.length}</span><span>${s.part}</span></div><div class="bar"><i style="width:${pct}%"></i></div></div>
        <p style="font-weight:600;color:var(--sky-deep);margin-bottom:8px;font-size:14px">${firstScreen ? 'Welcome to Customly' : esc(s.part)}</p>
        <h1>${n === 1 ? 'Get your texting number approved' : s.t}</h1>
        <p class="lead">${s.d}${firstScreen ? ' Your answers save as you go, so you can stop and come back anytime.' : ''}</p>
        ${stepBody(n)}
        <div class="ob-nav">
          ${n > 1 ? `<button type="button" class="btn ghost" id="back">Back</button>` : '<span></span>'}
          <span class="saved" id="saved" hidden>Saved</span>
          <button type="submit" class="btn" id="next">${n < STEPS.length ? 'Continue' : editing ? 'Save changes' : 'Submit'}</button>
        </div>
      </form>
    </div>`;
    const form = $('form.ob-card');
    form.addEventListener('input', onFieldInput);
    form.addEventListener('change', onFieldInput);
    form.addEventListener('submit', (e) => { e.preventDefault(); next(n); });
    $('#back') && $('#back').addEventListener('click', () => go('#/onboarding/' + (n - 1)));
    $$('[data-go]').forEach(b => b.addEventListener('click', () => go('#/onboarding/' + b.dataset.go)));
    $$('[data-svc]').forEach(b => b.addEventListener('click', () => {
      const list = (draft.services || '').split(',').map(x => x.trim()).filter(Boolean);
      const i = list.findIndex(x => x.toLowerCase() === b.dataset.svc.toLowerCase());
      i >= 0 ? list.splice(i, 1) : list.push(b.dataset.svc);
      draft.services = list.join(', '); $('#f_services').value = draft.services; b.classList.toggle('on', i < 0); save(n);
    }));
    const file = $('#f_ein_letter');
    if (file) file.addEventListener('change', () => {
      pendingFile = file.files[0] || null;
      const f = file.closest('.field'); f.classList.remove('bad');
      if (pendingFile && pendingFile.size > 8 * 1024 * 1024) { pendingFile = null; file.value = ''; toast('That file is over 8 MB. Try a smaller photo or PDF.'); }
    });
    window.scrollTo(0, 0);
  }
  function onFieldInput(e) {
    const el = e.target; if (!el.name) return;
    if (el.type === 'file') return;
    if (el.type === 'checkbox' && el.closest('.chips')) {
      draft[el.name] = $$(`input[name="${el.name}"]:checked`).map(x => x.value).join(', ');
      el.closest('.chip').classList.toggle('on', el.checked);
    } else if (el.type === 'checkbox') draft[el.name] = el.checked ? 'yes' : '';
    else if (el.type === 'radio') { if (el.checked) draft[el.name] = el.value; }
    else draft[el.name] = el.value;
    const f = el.closest('.field'); if (f) f.classList.remove('bad');
    if (el.name === 'ein_date') { const w = $('#einwarn'); if (w) w.innerHTML = einAgeWarning(); }
    if (RERENDER.includes(el.name) && e.type === 'change') {
      const n = currentStep(); const y = scrollY;
      Data.saveDraft(draft, n); renderOnboarding(n); window.scrollTo(0, y);
      const back = $(`[name="${el.name}"]`); back && back.focus({ preventScroll: true });
      return;
    }
    save(currentStep());
  }
  function currentStep() { const m = /onboarding\/(\d)/.exec(location.hash); return m ? +m[1] : 1; }
  function save(n) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { Data.saveDraft(draft, n); const s = $('#saved'); if (s) s.hidden = false; }, 250);
  }
  function validate() {
    let ok = true, firstBad = null;
    const mark = (f, bad, el) => { f.classList.toggle('bad', bad); if (bad) { ok = false; firstBad = firstBad || el; } };
    $$('[data-req]').forEach(el => {
      const v = String(el.value || '').trim(); let bad = !v;
      if (!bad && el.type === 'email') bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (!bad && el.type === 'tel') bad = v.replace(/\D/g, '').length < 10;
      if (!bad && el.dataset.check === 'ein') bad = v.replace(/\D/g, '').length !== 9;
      if (!bad && el.dataset.check === 'pobox') bad = /\bp\.?\s*o\.?\s*box\b|post office box/i.test(v);
      mark(el.closest('.field'), bad, el);
    });
    $$('[data-reqradio]').forEach(f => mark(f, !f.querySelector('input:checked'), f.querySelector('input')));
    $$('[data-reqcheck]').forEach(f => mark(f, !f.querySelector('input').checked, f.querySelector('input')));
    $$('[data-reqfile]').forEach(f => mark(f, !pendingFile, f.querySelector('input')));
    if (firstBad) { firstBad.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => firstBad.focus({ preventScroll: true }), 300); }
    return ok;
  }
  function derive() {
    // Fill the everyday fields the portal uses from the registration answers
    if (draft.ein) { const d = draft.ein.replace(/\D/g, ''); if (d.length === 9) draft.ein = d.slice(0, 2) + '-' + d.slice(2); }
    if (draft.no_ein === 'yes') draft.business_type = 'Sole proprietor';
    draft.business_name = (draft.dba || draft.legal_name || '').trim();
    draft.owner_name = draft.contact_name || draft.owner_name || '';
    draft.phone = draft.contact_phone || draft.phone || '';
    draft.email = draft.contact_email || draft.email || '';
  }
  async function next(n) {
    if (!validate()) return;
    clearTimeout(saveTimer); derive();
    const btn = $('#next');
    if (n === 1 && pendingFile) {
      btn.disabled = true; btn.textContent = 'Uploading...';
      const ok = await postForm('ein_letter', { legal_name: draft.legal_name, business_name: draft.business_name }, pendingFile);
      draft.ein_letter_name = pendingFile.name; draft.ein_letter_sent = ok ? 'yes' : '';
      if (ok) pendingFile = null;
    }
    if (n === 3) {
      btn.disabled = true; btn.textContent = 'Sending to Pat...';
      const data = { business_name: draft.business_name }; REG_FIELDS.forEach(k => data[k] = draft[k] || '');
      const ok = await postForm('texting_registration', data, pendingFile);
      if (ok) { draft.registration_sent_at = Date.now(); pendingFile = null; toast('Sent to Pat. We\'ll start your registration today.'); }
    }
    Data.saveDraft(draft, Math.min(n + 1, STEPS.length));
    if (n < STEPS.length) return go('#/onboarding/' + (n + 1));
    btn.disabled = true; btn.textContent = 'Sending...';
    const wasSubmitted = Data.submitted();
    const ok = await sendToCustomly(draft);
    Data.markSubmitted(ok);
    if (wasSubmitted) { toast('Changes saved'); go('#/home'); } else go('#/welcome');
  }
  async function postForm(name, data, file) {
    const fd = new FormData();
    fd.append('form-name', name); fd.append('client_id', Data.clientId);
    Object.keys(data).forEach(k => fd.append(k, data[k] == null ? '' : data[k]));
    if (file) fd.append('ein_letter', file, file.name);
    try { const r = await fetch('/', { method: 'POST', body: fd }); return r.ok; } catch (e) { return false; }
  }
  async function sendToCustomly(p) {
    const data = { business_name: p.business_name };
    REG_FIELDS.concat(WORK_FIELDS).forEach(k => data[k] = p[k] || '');
    return postForm('onboarding', data, null);
  }

  function renderWelcome() {
    const p = Data.profile() || {};
    app.innerHTML = `<div class="ob"><div class="ob-top">${brand('Client portal')}</div>
      <div class="ob-card welcome">
        <div class="check-big">${I.check}</div>
        <h1>You're all set, ${esc(firstName(p.owner_name))}.</h1>
        <p class="lead" style="margin:8px 0 0">We're getting your agent ready.</p>
        <div class="steps-next">
          <div><b>1</b><p><strong>We submit your texting registration</strong><br><span class="muted">Pat checks your details and sends them to the carriers today.</span></p></div>
          <div><b>2</b><p><strong>Carriers approve your number</strong><br><span class="muted">Usually 1 to 2 weeks. You can watch every stage in your portal.</span></p></div>
          <div><b>3</b><p><strong>We go live together</strong><br><span class="muted">On a quick launch call we test your agent and turn it on.</span></p></div>
        </div>
        <a class="btn" href="#/home" style="width:100%">Open your portal</a>
        ${isStandalone() ? '' : `<div data-install-wrap style="margin-top:12px">${installBtn('ghost').replace('class="btn ghost"', 'class="btn ghost" style="width:100%"')}</div>`}
        <p class="muted" style="font-size:14px;margin-top:16px">Your portal is ready to explore now. Until you're live, it shows sample data built from your answers.</p>
      </div></div>`;
    wireInstall(app);
    window.scrollTo(0, 0);
  }

  /* =================================================================
     PORTAL
     ================================================================= */
  const NAV = [['home', 'Home', I.home], ['conversations', 'Conversations', I.chat], ['leads', 'Leads', I.leads], ['jobs', 'Jobs', I.jobs], ['try', 'Try it', I.try]];
  const TITLES = { home: 'Home', conversations: 'Conversations', leads: 'Leads', jobs: 'Jobs', try: 'Text your agent' };
  let period = 'month';
  let leadFilter = 'All';

  async function renderPortal(page, arg) {
    const p = Data.profile();
    const leads = await Data.leads();
    const newCount = leads.filter(l => l.status === 'New').length;
    const statusPill = Data.config.live && !Data.isDemo ? '<span class="pill live">Live</span>' : '<span class="pill" title="Everything here is sample data built from your answers until your agent goes live.">Preview: sample data</span>';
    app.innerHTML = `<div class="shell">
      <aside class="side">${brand()}
        <nav class="nav">${NAV.map(([k, t, ic]) => `<a href="#/${k}" class="${page === k ? 'on' : ''}">${ic}${t}${k === 'leads' && newCount ? `<span class="badge">${newCount}</span>` : ''}</a>`).join('')}</nav>
        <div class="side-foot"><div class="biz">${esc(p.business_name)}</div><button class="link" data-info style="font-size:14px">Your info</button></div>
      </aside>
      <div class="main">
        <header class="top">${brand()}<h1>${TITLES[page]}</h1><div style="display:flex;gap:12px;align-items:center">${statusPill}<button class="btn ghost small" data-info aria-label="Your info" style="width:40px;padding:0">${I.user}</button></div></header>
        <main class="content"><h1 class="page-title">${TITLES[page]}</h1><div id="page"></div></main>
      </div>
      <nav class="bottom">${NAV.map(([k, t, ic]) => `<a href="#/${k}" class="${page === k ? 'on' : ''}">${ic}${t === 'Conversations' ? 'Chats' : t}</a>`).join('')}</nav>
    </div>`;
    $$('[data-info]').forEach(b => b.addEventListener('click', openInfo));
    const top = $('.top'); const onScroll = () => top && top.classList.toggle('scrolled', scrollY > 4);
    window.onscroll = onScroll;
    const el = $('#page');
    ({ home: pageHome, conversations: pageConvos, leads: pageLeads, jobs: pageJobs, try: pageTry })[page](el, leads, p, arg);
  }

  /* ---------- Home ---------- */
  function pageHome(el, leads, p) {
    const c = Data.config;
    const ORDER = ['received', 'submitted', 'brand', 'approved', 'live'];
    const attention = c.texting === 'attention';
    const at = c.live ? 4 : attention ? -1 : Math.max(0, ORDER.indexOf(c.texting));
    // With "attention", everything up to the stage you'd reached stays done; default to after "submitted"
    const reached = attention ? Math.max(1, ORDER.indexOf(c.lastTexting || 'submitted')) : at;
    const stages = [
      ['Info received', 'You finished the texting steps'],
      ['Submitted to carriers', 'Pat sends your registration'],
      ['Business approved', 'Usually 1 to 3 business days'],
      ['Texting approved', 'Usually 5 to 10 business days'],
      ['Live', 'Your agent is switched on']
    ];
    const tracker = stages.map(([t, sub], i) => {
      const done = i <= reached;
      const cls = done ? 'done' : (i === reached + 1 ? (attention ? 'attn' : 'doing') : '');
      return `<li class="${cls}"><span class="dot">${done ? I.check : cls === 'attn' ? '!' : ''}</span>${t}<small>${cls === 'attn' ? 'Needs attention' : sub}</small></li>`;
    }).join('');
    const extra = [
      [c.agentTrained ? 'done' : 'doing', 'Agent training', c.agentTrained ? 'Trained on your business' : 'In progress'],
      [c.launchCall ? 'done' : '', 'Launch call', c.launchCall ? esc(c.launchCall) : 'We\'ll set this together']
    ].map(([s, t, sub]) => `<li class="${s}"><span class="dot">${s === 'done' ? I.check : ''}</span>${t}<small>${sub}</small></li>`).join('');
    const setup = c.live ? '' : `<section class="card setup">
      <div><h2>Getting your texting number approved</h2><p class="muted">Phone carriers approve every business that texts customers. This usually takes 1 to 2 weeks. Until you're live, everything below is sample data built from your answers, so you can see exactly how it will work for ${esc(p.business_name)}.</p>
      ${attention ? `<div class="note" style="background:var(--red-soft);border-color:#FECACA;margin:16px 0 0"><span>⚠️</span><div><b>Needs attention.</b> ${esc(c.textingNote || 'Pat will reach out with what to fix.')}<br><span class="muted" style="font-size:13px">Each fix adds about 5 to 10 business days.</span></div></div>` : ''}
      <a class="btn small" href="#/try" style="margin-top:16px">Text your agent now</a></div>
      <div><ul class="checklist">${tracker}</ul>
      <ul class="checklist" style="margin-top:16px">${extra}</ul></div>
    </section>`;
    const reach = `<section class="card"><h2>How customers reach your agent</h2>
      <div class="list" style="margin-top:8px">
        <div class="item" style="cursor:default"><span class="avatar">${I.chat.replace('<svg', '<svg width="20" height="20"')}</span><span class="meta"><span class="name">Your texting number</span><span class="sub" style="white-space:normal">${c.number ? `<b style="color:var(--ink)">${esc(c.number)}</b>. ` : ''}Put it on Google, Facebook, your trucks and signs. It also texts back every missed call on your main line.</span></span><span class="right"><span class="tag ${c.number ? 'st-Won' : 'st-Booked'}">${c.number ? 'Ready' : 'After approval'}</span></span></div>
        <div class="item" style="cursor:default"><span class="avatar">${I.try.replace('<svg', '<svg width="20" height="20"')}</span><span class="meta"><span class="name">"Text us" box on your website</span><span class="sub" style="white-space:normal">Optional. Visitors leave their name and number, then the conversation keeps going by text.</span></span><span class="right"><span class="tag">Optional</span></span></div>
      </div><p class="muted" style="font-size:13px;margin-top:8px">Both turn on once your texting is approved.</p></section>`;
    let dismissed = false; try { dismissed = localStorage.getItem('customly_install_dismissed') === '1'; } catch (e) {}
    const installCard = isStandalone() || dismissed ? '' : `<section class="card install-card" data-install-wrap>
      <img src="icon-192.png" alt="" width="48" height="48"><div style="flex:1;min-width:0"><h2 style="font-size:16px;margin:0">Put Customly on your home screen</h2><p class="muted" style="font-size:14px">Check your leads in one tap, like an app.</p></div>
      ${installBtn('small')}<button class="link" data-dismiss style="color:var(--muted);font-weight:500;font-size:14px">Not now</button></section>`;
    el.innerHTML = `<div class="stack">${installCard}${setup}
      <div class="card-head" style="margin:8px 0 -8px"><div><h2 style="font-size:20px">What your agent did</h2><p class="muted" style="font-size:14px">Every number here is counted from your leads and texts.</p></div>
        <div class="seg" role="tablist">${[['week', 'This week'], ['month', 'This month'], ['all', 'All time']].map(([k, t]) => `<button data-p="${k}" class="${period === k ? 'on' : ''}">${t}</button>`).join('')}</div></div>
      <div id="statwrap"></div>
      ${c.live ? '' : reach}
      <div class="two-col">
        <section class="card"><div class="card-head"><div><h2>Recent conversations</h2><p class="muted" style="font-size:14px">Your agent's latest texts</p></div><a class="link" href="#/conversations">See all</a></div>
          <div class="list">${leads.slice(0, 5).map(leadRow).join('')}</div></section>
        <section class="card"><div class="card-head"><div><h2>Upcoming estimates</h2><p class="muted" style="font-size:14px">Booked by your agent</p></div><a class="link" href="#/jobs">See all</a></div>
          ${upcomingList(leads, 4)}</section>
      </div></div>`;
    wireInstall(el);
    const dm = $('[data-dismiss]', el); if (dm) dm.addEventListener('click', () => { try { localStorage.setItem('customly_install_dismissed', '1'); } catch (e) {} dm.closest('.card').remove(); });
    $$('[data-p]').forEach(b => b.addEventListener('click', () => { period = b.dataset.p; $$('[data-p]').forEach(x => x.classList.toggle('on', x === b)); drawStats(leads); }));
    drawStats(leads);
  }
  function drawStats(leads) {
    const s = Data.stats(leads, period);
    const lbl = { week: 'this week', month: 'this month', all: 'all time' }[period];
    const max = Math.max(1, ...s.byDay);
    $('#statwrap').innerHTML = `<div class="stack">
      <div class="stats">
        <div class="stat hero"><div class="k">Revenue from jobs won</div><div class="v">${Data.money(s.revenue)}</div><div class="s">${s.jobsWon} jobs won ${lbl}</div></div>
        <div class="stat blue"><div class="k">Leads caught</div><div class="v">${s.leads}</div><div class="s">${s.missedCalls} from missed calls</div></div>
        <div class="stat"><div class="k">Estimates booked</div><div class="v">${s.estimates}</div><div class="s">Booked by your agent</div></div>
        <div class="stat"><div class="k">Hours saved</div><div class="v">${s.hoursSaved}</div><div class="s">Texts you didn't have to send</div></div>
        <div class="stat"><div class="k">Conversations handled</div><div class="v">${s.conversations}</div><div class="s">Answered in seconds</div></div>
        <div class="stat"><div class="k">After hours leads answered</div><div class="v">${s.afterHours}</div><div class="s">While you were off the clock</div></div>
        <div class="stat"><div class="k">Review requests sent</div><div class="v">${s.reviews}</div><div class="s">After each finished job</div></div>
        <div class="stat"><div class="k">Past quotes brought back</div><div class="v">${s.reengaged}</div><div class="s">Followed up by your agent</div></div>
      </div>
      <section class="card"><div class="card-head"><div><h2>Leads per day</h2><p class="muted" style="font-size:14px">${lbl[0].toUpperCase() + lbl.slice(1)}</p></div></div>
        <div class="chart">${s.byDay.map((v, i) => `<i class="${i === s.byDay.length - 1 ? 'hi' : ''}" style="height:${(v / max) * 100}%" title="${v} leads"></i>`).join('')}</div>
        <div class="chart-x"><span>${s.byDay.length} days ago</span><span>Today</span></div></section></div>`;
  }
  function leadRow(l) {
    const last = l.messages[l.messages.length - 1];
    const prev = last ? (last.from === 'agent' ? 'Agent: ' : last.from === 'owner' ? 'You: ' : '') + last.text : '';
    return `<a class="item" href="#/conversations/${l.id}"><span class="avatar">${initials(l.name)}</span>
      <span class="meta"><span class="name">${esc(l.name)}${l.test ? ' <span class="tag st-New">Your test</span>' : ''}</span><span class="sub">${esc(prev)}</span></span>
      <span class="right"><span class="tag st-${l.status}">${l.status}</span><span>${when(last ? last.at : l.createdAt)}</span></span></a>`;
  }
  function upcomingList(leads, limit) {
    const now = Date.now();
    const up = leads.filter(l => l.estimateAt && l.estimateAt > now).sort((a, b) => a.estimateAt - b.estimateAt).slice(0, limit || 99);
    if (!up.length) return '<div class="empty">No estimates coming up yet.</div>';
    return up.map(l => jobRow(l, l.estimateAt, 'Estimate')).join('');
  }
  function jobRow(l, ts, kind, amount) {
    const d = new Date(ts);
    return `<a class="job" href="#/conversations/${l.id}" style="text-decoration:none;color:inherit">
      <div class="cal"><b>${d.toLocaleDateString('en-US', { month: 'short' })}</b><span>${d.getDate()}</span></div>
      <div style="flex:1;min-width:0"><div style="font-weight:600">${esc(l.name)} <span class="muted" style="font-weight:400">· ${esc(l.service)}</span></div>
      <div class="muted" style="font-size:14px">${kind} ${esc(Data.slotLabel(ts).replace(/^\w+ at /, 'at '))} · ${esc(l.address || '')}</div></div>
      <div style="font-weight:700;font-variant-numeric:tabular-nums">${amount != null ? Data.money(amount) : ''}</div></a>`;
  }

  /* ---------- Conversations ---------- */
  function pageConvos(el, leads, p, id) {
    const sel = leads.find(l => l.id === id) || (window.innerWidth > 860 ? leads[0] : null);
    el.innerHTML = `<div class="convo ${id ? 'open' : ''}">
      <div class="convo-list">${leads.map(l => leadRow(l).replace('class="item"', `class="item ${sel && l.id === sel.id ? 'on' : ''}"`)).join('')}</div>
      <div class="thread" id="thread"></div></div>`;
    if (sel) drawThread(sel, p);
  }
  function drawThread(l, p) {
    const t = $('#thread');
    let lastDay = '';
    const bubbles = l.messages.map(m => {
      const dl = dayLabel(m.at); const sep = dl !== lastDay ? `<div class="day-sep">${dl}</div>` : ''; lastDay = dl;
      const who = m.from === 'agent' ? 'Your agent' : m.from === 'owner' ? 'You' : m.from === 'customer' ? (l.test ? 'Test customer' : esc(firstName(l.name))) : '';
      return sep + `<div class="msg ${m.from}">${who ? `<span class="who">${who} · ${new Date(m.at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>` : ''}<div class="b">${esc(m.text)}</div></div>`;
    }).join('');
    t.innerHTML = `<div class="thread-head"><button class="back" aria-label="Back" onclick="location.hash='#/conversations'">${I.back}</button>
        <span class="avatar">${initials(l.name)}</span><div style="flex:1;min-width:0"><div style="font-weight:600">${esc(l.name)} <span class="tag st-${l.status}">${l.status}</span></div>
        <div class="muted" style="font-size:14px">${esc(l.service)} · ${esc(l.source)} · ${esc(l.phone)}</div></div>
        <div class="muted" style="font-size:14px;text-align:right">Job value<br><b style="color:var(--ink)">${Data.money(l.wonValue || l.value)}</b></div></div>
      ${l.agentPaused ? `<div class="paused"><span>Agent paused. You're handling this one.</span><button class="btn ghost small" id="resume">Turn agent back on</button></div>` : ''}
      <div class="thread-body" id="tb">${bubbles}</div>
      <form class="composer" id="reply"><input placeholder="Reply as ${esc(firstName(p.owner_name) || 'you')}..." aria-label="Reply"><button class="btn" aria-label="Send">${I.send}</button></form>
      <div class="muted" style="font-size:12px;padding:0 16px 12px;background:var(--white)">Replying here pauses your agent on this conversation.</div>`;
    const tb = $('#tb'); tb.scrollTop = tb.scrollHeight;
    $('#reply').addEventListener('submit', async (e) => {
      e.preventDefault(); const inp = e.target.querySelector('input'); const v = inp.value.trim(); if (!v) return;
      await Data.reply(l.id, v); toast('Sent. Your agent is paused on this conversation.');
      const leads = await Data.leads(); drawThread(leads.find(x => x.id === l.id), p);
    });
    const r = $('#resume'); if (r) r.addEventListener('click', async () => { Data.setPaused(l.id, false); toast('Agent is back on'); const leads = await Data.leads(); drawThread(leads.find(x => x.id === l.id), p); });
  }

  /* ---------- Leads ---------- */
  function pageLeads(el, leads) {
    const sts = ['All', 'New', 'Contacted', 'Quoted', 'Booked', 'Won', 'Lost'];
    const count = (s) => s === 'All' ? leads.length : leads.filter(l => l.status === s).length;
    const shown = leadFilter === 'All' ? leads : leads.filter(l => l.status === leadFilter);
    el.innerHTML = `<div class="filters">${sts.map(s => `<button class="chip ${leadFilter === s ? 'on' : ''}" data-s="${s}">${s} ${count(s)}</button>`).join('')}</div>
      <section class="card"><div class="list">${shown.length ? shown.map(l => `<a class="item" href="#/conversations/${l.id}"><span class="avatar">${initials(l.name)}</span>
        <span class="meta"><span class="name">${esc(l.name)}${l.test ? ' <span class="tag st-New">Your test</span>' : ''}</span><span class="sub">${esc(l.service)} · ${esc(l.source)}</span></span>
        <span class="right"><span class="tag st-${l.status}">${l.status}</span><span>${when(l.createdAt)} · ${Data.money(l.wonValue || l.value)}</span></span></a>`).join('') : '<div class="empty">No leads here yet.</div>'}</div></section>`;
    $$('[data-s]').forEach(b => b.addEventListener('click', () => { leadFilter = b.dataset.s; pageLeads(el, leads); }));
  }

  /* ---------- Jobs ---------- */
  function pageJobs(el, leads) {
    const now = Date.now();
    const booked = leads.filter(l => l.status === 'Booked' && l.jobAt).sort((a, b) => a.jobAt - b.jobAt);
    const won = leads.filter(l => l.status === 'Won').sort((a, b) => b.jobAt - a.jobAt);
    const total = won.reduce((n, l) => n + l.wonValue, 0);
    el.innerHTML = `<div class="stack">
      <section class="card"><div class="card-head"><div><h2>Upcoming estimates</h2><p class="muted" style="font-size:14px">Booked by your agent</p></div></div>${upcomingList(leads)}</section>
      <section class="card"><div class="card-head"><div><h2>Booked jobs</h2><p class="muted" style="font-size:14px">On the schedule</p></div><b>${Data.money(booked.reduce((n, l) => n + l.value, 0))}</b></div>
        ${booked.length ? booked.map(l => jobRow(l, l.jobAt, l.jobAt > now ? 'Job' : 'Job was', l.value)).join('') : '<div class="empty">No jobs booked yet.</div>'}</section>
      <section class="card"><div class="card-head"><div><h2>Jobs won</h2><p class="muted" style="font-size:14px">Finished and counted toward revenue</p></div><b>${Data.money(total)}</b></div>
        ${won.length ? won.map(l => jobRow(l, l.jobAt, 'Done', l.wonValue)).join('') : '<div class="empty">No jobs won yet.</div>'}</section></div>`;
  }

  /* ---------- Try it: text your own agent ---------- */
  function pageTry(el, leads, p) {
    let lead = leads.find(l => l.id === 'TEST');
    const svc = Data.services(p);
    const area = (p.service_area || '').split(',')[0].trim() || 'your area';
    const quick = [`How much for ${svc[0].toLowerCase()}?`, 'Are you open Saturday?', `Do you come out to ${area}?`, '1420 Oak St', 'The first one works'];
    el.innerHTML = `<div class="try">
      <div class="phone"><div class="phone-screen">
        <div class="phone-head"><span class="avatar">${initials(p.business_name)}</span><b>${esc(p.business_name)}</b></div>
        <div class="thread-body" id="pb"></div>
        <div class="quick">${quick.map(q => `<button type="button">${esc(q)}</button>`).join('')}</div>
        <form class="composer" id="pc"><input placeholder="Text as a customer..." aria-label="Text your agent"><button class="btn" aria-label="Send">${I.send}</button></form>
      </div></div>
      <div class="try-side">
        <section class="card"><h2>Pretend you're a customer</h2><p class="muted" style="margin-top:8px">Text your agent like a homeowner would. Ask for a price, your hours or a time to come out. It answers with your business details and books the estimate.</p>
          <p class="muted" style="margin-top:12px;font-size:14px">This preview uses sample replies. Once you're live, your trained agent answers real customers from your own number.</p></section>
        <section class="card"><h2>Watch the lead come in</h2><p class="muted" style="font-size:14px;margin-top:4px">This is what lands in your Leads.</p>
          <div id="ll" style="margin-top:16px"></div></section>
        <button class="link" id="resetchat" style="margin-top:16px">Start a new test chat</button>
      </div></div>`;
    const pb = $('#pb');
    const draw = () => {
      const msgs = lead ? lead.messages.filter(m => m.from !== 'system') : [];
      pb.innerHTML = msgs.length ? msgs.map(m => `<div class="msg ${m.from}"><div class="b">${esc(m.text)}</div></div>`).join('') :
        `<div class="msg system"><div class="b">Send a text to start. Try one of the suggestions below.</div></div>`;
      pb.scrollTop = pb.scrollHeight;
      const stage = !lead ? -1 : lead.estimateAt ? 2 : lead.messages.some(m => m.from === 'agent') ? 1 : 0;
      $('#ll').innerHTML = lead ? `<div class="live-lead"><span class="avatar">YT</span><div style="flex:1"><b>Your test</b><div class="muted" style="font-size:14px">${esc(lead.service)} · Inbound text</div></div><span class="tag st-${lead.status}">${lead.status}</span></div>
        <div class="pipeline">${['New lead', 'Agent replied', 'Estimate booked'].map((t, i) => `<span class="${i <= stage ? 'on' : ''}">${t}</span>`).join('')}</div>
        ${lead.estimateAt ? `<p style="margin-top:16px;font-size:14px">Estimate on <b>${esc(Data.slotLabel(lead.estimateAt))}</b>. <a href="#/conversations/TEST">Open in Conversations</a></p>` : ''}`
        : '<div class="empty" style="padding:16px">Nothing yet. Send a text.</div>';
    };
    draw();
    let busy = false;
    async function send(text) {
      if (busy || !text.trim()) return; busy = true;
      if (!lead) lead = { id: 'TEST', test: true, name: 'Your test', phone: '555 0100', service: svc[0], source: 'Inbound text', status: 'New', createdAt: Date.now(), value: parseFloat(String(p.avg_job_value).replace(/[^0-9.]/g, '')) || 1500, address: '', afterHours: false, reviewSent: false, reengaged: false, estimateAt: null, jobAt: null, wonValue: 0, messages: [], st: { stage: 'start' } };
      lead.messages.push({ from: 'customer', text: text.trim(), at: Date.now() });
      Data.upsertTestLead(lead); draw();
      const typing = document.createElement('div'); typing.className = 'typing'; typing.innerHTML = '<i></i><i></i><i></i>';
      pb.appendChild(typing); pb.scrollTop = pb.scrollHeight;
      await new Promise(r => setTimeout(r, matchMedia('(prefers-reduced-motion: reduce)').matches ? 200 : 900 + Math.random() * 600));
      const reply = agentReply(text, lead, p);
      lead.messages.push({ from: 'agent', text: reply, at: Date.now() });
      if (lead.status === 'New') lead.status = 'Contacted';
      if (lead.st.justBooked) {
        lead.st.justBooked = false;
        const how = { text: 'by text', email: 'by email', both: 'by text and email' }[p.handoff] || 'by text';
        lead.messages.push({ from: 'system', text: `Summary sent to you ${how}: new estimate for ${lead.service.toLowerCase()} on ${Data.slotLabel(lead.estimateAt)}.`, at: Date.now() });
        toast('Estimate booked. It\'s in your Leads and Jobs.');
      }
      Data.upsertTestLead(lead); busy = false; draw();
    }
    $('#pc').addEventListener('submit', (e) => { e.preventDefault(); const i = e.target.querySelector('input'); const v = i.value; i.value = ''; send(v); });
    $$('.quick button').forEach(b => b.addEventListener('click', () => send(b.textContent)));
    $('#resetchat').addEventListener('click', () => { lead = null; Data.upsertTestLead({ id: 'TEST', _drop: true }); dropTest(); draw(); });
  }
  function dropTest() {
    // remove the test lead from storage
    try {
      const k = Object.keys(localStorage).find(x => x === 'customly_portal_' + Data.clientId);
      const s = JSON.parse(localStorage.getItem(k)); s.extraLeads = (s.extraLeads || []).filter(l => l.id !== 'TEST');
      if (s.edits) delete s.edits.TEST; localStorage.setItem(k, JSON.stringify(s));
    } catch (e) {}
  }

  function agentReply(text, lead, p) {
    const t = text.toLowerCase();
    const st = lead.st || (lead.st = { stage: 'start' });
    const svc = Data.services(p);
    const owner = firstName(p.owner_name) || 'The owner';
    const area = p.service_area || 'your area';
    const agent = p.agent_name || 'Riley';
    const tone = p.tone || 'friendly';
    const first = st.greeted ? '' : (tone === 'professional' ? `Hi, this is ${agent} with ${p.business_name}. ` : tone === 'casual' ? `Hey, ${agent} here with ${p.business_name}. ` : `Hey there! This is ${agent} with ${p.business_name}. `);
    st.greeted = true;
    const mention = (p.always_mention || '').trim();
    const mentionLine = mention ? ' ' + (/[.!?]$/.test(mention) ? mention : mention + '.') : '';
    const found = svc.find(s => { const w = s.toLowerCase(); return t.includes(w) || t.includes(w.replace(/s$/, '')) || w.split(' ').some(x => x.length > 4 && t.includes(x.replace(/s$/, ''))); });
    if (found) lead.service = found;
    const ask = ' What\'s the address for the job?';

    if (st.stage === 'time') {
      const pick2 = /\b2\b|second|other|later|2nd/.test(t) || (st.d2 && t.includes(st.d2.toLowerCase()));
      const yes = pick2 || /\b1\b|first|1st|works|yes|yeah|yep|sure|ok|okay|perfect|great|that|sounds good|book/.test(t) || (st.d1 && t.includes(st.d1.toLowerCase()));
      if (yes) {
        lead.estimateAt = pick2 ? st.s2 : st.s1; st.stage = 'booked'; st.justBooked = true;
        return `You're booked for ${Data.slotLabel(lead.estimateAt)}. ${owner} will meet you at ${st.address}.${mentionLine} You'll get a reminder the day before.`;
      }
    }
    if (st.stage === 'address' && /\d/.test(t) && /[a-z]/.test(t)) {
      st.address = text.trim().replace(/[.!]+$/, ''); lead.address = st.address;
      const mk = (off) => { const d = new Date(Date.now() + off * 86400000); while (d.getDay() === 0 || (d.getDay() === 6 && p.saturday === 'closed')) d.setDate(d.getDate() + 1); d.setHours(off % 2 ? 10 : 14, 0, 0, 0); return d.getTime(); };
      st.s1 = mk(1); st.s2 = mk(2); if (new Date(st.s2).toDateString() === new Date(st.s1).toDateString()) st.s2 += 86400000;
      st.d1 = Data.slotLabel(st.s1).split(' at ')[0]; st.d2 = Data.slotLabel(st.s2).split(' at ')[0];
      st.stage = 'time';
      return `Got it. ${owner} does free estimates. Would ${Data.slotLabel(st.s1)} or ${Data.slotLabel(st.s2)} work for you?`;
    }
    if (/price|cost|how much|quote|estimate|charge|rate|\$/.test(t)) {
      if (st.stage === 'booked') return `${owner} will give you an exact price at your estimate. Anything else I can help with?`;
      if (st.stage === 'time') return `${owner} gives an exact price at the free estimate. Which works better, ${Data.slotLabel(st.s1)} or ${Data.slotLabel(st.s2)}?`;
      st.stage = 'address';
      return `${first}Every job is a little different, so ${owner} gives free estimates on site.${ask}`;
    }
    if (/hour|open|close|saturday|sunday|weekend|tonight|today|tomorrow/.test(t) && st.stage !== 'time') {
      const tail = st.stage === 'booked' ? ' Anything else I can help with?' : ' I can book your free estimate right now.' + ask;
      if (st.stage !== 'booked') st.stage = 'address';
      return `${first}We're open ${Data.hoursText(p)}. And I answer texts anytime.${tail}`;
    }
    if (/where|area|come out|travel|serve|near|far/.test(t) && st.stage !== 'time') {
      if (st.stage !== 'booked') st.stage = 'address';
      return `${first}We cover ${area}.${st.stage === 'booked' ? ' Anything else I can help with?' : ask}`;
    }
    if (found && st.stage !== 'time' && st.stage !== 'booked') {
      st.stage = 'address';
      return `${first}Yes, we do ${found.toLowerCase()}! Happy to help.${ask}`;
    }
    if (/what (do|services|kind)|services|do you do|offer/.test(t)) {
      return `${first}We do ${svc.map(s => s.toLowerCase()).join(', ')}. Which one can we help with?`;
    }
    if (/^(hi|hey|hello|yo|good (morning|afternoon|evening))\b/.test(t) && st.stage === 'start') {
      return `${first}What can we help you with today?`;
    }
    if (/thank|thanks|appreciate/.test(t)) return `Anytime! ${st.stage === 'booked' ? 'See you soon.' : 'Just text me whenever you\'re ready.'}`;
    if (st.stage === 'booked') return `You're all set! ${owner} will see you then. Anything else I can help with?`;
    if (st.stage === 'time') return `Which works better for you, ${Data.slotLabel(st.s1)} or ${Data.slotLabel(st.s2)}?`;
    if (st.stage === 'address') return `No problem. What's the address for the job so I can get you on the schedule?`;
    return `${first}Happy to help! Are you looking for ${svc[0].toLowerCase()} or something else?`;
  }

  /* ---------- Your info drawer ---------- */
  function openInfo() {
    const p = Data.profile();
    const rows = [['Business', p.business_name], ['Name', p.owner_name], ['Phone', p.phone], ['Email', p.email], ['Website', p.website], ['Services', p.services], ['Area', p.service_area], ['Hours', Data.hoursText(p)], ['Average job', p.avg_job_value], ['Agent name', p.agent_name || 'Riley'], ['Sounds', p.tone], ['Always mention', p.always_mention], ['Never say', p.never_say], ['Texting from', p.number_choice === 'new' ? 'A new local number' : 'Your business number'], ['Registration', p.registration_sent_at ? 'Sent to Pat' : 'Not sent yet']];
    const wrap = document.createElement('div');
    wrap.innerHTML = `<div class="drawer-bg"></div><aside class="drawer" role="dialog" aria-label="Your info">
      <div class="card-head"><h2 style="font-size:22px">Your info</h2><button class="btn ghost small" data-x>Close</button></div>
      <p class="muted" style="margin-bottom:16px;font-size:14px">This is what your agent knows about your business.</p>
      <div class="review"><section><dl>${rows.filter(r => r[1]).map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl></section></div>
      <a class="btn" href="#/onboarding/1" data-x style="width:100%;margin-top:24px">Edit my answers</a>
      ${isStandalone() ? '' : `<div style="margin-top:12px">${installBtn('ghost').replace('class="btn ghost"', 'class="btn ghost" style="width:100%"')}</div>`}
      <button class="link" id="wipe" style="margin-top:24px;color:var(--muted);font-weight:500;font-size:14px">Clear this device</button>
    </aside>`;
    document.body.appendChild(wrap);
    wireInstall(wrap);
    const close = () => wrap.remove();
    wrap.querySelector('.drawer-bg').addEventListener('click', close);
    $$('[data-x]', wrap).forEach(b => b.addEventListener('click', close));
    const w = $('#wipe', wrap); let armed = false;
    w.addEventListener('click', () => {
      if (!armed) { armed = true; w.textContent = 'Tap again to clear your answers from this device'; w.style.color = 'var(--red)'; return; }
      Data.reset(); close(); go('#/onboarding/1');
    });
    document.addEventListener('keydown', function k(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', k); } });
  }

  /* =================================================================
     ROUTER
     ================================================================= */
  function go(h) { if (location.hash === h) route(); else location.hash = h; }
  function route() {
    window.onscroll = null;
    const h = location.hash.replace(/^#\/?/, '');
    const [page, arg] = h.split('/');
    if (!Data.submitted()) {
      if (page !== 'onboarding') return go('#/onboarding/' + Math.min(Data.step(), STEPS.length));
      return renderOnboarding(Math.min(Math.max(+arg || 1, 1), STEPS.length));
    }
    if (page === 'onboarding') return renderOnboarding(Math.min(Math.max(+arg || 1, 1), STEPS.length));
    if (page === 'welcome') return renderWelcome();
    if (!TITLES[page]) return go('#/home');
    renderPortal(page, arg).then(() => { if (!arg) window.scrollTo(0, 0); });
  }
  window.addEventListener('hashchange', route);
  route();

  // If the first send failed (bad signal), try again quietly
  const p0 = Data.profile();
  if (p0 && p0.submitted_at && !p0.sent) sendToCustomly(p0).then(ok => ok && Data.markSent());
})();
