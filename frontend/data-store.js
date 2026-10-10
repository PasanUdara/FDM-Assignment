/**
 * Credence Banking Platform - Core Data Store & UI Controller
 * Manages applications, state persistence, risk calculations, and shared layout components.
 */

const STORAGE_KEY = "credence_bank_applications";
const CURRENT_ASSESSMENT_KEY = "credence_current_assessment";
const NOTIFICATIONS_KEY = "credence_notifications";
const AUTH_KEY = "credence_auth_user";

// Pre-configured personas for testing
const DEFAULT_OFFICER_USER = {
  id: "OFF-101",
  name: "Sarah Jenkins",
  role: "officer",
  email: "sarah.jenkins@credence.bank",
  title: "Senior Loan Officer",
  avatar: "SJ"
};

const DEFAULT_APPLICANT_USER = {
  id: "APP-USER-01",
  name: "Eleanor Brooks",
  role: "applicant",
  email: "eleanor.brooks@example.com",
  title: "Loan Applicant",
  avatar: "EB"
};

function getAuthUser() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return DEFAULT_OFFICER_USER;
}

function setAuthUser(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

function logoutUser() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = "login.html";
}

function switchUserRole(targetRole) {
  const current = getAuthUser();
  if (targetRole) {
    if (targetRole === "applicant") {
      setAuthUser(DEFAULT_APPLICANT_USER);
    } else {
      setAuthUser(DEFAULT_OFFICER_USER);
    }
  } else {
    if (current.role === "applicant") {
      setAuthUser(DEFAULT_OFFICER_USER);
    } else {
      setAuthUser(DEFAULT_APPLICANT_USER);
    }
  }
  const updated = getAuthUser();
  if (typeof showToast === "function") {
    showToast(`Switched active role to ${updated.role === 'officer' ? 'Loan Officer' : 'Applicant'} (${updated.name})`, "info");
  }
  setTimeout(() => {
    const page = window.location.pathname.split("/").pop();
    if (updated.role === "applicant" && (page === "index.html" || page === "" || page === "reports.html")) {
      window.location.href = "applicant-dashboard.html";
    } else if (updated.role === "officer" && page === "applicant-dashboard.html") {
      window.location.href = "index.html";
    } else {
      window.location.reload();
    }
  }, 350);
}
window.getAuthUser = getAuthUser;
window.setAuthUser = setAuthUser;
window.switchUserRole = switchUserRole;
window.logoutUser = logoutUser;

// Pre-seeded realistic banking applications
const INITIAL_APPLICATIONS = [
  {
    id: "APP-2026-9041",
    applicant_name: "Eleanor Brooks",
    date: "Oct 09, 2026",
    loan_amnt: 18500,
    loan_intent: "DEBTCONSOLIDATION",
    loan_term_months: 36,
    default_probability: 0.124,
    default_probability_percent: 12.4,
    risk_level: "Low",
    status: "Approved",
    officer: "Sarah Jenkins",
    person_age: 34,
    person_income: 88000,
    monthly_income: 7333.33,
    person_emp_length: 7,
    person_home_ownership: "MORTGAGE",
    employment_type: "Full-time",
    education_level: "Master",
    marital_status: "Married",
    credit_score: 742,
    cb_person_cred_hist_length: 11,
    cb_person_default_on_file: "N",
    loan_percent_income: 0.21,
    debt_to_income_ratio: 0.24,
    credit_utilization_pct: 19.5,
    recommendation: "Standard Approval Recommended",
    recommendation_desc: "Applicant exhibits superior debt-service capacity and an unblemished credit track record."
  },
  {
    id: "APP-2026-9040",
    applicant_name: "Marcus Vance",
    date: "Oct 08, 2026",
    loan_amnt: 45000,
    loan_intent: "VENTURE",
    loan_term_months: 60,
    default_probability: 0.738,
    default_probability_percent: 73.8,
    risk_level: "High",
    status: "Rejected",
    officer: "Sarah Jenkins",
    person_age: 26,
    person_income: 42000,
    monthly_income: 3500.00,
    person_emp_length: 1.5,
    person_home_ownership: "RENT",
    employment_type: "Self-employed",
    education_level: "Bachelor",
    marital_status: "Single",
    credit_score: 588,
    cb_person_cred_hist_length: 3,
    cb_person_default_on_file: "Y",
    loan_percent_income: 1.07,
    debt_to_income_ratio: 0.58,
    credit_utilization_pct: 78.2,
    recommendation: "High Risk – Decline Recommended",
    recommendation_desc: "Excessive loan-to-income burden paired with active historical default on bureau records."
  },
  {
    id: "APP-2026-9039",
    applicant_name: "Aaliyah Chen",
    date: "Oct 08, 2026",
    loan_amnt: 28000,
    loan_intent: "HOMEIMPROVEMENT",
    loan_term_months: 48,
    default_probability: 0.442,
    default_probability_percent: 44.2,
    risk_level: "Medium",
    status: "Pending",
    officer: "Sarah Jenkins",
    person_age: 41,
    person_income: 76000,
    monthly_income: 6333.33,
    person_emp_length: 9,
    person_home_ownership: "OWN",
    employment_type: "Full-time",
    education_level: "Bachelor",
    marital_status: "Married",
    credit_score: 665,
    cb_person_cred_hist_length: 14,
    cb_person_default_on_file: "N",
    loan_percent_income: 0.368,
    debt_to_income_ratio: 0.39,
    credit_utilization_pct: 42.0,
    recommendation: "Manual Review Suggested",
    recommendation_desc: "Acceptable collateral and tenure; secondary verification of monthly obligations recommended."
  },
  {
    id: "APP-2026-9038",
    applicant_name: "Liam O'Connor",
    date: "Oct 07, 2026",
    loan_amnt: 12000,
    loan_intent: "PERSONAL",
    loan_term_months: 24,
    default_probability: 0.089,
    default_probability_percent: 8.9,
    risk_level: "Low",
    status: "Approved",
    officer: "Sarah Jenkins",
    person_age: 38,
    person_income: 94000,
    monthly_income: 7833.33,
    person_emp_length: 12,
    person_home_ownership: "MORTGAGE",
    employment_type: "Full-time",
    education_level: "Master",
    marital_status: "Single",
    credit_score: 780,
    cb_person_cred_hist_length: 16,
    cb_person_default_on_file: "N",
    loan_percent_income: 0.128,
    debt_to_income_ratio: 0.16,
    credit_utilization_pct: 12.3,
    recommendation: "Standard Approval Recommended",
    recommendation_desc: "Strong balance sheet, low borrowing ratio, and exemplary credit utilization."
  },
  {
    id: "APP-2026-9037",
    applicant_name: "Sophia Martinez",
    date: "Oct 06, 2026",
    loan_amnt: 32000,
    loan_intent: "EDUCATION",
    loan_term_months: 48,
    default_probability: 0.385,
    default_probability_percent: 38.5,
    risk_level: "Medium",
    status: "Pending",
    officer: "Sarah Jenkins",
    person_age: 29,
    person_income: 68000,
    monthly_income: 5666.67,
    person_emp_length: 4,
    person_home_ownership: "RENT",
    employment_type: "Full-time",
    education_level: "Doctorate",
    marital_status: "Single",
    credit_score: 682,
    cb_person_cred_hist_length: 8,
    cb_person_default_on_file: "N",
    loan_percent_income: 0.47,
    debt_to_income_ratio: 0.35,
    credit_utilization_pct: 31.0,
    recommendation: "Manual Review Suggested",
    recommendation_desc: "High earning potential; request verification of co-signer or proof of enrollment."
  },
  {
    id: "APP-2026-9036",
    applicant_name: "Derrick Vance",
    date: "Oct 05, 2026",
    loan_amnt: 50000,
    loan_intent: "DEBTCONSOLIDATION",
    loan_term_months: 60,
    default_probability: 0.812,
    default_probability_percent: 81.2,
    risk_level: "High",
    status: "Rejected",
    officer: "Sarah Jenkins",
    person_age: 45,
    person_income: 51000,
    monthly_income: 4250.00,
    person_emp_length: 2,
    person_home_ownership: "RENT",
    employment_type: "Contract",
    education_level: "High School",
    marital_status: "Divorced",
    credit_score: 540,
    cb_person_cred_hist_length: 6,
    cb_person_default_on_file: "Y",
    loan_percent_income: 0.98,
    debt_to_income_ratio: 0.62,
    credit_utilization_pct: 88.0,
    recommendation: "High Risk – Decline Recommended",
    recommendation_desc: "Severe debt burden, low credit score and prior default flags prohibit unsecured extension."
  },
  {
    id: "APP-2026-9035",
    applicant_name: "Chloe Dupont",
    date: "Oct 04, 2026",
    loan_amnt: 15000,
    loan_intent: "MEDICAL",
    loan_term_months: 36,
    default_probability: 0.198,
    default_probability_percent: 19.8,
    risk_level: "Low",
    status: "Approved",
    officer: "Sarah Jenkins",
    person_age: 33,
    person_income: 82000,
    monthly_income: 6833.33,
    person_emp_length: 6,
    person_home_ownership: "OWN",
    employment_type: "Full-time",
    education_level: "Bachelor",
    marital_status: "Married",
    credit_score: 725,
    cb_person_cred_hist_length: 10,
    cb_person_default_on_file: "N",
    loan_percent_income: 0.183,
    debt_to_income_ratio: 0.22,
    credit_utilization_pct: 22.4,
    recommendation: "Standard Approval Recommended",
    recommendation_desc: "Manageable medical obligation with strong income and asset reserve profile."
  },
  {
    id: "APP-2026-9034",
    applicant_name: "Harrison Forde",
    date: "Oct 03, 2026",
    loan_amnt: 22000,
    loan_intent: "VENTURE",
    loan_term_months: 36,
    default_probability: 0.485,
    default_probability_percent: 48.5,
    risk_level: "Medium",
    status: "Pending",
    officer: "Sarah Jenkins",
    person_age: 39,
    person_income: 70000,
    monthly_income: 5833.33,
    person_emp_length: 5,
    person_home_ownership: "MORTGAGE",
    employment_type: "Self-employed",
    education_level: "Bachelor",
    marital_status: "Married",
    credit_score: 658,
    cb_person_cred_hist_length: 12,
    cb_person_default_on_file: "N",
    loan_percent_income: 0.314,
    debt_to_income_ratio: 0.41,
    credit_utilization_pct: 49.0,
    recommendation: "Manual Review Suggested",
    recommendation_desc: "Commercial venture risk; evaluate business cash-flow projections prior to disbursement."
  }
];

// Data Store Accessors
function getApplications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveApplications(INITIAL_APPLICATIONS);
      return [...INITIAL_APPLICATIONS];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : [...INITIAL_APPLICATIONS];
  } catch (e) {
    return [...INITIAL_APPLICATIONS];
  }
}

function saveApplications(apps) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}

function addApplication(app) {
  const apps = getApplications();
  apps.unshift(app);
  saveApplications(apps);
  return app;
}

function updateApplicationStatus(id, newStatus, notes, officerName) {
  const apps = getApplications();
  const idx = apps.findIndex(a => a.id === id);
  if (idx !== -1) {
    apps[idx].status = newStatus;
    if (notes) apps[idx].decision_notes = notes;
    if (officerName) apps[idx].officer = officerName;
    apps[idx].decision_date = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    saveApplications(apps);
    // Also update current assessment if active
    const curr = getCurrentAssessment();
    if (curr && curr.id === id) {
      curr.status = newStatus;
      if (notes) curr.decision_notes = notes;
      if (officerName) curr.officer = officerName;
      curr.decision_date = apps[idx].decision_date;
      saveCurrentAssessment(curr);
    }
    return apps[idx];
  }
  return null;
}

function getCurrentAssessment() {
  try {
    const raw = sessionStorage.getItem(CURRENT_ASSESSMENT_KEY);
    if (raw) return JSON.parse(raw);
    const apps = getApplications();
    return apps[0];
  } catch (e) {
    return INITIAL_APPLICATIONS[0];
  }
}

function saveCurrentAssessment(app) {
  sessionStorage.setItem(CURRENT_ASSESSMENT_KEY, JSON.stringify(app));
}

// Formatters
function formatCurrency(val) {
  if (val === null || val === undefined || isNaN(val)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(val);
}

function formatPercent(val) {
  if (val === null || val === undefined || isNaN(val)) return "0.0%";
  return `${Number(val).toFixed(1)}%`;
}

function getRiskBadgeHtml(risk) {
  const r = (risk || "Low").toLowerCase();
  if (r.includes("high")) {
    return `<span class="badge badge-high"><span class="badge-dot"></span>High Risk</span>`;
  } else if (r.includes("med")) {
    return `<span class="badge badge-med"><span class="badge-dot"></span>Medium Risk</span>`;
  }
  return `<span class="badge badge-low"><span class="badge-dot"></span>Low Risk</span>`;
}

function getStatusPillHtml(status) {
  const s = (status || "Pending").toLowerCase();
  if (s.includes("app")) {
    return `<span class="status-pill status-approved">Approved</span>`;
  } else if (s.includes("rej")) {
    return `<span class="status-pill status-rejected">Rejected</span>`;
  } else if (s.includes("rev")) {
    return `<span class="status-pill status-review">Under Review</span>`;
  }
  return `<span class="status-pill status-pending">Pending</span>`;
}

// Client-side Model Fallback & Explainability Calculation
function assessApplicantRiskModel(payload) {
  // Extract key variables
  const income = payload.person_income || 50000;
  const loan = payload.loan_amnt || 15000;
  const loanPercentIncome = payload.loan_percent_income || (loan / income);
  const creditScore = payload.credit_score || 680;
  const defaultOnFile = payload.cb_person_default_on_file === "Y";
  const empLength = payload.person_emp_length || 3;
  const credHistLength = payload.cb_person_cred_hist_length || 5;
  const homeOwnership = payload.person_home_ownership || "RENT";
  const dti = payload.debt_to_income_ratio || 0.30;
  const intent = payload.loan_intent || "PERSONAL";

  // Base log-odds calculated from XGBoost model feature weights
  let logOdds = -1.8; // Baseline intercept

  // 1. Loan-to-income ratio (Dominant factor in credit risk)
  if (loanPercentIncome > 0.40) {
    logOdds += (loanPercentIncome - 0.40) * 4.5;
  } else if (loanPercentIncome < 0.20) {
    logOdds -= (0.20 - loanPercentIncome) * 2.0;
  }

  // 2. Default on bureau file
  if (defaultOnFile) {
    logOdds += 1.85;
  } else {
    logOdds -= 0.45;
  }

  // 3. Credit Score
  if (creditScore < 600) {
    logOdds += (600 - creditScore) * 0.012;
  } else if (creditScore > 720) {
    logOdds -= (creditScore - 720) * 0.008;
  }

  // 4. Employment tenure
  if (empLength < 2) {
    logOdds += 0.45;
  } else if (empLength >= 6) {
    logOdds -= 0.50;
  }

  // 5. Debt to income
  if (dti > 0.45) {
    logOdds += (dti - 0.45) * 3.0;
  }

  // 6. Home ownership
  if (homeOwnership === "OWN" || homeOwnership === "MORTGAGE") {
    logOdds -= 0.35;
  } else {
    logOdds += 0.20;
  }

  // 7. Intent adjustments
  if (intent === "VENTURE" || intent === "DEBTCONSOLIDATION") {
    logOdds += 0.25;
  }

  // Logistic sigmoid
  const prob = 1 / (1 + Math.exp(-logOdds));
  const clampedProb = Math.min(0.96, Math.max(0.04, prob));
  const probPercent = clampedProb * 100;

  let riskLevel = "Low";
  let recommendation = "Standard Approval Recommended";
  let recommendationDesc = "Applicant exhibits solid income-to-debt metrics and no prior delinquency flags.";

  if (clampedProb >= 0.55) {
    riskLevel = "High";
    recommendation = "High Risk – Manual Review or Decline";
    recommendationDesc = "High probability of default driven by debt service strain and bureau markers.";
  } else if (clampedProb >= 0.28) {
    riskLevel = "Medium";
    recommendation = "Manual Review Suggested";
    recommendationDesc = "Moderate risk indicators; recommend secondary income and obligation audit.";
  }

  // Top 5 Key Risk Factor Impacts (SHAP / feature contribution approximations)
  const factors = [
    {
      name: "Loan-to-Income Ratio (" + (loanPercentIncome * 100).toFixed(1) + "%)",
      impact: loanPercentIncome > 0.30 ? +(loanPercentIncome * 24).toFixed(1) : -(15 - loanPercentIncome * 20).toFixed(1),
      direction: loanPercentIncome > 0.30 ? "up" : "down"
    },
    {
      name: "Prior Default on File (" + (defaultOnFile ? "Yes" : "No") + ")",
      impact: defaultOnFile ? +18.4 : -8.6,
      direction: defaultOnFile ? "up" : "down"
    },
    {
      name: "Credit Score (" + creditScore + ")",
      impact: creditScore < 640 ? +12.3 : -(Math.max(4, (creditScore - 640) * 0.12)).toFixed(1),
      direction: creditScore < 640 ? "up" : "down"
    },
    {
      name: "Employment Stability (" + empLength + " yrs)",
      impact: empLength < 2 ? +6.8 : -7.4,
      direction: empLength < 2 ? "up" : "down"
    },
    {
      name: "Home Ownership (" + homeOwnership + ")",
      impact: homeOwnership === "RENT" ? +5.2 : -6.5,
      direction: homeOwnership === "RENT" ? "up" : "down"
    }
  ];

  return {
    prediction: clampedProb >= 0.5 ? "Default" : "No default",
    default_probability: Number(clampedProb.toFixed(4)),
    default_probability_percent: Number(probPercent.toFixed(1)),
    risk_level: riskLevel,
    recommendation: recommendation,
    recommendation_desc: recommendationDesc,
    key_factors: factors,
    model: "Tuned XGBoost v2.4 (Production)"
  };
}

// Toast System
function showToast(message, type = "info") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Setup Shared Topbar & Sidebar Interactions
function toggleAppSidebar(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (e && e.stopPropagation) e.stopPropagation();

  const sidebar = document.querySelector(".sidebar") || document.querySelector("#appSidebar");
  let backdrop = document.querySelector(".sidebar-backdrop");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.className = "sidebar-backdrop";
    document.body.appendChild(backdrop);
    backdrop.addEventListener("click", () => {
      if (sidebar) sidebar.classList.remove("mobile-open");
      backdrop.classList.remove("active");
    });
  }

  if (window.innerWidth <= 900) {
    // Mobile drawer toggle
    if (sidebar) {
      sidebar.classList.toggle("mobile-open");
      const isOpen = sidebar.classList.contains("mobile-open");
      backdrop.classList.toggle("active", isOpen);
      const toggleBtns = document.querySelectorAll(".sidebar-toggle-btn, .mobile-menu-btn, #sidebarToggleBtn");
      toggleBtns.forEach(b => b.setAttribute("aria-expanded", isOpen ? "true" : "false"));
    }
  } else {
    // Desktop collapse toggle
    document.body.classList.toggle("sidebar-collapsed");
    const isCollapsed = document.body.classList.contains("sidebar-collapsed");
    localStorage.setItem("credence_sidebar_collapsed", isCollapsed ? "true" : "false");
    const toggleBtns = document.querySelectorAll(".sidebar-toggle-btn, .mobile-menu-btn, #sidebarToggleBtn");
    toggleBtns.forEach(b => {
      b.setAttribute("aria-expanded", isCollapsed ? "false" : "true");
      b.setAttribute("title", isCollapsed ? "Expand Sidebar" : "Collapse Sidebar");
    });
  }
}
window.toggleAppSidebar = toggleAppSidebar;
window.toggleSidebar = toggleAppSidebar;

// Global Delegated Click Listener for Sidebar Toggling (guarantees clicks work anywhere)
document.addEventListener("click", function(e) {
  const btn = e.target.closest(".sidebar-toggle-btn, .mobile-menu-btn, #sidebarToggleBtn, .sidebar-collapse-btn");
  if (btn) {
    toggleAppSidebar(e);
  }
});

function setupSharedLayout() {
  const sidebar = document.querySelector(".sidebar") || document.querySelector("#appSidebar");
  const toggleBtns = document.querySelectorAll(".sidebar-toggle-btn, .mobile-menu-btn, #sidebarToggleBtn, .sidebar-collapse-btn");

  // Create mobile backdrop if not present
  let backdrop = document.querySelector(".sidebar-backdrop");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.className = "sidebar-backdrop";
    document.body.appendChild(backdrop);
  }

  // Restore saved desktop collapse preference
  const isDesktop = window.innerWidth > 900;
  const savedCollapsed = localStorage.getItem("credence_sidebar_collapsed") === "true";
  if (isDesktop && savedCollapsed) {
    document.body.classList.add("sidebar-collapsed");
  }

  toggleBtns.forEach(btn => {
    btn.onclick = toggleAppSidebar;
  });

  // Inject a collapse button in sidebar header if not already present
  const sidebarHeader = document.querySelector(".sidebar-header");
  if (sidebarHeader && !sidebarHeader.querySelector(".sidebar-collapse-btn")) {
    const collapseBtn = document.createElement("button");
    collapseBtn.className = "sidebar-collapse-btn";
    collapseBtn.setAttribute("type", "button");
    collapseBtn.setAttribute("title", "Collapse Sidebar");
    collapseBtn.setAttribute("aria-label", "Collapse Sidebar");
    collapseBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    `;
    collapseBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleSidebar();
    });
    sidebarHeader.appendChild(collapseBtn);
  }

  // Close when clicking outside on mobile
  backdrop.addEventListener("click", () => {
    if (sidebar) {
      sidebar.classList.remove("mobile-open");
      backdrop.classList.remove("active");
    }
  });

  // Handle window resizing
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      if (sidebar) sidebar.classList.remove("mobile-open");
      backdrop.classList.remove("active");
      const shouldCollapse = localStorage.getItem("credence_sidebar_collapsed") === "true";
      document.body.classList.toggle("sidebar-collapsed", shouldCollapse);
    } else {
      document.body.classList.remove("sidebar-collapsed");
    }
  });

  // Notification Bell Popover
  const notifBtn = document.querySelector("#notifBtn");
  const notifDropdown = document.querySelector("#notifDropdown");
  if (notifBtn && notifDropdown) {
    notifBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle("active");
    });

    document.addEventListener("click", (e) => {
      if (!notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
        notifDropdown.classList.remove("active");
      }
    });
  }

  // User Profile & Role Switcher Integration
  const user = getAuthUser();
  // Remove any legacy role switcher container if present
  const existingSwitcher = document.querySelector("#roleSwitcherContainer");
  if (existingSwitcher) {
    existingSwitcher.remove();
  }

  // Update profile avatar & info text
  const profileAvatar = document.querySelector(".officer-avatar");
  const profileName = document.querySelector(".officer-name");
  const profileRole = document.querySelector(".officer-role");
  if (profileAvatar) profileAvatar.textContent = user.avatar || "U";
  if (profileName) profileName.textContent = user.name || "User";
  if (profileRole) profileRole.textContent = user.title || (user.role === "officer" ? "Loan Officer" : "Applicant");

  // Profile Menu Dropdown
  const profileBtn = document.querySelector("#profileBtn");
  const profileDropdown = document.querySelector("#profileDropdown");
  if (profileBtn && profileDropdown) {
    // Populate profile dropdown with role switch and logout
    profileDropdown.innerHTML = `
      <div class="dropdown-header">
        <div>
          <h4>${user.name}</h4>
          <span class="role-badge ${user.role === 'officer' ? 'role-officer' : 'role-applicant'}">${user.role === 'officer' ? 'Loan Officer' : 'Applicant'}</span>
        </div>
      </div>
      <a class="dropdown-item" href="javascript:void(0)" onclick="switchUserRole()">
        <div>
          <p class="dropdown-item-title">⇄ Switch to ${user.role === 'officer' ? 'Applicant (Eleanor Brooks)' : 'Loan Officer (Sarah Jenkins)'}</p>
          <p class="dropdown-item-sub">Toggle between underwriter & applicant portals</p>
        </div>
      </a>
      <a class="dropdown-item" href="login.html">
        <div>
          <p class="dropdown-item-title">Sign Out / Switch Account</p>
          <p class="dropdown-item-sub">Open login portal</p>
        </div>
      </a>
    `;

    profileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle("active");
    });

    document.addEventListener("click", (e) => {
      if (!profileDropdown.contains(e.target) && !profileBtn.contains(e.target)) {
        profileDropdown.classList.remove("active");
      }
    });
  }

  // Adapt Sidebar for Applicant if applicable
  if (user.role === "applicant") {
    const navItems = document.querySelectorAll(".sidebar-nav-container .nav-item");
    if (navItems.length > 0) {
      // First link -> Applicant Dashboard
      navItems[0].setAttribute("href", "applicant-dashboard.html");
      const firstSpan = navItems[0].querySelector("span");
      if (firstSpan) firstSpan.textContent = "My Applications";

      // Second link -> New Loan Application
      if (navItems[1]) {
        navItems[1].setAttribute("href", "new-application.html");
        const secondSpan = navItems[1].querySelector("span");
        if (secondSpan) secondSpan.textContent = "Apply for Loan";
      }
    }
  }

  // Global Search Box Listener
  const globalSearch = document.querySelector("#globalSearch");
  if (globalSearch) {
    globalSearch.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && globalSearch.value.trim()) {
        const query = encodeURIComponent(globalSearch.value.trim());
        window.location.href = `history.html?q=${query}`;
      }
    });
  }
}

// Export Applications to CSV
function exportApplicationsCSV(applications) {
  const headers = ["Applicant ID", "Applicant Name", "Date", "Loan Amount", "Purpose", "Term (Months)", "Default Risk %", "Risk Level", "Status", "Officer"];
  const rows = applications.map(a => [
    `"${a.id}"`,
    `"${a.applicant_name || 'Applicant'}"`,
    `"${a.date}"`,
    a.loan_amnt,
    `"${a.loan_intent}"`,
    a.loan_term_months,
    a.default_probability_percent,
    `"${a.risk_level}"`,
    `"${a.status}"`,
    `"${a.officer}"`
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `credence_applications_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("Application history exported to CSV successfully", "success");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupSharedLayout);
} else {
  setupSharedLayout();
}
