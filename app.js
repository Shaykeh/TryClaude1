const uploadArea = document.getElementById("uploadArea");
const fileInput = document.getElementById("fileInput");
const controls = document.getElementById("controls");
const chartType = document.getElementById("chartType");
const xAxis = document.getElementById("xAxis");
const yAxis = document.getElementById("yAxis");
const drawBtn = document.getElementById("drawBtn");
const chartContainer = document.getElementById("chartContainer");
const dataPreview = document.getElementById("dataPreview");
const previewTable = document.getElementById("previewTable");

let parsedData = { headers: [], rows: [] };
let currentChart = null;

// --- File upload handling ---

uploadArea.addEventListener("click", () => fileInput.click());

uploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadArea.classList.add("drag-over");
});

uploadArea.addEventListener("dragleave", () => {
  uploadArea.classList.remove("drag-over");
});

uploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadArea.classList.remove("drag-over");
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

fileInput.addEventListener("change", () => {
  if (fileInput.files[0]) handleFile(fileInput.files[0]);
});

function handleFile(file) {
  if (!file.name.toLowerCase().endsWith(".csv")) {
    alert("Please upload a CSV file.");
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    parsedData = parseCSV(e.target.result);
    if (parsedData.headers.length === 0) {
      alert("Could not parse CSV. Make sure it contains valid data.");
      return;
    }
    populateControls();
    autoSelectAxes();
    renderPreview();
    drawChart();
  };
  reader.readAsText(file);
}

// --- CSV parsing ---

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };

  const delimiter = detectDelimiter(lines[0]);
  const headers = parseLine(lines[0], delimiter);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i], delimiter);
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((h, idx) => (row[h] = values[idx]));
      rows.push(row);
    }
  }

  return { headers, rows };
}

function detectDelimiter(line) {
  const counts = { ",": 0, ";": 0, "\t": 0, "|": 0 };
  for (const ch of line) {
    if (ch in counts) counts[ch]++;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

function parseLine(line, delimiter) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === delimiter) {
        values.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
  }
  values.push(current.trim());
  return values;
}

// --- Column type detection ---

function isNumericColumn(header) {
  let numericCount = 0;
  const sample = parsedData.rows.slice(0, 50);
  for (const row of sample) {
    const val = row[header];
    if (val !== "" && val != null && !isNaN(Number(val))) {
      numericCount++;
    }
  }
  return numericCount > sample.length * 0.7;
}

// --- UI controls ---

function populateControls() {
  controls.classList.remove("hidden");

  xAxis.innerHTML = "";
  yAxis.innerHTML = "";

  parsedData.headers.forEach((h) => {
    xAxis.appendChild(new Option(h, h));
    yAxis.appendChild(new Option(h, h));
  });
}

function autoSelectAxes() {
  const numericCols = parsedData.headers.filter(isNumericColumn);
  const categoryCols = parsedData.headers.filter((h) => !isNumericColumn(h));

  // Pick the first category column for X, first numeric column for Y
  if (categoryCols.length > 0) {
    xAxis.value = categoryCols[0];
  } else {
    xAxis.value = parsedData.headers[0];
  }

  if (numericCols.length > 0) {
    yAxis.value = numericCols[0];
  } else {
    yAxis.value =
      parsedData.headers.length > 1
        ? parsedData.headers[1]
        : parsedData.headers[0];
  }

  // Auto-select chart type based on data
  const uniqueLabels = new Set(parsedData.rows.map((r) => r[xAxis.value]));
  if (uniqueLabels.size <= 8) {
    chartType.value = "bar";
  } else if (numericCols.length >= 2 && isNumericColumn(xAxis.value)) {
    chartType.value = "scatter";
  } else {
    chartType.value = "line";
  }
}

// --- Chart rendering ---

drawBtn.addEventListener("click", drawChart);

function generateColors(count) {
  const palette = [
    "#4361ee",
    "#f72585",
    "#4cc9f0",
    "#7209b7",
    "#3a0ca3",
    "#f77f00",
    "#06d6a0",
    "#ef476f",
    "#118ab2",
    "#ffd166",
  ];
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(palette[i % palette.length]);
  }
  return colors;
}

function drawChart() {
  const xCol = xAxis.value;
  const yCol = yAxis.value;
  const type = chartType.value;

  const labels = parsedData.rows.map((r) => r[xCol]);
  const values = parsedData.rows.map((r) => Number(r[yCol]));
  const colors = generateColors(labels.length);

  chartContainer.classList.remove("hidden");

  if (currentChart) {
    currentChart.destroy();
  }

  const ctx = document.getElementById("chart").getContext("2d");

  const datasets = [];

  if (type === "scatter") {
    datasets.push({
      label: `${xCol} vs ${yCol}`,
      data: parsedData.rows.map((r) => ({
        x: Number(r[xCol]),
        y: Number(r[yCol]),
      })),
      backgroundColor: colors[0],
      pointRadius: 5,
    });
  } else {
    datasets.push({
      label: yCol,
      data: values,
      backgroundColor:
        type === "pie" || type === "doughnut" ? colors : colors[0],
      borderColor:
        type === "line" ? colors[0] : undefined,
      borderWidth: type === "line" ? 2 : 1,
      fill: type === "line" ? false : undefined,
      tension: type === "line" ? 0.3 : undefined,
    });
  }

  const config = {
    type,
    data: {
      labels: type === "scatter" ? undefined : labels,
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: type === "pie" || type === "doughnut",
        },
        title: {
          display: true,
          text: `${yCol} by ${xCol}`,
          font: { size: 16 },
        },
      },
      scales:
        type === "pie" || type === "doughnut"
          ? {}
          : {
              x: {
                title: { display: true, text: xCol },
              },
              y: {
                title: { display: true, text: yCol },
                beginAtZero: true,
              },
            },
    },
  };

  currentChart = new Chart(ctx, config);
}

// --- Data preview table ---

function renderPreview() {
  dataPreview.classList.remove("hidden");

  const maxRows = 10;
  const rows = parsedData.rows.slice(0, maxRows);

  let html = "<table><thead><tr>";
  parsedData.headers.forEach((h) => {
    html += `<th>${escapeHtml(h)}</th>`;
  });
  html += "</tr></thead><tbody>";

  rows.forEach((row) => {
    html += "<tr>";
    parsedData.headers.forEach((h) => {
      html += `<td>${escapeHtml(row[h])}</td>`;
    });
    html += "</tr>";
  });

  html += "</tbody></table>";

  if (parsedData.rows.length > maxRows) {
    html += `<p style="color:#888;margin-top:0.5rem;font-size:0.85rem;">Showing ${maxRows} of ${parsedData.rows.length} rows</p>`;
  }

  previewTable.innerHTML = html;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
