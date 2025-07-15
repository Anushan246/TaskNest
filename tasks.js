// Task Manager with Add, Remove, Delete (Recycle Bin/Restore)

document.addEventListener('DOMContentLoaded', function() {
    // Tab switching logic
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (link.hasAttribute('href') && link.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                tabLinks.forEach(l => l.classList.remove('active'));
                tabContents.forEach(tc => tc.classList.remove('active'));
                link.classList.add('active');
                const tabId = link.getAttribute('href').substring(1);
                document.getElementById(tabId).classList.add('active');
            }
        });
    });

    // Task data
    let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    let deletedTasks = JSON.parse(localStorage.getItem('deletedTasks') || '[]');

    // Render Add Task UI
    const addTab = document.getElementById('add');
    addTab.innerHTML = `
        <form id="task-form">
            <input type="text" id="task-input" placeholder="Enter a new task" required />
            <select id="priority-select">
                <option value="high">High</option>
                <option value="medium" selected>Medium</option>
                <option value="low">Low</option>
            </select>
            <label class="important-label">
                <input type="checkbox" id="important-checkbox" /> Important
            </label>
            <input type="password" id="task-password" placeholder="Password (if important)" style="display:none;" />
            <button type="submit">Add Task</button>
        </form>
        <div id="task-counter"></div>
        <ul id="task-list"></ul>
    `;

    // Render Remove Task UI
    const removeTab = document.getElementById('remove');
    removeTab.innerHTML = `
        <h2>Remove Tasks</h2>
        <ul id="remove-task-list"></ul>
    `;

    // Elements for Add tab
    const taskForm = addTab.querySelector('#task-form');
    const taskInput = addTab.querySelector('#task-input');
    const prioritySelect = addTab.querySelector('#priority-select');
    const importantCheckbox = addTab.querySelector('#important-checkbox');
    const taskPasswordInput = addTab.querySelector('#task-password');
    const taskList = addTab.querySelector('#task-list');
    const taskCounter = addTab.querySelector('#task-counter');

    // Elements for Remove tab
    const removeTaskList = removeTab.querySelector('#remove-task-list');

    // Elements for Deleted tab
    const recycleBinList = document.getElementById('recycle-bin-list');

    // Show/hide password input
    importantCheckbox.addEventListener('change', function() {
        taskPasswordInput.style.display = importantCheckbox.checked ? '' : 'none';
        if (!importantCheckbox.checked) taskPasswordInput.value = '';
    });

    // Add Task
    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const text = taskInput.value.trim();
        const priority = prioritySelect.value;
        const isImportant = importantCheckbox.checked;
        const password = taskPasswordInput.value;
        if (text && (!isImportant || password)) {
            tasks.push({ text, priority, isImportant, password, completed: false });
            saveTasks();
            renderTasks();
            renderRemoveTasks();
            taskInput.value = '';
            prioritySelect.value = 'medium';
            importantCheckbox.checked = false;
            taskPasswordInput.value = '';
            taskPasswordInput.style.display = 'none';
        } else if (isImportant && !password) {
            alert('Please enter a password for important tasks.');
        }
    });

    // Render all tasks in Add tab
    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach((task, idx) => {
            const li = document.createElement('li');
            li.setAttribute('data-priority', task.priority);
            if (task.isImportant) {
                li.classList.add('important');
            }
            // Priority label
            const priorityLabel = document.createElement('span');
            priorityLabel.className = `priority-label priority-${task.priority}`;
            priorityLabel.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
            // Important icon
            if (task.isImportant) {
                const importantIcon = document.createElement('span');
                importantIcon.className = 'important-icon';
                importantIcon.innerHTML = '🔒';
                li.appendChild(importantIcon);
            }
            li.appendChild(priorityLabel);
            // Task text
            const taskSpan = document.createElement('span');
            taskSpan.textContent = task.isImportant && !task.revealed ? 'Protected Task (Click to view)' : task.text;
            if (task.completed) li.classList.add('completed');
            taskSpan.addEventListener('click', function() {
                if (task.isImportant && !task.revealed) {
                    const entered = prompt('Enter password to view this important task:');
                    if (entered === task.password) {
                        task.revealed = true;
                        taskSpan.textContent = task.text;
                    } else {
                        alert('Incorrect password!');
                    }
                } else {
                    task.completed = !task.completed;
                    saveTasks();
                    renderTasks();
                }
            });
            li.appendChild(taskSpan);
            taskList.appendChild(li);
        });
        updateCounter();
    }

    // Render Remove tab
    function renderRemoveTasks() {
        removeTaskList.innerHTML = '';
        tasks.forEach((task, idx) => {
            const li = document.createElement('li');
            li.setAttribute('data-priority', task.priority);
            if (task.isImportant) li.classList.add('important');
            // Priority label
            const priorityLabel = document.createElement('span');
            priorityLabel.className = `priority-label priority-${task.priority}`;
            priorityLabel.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
            if (task.isImportant) {
                const importantIcon = document.createElement('span');
                importantIcon.className = 'important-icon';
                importantIcon.innerHTML = '🔒';
                li.appendChild(importantIcon);
            }
            li.appendChild(priorityLabel);
            // Task text
            const taskSpan = document.createElement('span');
            taskSpan.textContent = task.isImportant && !task.revealed ? 'Protected Task (Click to view)' : task.text;
            li.appendChild(taskSpan);
            // Delete button
            const delBtn = document.createElement('button');
            delBtn.textContent = 'Delete';
            delBtn.className = 'delete-btn';
            delBtn.addEventListener('click', function() {
                if (task.isImportant) {
                    const entered = prompt('Enter password to delete this important task:');
                    if (entered === task.password) {
                        deletedTasks.push(task);
                        tasks.splice(idx, 1);
                        saveTasks();
                        renderTasks();
                        renderRemoveTasks();
                        renderRecycleBin();
                    } else {
                        alert('Incorrect password!');
                    }
                } else {
                    deletedTasks.push(task);
                    tasks.splice(idx, 1);
                    saveTasks();
                    renderTasks();
                    renderRemoveTasks();
                    renderRecycleBin();
                }
            });
            li.appendChild(delBtn);
            removeTaskList.appendChild(li);
        });
    }

    // Render recycle bin
    function renderRecycleBin() {
        recycleBinList.innerHTML = '';
        deletedTasks.forEach((task, idx) => {
            const li = document.createElement('li');
            li.setAttribute('data-priority', task.priority);
            if (task.isImportant) li.classList.add('important');
            // Priority label
            const priorityLabel = document.createElement('span');
            priorityLabel.className = `priority-label priority-${task.priority}`;
            priorityLabel.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
            if (task.isImportant) {
                const importantIcon = document.createElement('span');
                importantIcon.className = 'important-icon';
                importantIcon.innerHTML = '🔒';
                li.appendChild(importantIcon);
            }
            li.appendChild(priorityLabel);
            // Task text
            const taskSpan = document.createElement('span');
            taskSpan.textContent = task.isImportant ? 'Protected Task (Click to view)' : task.text;
            taskSpan.addEventListener('click', function() {
                if (task.isImportant) {
                    const entered = prompt('Enter password to view this important task:');
                    if (entered === task.password) {
                        taskSpan.textContent = task.text;
                    } else {
                        alert('Incorrect password!');
                    }
                }
            });
            li.appendChild(taskSpan);
            // Restore button
            const restoreBtn = document.createElement('button');
            restoreBtn.textContent = 'Restore';
            restoreBtn.className = 'restore-btn';
            restoreBtn.addEventListener('click', function() {
                tasks.push(task);
                deletedTasks.splice(idx, 1);
                saveTasks();
                renderTasks();
                renderRemoveTasks();
                renderRecycleBin();
            });
            li.appendChild(restoreBtn);
            recycleBinList.appendChild(li);
        });
    }

    function updateCounter() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const remaining = total - completed;
        taskCounter.textContent = `Total: ${total} | Completed: ${completed} | Remaining: ${remaining}`;
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('deletedTasks', JSON.stringify(deletedTasks));
    }

    // Initial render
    renderTasks();
    renderRemoveTasks();
    renderRecycleBin();
}); 