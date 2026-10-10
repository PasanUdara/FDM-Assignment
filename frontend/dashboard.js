const STORAGE_KEY = "nexbank_dash_applications";

const defaultApplications = [
  { id: "APP-2026-1001", date: "Jun 28, 2026", amount: 25000, risk: "Low Risk", status: "Approved" },
  { id: "APP-2026-1002", date: "Jun 27, 2026", amount: 50000, risk: "High Risk", status: "Rejected" },
  { id: "APP-2026-1003", date: "Jun 27, 2026", amount: 15000, risk: "Medium Risk", status: "Pending" },
  { id: "APP-2026-1004", date: "Jun 26, 2026", amount: 30000, risk: "Low Risk", status: "Approved" },
  { id: "APP-2026-1005", date: "Jun 26, 2026", amount: 45000, risk: "Medium Risk", status: "Pending" }
];

function getApplications() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [...defaultApplications];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length ? parsed : [...defaultApplications];
  } catch (error) {
    return [...defaultApplications];
  }
}

function saveApplications(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function riskClass(risk) {
  return risk.toLowerCase().includes("high") ? "high" : risk.toLowerCase().includes("medium") ? "medium" : "low";
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function updateMetrics(applications) {
  const total = applications.length;
  const approved = applications.filter((item) => item.status === "Approved").length;
  const approvalRate = Math.round((approved / total) * 100) || 0;
  const highRisk = applications.filter((item) => item.risk.toLowerCase().includes("high")).length;
  const lowRisk = applications.filter((item) => item.risk.toLowerCase().includes("low")).length;

  document.getElementById("totalApplications").textContent = total.toLocaleString();
  document.getElementById("approvalRate").textContent = `${approvalRate}%`;
  document.getElementById("avgDefaultRisk").textContent = `${Math.max(8, 18 - highRisk)}%`;
  document.getElementById("highRiskCount").textContent = highRisk.toString();

  const totalLow = lowRisk;
  const totalMedium = applications.filter((item) => item.risk.toLowerCase().includes("medium")).length;
  const totalHigh = highRisk;
  const donut = document.getElementById("riskDonut");
  const safeTotal = totalLow + totalMedium + totalHigh || 1;
  const lowPercent = (totalLow / safeTotal) * 100;
  const mediumPercent = (totalMedium / safeTotal) * 100;
  const highPercent = (totalHigh / safeTotal) * 100;

  donut.style.setProperty("--segments", `conic-gradient(#1fb7a2 0 ${lowPercent}%, #f0b65b ${lowPercent}% ${lowPercent + mediumPercent}%, #ec5d59 ${lowPercent + mediumPercent}% 100%)`);
  document.getElementById("riskTotal").textContent = total.toLocaleString();
  document.getElementById("lowRiskCount").textContent = totalLow.toString();
  document.getElementById("mediumRiskCount").textContent = totalMedium.toString();
  document.getElementById("highRiskCountLabel").textContent = totalHigh.toString();
}

function renderTable(applications) {
  const tbody = document.getElementById("appTableBody");
  if (!tbody) return;

  tbody.innerHTML = applications.map((item) => `
    <tr>
      <td>${item.id}</td>
      <td>${item.date}</td>
      <td>${formatCurrency(item.amount)}</td>
      <td><span class="badge ${riskClass(item.risk)}">${item.risk}</span></td>
      <td><span class="status-pill ${item.status.toLowerCase()}">${item.status}</span></td>
      <td><a href="assessment.html" class="action-link">View Details →</a></td>
    </tr>
  `).join("");
}

function initDashboard() {
  const appData = getApplications();
  saveApplications(appData);
  updateMetrics(appData);
  renderTable(appData);
}

document.addEventListener("DOMContentLoaded", initDashboard);
