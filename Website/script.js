const weights = { SS: 5, MS: 4, MM: 3, MI: 2, II: 1, SR: 0 };
const gradeOrder = Object.keys(weights);
const maxWeight = 6;

let rowCount = 0;
const tbody = document.getElementById("table-body");
const iraOutput = document.getElementById("ira");
const gpaOutput = document.getElementById("gpa");
const mediaOutput = document.getElementById("media");

let updateTimeout;
function debounceUpdate() {
  clearTimeout(updateTimeout);
  updateTimeout = setTimeout(updateStats, 150);
}

function createInput(grade) {
  const input = document.createElement("input");
  input.type = "number";
  input.min = 0;
  input.dataset.grade = grade;
  input.placeholder = grade;
  input.oninput = debounceUpdate;
  return input;
}

function addRow() {
  rowCount++;
  const tr = document.createElement("tr");

  const term = document.createElement("td");
  term.textContent = rowCount;
  term.className = "term-column";
  tr.appendChild(term);

  gradeOrder.forEach(grade => {
    const td = document.createElement("td");
    td.appendChild(createInput(grade));
    tr.appendChild(td);
  });

  const creditTd = document.createElement("td");
  creditTd.className = "credit-output";
  creditTd.textContent = "0";
  tr.appendChild(creditTd);

  tbody.appendChild(tr);
  updateStats();
}

function removeRow() {
  if (rowCount > 0) {
    tbody.removeChild(tbody.lastChild);
    rowCount--;
    updateStats();
  }
}

function calculateRow(row, index) {
  const inputs = row.querySelectorAll("input");
  const weight = Math.min(index + 1, maxWeight);
  let semesterCredits = 0;
  let weighted = 0, weightSum = 0, gpaSum = 0;

  inputs.forEach(input => {
    const value = parseFloat(input.value) || 0;
    const grade = input.dataset.grade;
    const gradeVal = weights[grade];
    weighted += value * weight * gradeVal;
    weightSum += value * weight;
    gpaSum += value * gradeVal;
    semesterCredits += value;
  });

  return { weighted, weightSum, gpaSum, semesterCredits };
}

function updateStats() {
  let totalWeighted = 0, totalWeight = 0, totalGPA = 0, totalCredits = 0;

  Array.from(tbody.children).forEach((row, index) => {
    const { weighted, weightSum, gpaSum, semesterCredits } = calculateRow(row, index);
    row.querySelector(".credit-output").textContent = semesterCredits;
    totalWeighted += weighted;
    totalWeight += weightSum;
    totalGPA += gpaSum;
    totalCredits += semesterCredits;
  });

  const ira = totalWeight ? totalWeighted / totalWeight : 0;
  const gpa = totalCredits ? (totalGPA / totalCredits) * 0.8 : 0;
  const media = gpa * 2.5;

  iraOutput.textContent = ira.toFixed(2);
  gpaOutput.textContent = gpa.toFixed(2);
  mediaOutput.textContent = media.toFixed(2);
}

function exportPDF() {
  // Hide interactive elements temporarily
  const elementsToHide = document.querySelectorAll(".header, .instruction, .table-actions");
  elementsToHide.forEach(el => el.style.display = "none");

  const element = document.getElementById("capture");
  html2pdf().set({
    margin: 0.5,
    filename: 'IRA-GPA-Report.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  }).from(element).save().then(() => {
    // Restore elements after PDF generation
    elementsToHide.forEach(el => el.style.display = "");
  });
}

let darkmode = localStorage.getItem("darkmode");
const themeSwitch = document.getElementById("theme-switch");

const enableDarkmode = () => {
  document.body.classList.add("darkmode");
  localStorage.setItem("darkmode", "active");
};

const disableDarkmode = () => {
  document.body.classList.remove("darkmode");
  localStorage.setItem("darkmode", null);
};

if (darkmode === "active") enableDarkmode();

themeSwitch.addEventListener("click", () => {
  darkmode = localStorage.getItem("darkmode");
  darkmode !== "active" ? enableDarkmode() : disableDarkmode();
});

window.exportPDF = exportPDF;
window.addRow = addRow;
window.removeRow = removeRow;
addRow();