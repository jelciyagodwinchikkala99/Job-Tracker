const STATUSES = ["Applied", "Interview", "Offer", "Rejected"];

let applications = JSON.parse(localStorage.getItem("applications")) || [];

const form = document.getElementById("app-form");
const rows = document.getElementById("rows");
const searchInput = document.getElementById("search");
const filterSelect = document.getElementById("filter");

function save() {
  localStorage.setItem("applications", JSON.stringify(applications));
}

function renderStats() {
  const stats = document.getElementById("stats");

  function count(status) {
    return applications.filter(function (a) {
      return a.status === status;
    }).length;
  }

  const offers = count("Offer");
  const rejected = count("Rejected");
  const decided = offers + rejected;
  const offerRate = decided ? Math.round((offers / decided) * 100) + "%" : "–";

  const cards = [
    ["Total", applications.length],
    ["Applied", count("Applied")],
    ["Interviews", count("Interview")],
    ["Offers", offers],
    ["Rejected", rejected],
    ["Offer rate", offerRate],
  ];

  stats.innerHTML = "";
  cards.forEach(function (card) {
    const div = document.createElement("div");
    div.className = "stat";

    const number = document.createElement("b");
    number.textContent = card[1];

    const label = document.createElement("span");
    label.textContent = card[0];

    div.append(number, label);
    stats.appendChild(div);
  });
}

let statusChart = null;

function renderChart() {
  const canvas = document.getElementById("status-chart");
  if (!canvas || typeof Chart === "undefined") {
    return;
  }

  const counts = STATUSES.map(function (s) {
    return applications.filter(function (a) {
      return a.status === s;
    }).length;
  });

  const total = counts.reduce(function (sum, n) {
    return sum + n;
  }, 0);

  const emptyMsg = document.getElementById("chart-empty");
  if (emptyMsg) emptyMsg.hidden = total > 0;
  canvas.style.display = total > 0 ? "" : "none";

  if (statusChart) {
    statusChart.destroy();
    statusChart = null;
  }

  if (total === 0) {
    return;
  }

  statusChart = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: STATUSES,
      datasets: [
        {
          data: counts,
          backgroundColor: ["#94a3b8", "#f59e0b", "#22c55e", "#ef4444"],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "right" } },
    },
  });
}

function render() {
  renderStats();
  renderChart();
  rows.innerHTML = "";

  const visible = applications.filter(function (app) {
    const matchesStatus =
      filterSelect.value === "All" || app.status === filterSelect.value;

    const text = (app.company + " " + app.role + " " + (app.location || "")).toLowerCase();
    const matchesSearch = text.includes(searchInput.value.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  visible.forEach(function (app) {
    const tr = document.createElement("tr");

    const company = document.createElement("td");
    company.textContent = app.company;

    const role = document.createElement("td");
    role.textContent = app.role;

    const location = document.createElement("td");
    location.textContent = app.location || "–";

    const date = document.createElement("td");
    date.textContent = app.date;

    const statusCell = document.createElement("td");
    const select = document.createElement("select");
    select.className = "status-" + app.status;
    STATUSES.forEach(function (s) {
      const option = document.createElement("option");
      option.textContent = s;
      option.selected = s === app.status;
      select.appendChild(option);
    });
    select.addEventListener("change", function () {
      app.status = select.value;
      save();
      render();
    });
    statusCell.appendChild(select);

    const deleteCell = document.createElement("td");
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", function () {
      applications = applications.filter(function (a) {
        return a.id !== app.id;
      });
      save();
      render();
    });
    deleteCell.appendChild(deleteBtn);

    tr.append(company, role, location, date, statusCell, deleteCell);
    rows.appendChild(tr);
  });
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  applications.push({
    id: Date.now(),
    company: document.getElementById("company").value.trim(),
    role: document.getElementById("role").value.trim(),
    location: document.getElementById("location").value.trim(),
    date: document.getElementById("date").value,
    status: document.getElementById("status").value,
  });

  save();
  render();
  form.reset();
});

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

document.getElementById("load-sample").addEventListener("click", function () {
  const samples = [
    ["Northwind", "Data Analyst", "Dallas, TX", 14, "Interview"],
    ["Contoso", "Product Analyst", "Remote", 10, "Rejected"],
    ["Fabrikam", "BI Developer", "Austin, TX", 5, "Applied"],
    ["Tailspin", "Analytics Engineer", "Chicago, IL", 21, "Offer"],
    ["Adventure Works", "Data Scientist", "Remote", 3, "Applied"],
  ];

  samples.forEach(function (s, i) {
    applications.push({
      id: Date.now() + i,
      company: s[0],
      role: s[1],
      location: s[2],
      date: daysAgo(s[3]),
      status: s[4],
    });
  });

  save();
  render();
});

document.getElementById("clear-all").addEventListener("click", function () {
  if (confirm("Delete all applications? This cannot be undone.")) {
    applications = [];
    save();
    render();
  }
});

searchInput.addEventListener("input", render);
filterSelect.addEventListener("change", render);

render();