// Add new task
function addTask() {
    const taskInput = document.getElementById('task-input');
    const taskText = taskInput.value.trim();
    if (!taskText) return;
  
    fetch('/api/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: taskText })
    })
    .then(response => response.json())
    .then(task => {
      const taskList = document.getElementById('task-list');
      const taskItem = document.createElement('li');
      taskItem.id = `task-${task.id}`;
      taskItem.classList.toggle('completed', task.completed);
      taskItem.innerHTML = `
        <input type="checkbox" onclick="toggleTaskCompletion(${task.id})" ${task.completed ? 'checked' : ''} />
        ${task.text}
        <button onclick="deleteTask(${task.id})">Delete</button>
      `;
      taskList.appendChild(taskItem);
      taskInput.value = '';
    });
  }
  
  // Delete task
  function deleteTask(id) {
    fetch(`/api/delete/${id}`, {
      method: 'DELETE'
    })
    .then(() => {
      document.getElementById(`task-${id}`).remove();
    });
  }
  
  // Toggle task completion
  function toggleTaskCompletion(id) {
    const taskItem = document.getElementById(`task-${id}`);
    const isChecked = taskItem.querySelector('input[type="checkbox"]').checked;
  
    fetch(`/api/complete/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: isChecked })
    })
    .then(() => {
      taskItem.classList.toggle('completed', isChecked);
    });
  }
  