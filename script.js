// -----------------------------
// SIMPLE STEP NAVIGATION SYSTEM
// -----------------------------
let currentStep = 0;
const steps = document.querySelectorAll(".step");
const nextButtons = document.querySelectorAll(".next-btn");
const backButtons = document.querySelectorAll(".back-btn");

function showStep(index) {
  steps.forEach((step, i) => {
    step.style.display = i === index ? "block" : "none";
  });
  currentStep = index;
}

// Initialize first step
showStep(0);

// Next buttons
nextButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    if (currentStep < steps.length - 1) {
      showStep(currentStep + 1);
    }
  });
});

// Back buttons
backButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    if (currentStep > 0) {
      showStep(currentStep - 1);
    }
  });
});

// -----------------------------
// FORM INPUT COLLECTION
// -----------------------------
function getFormValues() {
  return {
    orgName: document.getElementById("orgName")?.value || "",
    funder: document.getElementById("funder")?.value || "",
    amount: document.getElementById("amount")?.value || "",
    mission: document.getElementById("mission")?.value || "",
    readinessAnswers: Array.from(
      document.querySelectorAll("input[data-readiness]:checked")
    ).map(i => Number(i.value)),
    applicationAnswers: Array.from(
      document.querySelectorAll("input[data-application]:checked")
    ).map(i => Number(i.value))
  };
}

// -----------------------------
// SCORING LOGIC
// -----------------------------
function calculateScore() {
  const values = getFormValues();

  const readinessScore = values.readinessAnswers.reduce((a, b) => a + b, 0);
  const applicationScore = values.applicationAnswers.reduce((a, b) => a + b, 0);

  const totalScore = readinessScore + applicationScore;

  return {
    readinessScore,
    applicationScore,
    totalScore
  };
}

// -----------------------------
// RESULTS DISPLAY
// -----------------------------
const resultsBtn = document.getElementById("showResults");
const scoreBox = document.getElementById("scoreBox");

if (resultsBtn) {
  resultsBtn.addEventListener("click", () => {
    const scores = calculateScore();

    scoreBox.innerHTML = `
      <h2>Your Grant Readiness Score</h2>
      <p><strong>Readiness:</strong> ${scores.readinessScore}</p>
      <p><strong>Application Strength:</strong> ${scores.applicationScore}</p>
      <p><strong>Total Score:</strong> ${scores.totalScore}</p>
    `;

    showStep(steps.length - 1);
  });
}
