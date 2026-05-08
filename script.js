console.log('GrantScorePro script.js v3 loading...');

// ─── CONFIG ───────────────────────────────────────────────────────────────────
var FREE_LIMIT = 50;
var STORAGE_KEY = 'gsp_score_count';
var EMAIL_KEY = 'gsp_user_email';
var ORG_KEY = 'gsp_user_org';
var GATE_KEY = 'gsp_gate_done';
var FORM_BASE = 'https://docs.google.com/forms/d/e/1FAIpQLSfBZMjWkhpo1ZA2OhNkZhGQW6DyjZgghkpexuM46z0_on8tXw/formResponse';
var ENTRY_EMAIL = 'entry.64683268';
var ENTRY_SCORE = 'entry.666362287';
var ENTRY_ORG = 'entry.1144984992';
var ENTRY_COMMENT = 'entry.1655417842';
var STRIPE_LINKS = {
  pro: 'https://buy.stripe.com/6oU28ra7i1px4s9fzE8Vi00',
  team: 'https://buy.stripe.com/bJedR93IU2tB0bT9bg8Vi01',
  agency: 'https://buy.stripe.com/dRm28r1AM1px2k14V08Vi02'
};

// ─── USAGE HELPERS ────────────────────────────────────────────────────────────
window.getCount = function getCount() {
  return parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
};

window.incrementCount = function incrementCount() {
  localStorage.setItem(STORAGE_KEY, window.getCount() + 1);
};

window.isLocked = function isLocked() {
  return window.getCount() >= FREE_LIMIT;
};

window.remaining = function remaining() {
  return Math.max(0, FREE_LIMIT - window.getCount());
};

window.getSavedEmail = function getSavedEmail() {
  return localStorage.getItem(EMAIL_KEY) || '';
};

// ─── GOOGLE FORM SUBMIT ───────────────────────────────────────────────────────
window.submitToGoogleForm = function submitToGoogleForm(email, org, score, comment) {
  var params = new URLSearchParams();
  params.append(ENTRY_EMAIL, email || '');
  params.append(ENTRY_ORG, org || '');
  params.append(ENTRY_SCORE, score || '');
  params.append(ENTRY_COMMENT, comment || '');
  fetch(FORM_BASE, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  }).catch(function() {});
};

// ─── EMAIL GATE ───────────────────────────────────────────────────────────────
window.checkEmailGate = function checkEmailGate() {
  if (!localStorage.getItem(GATE_KEY)) {
    document.getElementById('email-gate-modal').classList.add('open');
  }
};

window.submitEmailGate = function submitEmailGate() {
  var email = document.getElementById('gate-email').value.trim();
  var org = document.getElementById('gate-org').value.trim();
  var errEl = document.getElementById('email-err');
  if (!email || !email.includes('@')) {
    errEl.style.display = 'block';
    return;
  }
  errEl.style.display = 'none';
  localStorage.setItem(EMAIL_KEY, email);
  localStorage.setItem(ORG_KEY, org);
  localStorage.setItem(GATE_KEY, '1');
  window.submitToGoogleForm(email, org, 'signup', 'New user registration');
  document.getElementById('email-gate-modal').classList.remove('open');
};

window.skipEmailGate = function skipEmailGate() {
  localStorage.setItem(GATE_KEY, '1');
  document.getElementById('email-gate-modal').classList.remove('open');
};

// ─── UPGRADE MODAL ────────────────────────────────────────────────────────────
var selectedTier = 'pro';

window.selectTier = function selectTier(t) {
  selectedTier = t;
  document.querySelectorAll('.tier-card').forEach(function(c) { c.classList.remove('selected'); });
  document.getElementById('tier-' + t).classList.add('selected');
};

window.openUpgradeModal = function openUpgradeModal() {
  var el = document.getElementById('upgrade-modal-count');
  if (el) el.textContent = window.getCount();
  document.getElementById('upgrade-modal').classList.add('open');
};

window.closeUpgradeModal = function closeUpgradeModal() {
  document.getElementById('upgrade-modal').classList.remove('open');
};

window.handleUpgrade = function handleUpgrade(tier) {
  var t = tier || selectedTier;
  var url = STRIPE_LINKS[t];
  if (url) window.open(url, '_blank');
};

// ─── USAGE BADGE ──────────────────────────────────────────────────────────────
window.updateUsageBadge = function updateUsageBadge() {
  var r = window.remaining();
  var badge = document.getElementById('uses-badge');
  var banner = document.getElementById('warn-banner');
  var txt = document.getElementById('warn-banner-txt');
  if (!badge) return;
  if (window.isLocked()) {
    badge.textContent = 'Limit reached';
    badge.className = 'uses-badge warn';
    if (banner) banner.style.display = 'flex';
    if (txt) txt.textContent = "You've used all 50 free scores — upgrade to keep scoring.";
    return;
  }
  badge.textContent = r + ' free score' + (r === 1 ? '' : 's') + ' left';
  badge.className = r <= 10 ? 'uses-badge warn' : 'uses-badge';
  if (r <= 10 && r > 0) {
    if (banner) banner.style.display = 'flex';
    if (txt) txt.textContent = r + ' free score' + (r === 1 ? '' : 's') + ' remaining — upgrade to keep going.';
  } else {
    if (banner) banner.style.display = 'none';
  }
};

// ─── WORD COUNT ───────────────────────────────────────────────────────────────
window.updateWC = function updateWC(textareaId, countId, minWords) {
  var text = document.getElementById(textareaId).value.trim();
  var words = text.length === 0 ? 0 : text.split(/\s+/).length;
  var el = document.getElementById(countId);
  if (!el) return;
  el.textContent = words + ' words';
  if (words >= minWords) {
    el.className = 'wc good';
  } else if (words >= minWords * 0.5) {
    el.className = 'wc mid';
  } else {
    el.className = 'wc low';
  }
};

// ─── DIMS & DATA ──────────────────────────────────────────────────────────────
var DIMS = [
  { key: 'mission',       label: 'Mission Alignment',     weight: 0.25, tip: "How closely does your mission match the funder's stated priorities?" },
  { key: 'capacity',      label: 'Org Capacity',           weight: 0.20, tip: 'Staff, systems, and bandwidth to execute and report.' },
  { key: 'track',         label: 'Track Record',           weight: 0.18, tip: 'Demonstrated outcomes and history of successful grant management.' },
  { key: 'budget',        label: 'Budget Fit',             weight: 0.15, tip: "Your request aligns with the funder's typical grant range." },
  { key: 'narrative',     label: 'Narrative Strength',     weight: 0.12, tip: 'Clarity, urgency, and specificity of your case for support.' },
  { key: 'relationships', label: 'Funder Relationship',    weight: 0.06, tip: 'Prior contact, site visits, or warm introduction.' },
  { key: 'compliance',    label: 'Compliance Readiness',   weight: 0.04, tip: '990s current, registration active, determination letter on file.' }
];

var TIPS_BY_DIM = {
  mission:       "Rewrite your mission statement to mirror the funder's exact language and priority areas.",
  capacity:      'Document your staffing plan and reporting systems — funders fund organizations, not just programs.',
  track:         'Pull 2–3 quantified outcomes from prior work. Numbers beat narratives every time.',
  budget:        "Research the funder's typical grant range and right-size your ask to match their pattern.",
  narrative:     'Lead with the problem, not your organization. Make the need undeniable in the first paragraph.',
  relationships: 'Request a pre-submission call or site visit before submitting. One conversation is worth ten cold applications.',
  compliance:    'Get your 990, determination letter, and charitable registration current before submitting anything.'
};

var FUNDERS = [
  { name: 'Z. Smith Reynolds Foundation',       focus: 'NC general',                               deadline: 'Rolling' },
  { name: 'Duke Endowment',                      focus: 'Health, education, rural NC',               deadline: 'LOI required' },
  { name: 'Triangle Community Foundation',       focus: 'Triangle region',                           deadline: 'Quarterly' },
  { name: 'United Way of Wayne County',          focus: 'Local impact — Wayne County',               deadline: 'Spring / Fall' },
  { name: 'Kate B. Reynolds Charitable Trust',   focus: 'Health, poverty',                           deadline: 'LOI required' },
  { name: 'NC Arts Council',                     focus: 'Arts & culture',                            deadline: 'Annual' },
  { name: 'Golden LEAF Foundation',              focus: 'Rural NC economy',                          deadline: 'Quarterly' },
  { name: 'Community Foundation of NC',          focus: 'Statewide',                                 deadline: 'Rolling' },
  { name: 'Cemala Foundation',                   focus: 'Greensboro-area education & community',     deadline: 'LOI required' },
  { name: 'Cannon Foundation',                   focus: 'NC human services, education, health',      deadline: 'Rolling' },
  { name: 'Lyndhurst Foundation',                focus: 'Chattanooga + SE US',                       deadline: 'Invitation only' }
];

var SEASONS = [
  { q: 'Q1 (Jan–Mar)', events: ['Federal LOIs open (many programs)', 'United Way spring cycle opens', 'NC Arts Council Letters of Inquiry', 'Foundation spring cycles begin'] },
  { q: 'Q2 (Apr–Jun)', events: ['Community foundation spring deadlines', 'Hey Helen Grant (April 30)', 'State agency FY close — watch carryover', 'Golden LEAF spring cycle'] },
  { q: 'Q3 (Jul–Sep)', events: ['New federal FY begins Oct 1 — prep now', 'Corporate CSR budgets finalize', 'Fall cycle LOIs open', 'Z. Smith Reynolds rolling review'] },
  { q: 'Q4 (Oct–Dec)', events: ['United Way fall cycle', 'Year-end corporate giving surge', 'Federal grant season peaks', 'NC DHHS & DHSS cycles close'] }
];

var readiness = {};

window.getBand = function getBand(s) {
  if (s >= 85) return {
    label: 'COMPETITIVE', cls: 'competitive', color: '#00c47a',
    bg: 'rgba(0,196,122,0.12)', border: 'rgba(0,196,122,0.3)',
    direction: 'Your application is competitive. Review the Checklist tab and clear any remaining items before your deadline. You are ready to submit.'
  };
  if (s >= 70) return {
    label: 'VIABLE', cls: 'viable', color: '#3b9eff',
    bg: 'rgba(59,158,255,0.12)', border: 'rgba(59,158,255,0.3)',
    direction: "Your score clears the submission threshold but has clear gaps. Address all flagged items in the flagged sections below before submitting — it's the difference between a competitive and a passed-over application."
  };
  if (s >= 55) return {
    label: 'MARGINAL', cls: 'marginal', color: '#f0b429',
    bg: 'rgba(240,180,41,0.12)', border: 'rgba(240,180,41,0.3)',
    direction: 'This application is close, but key sections are limiting competitiveness. Focus on the areas flagged in the flagged sections below to strengthen your score before submission — addressing the top gaps could move you into Viable range.'
  };
  return {
    label: 'NOT READY', cls: 'notready', color: '#f56565',
    bg: 'rgba(245,101,101,0.12)', border: 'rgba(245,101,101,0.3)',
    direction: 'Do not submit in current form. Fundamental gaps would likely result in rejection — and a premature submission can close future doors with this funder. Work through the flagged sections below for a 90-day improvement plan, then re-score before your next opportunity.'
  };
};

// ─── NAVIGATION ───────────────────────────────────────────────────────────────
window.showPage = function showPage(name, btn) {
  document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
  document.querySelectorAll('.nav-btn').forEach(function(b) { b.classList.remove('active'); });
  document.getElementById('pg-' + name).classList.add('active');
  if (btn) btn.classList.add('active');
  window.scrollTo(0, 0);
};

window.goBack = function goBack(to) {
  ['vw-input', 'vw-readiness', 'vw-application'].forEach(function(id) {
    document.getElementById(id).style.display = 'none';
  });
  document.getElementById('vw-' + to).style.display = 'block';
  window.scrollTo(0, 0);
};

// ─── STEP 1 → 2 ───────────────────────────────────────────────────────────────
window.goReadiness = function goReadiness() {
  var o = document.getElementById('orgName').value.trim();
  var f = document.getElementById('funderName').value.trim();
  var a = document.getElementById('askAmt').value.trim();
  var e = document.getElementById('err1');
  if (!o || !f || !a) {
    e.style.display = 'block';
    return;
  }
  e.style.display = 'none';
  DIMS.forEach(function(d) {
    if (readiness[d.key] === undefined) readiness[d.key] = 5;
  });
  window.buildSliders();
  document.getElementById('vw-input').style.display = 'none';
  document.getElementById('vw-readiness').style.display = 'block';
  window.scrollTo(0, 0);
};

// ─── STEP 2 → 3 ───────────────────────────────────────────────────────────────
window.goApplication = function goApplication() {
  document.getElementById('vw-readiness').style.display = 'none';
  document.getElementById('vw-application').style.display = 'block';
  window.scrollTo(0, 0);
};

// ─── SLIDERS ──────────────────────────────────────────────────────────────────
window.buildSliders = function buildSliders() {
  var w = document.getElementById('sliders-wrap');
  if (!w) return;
  w.innerHTML = '';
  DIMS.forEach(function(d) {
    var v = readiness[d.key] !== undefined ? readiness[d.key] : 5;
    w.innerHTML += '<div class="dim-wrap">' +
      '<div class="dim-top">' +
        '<span class="dim-name">' + d.label + ' <span style="font-size:9px;color:rgba(255,255,255,0.3);font-weight:400">' + Math.round(d.weight * 100) + '% weight</span></span>' +
        '<span class="dim-val" id="dv-' + d.key + '">' + v + '</span>' +
      '</div>' +
      '<div class="dim-tip">' + d.tip + '</div>' +
      '<input type="range" min="0" max="10" value="' + v + '" step="1" style="width:100%;margin-bottom:4px" oninput="setDim(\'' + d.key + '\', this.value)" />' +
      '<div style="display:flex;justify-content:space-between;font-size:9px;color:rgba(255,255,255,0.2)"><span>Weak</span><span>Strong</span></div>' +
    '</div>';
  });
};

window.setDim = function setDim(k, v) {
  readiness[k] = Number(v);
  var el = document.getElementById('dv-' + k);
  if (el) el.textContent = v;
};

// ─── TEXT ANALYSIS ────────────────────────────────────────────────────────────
window.wordCount = function wordCount(text) {
  if (!text || text.trim().length === 0) return 0;
  return text.trim().split(/\s+/).length;
};

window.scoreTextField = function scoreTextField(text, minWords, priorities) {
  var wc = window.wordCount(text);
  var base = 0;
  if (wc >= minWords * 2) base = 9;
  else if (wc >= minWords * 1.3) base = 7.5;
  else if (wc >= minWords) base = 6;
  else if (wc >= minWords * 0.5) base = 4;
  else if (wc > 0) base = 2;
  if (/\d/.test(text)) base = Math.min(10, base + 0.5);
  if (/\$|\d+%/.test(text)) base = Math.min(10, base + 0.5);
  if (priorities && priorities.trim().length > 0) {
    var pWords = priorities.toLowerCase().split(/\s+/).filter(function(w) { return w.length > 4; });
    var tLower = text.toLowerCase();
    var hits = pWords.filter(function(w) { return tLower.includes(w); }).length;
    var align = Math.min(1, hits / Math.max(pWords.length, 1));
    base = Math.min(10, base + align * 1.5);
  }
  return Math.round(base * 10) / 10;
};

window.computeTextScore = function computeTextScore() {
  var priorities = document.getElementById('priorities').value;
  var fields = [
    { id: 'appNeed',     weight: 0.25, minWords: 75 },
    { id: 'appGoals',    weight: 0.20, minWords: 50 },
    { id: 'appDesign',   weight: 0.20, minWords: 75 },
    { id: 'appEval',     weight: 0.15, minWords: 50 },
    { id: 'appBudget',   weight: 0.12, minWords: 50 },
    { id: 'appCapacity', weight: 0.08, minWords: 50 }
  ];
  var total = 0;
  fields.forEach(function(f) {
    var el = document.getElementById(f.id);
    var text = el ? el.value : '';
    total += window.scoreTextField(text, f.minWords, priorities) * f.weight;
  });
  return total;
};

window.computeScore = function computeScore() {
  var readinessRaw = DIMS.reduce(function(s, d) {
    return s + (readiness[d.key] !== undefined ? readiness[d.key] : 5) * d.weight;
  }, 0);
  var textRaw = window.computeTextScore();
  var blended = (readinessRaw * 0.6) + (textRaw * 0.4);
  return Math.min(100, Math.max(0, Math.round((blended / 10) * 100)));
};

window.computePotentialScore = function computePotentialScore(weakDims) {
  var simReadiness = Object.assign({}, readiness);
  weakDims.forEach(function(d) { simReadiness[d.key] = 8; });
  var readinessRaw = DIMS.reduce(function(s, d) {
    return s + (simReadiness[d.key] !== undefined ? simReadiness[d.key] : 5) * d.weight;
  }, 0);
  var textRaw = window.computeTextScore();
  var blended = (readinessRaw * 0.6) + (textRaw * 0.4);
  return Math.min(100, Math.max(0, Math.round((blended / 10) * 100)));
};

// ─── STEP 3 → SCORE ───────────────────────────────────────────────────────────
window.calcScore = function calcScore() {
  if (window.isLocked()) {
    window.openUpgradeModal();
    return;
  }
  window.incrementCount();
  // Fix DOM structure: vw-loading and vw-results may be nested inside vw-application
  // due to HTML corruption. Move them to be direct children of pg-score so that
  // calcScore()'s hide/show logic works correctly.
  (function fixDomStructure() {
    var pgScore = document.getElementById('pg-score');
    if (!pgScore) return;
    ['vw-loading', 'vw-results'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el && el.parentElement && el.parentElement !== pgScore) {
        pgScore.insertBefore(el, null);
        console.log('GrantScorePro: moved #' + id + ' to pg-score');
      }
    });
  })();

  window.updateUsageBadge();
  document.getElementById('vw-application').style.display = 'none';
  document.getElementById('vw-loading').style.display = 'block';
  window.scrollTo(0, 0);
  var msgs = [
    'Analyzing mission alignment...',
    'Evaluating organizational readiness...',
    'Scoring statement of need...',
    'Reviewing goals and methodology...',
    'Checking budget narrative...',
    'Calculating composite score...',
    'Generating readiness report...'
  ];
  var i = 0;
  var ml = document.getElementById('load-msg');
  var t = setInterval(function() {
    i++;
    if (ml) ml.textContent = msgs[i % msgs.length];
  }, 700);
  setTimeout(function() {
    clearInterval(t);
    window.showResults();
  }, 2800);
};

// ─── RESULTS ──────────────────────────────────────────────────────────────────
window.sendReportEmail = function sendReportEmail(score, band, org, funder) {
  var emailInput = document.getElementById('report-email-input');
  var sentMsg = document.getElementById('report-email-sent');
  var btn = document.getElementById('report-email-btn');
  var email = emailInput ? emailInput.value.trim() : window.getSavedEmail();
  if (!email || !email.includes('@')) {
    if (emailInput) emailInput.style.borderColor = 'rgba(245,101,101,0.5)';
    return;
  }
  if (emailInput) emailInput.style.borderColor = 'rgba(255,255,255,0.12)';
  var weakDims = DIMS.filter(function(d) {
    return (readiness[d.key] !== undefined ? readiness[d.key] : 5) < 7;
  }).sort(function(a, b) { return b.weight - a.weight; }).slice(0, 3);
  var tipsText = weakDims.map(function(d, i) {
    return 'Tip' + (i + 1) + ' — ' + d.label + ': ' + TIPS_BY_DIM[d.key];
  }).join('|');
  var comment = 'Score: ' + score + ' | Band: ' + band + ' | Funder: ' + funder + ' | Tips: ' + tipsText;
  window.submitToGoogleForm(email, org, String(score), comment);
  if (btn) btn.style.display = 'none';
  if (emailInput) emailInput.style.display = 'none';
  if (sentMsg) {
    sentMsg.style.display = 'block';
    sentMsg.textContent = 'Report sent to ' + email;
  }
  localStorage.setItem(EMAIL_KEY, email);
};

window.showResults = function showResults() {
  try {
    document.getElementById('vw-loading').style.display = 'none';
    var score = window.computeScore();
    var b = window.getBand(score);
    var org = document.getElementById('orgName').value.trim();
    var funder = document.getElementById('funderName').value.trim();
    var gtype = document.getElementById('grantType').value;
    var ask = document.getElementById('askAmt').value;
    var social = document.getElementById('socialAudit').value;
    var savedEmail = window.getSavedEmail();
    var r = 52, circ = 2 * Math.PI * r, dash = (score / 100) * circ;
    var topWeak = DIMS.filter(function(d) {
      return (readiness[d.key] !== undefined ? readiness[d.key] : 5) < 7;
    }).sort(function(a, c) { return c.weight - a.weight; }).slice(0, 3);
    var checklist = [
      { item: 'IRS Determination Letter on file',             done: (readiness.compliance || 5) >= 7 },
      { item: '990 or 990-N filed and current',               done: (readiness.compliance || 5) >= 6 },
      { item: 'NC Charitable Solicitation Registration active', done: (readiness.compliance || 5) >= 7 },
      { item: 'Board-approved budget for current year',        done: (readiness.capacity || 5) >= 6 },
      { item: 'Program outcome data documented',              done: (readiness.track || 5) >= 6 },
      { item: 'Active website and social presence',           done: social === 'strong' },
      { item: 'Cover letter drafted',                         done: false },
      { item: 'Letters of support secured',                   done: false },
      { item: 'Budget narrative prepared',                    done: window.wordCount(document.getElementById('appBudget').value) >= 50 },
      { item: 'Statement of Need written',                    done: window.wordCount(document.getElementById('appNeed').value) >= 75 },
      { item: 'Evaluation plan documented',                   done: window.wordCount(document.getElementById('appEval').value) >= 50 }
    ];
    var scoresLeft = window.remaining();

    var ringHTML = '<svg width="120" height="120" style="transform:rotate(-90deg)">' +
      '<circle cx="60" cy="60" r="' + r + '" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="9"/>' +
      '<circle cx="60" cy="60" r="' + r + '" fill="none" stroke="' + b.color + '" stroke-width="9" stroke-dasharray="' + dash.toFixed(1) + ' ' + circ.toFixed(1) + '" stroke-linecap="round"/>' +
      '</svg>';

    var gainHTML = '';
    if (score < 85 && topWeak.length > 0) {
      var potentialScore = window.computePotentialScore(topWeak);
      var gain = potentialScore - score;
      if (gain > 0) {
        var potentialBand = window.getBand(potentialScore);
        gainHTML = '<div style="margin-top:8px;padding:7px 10px;background:rgba(0,196,122,0.08);border-radius:6px;font-size:11px;color:rgba(255,255,255,0.55);line-height:1.5">' +
          '💡 Addressing your top ' + topWeak.length + ' gap' + (topWeak.length > 1 ? 's' : '') +
          ' could raise your score from <strong style="color:' + b.color + '">' + score + '</strong> → <strong style="color:' + potentialBand.color + '">' + potentialScore + '</strong> (' + potentialBand.label + ')' +
          '</div>';
        gainHTML += '<div style="margin-top:6px;padding:5px 10px;font-size:11px;color:rgba(255,255,255,0.62);line-height:1.9">' +
          topWeak.slice(0, 3).map(function(d) { return '❌ ' + d.label + ' — needs strengthening'; }).join('<br>') +
          '</div>';
      }
    }

    var directionHTML = '<div class="direction-box ' + b.cls + '">' +
      '<div class="direction-label" style="color:' + b.color + '">' + b.label + ' — What to do next</div>' +
      '<div class="direction-text">' + b.direction + '</div>' +
      gainHTML +
      '</div>';

    var upgradeHTML = '<div class="result-upgrade">' +
      '<div class="result-upgrade-head">' +
        '<div class="result-upgrade-title">Unlock Unlimited Scoring</div>' +
        '<div style="font-size:10px;color:rgba(255,255,255,0.62)">Cancel anytime</div>' +
      '</div>' +
      '<div class="result-upgrade-sub">Keep scoring grants, track your improvement over time, and access the full NC Funder Directory.</div>' +
      '<div class="result-tier-row">' +
        '<button class="result-tier-btn selected" onclick="handleUpgrade(\'pro\')">' +
          '<span class="result-tier-price">$19<span style="font-size:10px;font-weight:600;opacity:.6">/mo</span></span>' +
          '<span class="result-tier-name">Pro — Solo</span>' +
        '</button>' +
        '<button class="result-tier-btn" onclick="handleUpgrade(\'team\')">' +
          '<span class="result-tier-price">$49<span style="font-size:10px;font-weight:600;opacity:.6">/mo</span></span>' +
          '<span class="result-tier-name">Team — 5 users</span>' +
        '</button>' +
        '<button class="result-tier-btn" onclick="handleUpgrade(\'agency\')">' +
          '<span class="result-tier-price">$149<span style="font-size:10px;font-weight:600;opacity:.6">/mo</span></span>' +
          '<span class="result-tier-name">Agency</span>' +
        '</button>' +
      '</div>' +
      '<div class="result-trust">🔒 Cancel anytime · No commitment · Powered by Stripe · Your data is never stored or shared</div>' +
      '</div>';

    var reportEmailBox = '<div class="report-email-box">' +
      '<div class="report-email-title">📧 Email My Report</div>' +
      '<div class="report-email-sub">Get your score summary + top improvement tips sent to your inbox.</div>' +
      '<div class="report-email-row">' +
        '<input id="report-email-input" type="email" placeholder="' + (savedEmail || 'you@yourorg.org') + '" value="' + savedEmail + '" style="margin-bottom:0" />' +
        '<button class="btn" id="report-email-btn" onclick="sendReportEmail(' + score + ',\'' + b.label.replace(/'/g, "\\'") + '\',\'' + org.replace(/'/g, "\\'") + '\',\'' + funder.replace(/'/g, "\\'") + '\')">Send Report →</button>' +
      '</div>' +
      '<div id="report-email-sent" class="report-email-sent"></div>' +
      '</div>';

    var overviewBars = DIMS.map(function(d) {
      var v = readiness[d.key] !== undefined ? readiness[d.key] : 5;
      var c = v >= 7 ? '#00c47a' : v >= 5 ? '#c9a84c' : '#f56565';
      return '<div class="bar-row">' +
        '<div class="bar-top"><span>' + d.label + '</span><span style="color:' + c + '">' + v + '/10 <span style="color:rgba(255,255,255,0.62);font-size:9px">' + Math.round(d.weight * 100) + '% weight</span></span></div>' +
        '<div class="bar-track"><div class="bar-fill" style="width:' + (v * 10) + '%;background:' + c + '"></div></div>' +
        '</div>';
    }).join('');

    var appFields = [
      { id: 'appNeed',     label: 'Statement of Need',        minWords: 75 },
      { id: 'appGoals',    label: 'Goals & Objectives',       minWords: 50 },
      { id: 'appDesign',   label: 'Program Design',           minWords: 75 },
      { id: 'appEval',     label: 'Evaluation Plan',          minWords: 50 },
      { id: 'appBudget',   label: 'Budget Narrative',         minWords: 50 },
      { id: 'appCapacity', label: 'Organizational Capacity',  minWords: 50 }
    ];
    var appBars = appFields.map(function(f) {
      var el = document.getElementById(f.id);
      var wc = el ? window.wordCount(el.value) : 0;
      var pct = Math.min(100, Math.round((wc / (f.minWords * 2)) * 100));
      var c = wc >= f.minWords ? '#00c47a' : wc >= f.minWords * 0.5 ? '#c9a84c' : '#f56565';
      return '<div class="bar-row">' +
        '<div class="bar-top"><span>' + f.label + '</span><span style="color:' + c + '">' + wc + ' words</span></div>' +
        '<div class="bar-track"><div class="bar-fill" style="width:' + pct + '%;background:' + c + '"></div></div>' +
        '</div>';
    }).join('');

    var checklistHTML = checklist.map(function(c) {
      return '<div class="check-item">' +
        '<span style="font-size:16px;color:' + (c.done ? '#00c47a' : '#f56565') + ';min-width:20px">' + (c.done ? '✓' : '✗') + '</span>' +
        '<span style="color:' + (c.done ? 'rgba(255,255,255,0.55)' : '#fff') + ';font-weight:' + (c.done ? 400 : 600) + '">' + c.item + '</span>' +
        '</div>';
    }).join('');

    var pathHTML = topWeak.length === 0
      ? '<p style="color:#00c47a;font-weight:700;font-size:13px;padding:12px 0">All readiness dimensions are strong. Focus on strengthening your application narrative.</p>'
      : '<p style="font-size:11px;color:rgba(255,255,255,0.55);margin-bottom:12px">Highest-impact improvements, ranked by scoring weight.</p>' +
        topWeak.map(function(d, i) {
          return '<div class="gap-card">' +
            '<div class="gap-title"><span>' + (i + 1) + '. ' + d.label + '</span><span class="gap-pts">+' + Math.round(d.weight * 100) + ' pts potential</span></div>' +
            '<div class="gap-desc" style="margin-bottom:6px">' + d.tip + '</div>' +
            '<div style="font-size:11px;color:rgba(255,255,255,0.6);line-height:1.5;background:rgba(59,158,255,0.06);border-left:2px solid #3b9eff;padding:6px 10px;border-radius:0 4px 4px 0">→ ' + TIPS_BY_DIM[d.key] + '</div>' +
            '</div>';
        }).join('') +
        '<div style="margin-top:12px;padding:12px 15px;background:rgba(59,158,255,0.08);border-radius:8px;border-left:3px solid #3b9eff;font-size:11px;color:rgba(255,255,255,0.55)">Address these gaps then re-run GrantScore Pro before submitting.</div>';

    var remNote = scoresLeft <= 10
      ? '<div style="background:rgba(240,180,41,0.08);border:1px solid rgba(240,180,41,0.2);border-radius:8px;padding:9px 14px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap"><span style="font-size:11px;color:#f0b429">⚠ ' + scoresLeft + ' free score' + (scoresLeft === 1 ? '' : 's') + ' remaining.</span><span style="font-size:10px;color:rgba(240,180,41,0.7);cursor:pointer;text-decoration:underline" onclick="openUpgradeModal()">Upgrade →</span></div>'
      : '';

    var html = '<div class="step-row">' +
        '<div class="step-dot done">✓</div><span class="step-lbl done">Input</span>' +
        '<div class="step-line"></div>' +
        '<div class="step-dot done">✓</div><span class="step-lbl done">Readiness</span>' +
        '<div class="step-line"></div>' +
        '<div class="step-dot done">✓</div><span class="step-lbl done">Application</span>' +
        '<div class="step-line"></div>' +
        '<div class="step-dot done" style="background:#3b9eff;color:#000">✓</div><span class="step-lbl active">Results</span>' +
      '</div>' +
      remNote +
      '<div style="display:flex;gap:24px;align-items:flex-start;margin-bottom:16px;flex-wrap:wrap">' +
        '<div style="text-align:center">' +
          ringHTML +
          '<div style="margin-top:-68px;position:relative;z-index:1">' +
            '<div style="font-size:36px;font-weight:900;color:' + b.color + ';line-height:1">' + score + '</div>' +
            '<div style="font-size:10px;color:rgba(255,255,255,0.3);margin-top:2px">/ 100</div>' +
          '</div>' +
          '<div style="margin-top:46px"><span class="band-chip" style="background:' + b.bg + ';color:' + b.color + ';border:1px solid ' + b.border + '">' + b.label + '</span></div>' +
        '</div>' +
        '<div style="flex:1;min-width:200px">' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:4px">' + org + ' → ' + funder + '</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.3);margin-bottom:14px">' + gtype + ' · $' + Number(ask).toLocaleString() + ' request</div>' +
          directionHTML +
        '</div>' +
      '</div>' +
      upgradeHTML +
      reportEmailBox +
      '<div class="tab-row">' +
        '<button class="tab active" onclick="switchTab(\'overview\',this)">OVERVIEW</button>' +
        '<button class="tab" onclick="switchTab(\'application\',this)">APPLICATION</button>' +
        '<button class="tab" onclick="switchTab(\'checklist\',this)">CHECKLIST</button>' +
        '<button class="tab" onclick="switchTab(\'path\',this)">PATH</button>' +
        '<button class="tab" onclick="switchTab(\'share\',this)">SHARE</button>' +
      '</div>' +
      '<div id="tab-overview">' + overviewBars + '</div>' +
      '<div id="tab-application" style="display:none">' +
        '<p style="font-size:11px;color:rgba(255,255,255,0.55);margin-bottom:12px">Application narrative completeness — minimum word thresholds shown.</p>' +
        appBars +
      '</div>' +
      '<div id="tab-checklist" style="display:none">' +
        '<p style="font-size:11px;color:rgba(255,255,255,0.55);margin-bottom:12px">Pre-submission checklist based on your readiness inputs.</p>' +
        checklistHTML +
      '</div>' +
      '<div id="tab-path" style="display:none">' + pathHTML + '</div>' +
      '<div id="tab-share" style="display:none">' +
        '<p style="font-size:11px;color:rgba(255,255,255,0.55);margin-bottom:12px">Share your readiness score with your board, ED, or funders.</p>' +
        '<div class="share-box">"I scored ' + score + '/100 on GrantScore Pro — ' + b.label + ' for the ' + funder + ' grant. grantscorepro.com"</div>' +
        '<button class="btn" id="copy-btn" onclick="copyShare(' + score + ',\'' + b.label.replace(/'/g, "\\'") + '\',\'' + funder.replace(/'/g, "\\'") + '\')">Copy to Clipboard</button>' +
        '<p style="font-size:11px;color:rgba(255,255,255,0.3);margin-top:12px">Attaching your GrantScore report in funder correspondence signals organizational maturity.</p>' +
      '</div>' +
      '<div style="display:flex;gap:10px;margin-top:24px;flex-wrap:wrap">' +
        '<button class="btn-s" onclick="editApplication()">← Edit Application</button>' +
        '<button class="btn-s" onclick="resetAll()">Score Another Grant</button>' +
      '</div>';

    var rv = document.getElementById('vw-results');
    rv.innerHTML = html;
    rv.style.display = 'block';
    window.scrollTo(0, 0);

  } catch (err) {
    var rv = document.getElementById('vw-results');
    rv.style.display = 'block';
    rv.innerHTML = '<div style="background:rgba(245,101,101,0.15);border:1px solid #f56565;border-radius:8px;padding:20px;color:#f56565;font-family:monospace;font-size:13px;margin:20px 0"><strong>Debug Error:</strong><br>' + err.message + '<br><br><span style="color:rgba(255,255,255,0.5);font-size:11px">' + (err.stack || '') + '</span></div>';
    window.scrollTo(0, 0);
  }
};

window.switchSampleTab = function switchSampleTab(name, btn) {
  ['s-overview', 's-application', 's-checklist', 's-path', 's-share'].forEach(function(t) {
    var el = document.getElementById(t);
    if (el) el.style.display = (t === name ? 'block' : 'none');
  });
  var tabRow = btn ? btn.closest('.tab-row') : null;
  if (tabRow) tabRow.querySelectorAll('.tab').forEach(function(b) { b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
};

window.switchTab = function switchTab(name, btn) {
  ['overview', 'application', 'checklist', 'path', 'share'].forEach(function(t) {
    var el = document.getElementById('tab-' + t);
    if (el) el.style.display = (t === name ? 'block' : 'none');
  });
  document.querySelectorAll('.tab').forEach(function(b) { b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
};

window.copyShare = function copyShare(score, label, funder) {
  var text = 'I scored ' + score + '/100 on GrantScore Pro — ' + label + ' for the ' + funder + ' grant. grantscorepro.com';
  navigator.clipboard.writeText(text).catch(function() {});
  var btn = document.getElementById('copy-btn');
  if (btn) {
    btn.textContent = '✓ Copied!';
    setTimeout(function() { btn.textContent = 'Copy to Clipboard'; }, 2000);
  }
};

window.editApplication = function editApplication() {
  document.getElementById('vw-results').style.display = 'none';
  document.getElementById('vw-results').innerHTML = '';
  document.getElementById('vw-application').style.display = 'block';
  window.scrollTo(0, 0);
};

window.resetAll = function resetAll() {
  document.getElementById('vw-results').style.display = 'none';
  document.getElementById('vw-results').innerHTML = '';
  readiness = {};
  document.getElementById('vw-application').style.display = 'none';
  document.getElementById('vw-readiness').style.display = 'none';
  document.getElementById('vw-input').style.display = 'block';
  window.scrollTo(0, 0);
};

// ─── FUNDER DIRECTORY ─────────────────────────────────────────────────────────
window.filterFunders = function filterFunders() {
  var q = (document.getElementById('funder-search') ? document.getElementById('funder-search').value || '' : '').toLowerCase();
  var list = document.getElementById('funder-list');
  if (!list) return;
  list.innerHTML = FUNDERS
    .filter(function(f) { return f.name.toLowerCase().includes(q) || f.focus.toLowerCase().includes(q); })
    .map(function(f) {
      return '<div class="funder-row">' +
        '<div><div class="funder-name">' + f.name + '</div><div class="funder-focus">' + f.focus + '</div></div>' +
        '<div class="funder-dl">' + f.deadline + '</div>' +
        '</div>';
    }).join('');
};

// ─── CALENDAR ─────────────────────────────────────────────────────────────────
window.buildCalendar = function buildCalendar() {
  var grid = document.getElementById('cal-grid');
  if (!grid) return;
  grid.innerHTML = SEASONS.map(function(s) {
    return '<div class="cal-card"><div class="cal-q">' + s.q + '</div>' +
      s.events.map(function(e) { return '<div class="cal-ev">' + e + '</div>'; }).join('') +
      '</div>';
  }).join('');
};

// ─── INIT ─────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', function() {
  console.log('GrantScorePro DOMContentLoaded — wiring up...');

  // Upgrade modal click-outside-to-close
  var upgradeModal = document.getElementById('upgrade-modal');
  if (upgradeModal) {
    upgradeModal.addEventListener('click', function(e) {
      if (e.target === this) window.closeUpgradeModal();
    });
  }

  window.updateUsageBadge();
  window.filterFunders();
  window.buildCalendar();
  window.checkEmailGate();

  console.log('GrantScorePro ready. goReadiness:', typeof window.goReadiness, '| calcScore:', typeof window.calcScore);
});
