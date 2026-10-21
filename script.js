const entryDateInput = document.getElementById("entry-date");
const habitForm = document.getElementById("habit-form");
const studyHoursInput = document.getElementById("study-hours");
const activityMinutesInput = document.getElementById("activity-minutes");
const nutritionNotesInput = document.getElementById("nutrition-notes");
const saveStatus = document.getElementById("save-status");

const reminderForm = document.getElementById("reminder-form");
const reminderTextInput = document.getElementById("reminder-text");
const reminderTimeInput = document.getElementById("reminder-time");
const reminderList = document.getElementById("reminder-list");

const HABITS_KEY = "routineTrackerHabits";
const REMINDERS_KEY = "routineTrackerReminders";

const today = new Date().toISOString().split("T")[0];
entryDateInput.value = today;

function readHabits() {
  return JSON.parse(localStorage.getItem(HABITS_KEY) || "{}");
}

function writeHabits(data) {
  localStorage.setItem(HABITS_KEY, JSON.stringify(data));
}

function loadHabitEntry(date) {
  const habits = readHabits();
  const entry = habits[date] || {};

  studyHoursInput.value = entry.studyHours ?? "";
  activityMinutesInput.value = entry.activityMinutes ?? "";
  nutritionNotesInput.value = entry.nutritionNotes ?? "";
}

entryDateInput.addEventListener("change", () => {
  loadHabitEntry(entryDateInput.value);
  saveStatus.textContent = "";
});

habitForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const habits = readHabits();
  habits[entryDateInput.value] = {
    studyHours: studyHoursInput.value,
    activityMinutes: activityMinutesInput.value,
    nutritionNotes: nutritionNotesInput.value.trim(),
  };

  writeHabits(habits);
  saveStatus.textContent = "Daily entry saved.";
});

function readReminders() {
  return JSON.parse(localStorage.getItem(REMINDERS_KEY) || "[]");
}

function writeReminders(data) {
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(data));
}

function scheduleReminder(reminder) {
  const triggerAt = new Date(reminder.when).getTime();
  const delay = triggerAt - Date.now();

  if (delay <= 0) {
    return;
  }

  setTimeout(() => {
    const message = `Reminder: ${reminder.text}`;

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(message);
    } else {
      alert(message);
    }
  }, delay);
}

function renderReminders() {
  const reminders = readReminders().sort((a, b) =>
    a.when.localeCompare(b.when)
  );
  reminderList.innerHTML = "";

  for (const reminder of reminders) {
    const li = document.createElement("li");
    li.textContent = `${new Date(reminder.when).toLocaleString()} — ${
      reminder.text
    }`;
    reminderList.appendChild(li);
  }
}

reminderForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const reminder = {
    text: reminderTextInput.value.trim(),
    when: reminderTimeInput.value,
  };

  if (!reminder.text || !reminder.when) {
    return;
  }

  const reminders = readReminders();
  reminders.push(reminder);
  writeReminders(reminders);

  scheduleReminder(reminder);
  renderReminders();

  reminderForm.reset();
});

if ("Notification" in window && Notification.permission === "default") {
  Notification.requestPermission();
}

loadHabitEntry(today);
const existingReminders = readReminders();
for (const reminder of existingReminders) {
  scheduleReminder(reminder);
}
renderReminders();
