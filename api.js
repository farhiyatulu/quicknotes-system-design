const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadBtn = document.getElementById("load-btn");
const statusEl = document.getElementById("status");
const listEl = document.getElementById("notes-list");

/* ---------- UI helpers ---------- */
function setStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = type || "";
}

function setBusy(busy) {
  loadBtn.disabled = busy;
}

function showEmptyState() {
  listEl.replaceChildren();
  const li = document.createElement("li");
  li.className = "empty";
  li.textContent = "No notes yet. Click \"Load notes\" or add one.";
  listEl.append(li);
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

/* ---------- Wiring ---------- */
loadBtn.addEventListener("click", loadNotes);
showEmptyState();