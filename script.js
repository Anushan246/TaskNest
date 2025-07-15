document.addEventListener('DOMContentLoaded', function() {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const prioritySelect = document.getElementById('priority-select');
    const importantCheckbox = document.getElementById('important-checkbox');
    const taskPasswordInput = document.getElementById('task-password');
    const taskList = document.getElementById('task-list');
    const taskCounter = document.getElementById('task-counter');
    const deleteAllBtn = document.getElementById('delete-all-btn');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    let currentFilter = 'all';

    // Show/hide password input based on important checkbox
    importantCheckbox.addEventListener('change', function() {
        taskPasswordInput.style.display = importantCheckbox.checked ? '' : 'none';
        if (!importantCheckbox.checked) taskPasswordInput.value = '';
    });

    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const taskText = taskInput.value.trim();
        const priority = prioritySelect.value;
        const isImportant = importantCheckbox.checked;
        const password = taskPasswordInput.value;
        if (taskText !== '' && (!isImportant || password)) {
            addTask(taskText, priority, isImportant, password);
            taskInput.value = '';
            prioritySelect.value = 'medium';
            importantCheckbox.checked = false;
            taskPasswordInput.value = '';
            taskPasswordInput.style.display = 'none';
        } else if (isImportant && !password) {
            alert('Please enter a password for important tasks.');
        }
    });

    function addTask(text, priority, isImportant, password) {
        const li = document.createElement('li');
        li.setAttribute('data-priority', priority);
        if (isImportant) {
            li.classList.add('important');
            li.setAttribute('data-important', 'true');
            li.setAttribute('data-password', password);
        }
        // Priority label
        const priorityLabel = document.createElement('span');
        priorityLabel.className = `priority-label priority-${priority}`;
        priorityLabel.textContent = priority.charAt(0).toUpperCase() + priority.slice(1);
        // Important icon
        if (isImportant) {
            const importantIcon = document.createElement('span');
            importantIcon.className = 'important-icon';
            importantIcon.innerHTML = '🔒';
            li.appendChild(importantIcon);
        }
        li.appendChild(priorityLabel);
        // Task text
        const taskSpan = document.createElement('span');
        taskSpan.textContent = isImportant ? 'Protected Task (Click to view)' : text;
        li.appendChild(taskSpan);
        // Complete on click (not on delete)
        taskSpan.addEventListener('click', function() {
            if (isImportant && taskSpan.textContent !== text) {
                const entered = prompt('Enter password to view this important task:');
                if (entered === password) {
                    taskSpan.textContent = text;
                } else {
                    alert('Incorrect password!');
                }
            } else {
                li.classList.toggle('completed');
                updateCounter();
            }
        });
        // Delete button
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.className = 'delete-btn';
        delBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (isImportant) {
                const entered = prompt('Enter password to delete this important task:');
                if (entered === password) {
                    li.remove();
                    updateCounter();
                } else {
                    alert('Incorrect password!');
                }
            } else {
                li.remove();
                updateCounter();
            }
        });
        li.appendChild(delBtn);
        taskList.appendChild(li);
        updateCounter();
        applyFilter();
    }

    deleteAllBtn.addEventListener('click', function() {
        taskList.innerHTML = '';
        updateCounter();
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            applyFilter();
        });
    });

    function applyFilter() {
        Array.from(taskList.children).forEach(li => {
            const priority = li.getAttribute('data-priority');
            if (currentFilter === 'all' || currentFilter === priority) {
                li.style.display = '';
            } else {
                li.style.display = 'none';
            }
        });
    }

    function updateCounter() {
        const total = taskList.children.length;
        const completed = Array.from(taskList.children).filter(li => li.classList.contains('completed')).length;
        const remaining = total - completed;
        taskCounter.textContent = `Total: ${total} | Completed: ${completed} | Remaining: ${remaining}`;
    }

    // Initial counter update and filter
    updateCounter();
    applyFilter();
}); 