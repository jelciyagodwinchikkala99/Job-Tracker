const STATUSES = ["Applied", "Interview", "Offer", "Rejected"];

// Load saved data, or start with an empty list
let applications = JSON.parse(localStorage.getItem("applications")) || [];

const form = document.getElementById("app-form");
const rows = document.getElementById("rows");

// Save the list to the browser
function save() {
  localStorage.setItem("applications", JSON.stringify(applications));
}

// Draw the table from the list
function render() {
  rows.innerHTML = "";

  applications.forEach(function (app) {
    const tr = document.createElement("tr");

    const company = document.createElement("td");
    company.textContent = app.company;

    const role = document.createElement("td");
    role.textContent = app.role;

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

    tr.append(company, role, date, statusCell, deleteCell);
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
    date: document.getElementById("date").value,
    status: document.getElementById("status").value,
  };

  applications.push(application);
  save();
  render();
  form.reset();
});

render();