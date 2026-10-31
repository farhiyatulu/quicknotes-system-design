const API_URL = "https://jsonplaceholder.typicode.com/posts";
const MAX_TITLE = 100;

const loadBtn = document.getElementById("load-btn");
const submitBtn = document.getElementById("submit-btn");
const statusEl = document.getElementById("status");
const listEl = document.getElementById("notes-list");
const form = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");

/* ---------- UI helpers ---------- */
function setStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = type || "";
}

function setBusy(busy) {
  loadBtn.disabled = busy;
  submitBtn.disabled = busy;
}

function showEmptyState() {
  listEl.replaceChildren();
  const li = document.createElement("li");
  li.className = "empty";
  li.textContent = "No notes yet. Click \"Load notes\" or add one.";
  listEl.append(li);
}

function removeEmptyState() {
  const empty = listEl.querySelector(".empty");
  if (empty) empty.remove();
}

function renderNote(note) {
  const li = document.createElement("li");
  li.dataset.id = note.id;

  const h = document.createElement("h3");
  h.className = "note-title";
  h.textContent = note.title;

  const p = document.createElement("p");
  p.className = "note-body";
  p.textContent = note.body || "";

  li.append(h, p);
  return li;
}

/* ---------- Reusable request ---------- */
async function request(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const err = new Error(`Request failed with status ${response.status}`);
    err.status = response.status;
    throw err;
  }
  return { status: response.status, data: await response.json() };
}

/* ---------- GET ---------- */
async function loadNotes() {
  setBusy(true);
  setStatus("Loading notes...", "loading");
  try {
    const { data } = await request(`${API_URL}?_limit=10`);
    listEl.replaceChildren();
    if (data.length === 0) {
      showEmptyState();
      setStatus("The server returned no notes.", "success");
    } else {
      data.forEach((n) => listEl.append(renderNote(n)));
      setStatus(`Loaded ${data.length} notes from the server.`, "success");
    }
  } catch (err) {
    console.error(err);
    setStatus("Sorry, we could not load your notes. Please check your connection and try again.", "error");
  } finally {
    setBusy(false);
  }
}

/* ---------- POST ---------- */
function validateTitle(title) {
  if (!title) return "Please enter a title.";
  if (title.length > MAX_TITLE) return `Title must be ${MAX_TITLE} characters or fewer (currently ${title.length}).`;
  return null;
}

async function createNote(event) {
  event.preventDefault();
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  const problem = validateTitle(title);
  if (problem) {
    setStatus(problem, "error");
    titleInput.focus();
    return;
  }

  setBusy(true);
  setStatus("Creating note...", "loading");
  try {
    const { status, data } = await request(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({ title, body, userId: 1 }),
    });
    removeEmptyState();
    listEl.prepend(renderNote({ id: data.id, title, body }));
    setStatus(`Note created (status ${status}, id ${data.id}).`, "success");
    form.reset();
  } catch (err) {
    console.error(err);
    setStatus("Sorry, the note could not be created. Please try again.", "error");
  } finally {
    setBusy(false);
  }
}

/* ---------- Wiring ---------- */
loadBtn.addEventListener("click", loadNotes);
form.addEventListener("submit", createNote);
showEmptyState();