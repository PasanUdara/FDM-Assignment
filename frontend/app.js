const API_URL = "http://127.0.0.1:8000/predict";
const form = document.querySelector("#assessment-form");
const error = document.querySelector("#form-error");
const submit = document.querySelector("#submit-button");

const sample = {person_age:32,person_income:65000,person_home_ownership:"RENT",person_emp_length:5,loan_intent:"PERSONAL",loan_amnt:12000,loan_percent_income:.18,cb_person_default_on_file:"N",cb_person_cred_hist_length:9,loan_term_months:36,employment_type:"Full-time",education_level:"Bachelor",marital_status:"Single",num_dependents:1,credit_score:690,credit_utilization_pct:28,num_open_accounts:5,num_late_payments_24m:0,num_hard_inquiries_6m:1,existing_monthly_debt:450,savings_balance:6000,has_co_applicant:false,monthly_income:5416.67,est_monthly_payment:390,total_interest_cost:2100,debt_to_income_ratio:.19};

function numericValue(name) {
	const value = Number(form.elements[name].value);
	return Number.isFinite(value) ? value : null;
}

function setRatio(name, value) {
	form.elements[name].value = value === null ? "" : value.toFixed(4);
}

function updateCalculatedFields() {
	const annualIncome = numericValue("person_income");
	const loanAmount = numericValue("loan_amnt");
	const monthlyIncome = numericValue("monthly_income") ?? (annualIncome === null ? null : annualIncome / 12);
	const monthlyDebt = numericValue("existing_monthly_debt") ?? 0;
	const monthlyPayment = numericValue("est_monthly_payment") ?? 0;

	setRatio(
		"loan_percent_income",
		annualIncome !== null && annualIncome > 0 && loanAmount !== null ? loanAmount / annualIncome : null,
	);
	setRatio(
		"debt_to_income_ratio",
		monthlyIncome !== null && monthlyIncome > 0 && (monthlyDebt > 0 || monthlyPayment > 0)
			? (monthlyDebt + monthlyPayment) / monthlyIncome
			: null,
	);
}

function setSample() {
	Object.entries(sample).forEach(([key, value]) => {
		const input = form.elements[key];
		if (input) input.value = String(value);
	});
	updateCalculatedFields();
	error.textContent = "";
}

function formData() {
	const payload = {};
	for (const [key, value] of new FormData(form)) {
		if (value !== "") payload[key] = value;
	}
	const numbers = ["person_age","person_income","person_emp_length","loan_amnt","loan_percent_income","cb_person_cred_hist_length","loan_term_months","num_dependents","credit_score","credit_utilization_pct","num_open_accounts","num_late_payments_24m","num_hard_inquiries_6m","existing_monthly_debt","savings_balance","monthly_income","est_monthly_payment","total_interest_cost","debt_to_income_ratio"];
	numbers.forEach(key => { if (key in payload) payload[key] = Number(payload[key]); });
	payload.has_co_applicant = payload.has_co_applicant === "true";
	return payload;
}

function showResult(data) {
	document.querySelector("#empty-result").hidden = true;
	document.querySelector("#assessment-result").hidden = false;
	document.querySelector("#result-status").textContent = "Assessment complete";
	document.querySelector("#result-status").className = "pending-pill";
	document.querySelector("#probability").textContent = `${data.default_probability_percent.toFixed(1)}%`;
	const badge = document.querySelector("#risk-badge");
	badge.textContent = `${data.risk_level} risk`;
	badge.className = `risk-${data.risk_level.toLowerCase()}`;
	document.querySelector("#meter-fill").style.width = `${100 - data.default_probability_percent}%`;
	document.querySelector("#recommendation").textContent = data.recommendation;
	document.querySelector("#model-name").textContent = data.model;
	document.querySelector("#disclaimer").textContent = data.disclaimer;
}

const calculatedInputSources = ["person_income", "loan_amnt", "monthly_income", "existing_monthly_debt", "est_monthly_payment"];
calculatedInputSources.forEach(name => {
	form.elements[name].addEventListener("input", updateCalculatedFields);
	form.elements[name].addEventListener("change", updateCalculatedFields);
});
updateCalculatedFields();
form.addEventListener("submit", async event => {
	event.preventDefault();
	updateCalculatedFields();
	error.textContent = "";
	if (!form.checkValidity()) { form.reportValidity(); return; }
	submit.disabled = true;
	submit.querySelector("span").textContent = "Assessing…";
	try {
		const response = await fetch(API_URL, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(formData())});
		const data = await response.json();
		if (!response.ok) throw new Error(data.detail?.[0]?.msg || "The assessment could not be completed.");
		showResult(data);
	} catch (err) {
		error.textContent = err.message.includes("fetch") ? "Unable to reach the backend. Start the FastAPI service, then try again." : err.message;
	} finally {
		submit.disabled = false;
		submit.querySelector("span").textContent = "Assess default risk";
	}
});

document.querySelector("#sample-button").addEventListener("click", setSample);
document.querySelector("#new-assessment").addEventListener("click", () => {
	form.reset();
	updateCalculatedFields();
	document.querySelector("#assessment-result").hidden = true;
	document.querySelector("#empty-result").hidden = false;
	document.querySelector("#result-status").textContent = "Waiting for details";
	window.scrollTo({top:0, behavior:"smooth"});
});
