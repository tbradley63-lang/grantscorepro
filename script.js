// -----------------------------
// UTILITIES & CONSTANTS
// -----------------------------
const USES_KEY = "gsp_uses";
const EMAIL_KEY = "gsp_email";
const EMAIL_SKIPPED_KEY = "gsp_email_skipped";
const UPGRADE_SHOWN_KEY = "gsp_upgrade_shown";
const FREE_LIMIT = 50;

function $(sel) { return document.querySelector(sel); }
function $all(sel) { return Array.from(document.querySelectorAll(sel)); }

function getLS(key, fallback = null) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function setLS(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch {}
}

// -----------------------------
// PAGE NAVIGATION
// -----------------------------
function showPage(pageId, btn) {
  // Hide all pages
  document.querySelectorAll(".page").forEach(p => {
    p.style.display = "none";
  });

  // Show selected page
  const target = document.getElementById("pg-" + pageId);
  if (target) target.style.display = "block";

  // Update nav button active state
  document.querySelectorAll(".nav-btn").forEach(b => {
    b.classList.remove("active");
  });
  if (btn) btn.classList.add("active");

  // Reset score flow when returning to Score page
  if (pageId === "score") {
    showScoreStep("input");
  }
}

// -----------------------------
// SCORE FLOW – STEP VIEWS
// -----------------------------
function showScoreStep(step) {
  const views = ["input", "readiness", "application", "loading", "results"];
  views.forEach(v => {
    const el = $("#vw-" + v);
    if (el) el.style.display = (v === step ? "block" : "none");
  });
}

function goReadiness() {
  const org = $("#orgName")?.value.trim();
  const funder = $("#funderName")?.value.trim();
  const amt = $("#askAmt")?.value.trim();
  const err = $("#err1");

  if (!org || !funder || !amt) {
    if (err) err.style.display = "block";
    return;
  }
  if (err) err.style.display = "none";

  showScoreStep("readiness");
}

function goApplication() {
  showScoreStep("application");
}

function goBack(step) {
  showScoreStep(step);
}

// -----------------------------
// READINESS SLIDERS
// -----------------------------
const READINESS_DIMENSIONS = [
  { id: "leadership", label: "Leadership & Governance", tip: "Board engagement, clarity, decision-making.", min: 1, max: 10, defaultValue: 7 },
  { id: "program", label: "Program Strength", tip: "Evidence-based design, outcomes, track record.", min: 1, max: 10, defaultValue: 7 },
  { id: "data", label: "Data & Evaluation", tip: "Ability to track and report outcomes.", min: 1, max: 10, defaultValue: 6 },
  { id: "finance", label: "Financial Health", tip: "Budget stability, reserves, diversified revenue.", min: 1, max: 10, defaultValue: 6 },
  { id: "capacity", label: "Staff & Capacity", tip: "Expertise, bandwidth, operational systems.", min: 1, max: 10, defaultValue: 7 },
  { id: "alignment", label: "Funder Alignment", tip: "Mission, geography, population match.", min: 1, max: 10, defaultValue: 8 },
  { id: "sustainability", label: "Sustainability & Leverage", tip: "Matching funds, partnerships, long-term viability.", min: 1, max: 10, defaultValue: 6 }
];

function buildReadinessSliders() {
  const wrap = $("#sliders-wrap");
  if (!wrap) return;

  wrap.innerHTML = "";

  READINESS_DIMENSIONS.forEach(dim => {
    const block = document.createElement("div");
    block.className = "dim-wrap";
    block.innerHTML = `
      <div class="dim-top">
        <div class="dim-name">${dim.label}</div>
        <div class="dim-val" id="dim-val-${dim.id}">${dim.defaultValue}/10</div>
      </div>
      <div class="dim-tip">${dim.tip}</div>
      <input type="range" min="${dim.min}" max="${dim.max}" value="${dim.defaultValue}" data-dim="${dim.id}">
    `;
    wrap.appendChild(block);
  });

  $all("input[data-dim]").forEach(input => {
    input.addEventListener("input", () => {
      const id = input.getAttribute("data-dim");
      $("#dim-val-" + id).textContent = `${input.value}/10`;
    });
  });
}

// -----------------------------
// WORD COUNT
// -----------------------------
function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function updateWC(fieldId, counterId, minWords) {
  const field = $("#" + fieldId);
  const counter = $("#" + counterId);
  if (!field || !counter) return;

  const words = countWords(field.value);
  counter.textContent = `${words} words`;

  counter.classList.remove("low", "mid", "good");
  if (words === 0) counter.classList.add("low");
  else if (words < minWords) counter.classList.add("mid");
  else counter.classList.add("good");
}

// -----------------------------
// SCORING ENGINE
// -----------------------------
function collectReadinessScore() {
  let total = 0, maxTotal = 0;
  $all("input[data-dim]").forEach(input => {
    total += Number(input.value);
    maxTotal += Number(input.max);
  });
  return Math.round((total / maxTotal) * 50);
}

function collectApplicationScore() {
  const sections = [
    { id: "appNeed", min: 75 },
    { id: "appGoals", min: 50 },
    { id: "appDesign", min: 75 },
    { id: "appEval", min: 50 },
    { id: "appBudget", min: 50 },
    { id: "appCapacity", min: 50 }
  ];

  let total = 0;
  sections.forEach(sec => {
    const words = countWords($("#" + sec.id)?.value || "");
    if (words === 0) total += 0;
    else if (words < sec.min) total += 5;
    else total += 10;
  });

  return Math.round((total / (sections.length * 10)) * 50);
}

function classifyScore(total) {
  if (total >= 85) return { band: "Competitive", class: "competitive" };
  if (total >= 70) return { band: "Viable", class: "viable" };
  if (total >= 55) return { band: "Marginal", class: "marginal" };
  return { band: "Not Ready", class: "notready" };
}

function calcScore() {
  showScoreStep("loading");
  const loadMsg = $("#load-msg");

  setTimeout(() => loadMsg.textContent = "Analyzing mission alignment...", 200);
  setTimeout(() => loadMsg.textContent = "Scoring organizational readiness...", 800);
  setTimeout(() => loadMsg.textContent = "Evaluating application strength...", 1400);

  setTimeout(() => {
    const readiness = collectReadinessScore();
    const application = collectApplicationScore();
    const total = readiness + application;
    const band = classifyScore(total);

    renderResults({ readiness, application, total, band });

    incrementUses();
    updateUsageBadge();
    maybeShowUpgrade();

    showScoreStep("results");
  }, 2000);
}

// -----------------------------
// RESULTS RENDERING
// -----------------------------
function renderResults({ readiness, application, total, band }) {
  const el = $("#vw-results");
  const org = $("#orgName")?.value || "Your organization";
  const funder = $("#funderName")?.value || "the funder";

  el.innerHTML = `
    <div class="card">
      <div class="direction-box ${band.class}">
        <div class="direction-label">${band.band}</div>
        <div class="direction-text">
          ${band.band === "Competitive"
            ? "Strong position to submit. Polish clarity and alignment."
            : band.band === "Viable"
            ? "Close. Address gaps before submitting."
            : band.band === "Marginal"
            ? "Meaningful gaps exist. Consider revising."
            : "Significant gaps. Build readiness before applying."
          }
        </div>
      </div>

      <div class="stats">
        <div><div class="sv">${total}</div><div class="sl">Total / 100</div></div>
        <div><div class="sv">${readiness}</div><div class="sl">Readiness / 50</div></div>
        <div><div class="sv">${application}</div><div class="sl">Application / 50</div></div>
      </div>

      <div class="share-box">
        ${org} vs. ${funder}: Use this score to decide whether to move forward, revise, or redirect.
      </div>

      <div class="result-upgrade">
        <button class="btn-gold" onclick="openUpgradeModal()">Unlock Full Access →</button>
      </div>
    </div>
  `;
}

// -----------------------------
// USAGE TRACKING
// -----------------------------
function getUses() { return getLS(USES_KEY, 0); }
function incrementUses() { setLS(USES_KEY, getUses() + 1); }

function updateUsageBadge() {
  const badge = $("#uses-badge");
  const warn = $("#warn-banner");
  const txt = $("#warn-banner-txt");

  const uses = getUses();
  badge.textContent = `${uses} / ${FREE_LIMIT} free scores used`;

  if (uses >= FREE_LIMIT - 10) {
    badge.classList.add("warn");
    warn.style.display = "flex";
    txt.textContent = `You're nearing your free limit (${uses}/${FREE_LIMIT}).`;
  } else {
    badge.classList.remove("warn");
    warn.style.display = "none";
  }
}

function maybeShowUpgrade() {
  const uses = getUses();
  const shown = getLS(UPGRADE_SHOWN_KEY, false);
  if (uses >= FREE_LIMIT && !shown) {
    openUpgradeModal();
    setLS(UPGRADE_SHOWN_KEY, true);
  }
}

// -----------------------------
// EMAIL GATE
// -----------------------------
function openEmailGate() { $("#email-gate-modal")?.classList.add("open"); }
function closeEmailGate() { $("#email-gate-modal")?.classList.remove("open"); }

function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

function submitEmailGate() {
  const email = $("#gate-email")?.value.trim();
  const org = $("#gate-org")?.value.trim();
  const err = $("#email-err");

  if (!isValidEmail(email)) {
    err.textContent = "Enter a valid email.";
    err.style.display = "block";
    return;
  }
  if (!org) {
    err.textContent = "Enter your organization.";
    err.style.display = "block";
    return;
  }

  err.style.display = "none";
  setLS(EMAIL_KEY, { email, org });
  setLS(EMAIL_SKIPPED_KEY, false);
  closeEmailGate();
}

function skipEmailGate() {
  setLS(EMAIL_SKIPPED_KEY, true);
  closeEmailGate();
}

function checkEmailGate() {
  if (!getLS(EMAIL_KEY) && !getLS(EMAIL_SKIPPED_KEY) && getUses() >= 2) {
    openEmailGate();
  }
}

// -----------------------------
// UPGRADE MODAL
// -----------------------------
let selectedTier = "pro";

function openUpgradeModal() { $("#upgrade-modal")?.classList.add("open"); }
function closeUpgradeModal() { $("#upgrade-modal")?.classList.remove("open"); }

function selectTier(tier) {
  selectedTier = tier;
  ["pro", "team", "agency"].forEach(t => {
    const card = $("#tier-" + t);
    if (card) card.classList.toggle("selected", t === tier);
  });
}

function handleUpgrade() {
  const subject = encodeURIComponent("GrantScore Pro – Upgrade Inquiry");
  const body = encodeURIComponent(`Hi Terri,\n\nI'm interested in the ${selectedTier.toUpperCase()} tier.\n\nOrganization:\nGrant volume:\nStart date:\n\nThanks!`);
  window.location.href = `mailto:hello@grantscorepro.com?subject=${subject}&body=${body}`;
}

// -----------------------------
// FUNDER DIRECTORY
// -----------------------------
const FUNDERS = [
  { name: "Z. Smith Reynolds Foundation", focus: "Equity, community, democracy", download: "https://www.zsr.org/" },
  { name: "Golden LEAF Foundation", focus: "Rural NC, economic development", download: "https://goldenleaf.org/" },
  { name: "Kate B. Reynolds Charitable Trust", focus: "Health equity, NC", download: "https://kbr.org/" },
  { name: "NC Arts Council", focus: "Arts, culture, statewide", download: "https://www.ncarts.org/" },
  { name: "United Way of Wayne County", focus: "Health, education, stability", download: "https://www.unitedwayne.org/" }
];

function renderFunders(list) {
  const wrap = $("#funder-list");
  wrap.innerHTML = list.map(f => `
    <div class="funder-row">
      <div>
        <div class="funder-name">${f.name}</div>
        <div class="funder-focus">${f.focus}</div>
      </div>
      <a class="funder-dl" href="${f.download}" target="_blank">View Site →</a>
    </div>
  `).join("");
}

function filterFunders() {
  const q = $("#funder-search")?.value.toLowerCase().trim() || "";
  if (!q) return renderFunders(FUNDERS);

  const filtered = FUNDERS.filter(f =>
    f.name.toLowerCase().includes(q) ||
    f.focus.toLowerCase().includes(q)
  );
  renderFunders(filtered);
}

// -----------------------------
// GRANT CALENDAR
// -----------------------------
const CAL_EVENTS = [
  { quarter: "Q1 – Jan–Mar", items: ["Federal NOFO releases", "NC foundation LOIs", "Annual planning"] },
  { quarter: "Q2 – Apr–Jun", items: ["State RFPs", "Corporate CSR cycles", "Fiscal year alignment"] },
  { quarter: "Q3 – Jul–Sep", items: ["Federal deadlines", "Foundation program grants", "Renewal prep"] },
  { quarter: "Q4 – Oct–Dec", items: ["Year-end campaigns", "Pipeline building", "Annual debrief"] }
];

function buildCalendar() {
  const grid = $("#cal-grid");
  grid.innerHTML = CAL_EVENTS.map(ev => `
    <div class="cal-card">
      <div class="cal-q">${ev.quarter}</div>
      ${ev.items.map(i => `<div class="cal-ev">${i}</div>`).join("")}
    </div>
  `).join("");
}

// -----------------------------
// DOM READY
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  showPage("score");
  showScoreStep("input");

  buildReadinessSliders();
  renderFunders(FUNDERS);
  buildCalendar();

  updateUsageBadge();
  checkEmailGate();
});
