// GrantScore Pro V2 – script.js
// Comprehensive front-end logic for navigation, scoring, directory, calendar,
// email gate, upgrade modal, usage tracking, and word counts.

// -----------------------------
// UTILITIES & CONSTANTS
// -----------------------------

const USES_KEY = "gsp_uses";
const EMAIL_KEY = "gsp_email";
const EMAIL_SKIPPED_KEY = "gsp_email_skipped";
const UPGRADE_SHOWN_KEY = "gsp_upgrade_shown";
const FREE_LIMIT = 50;

// Simple helpers
function $(sel) {
  return document.querySelector(sel);
}
function $all(sel) {
  return Array.from(document.querySelectorAll(sel));
}

// Safe localStorage helpers
function getLS(key, fallback = null) {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : JSON.parse(v);
  } catch {
    return fallback;
  }
}
function setLS(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

// -----------------------------
// PAGE NAVIGATION
// -----------------------------

function showPage(pageId, btn) {
  const pages = $all(".page");
  pages.forEach(p => (p.style.display = "none"));

  const target = $("#pg-" + pageId);
  if (target) target.style.display = "block";

  const navBtns = $all(".nav-btn");
  navBtns.forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");

  // When returning to Score page, default to first step view
  if (pageId === "score") {
    showScoreStep("input");
  }
}

// -----------------------------
// SCORE FLOW – STEP VIEWS
// -----------------------------

function showScoreStep(step) {
  const vwInput = $("#vw-input");
  const vwReadiness = $("#vw-readiness");
  const vwApplication = $("#vw-application");
  const vwLoading = $("#vw-loading");
  const vwResults = $("#vw-results");

  if (!vwInput || !vwReadiness || !vwApplication || !vwLoading || !vwResults) return;

  vwInput.style.display = "none";
  vwReadiness.style.display = "none";
  vwApplication.style.display = "none";
  vwLoading.style.display = "none";
  vwResults.style.display = "none";

  if (step === "input") vwInput.style.display = "block";
  if (step === "readiness") vwReadiness.style.display = "block";
  if (step === "application") vwApplication.style.display = "block";
  if (step === "loading") vwLoading.style.display = "block";
  if (step === "results") vwResults.style.display = "block";
}

function goReadiness() {
  const orgName = $("#orgName")?.value.trim();
  const funderName = $("#funderName")?.value.trim();
  const askAmt = $("#askAmt")?.value.trim();
  const err1 = $("#err1");

  if (!orgName || !funderName || !askAmt) {
    if (err1) {
      err1.style.display = "block";
    }
    return;
  }
  if (err1) err1.style.display = "none";

  showScoreStep("readiness");
}

function goApplication() {
  showScoreStep("application");
}

function goBack(step) {
  if (step === "input") showScoreStep("input");
  if (step === "readiness") showScoreStep("readiness");
}

// -----------------------------
// READINESS SLIDERS
// -----------------------------

const READINESS_DIMENSIONS = [
  {
    id: "leadership",
    label: "Leadership & Governance",
    tip: "Board engagement, strategic clarity, and decision-making strength.",
    min: 1,
    max: 10,
    defaultValue: 7
  },
  {
    id: "program",
    label: "Program Strength",
    tip: "Evidence-based design, clear outcomes, and strong track record.",
    min: 1,
    max: 10,
    defaultValue: 7
  },
  {
    id: "data",
    label: "Data & Evaluation",
    tip: "Ability to track, analyze, and report meaningful outcomes.",
    min: 1,
    max: 10,
    defaultValue: 6
  },
  {
    id: "finance",
    label: "Financial Health",
    tip: "Budget stability, reserves, and diversified revenue.",
    min: 1,
    max: 10,
    defaultValue: 6
  },
  {
    id: "capacity",
    label: "Staff & Capacity",
    tip: "Staff expertise, bandwidth, and operational systems.",
    min: 1,
    max: 10,
    defaultValue: 7
  },
  {
    id: "alignment",
    label: "Funder Alignment",
    tip: "Mission, geography, and population match the funder.",
    min: 1,
    max: 10,
    defaultValue: 8
  },
  {
    id: "sustainability",
    label: "Sustainability & Leverage",
    tip: "Matching funds, partnerships, and long-term viability.",
    min: 1,
    max: 10,
    defaultValue: 6
  }
];

function buildReadinessSliders() {
  const wrap = $("#sliders-wrap");
  if (!wrap) return;

  wrap.innerHTML = "";

  READINESS_DIMENSIONS.forEach(dim => {
    const outer = document.createElement("div");
    outer.className = "dim-wrap";

    outer.innerHTML = `
      <div class="dim-top">
        <div class="dim-name">${dim.label}</div>
        <div class="dim-val" id="dim-val-${dim.id}">${dim.defaultValue}/10</div>
      </div>
      <div class="dim-tip">${dim.tip}</div>
      <input 
        type="range" 
        min="${dim.min}" 
        max="${dim.max}" 
        value="${dim.defaultValue}" 
        data-dim="${dim.id}"
      />
    `;
    wrap.appendChild(outer);
  });

  // Attach listeners
  $all("input[type=range][data-dim]").forEach(input => {
    input.addEventListener("input", () => {
      const id = input.getAttribute("data-dim");
      const valEl = $("#dim-val-" + id);
      if (valEl) valEl.textContent = `${input.value}/10`;
    });
  });
}

// -----------------------------
// WORD COUNT & APPLICATION TEXT
// -----------------------------

function countWords(text) {
  if (!text) return 0;
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function updateWC(fieldId, counterId, minWords) {
  const field = $("#" + fieldId);
  const counter = $("#" + counterId);
  if (!field || !counter) return;

  const words = countWords(field.value);
  counter.textContent = `${words} words`;

  counter.classList.remove("low", "mid", "good");
  if (words === 0) {
    counter.classList.add("low");
  } else if (words < minWords) {
    counter.classList.add("mid");
  } else {
    counter.classList.add("good");
  }
}

// -----------------------------
// SCORING ENGINE
// -----------------------------

function collectReadinessScore() {
  let total = 0;
  let maxTotal = 0;

  $all("input[type=range][data-dim]").forEach(input => {
    const val = Number(input.value || 0);
    const max = Number(input.max || 10);
    total += val;
    maxTotal += max;
  });

  // Normalize to 0–50
  if (maxTotal === 0) return 0;
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
  let maxTotal = sections.length * 10;

  sections.forEach(sec => {
    const el = $("#" + sec.id);
    if (!el) return;
    const words = countWords(el.value);
    let score = 0;

    if (words === 0) score = 0;
    else if (words < sec.min) score = 5;
    else score = 10;

    total += score;
  });

  // Normalize to 0–50
  return Math.round((total / maxTotal) * 50);
}

function classifyScore(total) {
  if (total >= 85) return { band: "Competitive", class: "competitive" };
  if (total >= 70) return { band: "Viable", class: "viable" };
  if (total >= 55) return { band: "Marginal", class: "marginal" };
  return { band: "Not Ready", class: "notready" };
}

function calcScore() {
  // Move to loading view
  showScoreStep("loading");
  const loadMsg = $("#load-msg");
  if (loadMsg) loadMsg.textContent = "Analyzing mission alignment...";

  setTimeout(() => {
    if (loadMsg) loadMsg.textContent = "Scoring organizational readiness...";
  }, 600);

  setTimeout(() => {
    if (loadMsg) loadMsg.textContent = "Evaluating application strength...";
  }, 1200);

  setTimeout(() => {
    const readinessScore = collectReadinessScore();
    const applicationScore = collectApplicationScore();
    const totalScore = readinessScore + applicationScore;
    const bandInfo = classifyScore(totalScore);

    renderResults({
      readinessScore,
      applicationScore,
      totalScore,
      bandInfo
    });

    incrementUses();
    updateUsageBadge();
    maybeShowUpgrade();

    showScoreStep("results");
  }, 1800);
}

// -----------------------------
// RESULTS RENDERING
// -----------------------------

function renderResults({ readinessScore, applicationScore, totalScore, bandInfo }) {
  const vwResults = $("#vw-results");
  if (!vwResults) return;

  const orgName = $("#orgName")?.value.trim() || "Your organization";
  const funderName = $("#funderName")?.value.trim() || "the funder";

  vwResults.innerHTML = `
    <div class="card">
      <div class="direction-box ${bandInfo.class}">
        <div class="direction-label">${bandInfo.band}</div>
        <div class="direction-text">
          ${bandInfo.band === "Competitive"
            ? "You are in a strong position to submit. Focus on polishing clarity, specificity, and alignment with the funder’s language."
            : bandInfo.band === "Viable"
            ? "You are close. Address the gaps below before submitting to increase your competitiveness."
            : bandInfo.band === "Marginal"
            ? "There are meaningful gaps in readiness or application strength. Consider revising or targeting a different funder."
            : "Significant readiness and application gaps exist. Use this as a roadmap to build capacity before investing time in a full proposal."
          }
        </div>
      </div>

      <div class="stats" style="margin-bottom:18px">
        <div>
          <div class="sv">${totalScore}</div>
          <div class="sl">Total Score / 100</div>
        </div>
        <div>
          <div class="sv">${readinessScore}</div>
          <div class="sl">Readiness / 50</div>
        </div>
        <div>
          <div class="sv">${applicationScore}</div>
          <div class="sl">Application / 50</div>
        </div>
      </div>

      <div class="share-box">
        ${orgName} vs. ${funderName}: Use this score to decide whether to move forward, revise, or redirect your effort to a better-aligned opportunity.
      </div>

      <div class="result-upgrade">
        <div class="result-upgrade-head">
          <div class="result-upgrade-title">Turn this into a repeatable system.</div>
        </div>
        <div class="result-upgrade-sub">
          Save scores, track funders, and keep a running history of every grant decision you make — all in one place.
        </div>
        <div class="result-tier-row">
          <button class="result-tier-btn selected">
            <span class="result-tier-price">$19</span>
            <span class="result-tier-name">Solo / Pro</span>
            Perfect for individual grant writers and small nonprofits.
          </button>
          <button class="result-tier-btn">
            <span class="result-tier-price">$49</span>
            <span class="result-tier-name">Team</span>
            ED + board + staff collaborating on decisions.
          </button>
        </div>
        <button class="btn-gold result-upgrade-cta" onclick="openUpgradeModal()">Unlock Full Access →</button>
        <div class="result-trust">
          No contracts · Cancel anytime · Built for real-world grant practice
        </div>
      </div>
    </div>
  `;
}

// -----------------------------
// USAGE TRACKING & WARNINGS
// -----------------------------

function getUses() {
  return getLS(USES_KEY, 0) || 0;
}

function incrementUses() {
  const current = getUses();
  setLS(USES_KEY, current + 1);
}

function updateUsageBadge() {
  const badge = $("#uses-badge");
  const warnBanner = $("#warn-banner");
  const warnText = $("#warn-banner-txt");
  if (!badge) return;

  const uses = getUses();
  const remaining = Math.max(FREE_LIMIT - uses, 0);

  badge.classList.remove("warn");
  if (uses === 0) {
    badge.textContent = "Loading...";
    setTimeout(() => {
      badge.textContent = "0 / 50 free scores used";
    }, 300);
    return;
  }

  badge.textContent = `${uses} / ${FREE_LIMIT} free scores used`;

  if (remaining <= 10) {
    badge.classList.add("warn");
    if (warnBanner && warnText) {
      warnBanner.style.display = "flex";
      warnText.textContent = `You’re nearing your free limit (${uses}/${FREE_LIMIT}). Consider upgrading to keep scoring without interruption.`;
    }
  } else {
    if (warnBanner) warnBanner.style.display = "none";
  }
}

function maybeShowUpgrade() {
  const uses = getUses();
  const alreadyShown = getLS(UPGRADE_SHOWN_KEY, false);

  if (uses >= FREE_LIMIT && !alreadyShown) {
    openUpgradeModal();
    setLS(UPGRADE_SHOWN_KEY, true);
  }
}

// -----------------------------
// EMAIL GATE
// -----------------------------

function openEmailGate() {
  const overlay = $("#email-gate-modal");
  if (overlay) overlay.classList.add("open");
}

function closeEmailGate() {
  const overlay = $("#email-gate-modal");
  if (overlay) overlay.classList.remove("open");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function submitEmailGate() {
  const emailInput = $("#gate-email");
  const orgInput = $("#gate-org");
  const err = $("#email-err");

  const email = emailInput?.value.trim() || "";
  const org = orgInput?.value.trim() || "";

  if (!isValidEmail(email)) {
    if (err) {
      err.textContent = "Please enter a valid email address.";
      err.style.display = "block";
    }
    return;
  }

  if (!org) {
    if (err) {
      err.textContent = "Please enter your organization name.";
      err.style.display = "block";
    }
    return;
  }

  if (err) err.style.display = "none";

  setLS(EMAIL_KEY, { email, org, ts: Date.now() });
  setLS(EMAIL_SKIPPED_KEY, false);
  closeEmailGate();
}

function skipEmailGate() {
  setLS(EMAIL_SKIPPED_KEY, true);
  closeEmailGate();
}

function checkEmailGate() {
  const emailData = getLS(EMAIL_KEY, null);
  const skipped = getLS(EMAIL_SKIPPED_KEY, false);
  const uses = getUses();

  // Only show after a couple of uses, and only if not already captured or skipped
  if (!emailData && !skipped && uses >= 2) {
    openEmailGate();
  }
}

// -----------------------------
// UPGRADE MODAL
// -----------------------------

let selectedTier = "pro";

function openUpgradeModal() {
  const overlay = $("#upgrade-modal");
  if (overlay) overlay.classList.add("open");
}

function closeUpgradeModal() {
  const overlay = $("#upgrade-modal");
  if (overlay) overlay.classList.remove("open");
}

function selectTier(tier) {
  selectedTier = tier;

  const tiers = ["pro", "team", "agency"];
  tiers.forEach(t => {
    const card = $("#tier-" + t);
    if (!card) return;
    if (t === tier) card.classList.add("selected");
    else card.classList.remove("selected");
  });
}

function handleUpgrade() {
  // For now, just open an email draft – you can wire Stripe later.
  const subject = encodeURIComponent("GrantScore Pro – Upgrade Inquiry");
  const body = encodeURIComponent(
    `Hi Terri,\n\nI'm interested in the ${selectedTier.toUpperCase()} tier of GrantScore Pro.\n\nOrganization:\nCurrent grant volume:\nIdeal start date:\n\nThanks!`
  );
  window.location.href = `mailto:hello@grantscorepro.com?subject=${subject}&body=${body}`;
}

// -----------------------------
// FUNDER DIRECTORY
// -----------------------------

const FUNDERS = [
  {
    name: "Z. Smith Reynolds Foundation",
    focus: "Equity, community, democracy, environmental justice",
    download: "https://www.zsr.org/"
  },
  {
    name: "Golden LEAF Foundation",
    focus: "Rural NC, economic development, workforce, agriculture",
    download: "https://goldenleaf.org/"
  },
  {
    name: "Kate B. Reynolds Charitable Trust",
    focus: "Health equity, low-income communities, NC",
    download: "https://kbr.org/"
  },
  {
    name: "NC Arts Council",
    focus: "Arts, culture, creative economy, statewide",
    download: "https://www.ncarts.org/"
  },
  {
    name: "United Way of Wayne County",
    focus: "Health, education, financial stability, Wayne County",
    download: "https://www.unitedwayne.org/"
  }
];

function renderFunders(list) {
  const wrap = $("#funder-list");
  if (!wrap) return;

  if (!list || list.length === 0) {
    wrap.innerHTML = `<div class="gap-card">No funders match your search. Try a broader term like "health" or "education".</div>`;
    return;
  }

  wrap.innerHTML = list
    .map(
      f => `
      <div class="funder-row">
        <div>
          <div class="funder-name">${f.name}</div>
          <div class="funder-focus">${f.focus}</div>
        </div>
        <a class="funder-dl" href="${f.download}" target="_blank" rel="noopener noreferrer">
          View Site →
        </a>
      </div>
    `
    )
    .join("");
}

function filterFunders() {
  const search = $("#funder-search")?.value.toLowerCase().trim() || "";
  if (!search) {
    renderFunders(FUNDERS);
    return;
  }

  const filtered = FUNDERS.filter(f => {
    return (
      f.name.toLowerCase().includes(search) ||
      f.focus.toLowerCase().includes(search)
    );
  });

  renderFunders(filtered);
}

// -----------------------------
// GRANT CALENDAR
// -----------------------------

const CAL_EVENTS = [
  {
    quarter: "Q1 – January–March",
    items: [
      "Federal: Many education and health NOFOs release in Q1.",
      "NC Foundations: Planning and LOI windows often open.",
      "Internal: Ideal time to map annual grant calendar."
    ]
  },
  {
    quarter: "Q2 – April–June",
    items: [
      "State & County: Budget cycles and RFPs ramp up.",
      "Corporate: CSR and sponsorship cycles often peak.",
      "Internal: Align proposals with fiscal year planning."
    ]
  },
  {
    quarter: "Q3 – July–September",
    items: [
      "Federal: Major deadlines for multi-year programs.",
      "NC Foundations: Many program grants due late summer.",
      "Internal: Prep reports and data for renewals."
    ]
  },
  {
    quarter: "Q4 – October–December",
    items: [
      "Year-End: Donor campaigns and matching opportunities.",
      "Planning: Build pipeline for next year’s submissions.",
      "Internal: Debrief wins/losses and refine strategy."
    ]
  }
];

function buildCalendar() {
  const grid = $("#cal-grid");
  if (!grid) return;

  grid.innerHTML = CAL_EVENTS.map(ev => {
    const items = ev.items
      .map(i => `<div class="cal-ev">${i}</div>`)
      .join("");
    return `
      <div class="cal-card">
        <div class="cal-q">${ev.quarter}</div>
        ${items}
      </div>
    `;
  }).join("");
}

// -----------------------------
// DOM READY
// -----------------------------

document.addEventListener("DOMContentLoaded", () => {
  // Initial page
  showPage("score");
  showScoreStep("input");

  // Build readiness sliders
  buildReadinessSliders();

  // Initial funder directory & calendar
  renderFunders(FUNDERS);
  buildCalendar();

  // Usage + email gate
  updateUsageBadge();
  checkEmailGate();
});
