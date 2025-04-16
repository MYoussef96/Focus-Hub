const weekRange = document.getElementById('week-range');
const prevBtn = document.getElementById('prev-week');
const nextBtn = document.getElementById('next-week');

const modal = document.getElementById('task-modal');
const taskNameInput = document.getElementById('task-name');
const taskDurationSelect = document.getElementById('task-duration');
const taskTypeSelect = document.getElementById('task-type');
const saveBtn = document.getElementById('save-task');
const cancelBtn = document.getElementById('cancel-task');

let currentStart = getStartOfWeek(new Date());
let plannerData = JSON.parse(localStorage.getItem('planner-tasks') || '{}');
let activeSlotKey = null;

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function savePlanner() {
  localStorage.setItem('planner-tasks', JSON.stringify(plannerData));
}

function openModal(slotKey) {
  activeSlotKey = slotKey;
  taskNameInput.value = '';
  taskDurationSelect.value = '1';
  taskTypeSelect.value = 'work';
  modal.classList.remove('hidden');
}

function closeModal() {
  activeSlotKey = null;
  modal.classList.add('hidden');
}

function insertTask(slot, text, blocks = 1, type = 'work') {
  const taskDiv = document.createElement('div');
  taskDiv.className = `planner-task task-${type}`;
  taskDiv.style.height = `${blocks * 60}px`;

  const taskText = document.createElement('span');
  taskText.textContent = text;

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-task';
  deleteBtn.innerHTML = '✖';
  deleteBtn.title = 'Delete task';
  deleteBtn.onclick = (e) => {
    e.stopPropagation();
    delete plannerData[slot.dataset.key];
    savePlanner();
    renderWeek();
  };

  const resizer = document.createElement('div');
  resizer.className = 'resize-handle';
  let isResizing = false;

  resizer.onmousedown = (e) => {
    e.stopPropagation();
    isResizing = true;
    const initialY = e.clientY;
    const startHeight = taskDiv.getBoundingClientRect().height;

    const onMouseMove = (moveEvent) => {
      if (!isResizing) return;
      const diff = moveEvent.clientY - initialY;
      const newHeight = startHeight + diff;
      const newBlocks = Math.max(1, Math.round(newHeight / 60));
      taskDiv.style.height = `${newBlocks * 60}px`;
    };

    const onMouseUp = () => {
      if (!isResizing) return;
      isResizing = false;
      const newBlocks = Math.max(1, Math.round(taskDiv.getBoundingClientRect().height / 60));
      plannerData[slot.dataset.key].blocks = newBlocks;
      savePlanner();
      renderWeek();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  taskDiv.setAttribute('draggable', 'true');
  taskDiv.addEventListener('dragstart', e => {
    e.dataTransfer.setData('text/plain', slot.dataset.key);
  });

  taskDiv.appendChild(taskText);
  taskDiv.appendChild(deleteBtn);
  taskDiv.appendChild(resizer);
  slot.innerHTML = '';
  slot.appendChild(taskDiv);
}

function renderWeek() {
  const start = new Date(currentStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  weekRange.textContent = `Week of ${start.toDateString()} – ${end.toDateString()}`;

  const allSlots = document.querySelectorAll('.time-slot');
  allSlots.forEach((slot, index) => {
    const hour = slot.dataset.time;
    const dayOffset = index % 7;
    const thisDay = new Date(start);
    thisDay.setDate(thisDay.getDate() + dayOffset);
    const dateKey = formatDate(thisDay);
    const slotKey = `${dateKey}-${hour}`;

    slot.dataset.key = slotKey;
    slot.innerHTML = '';

    slot.ondrop = e => {
      e.preventDefault();
      const fromKey = e.dataTransfer.getData('text/plain');
      if (plannerData[fromKey]) {
        plannerData[slotKey] = plannerData[fromKey];
        delete plannerData[fromKey];
        savePlanner();
        renderWeek();
      }
    };
    slot.ondragover = e => e.preventDefault();

    slot.onclick = () => openModal(slotKey);

    if (plannerData[slotKey]) {
      const { text, blocks, type } = plannerData[slotKey];
      insertTask(slot, text, blocks, type || 'work');
    }
  });
}

// Modal buttons
saveBtn.addEventListener('click', () => {
  const task = taskNameInput.value.trim();
  const blocks = parseInt(taskDurationSelect.value);
  const type = taskTypeSelect.value;
  if (!task || !activeSlotKey) return;

  plannerData[activeSlotKey] = { text: task, blocks, type };
  savePlanner();
  closeModal();
  renderWeek();
});

cancelBtn.addEventListener('click', closeModal);

// Week nav
prevBtn.addEventListener('click', () => {
  currentStart.setDate(currentStart.getDate() - 7);
  renderWeek();
});
nextBtn.addEventListener('click', () => {
  currentStart.setDate(currentStart.getDate() + 7);
  renderWeek();
});

renderWeek();
