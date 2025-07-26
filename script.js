//Acestea iau elementele HTML din pagină (calendar, titlul lunii, butoanele de navigare, dark mode).
const calendarDiv = document.getElementById("calendar");
const monthYearSpan = document.getElementById("month-year");
const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");
const darkModeBtn = document.getElementById("dark-mode-btn");

//Acestea sunt pentru fereastra (modal) unde adaugi și vezi taskurile unei zile.
const modal = document.getElementById("day-modal");
const closeBtn = document.querySelector(".close-btn");
const selectedDateEl = document.getElementById("selected-date");
const taskContainer = document.getElementById("task-container");
const taskTimeInput = document.getElementById("task-time");
const taskTextInput = document.getElementById("task-text");
const addTaskBtn = document.getElementById("add-task-btn");

let currentDate = new Date(); // data curentă (pentru calendar)
let selectedDate = null; // ziua pe care o selectezi
let tasks = JSON.parse(localStorage.getItem("dailyTasks")) || {}; // toate taskurile
let darkMode = localStorage.getItem("darkMode") === "true"; // dark mode salvat

// Activează Dark Mode dacă era salvat
if (darkMode) document.body.classList.add("dark-mode");

// Desenează calendarul
function renderCalendar() {
  calendarDiv.innerHTML = "";
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  monthYearSpan.textContent = currentDate.toLocaleDateString("ro-RO", {
    month: "long",
    year: "numeric",
  });

  // Celule goale pentru începutul lunii (dacă nu începe luni)
  for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
    const emptyDiv = document.createElement("div");
    calendarDiv.appendChild(emptyDiv);
  }

  for (let day = 1; day <= lastDate; day++) {
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("day");
    dayDiv.textContent = day;

    const dateKey = `${year}-${month + 1}-${day}`;
    if (tasks[dateKey] && tasks[dateKey].length > 0) {
      const badge = document.createElement("span");
      badge.classList.add("task-count");
      badge.textContent = tasks[dateKey].length;
      dayDiv.appendChild(badge);
    }

    dayDiv.addEventListener("click", () => openDayModal(dateKey, day));
    calendarDiv.appendChild(dayDiv);
  }
}

// Deschide modalul pentru o zi
function openDayModal(dateKey, day) {
  selectedDate = dateKey; //selectedDate este cheia datei (ex. 2025-7-26)
  selectedDateEl.textContent = `Ziua ${day}`;
  showTasks();
  modal.style.display = "flex";
}

// Închide modalul
closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

// Afișează taskurile
function showTasks() {
  taskContainer.innerHTML = "";
  const dayTasks = tasks[selectedDate] || [];

  dayTasks.forEach((task, index) => {
    const taskDiv = document.createElement("div");
    taskDiv.classList.add("task-item");

    // Adaugă clasa în funcție de status
    taskDiv.classList.remove("done", "canceled", "todo");
    if (task.status === "done") taskDiv.classList.add("done");
    if (task.status === "canceled") taskDiv.classList.add("canceled");
    if (task.status === "to_do") taskDiv.classList.add("todo");

    // Adaugă culori pentru prioritate doar dacă e "De făcut"
    if (task.status === "to_do") {
      if (task.priority === "low") taskDiv.classList.add("priority-low");
      if (task.priority === "medium") taskDiv.classList.add("priority-medium");
      if (task.priority === "high") taskDiv.classList.add("priority-high");
    }

    taskDiv.innerHTML = `<strong>${task.time}</strong> - ${task.text}`;

    // Dropdown pentru status
    const select = document.createElement("select");
    ["to_do", "in_progress", "done", "canceled"].forEach((status) => {
      const option = document.createElement("option");
      option.value = status;
      option.textContent =
        status === "to_do"
          ? "De făcut"
          : status === "in_progress"
          ? "În lucru"
          : status === "done"
          ? "Făcut"
          : "Anulat";
      if (task.status === status || (!task.status && status === "to_do")) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    select.addEventListener("change", () => {
      task.status = select.value;
      saveTasks();
      showTasks();
    });

    const actions = document.createElement("div");
    actions.classList.add("task-actions");

    // Buton editare
    const editBtn = document.createElement("button");
    editBtn.classList.add("edit");
    editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
    editBtn.addEventListener("click", () => {
      const newTime = prompt("Modifică ora:", task.time);
      const newText = prompt("Modifică textul:", task.text);
      if (newTime && newText) {
        dayTasks[index].time = newTime;
        dayTasks[index].text = newText;
        saveTasks();
        showTasks();
        renderCalendar();
      }
    });

    // Buton ștergere
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete");
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    deleteBtn.addEventListener("click", () => {
      dayTasks.splice(index, 1);
      tasks[selectedDate] = dayTasks;
      saveTasks();
      showTasks();
      renderCalendar();
    });

    actions.appendChild(select);
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    taskDiv.appendChild(actions);
    taskContainer.appendChild(taskDiv);
  });
}

// Adaugă task nou
addTaskBtn.addEventListener("click", () => {
  const time = taskTimeInput.value;
  const text = taskTextInput.value.trim();
  const repeat = document.getElementById("task-repeat").value; // recurența selectată
  const priority = document.getElementById("task-priority").value;

  if (!time || !text) return;

  if (!tasks[selectedDate]) tasks[selectedDate] = [];
  tasks[selectedDate].push({ time, text, status: "to_do", repeat, priority }); // salvăm și recurența
  saveTasks();

  taskTimeInput.value = "";
  taskTextInput.value = "";
  document.getElementById("task-repeat").value = "none";
  document.getElementById("task-priority").value = "medium";
  showTasks();
  renderCalendar();
});

// Salvează în localStorage
function saveTasks() {
  localStorage.setItem("dailyTasks", JSON.stringify(tasks));
}

// Dark Mode
darkModeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  darkMode = document.body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", darkMode);
});

// Navigare lună
prevMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});
nextMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

renderCalendar();
generateRecurringTasks(); //recurenta tasks

// Afișează popup reminder
function showReminder(task, dateKey) {
  const popup = document.getElementById("popup-reminder");
  const dateLabel = new Date(dateKey).toLocaleDateString("ro-RO");

  popup.textContent = `Este timpul să te apuci de: ${task.text} (ora ${task.time}, ${dateLabel})`;
  popup.classList.add("show");

  setTimeout(() => {
    popup.classList.remove("show");
  }, 1000);
}

// Actualizează panoul cu mementouri
function updateReminderPanel() {
  const reminderList = document.getElementById("reminder-list");
  reminderList.innerHTML = "";

  const todayKey = `${new Date().getFullYear()}-${
    new Date().getMonth() + 1
  }-${new Date().getDate()}`;
  const todayTasks = tasks[todayKey] || [];

  todayTasks.sort((a, b) => a.time.localeCompare(b.time));

  todayTasks.forEach((task) => {
    const li = document.createElement("li");
    const statusLabel =
      task.status === "done"
        ? "(Făcut)"
        : task.status === "canceled"
        ? "(Anulat)"
        : task.status === "in_progress"
        ? "(În lucru)"
        : "(De făcut)";

    // Textul afișat
    li.textContent = `${task.time} - ${task.text} ${statusLabel}`;

    // Stilizare după status
    if (task.status === "done") li.classList.add("status-done");
    else if (task.status === "to_do") li.classList.add("status-todo");
    else if (task.status === "in_progress") li.classList.add("status-progress");
    else if (task.status === "canceled") li.classList.add("status-canceled");

    reminderList.appendChild(li);
  });
}

// Notificarile(memento): Verifică taskurile la fiecare 10 secunde
setInterval(() => {
  const now = new Date();
  const hourNow = now.getHours();
  const minNow = now.getMinutes();

  Object.keys(tasks).forEach((dateKey) => {
    tasks[dateKey].forEach((task) => {
      const [h, m] = task.time.split(":").map(Number);
      if (
        h === hourNow &&
        m === minNow &&
        task.status !== "done" &&
        task.status !== "canceled" &&
        task.status !== "in_progress"
      ) {
        showReminder(task, dateKey);
      }
    });
  });

  updateReminderPanel();
}, 10000);

updateReminderPanel();

//Generare tasks recurente
function generateRecurringTasks() {
  const today = new Date();
  const futureDays = 30; // câte zile înainte generăm

  Object.keys(tasks).forEach((dateKey) => {
    const [year, month, day] = dateKey.split("-").map(Number);
    const taskDate = new Date(year, month - 1, day);

    tasks[dateKey].forEach((task) => {
      if (!task.repeat || task.repeat === "none") return;

      for (let i = 1; i <= futureDays; i++) {
        const newDate = new Date(taskDate);

        if (task.repeat === "daily") newDate.setDate(taskDate.getDate() + i);
        if (task.repeat === "weekly")
          newDate.setDate(taskDate.getDate() + i * 7);
        if (task.repeat === "monthly")
          newDate.setMonth(taskDate.getMonth() + i);

        const newKey = `${newDate.getFullYear()}-${
          newDate.getMonth() + 1
        }-${newDate.getDate()}`;

        if (!tasks[newKey]) tasks[newKey] = [];

        // adăugăm doar dacă nu există deja un task identic
        if (
          !tasks[newKey].some(
            (t) => t.text === task.text && t.time === task.time
          )
        ) {
          tasks[newKey].push({ ...task });
        }
      }
    });
  });

  saveTasks();
}

//Revin la Azi
const todayBtn = document.getElementById("today-btn");

todayBtn.addEventListener("click", () => {
  currentDate = new Date(); // setăm luna la cea curentă
  renderCalendar();

  // opțional: deschidem direct ziua de azi
  const todayKey = `${currentDate.getFullYear()}-${
    currentDate.getMonth() + 1
  }-${currentDate.getDate()}`;
  openDayModal(todayKey, currentDate.getDate());
});
