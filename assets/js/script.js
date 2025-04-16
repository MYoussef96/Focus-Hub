/*
##############################################################
User        Date            Change
--------------------------------------------------------------
MY          04-15-2025      Initial Creation

______________________________________________________________
##############################################################
*/

// Focus Hub Full Script

const clickCount = document.getElementById('click-count');
const colorBox = document.getElementById('color-box');
const quoteText = document.getElementById('quote');
const quoteTimer = document.getElementById('quote-timer');
const clockEl = document.getElementById('clock');
const sessionEl = document.getElementById('session-timer');
const refreshBtn = document.getElementById('refresh-quote');
const themeToggle = document.getElementById('theme-toggle');
const themeButtons = document.querySelectorAll('.theme-circle');
const todoInput = document.getElementById('todo-input');
const addTodoBtn = document.getElementById('add-todo');
const todoList = document.getElementById('todo-list');

let count = 0;
let quotes = [];
let quoteInterval = 4 * 60 * 1000;
let nextQuoteTime = Date.now() + quoteInterval;
const sessionStart = Date.now();

// COUNT CLICKS
window.addEventListener('click', () => {
  count++;
  clickCount.textContent = count;
});

// UPDATE CLOCK AND SESSION TIMER
function updateTime() {
  const now = new Date();
  clockEl.textContent = `Current Time: ${now.toLocaleTimeString()}`;
  const elapsed = now - sessionStart;
  const hrs = Math.floor(elapsed / 3600000);
  const mins = Math.floor((elapsed % 3600000) / 60000);
  const secs = Math.floor((elapsed % 60000) / 1000);
  sessionEl.textContent = `Session Time: ${hrs}h ${mins}m ${secs}s`;

  const remaining = Math.max(nextQuoteTime - Date.now(), 0);
  const rm = Math.floor((remaining % 3600000) / 60000);
  const rs = Math.floor((remaining % 60000) / 1000);
  quoteTimer.textContent = `Next quote in: ${rm}m ${rs}s`;
}

setInterval(updateTime, 1000);

// QUOTE HANDLING
async function loadQuotes() {
  try {
    const response = await fetch('assets/data/quotes.json');
    quotes = await response.json();
    rotateQuote();
    setInterval(rotateQuote, quoteInterval);
  } catch (e) {
    quoteText.textContent = 'Failed to load quotes.';
  }
}

function rotateQuote() {
  if (!quotes.length) return;
  const q = quotes[Math.floor(Math.random() * quotes.length)];
  quoteText.textContent = `“${q.text}” – ${q.author || 'Unknown'}`;
  colorBox.style.backgroundColor = getRandomColor();
  count = 0;
  clickCount.textContent = 0;
  nextQuoteTime = Date.now() + quoteInterval;
}

function getRandomColor() {
  const colors = ['#FFD1DC', '#C8E6C9', '#BBDEFB', '#FFE0B2', '#D1C4E9'];
  return colors[Math.floor(Math.random() * colors.length)];
}

refreshBtn.addEventListener('click', rotateQuote);

// DARK MODE
if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark');
}

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('darkMode', document.body.classList.contains('dark'));
});

// THEME SWITCHER
const savedTheme = localStorage.getItem('theme') || 'focus';
document.body.classList.add(`theme-${savedTheme}`);

themeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    document.body.classList.forEach(cls => {
      if (cls.startsWith('theme-')) document.body.classList.remove(cls);
    });
    const theme = btn.dataset.theme;
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem('theme', theme);
  });
});

// TO-DO LIST
let todos = JSON.parse(localStorage.getItem('todos')) || [];
renderTodos();

addTodoBtn.addEventListener('click', () => {
  const task = todoInput.value.trim();
  if (task === '') return;
  todos.push({ text: task, completed: false });
  saveTodos();
  renderTodos();
  todoInput.value = '';
});

function renderTodos() {
  todoList.innerHTML = '';
  todos.forEach((todo, i) => {
    const li = document.createElement('li');
    li.textContent = todo.text;
    if (todo.completed) li.classList.add('completed');
    li.addEventListener('click', () => {
      todos[i].completed = !todos[i].completed;
      saveTodos();
      renderTodos();
    });
    li.addEventListener('contextmenu', e => {
      e.preventDefault();
      todos.splice(i, 1);
      saveTodos();
      renderTodos();
    });
    todoList.appendChild(li);
  });
}

function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

// INIT
loadQuotes();
updateTime();
