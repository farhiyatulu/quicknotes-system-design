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
  listEl.querySelectorAll(".delete-btn").forEach((b) => (b.disabled = busy));
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

function renderNote(note, { local = false } = {}) {
  const li = document.createElement("li");
  li.dataset.id = note.id;
  li.dataset.local = local ? "1" : "0";

  const h = document.createElement("h3");
  h.className = "note-title";
  h.textContent = note.title;

  const p = document.createElement("p");
  p.className = "note-body";
  p.textContent = note.body || "";

  const del = document.createElement("button");
  del.type = "button";
  del.className = "delete-btn";
  del.textContent = "Delete";
  del.addEventListener("click", () => deleteNote(note.id, li));

  li.append(h, p, del);
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