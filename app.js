const STATUSES = ["Applied", "Interview", "Offer", "Rejected"];

// Load saved data, or start with an empty list
let applications = JSON.parse(localStorage.getItem("applications")) || [];

const form = document.getElementById("app-form");
const rows = document.getElementById("rows");
const searchInput = document.getElementById("search");
const filterSelect = document.getElementById("filter");
// Save the list to the browser
function save() {
  localStorage.setItem("applications", JSON.stringify(applications));
}
// Draw the summary cards
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
// Draw the table from the list
function render() {
      renderStats();
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

    // Status dropdown
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

    // Delete button
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

// Handle the form
form.addEventListener("submit", function (event) {
  event.preventDefault();

  const application = {
    id: Date.now(),
    company: document.getElementById("company").value.trim(),
    role: document.getElementById("role").value.trim(),
    location: document.getElementById("location").value.trim(),
    date: document.getElementById("date").value,
    status: document.getElementById("status").value,
  };

  applications.push(application);
  save();
  render();
  form.reset();
});

render();
searchInput.addEventListener("input", render);
filterSelect.addEventListener("change", render);
// Demo data for first-time visitors
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