/*
##############################################################
User        Date            Change
--------------------------------------------------------------
MY          04-15-2025      Initial Creation

______________________________________________________________
##############################################################
*/

const clickCount = document.getElementById('click-count');
const colorBox = document.getElementById('color-box');
const quoteText = document.getElementById('quote');
const clockEl = document.getElementById('clock');
const sessionEl = document.getElementById('session-timer');
const todoInput = document.getElementById('todo-input');
const addTodoBtn = document.getElementById('add-todo');
const todoList = document.getElementById('todo-list');
const quoteTimer = document.getElementById('quote-timer');
const themeToggle = document.getElementById('theme-toggle');

// Set when the page is loaded
const sessionStart = Date.now();

let count = 0;
let quotes = [];
let quoteInterval = 4 * 60 * 1000; // 4 minutes
let nextQuoteTime = Date.now() + quoteInterval;


// Count clicks anywhere on the page
document.addEventListener('click', () => {
    count++;
    clickCount.textContent = count;
});

// Fetch all quotes once at the start
async function loadQuotes() {
    try {
        const response = await fetch("assets/data/quotes.json");
        quotes = await response.json();

        // Show the first quote right away
        rotateQuote();
        setInterval(rotateQuote, quoteInterval);
    } catch (error) {
        console.error("Failed to load quotes:", error);
        quoteText.textContent = "Unable to load quotes. Try refreshing.";
    }
}

// Pick a random quote from the list
function rotateQuote() {
    if (quotes.length === 0) return;

    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];

    quoteText.textContent = `“${quote.text}” – ${quote.author || "Unknown"}`;

    // Flip background color of box
    const newColor = getRandomColor();
    colorBox.style.backgroundColor = newColor;

    // Reset click counter
    console.log(`Clicks since last quote: ${count}`);
    count = 0;
    clickCount.textContent = count;

    // Reset the quote timer
    nextQuoteTime = Date.now() + quoteInterval;
}

// Generate a random Pastel color
function getRandomColor() {
    const pastelColors = [
        '#FFD1DC', // light pink
        '#FFECB3', // soft yellow
        '#C8E6C9', // mint green
        '#BBDEFB', // light blue
        '#D1C4E9', // lavender
        '#F8BBD0', // blush pink
        '#B2EBF2', // pale turquoise
        '#FFE0B2', // peach
        '#E1BEE7', // lilac
        '#DCEDC8'  // pale green
    ];

    const randomIndex = Math.floor(Math.random() * pastelColors.length);
    return pastelColors[randomIndex];
}
// Load quotes on page load
loadQuotes();


function updateTime() {
    const now = new Date();

    // Format system time
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    clockEl.textContent = `Current Time: ${timeString}`;

    // Calculate session duration
    const elapsed = now - sessionStart;
    const seconds = Math.floor((elapsed / 1000) % 60);
    const minutes = Math.floor((elapsed / (1000 * 60)) % 60);
    const hours = Math.floor(elapsed / (1000 * 60 * 60));

    sessionEl.textContent = `Session Time: ${hours}h ${minutes}m ${seconds}s`;
}

// Start the clock & session timer
setInterval(updateTime, 1000);
updateTime(); // run once on load

// Load todos on page load
let todos = JSON.parse(localStorage.getItem('todos')) || [];
renderTodos();

// Add task
addTodoBtn.addEventListener('click', () => {
  const task = todoInput.value.trim();
  if (task === '') return;

  todos.push({ text: task, completed: false });
  saveTodos();
  renderTodos();
  todoInput.value = '';
});

// Render tasks
function renderTodos() {
  todoList.innerHTML = '';

  todos.forEach((todo, index) => {
    const li = document.createElement('li');
    li.textContent = todo.text;
    if (todo.completed) li.classList.add('completed');

    // Toggle complete
    li.addEventListener('click', () => {
      todos[index].completed = !todos[index].completed;
      saveTodos();
      renderTodos();
    });

    // Right-click to delete
    li.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      todos.splice(index, 1);
      saveTodos();
      renderTodos();
    });

    todoList.appendChild(li);
  });
}

// Save todos to localStorage
function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

// Load saved theme on page load
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
}

// Toggle theme
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');

  const currentTheme = document.body.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem('theme', currentTheme);
});

// Update countdown every second
setInterval(updateQuoteCountdown, 1000);

function updateQuoteCountdown() {
  const now = Date.now();
  let timeLeft = nextQuoteTime - now;

  if (timeLeft < 0) timeLeft = 0;

  const seconds = Math.floor((timeLeft / 1000) % 60);
  const minutes = Math.floor(timeLeft / (1000 * 60));

  quoteTimer.textContent = `Next quote in: ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
}



