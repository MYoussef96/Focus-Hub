// planner.js

const weekRange = document.getElementById('week-range');
const prevBtn = document.getElementById('prev-week');
const nextBtn = document.getElementById('next-week');
const grid = document.querySelector('.planner-grid');

let currentStart = getStartOfWeek(new Date());
let plannerData = JSON.parse(localStorage.getItem('planner-tasks') || '{}');

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  return new Date(d.setDate(diff));
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function renderWeek() {
  const start = new Date(currentStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  weekRange.textContent = `Week of ${start.toDateString()} – ${end.toDateString()}`;

  document.querySelectorAll('.time-slot').forEach((slot, i) => {
    const hour = slot.dataset.time;
    const dayOffset = i % 7;
    const thisDay = new Date(start);
    thisDay.setDate(thisDay.getDate() + dayOffset);
    const key = formatDate(thisDay) + `-${hour}`;

    slot.innerHTML = '';
    slot.setAttribute('data-date', formatDate(thisDay));

    if (plannerData[key]) {
      const task = document.createElement('div');
      task.className = 'planner-task';
      task.textContent = plannerData[key];
      task.setAttribute('draggable', 'true');
      task.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', key);
      });
      slot.appendChild(task);
    }

    slot.ondrop = e => {
      e.preventDefault();
      const fromKey = e.dataTransfer.getData('text/plain');
      if (plannerData[fromKey]) {
        plannerData[key] = plannerData[fromKey];
        delete plannerData[fromKey];
        savePlanner();
        renderWeek();
      }
    };

    slot.ondragover = e => e.preventDefault();

    slot.onclick = () => {
      const text = prompt('Enter task:');
      if (text) {
        plannerData[key] = text;
        savePlanner();
        renderWeek();
      }
    };
  });
}

function savePlanner() {
  localStorage.setItem('planner-tasks', JSON.stringify(plannerData));
}

prevBtn.addEventListener('click', () => {
  currentStart.setDate(currentStart.getDate() - 7);
  renderWeek();
});

nextBtn.addEventListener('click', () => {
  currentStart.setDate(currentStart.getDate() + 7);
  renderWeek();
});

renderWeek();
