/* =====================================================================
   Customly portal: data layer
   ---------------------------------------------------------------------
   Every screen reads through Data. Nothing else touches storage or APIs.

   DEMO MODE (today): sample leads and texts are generated from the
   client's own onboarding answers so the portal looks like their business.

   GOING LIVE: set the client's entry in CLIENTS (or the default) to
   mode: "live" and point apiBase at the backend. The live adapter expects
   the same lead shape the demo produces, so no screen needs to change.
   Stats are always computed from the leads themselves, never typed in.
   ===================================================================== */

window.CUSTOMLY = {
  // Used when a link has no ?c=client-id
  default: {
    mode: 'demo',          // 'demo' or 'live'
    apiBase: '',           // e.g. 'https://api.customlyai.com' once live
    // Texting approval tracker the client sees on Home. Move it along as carriers respond:
    //   received  -> client finished the texting steps
    //   submitted -> you submitted to carriers
    //   brand     -> business (brand) approved
    //   approved  -> texting campaign approved
    //   attention -> something needs fixing; put the message in textingNote
    texting: 'received',
    textingNote: '',
    lastTexting: 'submitted', // with 'attention': the last stage that was done       // e.g. "Your legal name doesn't match your EIN letter. Please upload the correct document."
    number: '',            // their texting number once you have it, e.g. '706 555 0199'
    agentTrained: false,
    launchCall: '',        // e.g. 'Thu, Nov 13 at 10 AM'
    live: false            // true flips the tracker to Live
  },
  // One entry per client link: customlyportal.netlify.app/?c=smithconcrete
  // Only letters, numbers and underscores in the id.
  clients: {
    // smithconcrete: { texting: 'submitted', launchCall: 'Thu, Nov 13 at 10 AM' },
  }
};

(function () {
  const params = new URLSearchParams(location.search);
  // Remember which client link was opened, so the home screen app (which opens without ?c=) finds the same portal
  let remembered = '';
  try { remembered = localStorage.getItem('customly_last_client') || ''; } catch (e) {}
  const clientId = (params.get('c') || remembered || 'default').toLowerCase().replace(/[^a-z0-9_]/g, '');
  try { localStorage.setItem('customly_last_client', clientId); } catch (e) {}
  const cfg = Object.assign({}, window.CUSTOMLY.default, window.CUSTOMLY.clients[clientId] || {});
  const KEY = 'customly_portal_' + clientId;

  /* ---------- local storage (per client link, per device) ---------- */
  function readStore() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }
  function writeStore(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
  }

  /* ---------- seeded random so a business always sees the same sample ---------- */
  function hash(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    return h >>> 0;
  }
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const FIRST = ['Marcus', 'Jenna', 'Dale', 'Tasha', 'Chris', 'Brittany', 'Luis', 'Karen', 'Andre', 'Megan', 'Tony', 'Shauna', 'Greg', 'Alicia', 'Ray', 'Courtney', 'Darius', 'Holly', 'Victor', 'Paige', 'Wes', 'Monica', 'Terrell', 'Amber', 'Glenn', 'Nina', 'Curtis', 'Erin', 'Hector', 'Jill'];
  const LAST = ['B.', 'C.', 'D.', 'F.', 'G.', 'H.', 'J.', 'K.', 'L.', 'M.', 'P.', 'R.', 'S.', 'T.', 'W.'];
  const STREETS = ['Oak St', 'Pine Ridge Dr', 'Walnut Ln', 'Hillcrest Ave', 'Maple Ct', 'Cedar Way', 'Lakeview Rd', 'Magnolia Dr', 'Sycamore Ln', 'Willow Bend'];
  const DAY = 86400000;

  function hoursText(p) {
    const wk = (p.weekday_open || '7 AM') + ' to ' + (p.weekday_close || '5 PM');
    let s = 'Monday to Friday ' + wk;
    if (p.saturday === 'full') s += ', Saturday ' + wk;
    else if (p.saturday === 'half') s += ', Saturday ' + (p.weekday_open || '8 AM') + ' to 12 PM';
    if (p.sunday === 'open') s += ', Sunday by appointment';
    return s;
  }
  function to24(t) {
    const m = /^(\d+)\s*(AM|PM)$/.exec(t || ''); if (!m) return null;
    let h = +m[1] % 12; if (m[2] === 'PM') h += 12; return h;
  }
  function isAfterHours(d, p) {
    const open = to24(p.weekday_open) ?? 7, close = to24(p.weekday_close) ?? 17;
    const day = d.getDay(), h = d.getHours();
    if (day === 0) return p.sunday !== 'open';
    if (day === 6) {
      if (p.saturday === 'closed' || !p.saturday) return true;
      const c = p.saturday === 'half' ? 12 : close;
      return h < open || h >= c;
    }
    return h < open || h >= close;
  }
  function services(p) {
    const list = (p.services || '').split(',').map(s => s.trim()).filter(Boolean);
    return list.length ? list : ['Estimates'];
  }
  function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  function slotLabel(ts) {
    const d = new Date(ts);
    const day = d.toLocaleDateString('en-US', { weekday: 'long' });
    let h = d.getHours(); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
    return day + ' at ' + h + ' ' + ap;
  }
  function nextSlot(from, r, offsetDays) {
    const d = new Date(from + offsetDays * DAY);
    if (d.getDay() === 0) d.setDate(d.getDate() + 1);
    if (d.getDay() === 6) d.setDate(d.getDate() + 2);
    d.setHours([8, 9, 10, 11, 13, 14, 15][Math.floor(r() * 7)], 0, 0, 0);
    return d.getTime();
  }
  function sentence(s) { s = (s || '').trim(); if (!s) return ''; return /[.!?]$/.test(s) ? s : s + '.'; }

  function voice(p) {
    const t = p.tone || 'friendly';
    return {
      greet: (first) => t === 'professional' ? `Hi ${first}, thank you for contacting ${p.business_name}.`
        : t === 'casual' ? `Hey ${first}, ${p.business_name} here.`
        : `Hey ${first}! Thanks for reaching out to ${p.business_name}.`,
      great: t === 'professional' ? 'Thank you.' : t === 'casual' ? 'Sounds good.' : 'Awesome!',
    };
  }

  /* ---------- sample data built from the client's answers ---------- */
  function buildDemo(p) {
    const r = rng(hash((p.business_name || 'customly') + (p.services || '')));
    const svc = services(p);
    const area = (p.service_area || 'your area').split(',')[0].trim();
    const owner = (p.owner_name || 'The owner').split(' ')[0];
    const agent = p.agent_name || 'Riley';
    const avg = Math.max(150, parseFloat(String(p.avg_job_value || '').replace(/[^0-9.]/g, '')) || 1500);
    const v = voice(p);
    const mention = sentence(p.always_mention);
    const now = Date.now();
    const leads = [];
    const N = 30;

    for (let i = 0; i < N; i++) {
      const daysAgo = Math.pow(r(), 1.35) * 42;
      const created = new Date(now - daysAgo * DAY);
      created.setHours(6 + Math.floor(r() * 16), Math.floor(r() * 60));
      const t0 = Math.min(created.getTime(), now - 20 * 60000);
      const first = FIRST[Math.floor(r() * FIRST.length)];
      const name = first + ' ' + LAST[Math.floor(r() * LAST.length)];
      const service = svc[Math.floor(r() * svc.length)];
      const sl = service.toLowerCase();
      const roll = r();
      const source = roll < 0.34 ? 'Missed call text back' : roll < 0.64 ? 'Inbound text' : roll < 0.8 ? 'Inbound call' : 'Outbound follow up';
      let status;
      const s = r();
      if (daysAgo < 1.2) status = s < 0.5 ? 'New' : 'Contacted';
      else if (daysAgo < 4) status = s < 0.45 ? 'Contacted' : s < 0.75 ? 'Quoted' : 'Booked';
      else status = s < 0.12 ? 'Contacted' : s < 0.32 ? 'Quoted' : s < 0.5 ? 'Booked' : s < 0.8 ? 'Won' : 'Lost';
      const value = Math.round((avg * (0.55 + r() * 1.0)) / 25) * 25;
      const street = (100 + Math.floor(r() * 8900)) + ' ' + STREETS[Math.floor(r() * STREETS.length)];
      const lead = {
        id: 'L' + (1000 + i), name, phone: '555 01' + String(10 + i).padStart(2, '0'),
        service, source, status, createdAt: t0, value, address: street + ', ' + area,
        afterHours: isAfterHours(new Date(t0), p), reviewSent: false, reengaged: false,
        estimateAt: null, jobAt: null, wonValue: 0, agentPaused: false, messages: []
      };
      let t = t0;
      const say = (from, text, gap) => { t = Math.min(t + (gap || (1 + r() * 4)) * 60000, now - 60000); lead.messages.push({ from, text, at: t }); };

      // Opening
      if (source === 'Missed call text back') {
        say('system', 'Missed call. Agent texted back in 4 seconds.', 0.1);
        say('agent', `Hi, this is ${agent} with ${p.business_name}. Sorry we missed your call! What can we help you with?`, 0.1);
        say('customer', `Hi, I need a quote on ${sl}.`);
      } else if (source === 'Inbound call') {
        say('system', 'Call answered by your agent. 3 minute call.', 0.1);
        say('agent', `Hi ${first}, it's ${agent} with ${p.business_name}. Thanks for the call! Quick recap: you're looking for ${sl} at your place. Can you text me the address?`, 4);
      } else if (source === 'Outbound follow up') {
        lead.reengaged = status !== 'Contacted' && status !== 'New' && status !== 'Lost';
        say('agent', `Hi ${first}, it's ${agent} with ${p.business_name}. Just checking in on the ${sl} you asked about. Still want to get that done?`, 0.1);
        say('customer', r() < 0.5 ? 'Yes actually, still need it done.' : 'Hey! Yeah we do, just got busy.', 30 + r() * 300);
      } else {
        const openers = [`Hi, do you guys do ${sl}?`, `Looking for a quote on ${sl}`, `How soon could someone come out for ${sl}?`];
        say('customer', openers[Math.floor(r() * openers.length)], 0.1);
      }
      if (status === 'New') { if (source === 'Inbound text') say('agent', `${v.greet(first)} Yes, we do ${sl} all over ${area}. What's the address for the job?`, 0.1); leads.push(lead); continue; }

      if (source === 'Inbound text') say('agent', `${v.greet(first)} Yes, we do ${sl} all over ${area}. What's the address for the job?`, 0.1);
      else if (source !== 'Inbound call') say('agent', `${v.great} What's the address for the job?`, 0.1);
      say('customer', `It's ${street}`);

      const est = status === 'Contacted' ? nextSlot(now, r, 1 + Math.floor(r() * 4)) : nextSlot(t0, r, 1 + Math.floor(r() * 2));
      const alt = est + DAY + 2 * 3600000;
      if (status === 'Contacted' && r() < 0.4) {
        say('agent', `Got it. ${owner} does free estimates. Would ${slotLabel(est)} or ${slotLabel(alt)} work for you?`, 0.1);
        leads.push(lead); continue;
      }
      say('agent', `Got it. ${owner} does free estimates. Would ${slotLabel(est)} or ${slotLabel(alt)} work for you?`, 0.1);
      say('customer', `${slotLabel(est).split(' at ')[0]} works`);
      say('agent', `You're booked for ${slotLabel(est)}. ${owner} will meet you at ${street}. ${mention ? mention + ' ' : ''}You'll get a reminder the day before.`, 0.1);
      lead.estimateAt = est;
      if (status === 'Contacted') { leads.push(lead); continue; }

      t = Math.max(t, est + 3 * 3600000);
      say('agent', `Hi ${first}, ${owner} put together your quote for the ${sl}: ${money(value)}. Want to get it on the schedule?`, 0.1);
      if (status === 'Quoted') { if (r() < 0.5) say('customer', 'Thanks, let me look it over tonight.'); leads.push(lead); continue; }
      if (status === 'Lost') {
        say('customer', 'We decided to hold off for now. Thanks though.', 60 + r() * 600);
        say('agent', `No problem at all. We'll be here whenever you're ready.`, 0.1);
        leads.push(lead); continue;
      }
      say('customer', 'Looks good, let\'s do it.', 30 + r() * 400);
      const job = status === 'Booked' ? nextSlot(now, r, 2 + Math.floor(r() * 8)) : nextSlot(t, r, 2 + Math.floor(r() * 4));
      lead.jobAt = job;
      say('agent', `${v.great} You're on the schedule for ${slotLabel(job)}. ${owner} will text you the morning of.`, 0.1);
      if (r() < 0.35) say('owner', `Thanks ${first}, looking forward to it.`, 20);
      if (status === 'Booked') { leads.push(lead); continue; }

      lead.wonValue = value;
      t = Math.max(t, job + 6 * 3600000);
      if (r() < 0.85) {
        lead.reviewSent = true;
        say('agent', `Hi ${first}, thanks for choosing ${p.business_name}! If you're happy with the work, a quick Google review would mean a lot to us.`, 0.1);
        if (r() < 0.6) say('customer', 'Done! Looks great, thank you.');
      }
      leads.push(lead);
    }
    return leads;
  }

  /* ---------- stats, always derived from the leads ---------- */
  function stats(leads, period) {
    const now = Date.now();
    const since = period === 'week' ? now - 7 * DAY : period === 'month' ? now - 30 * DAY : 0;
    const L = leads.filter(l => l.createdAt >= since);
    const agentMsgs = L.reduce((n, l) => n + l.messages.filter(m => m.from === 'agent').length, 0);
    const won = L.filter(l => l.status === 'Won');
    return {
      leads: L.length,
      conversations: L.filter(l => l.messages.some(m => m.from === 'agent')).length,
      afterHours: L.filter(l => l.afterHours).length,
      estimates: L.filter(l => l.estimateAt).length,
      jobsWon: won.length,
      revenue: won.reduce((n, l) => n + (l.wonValue || 0), 0),
      reviews: L.filter(l => l.reviewSent).length,
      reengaged: L.filter(l => l.reengaged).length,
      hoursSaved: Math.round((agentMsgs * 4) / 60), // about 4 minutes of your time per agent text
      missedCalls: L.filter(l => l.source === 'Missed call text back').length,
      byDay: (function () {
        const days = period === 'all' ? 42 : period === 'month' ? 30 : 7;
        const arr = new Array(days).fill(0);
        L.forEach(l => { const i = Math.floor((now - l.createdAt) / DAY); if (i < days) arr[days - 1 - i]++; });
        return arr;
      })()
    };
  }

  /* ---------- live adapter (fill in when the backend exists) ---------- */
  const live = {
    async leads() {
      const r = await fetch(`${cfg.apiBase}/clients/${clientId}/leads`, { credentials: 'include' });
      if (!r.ok) throw new Error('Could not load leads');
      return r.json(); // same shape as demo leads
    },
    async reply(leadId, text) {
      await fetch(`${cfg.apiBase}/clients/${clientId}/leads/${leadId}/messages`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, pauseAgent: true })
      });
    }
  };

  /* ---------- public API ---------- */
  window.Data = {
    clientId, config: cfg, isDemo: cfg.mode !== 'live',
    profile() { return readStore().profile || null; },
    saveDraft(profile, step) { const s = readStore(); s.profile = Object.assign({}, s.profile, profile); s.step = step; writeStore(s); },
    step() { return readStore().step || 1; },
    submitted() { return !!(readStore().profile || {}).submitted_at; },
    markSubmitted(sentOk) { const s = readStore(); s.profile.submitted_at = Date.now(); s.profile.sent = !!sentOk; writeStore(s); },
    markSent() { const s = readStore(); if (s.profile) { s.profile.sent = true; writeStore(s); } },
    reset() { try { localStorage.removeItem(KEY); } catch (e) {} },
    hoursText, services, money, slotLabel, stats,

    async leads() {
      const p = this.profile() || {};
      if (!this.isDemo) return live.leads();
      const s = readStore();
      const base = buildDemo(p);
      const extra = s.extraLeads || [];
      const edits = s.edits || {};
      const all = extra.concat(base).map(l => edits[l.id] ? Object.assign({}, l, edits[l.id], { messages: l.messages.concat(edits[l.id].added || []) }) : l);
      return all.sort((a, b) => b.createdAt - a.createdAt);
    },
    async reply(leadId, text) {
      if (!this.isDemo) return live.reply(leadId, text);
      const s = readStore(); s.edits = s.edits || {};
      const e = s.edits[leadId] || { added: [] };
      e.added.push({ from: 'owner', text, at: Date.now() }); e.agentPaused = true;
      s.edits[leadId] = e; writeStore(s);
    },
    setPaused(leadId, paused) {
      const s = readStore(); s.edits = s.edits || {};
      const e = s.edits[leadId] || { added: [] }; e.agentPaused = paused; s.edits[leadId] = e; writeStore(s);
    },
    upsertTestLead(lead) {
      const s = readStore(); s.extraLeads = (s.extraLeads || []).filter(l => l.id !== lead.id); s.extraLeads.unshift(lead); writeStore(s);
    }
  };
})();
