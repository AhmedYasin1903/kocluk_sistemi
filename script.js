/* ==========================================================================
   ZEKÂ KOÇU - TAM SENKRONİZE VE EKSİKSİZ ANA DOSYA
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {
    updateYksCounter();
    loadAllTasks();

    if (document.getElementById("calendarDays")) {
        renderCalendar();
    }

    // --- MODAL KONTROLLERİ ---
    const taskModal = document.getElementById("taskModal");
    const addTaskBtn = document.querySelector('.add-task-btn');
    const closeTaskBtn = document.querySelector(".close-task");
    const closeDayBtn = document.querySelector(".close-day");

    if (addTaskBtn) addTaskBtn.onclick = () => taskModal.style.display = "block";
    if (closeTaskBtn) closeTaskBtn.onclick = () => taskModal.style.display = "none";
    if (closeDayBtn) closeDayBtn.onclick = () => document.getElementById("dayModal").style.display = "none";

    window.onclick = function(event) {
        const dayModal = document.getElementById("dayModal");
        if (event.target == taskModal) taskModal.style.display = "none";
        if (dayModal && event.target == dayModal) dayModal.style.display = "none";
    };
});

/* --- 1. GÖREV YÖNETİMİ (KAYDETME VE YÜKLEME) --- */

function saveNewTask() {
    const nameInput = document.getElementById('modalTaskName');
    const categoryInput = document.getElementById('modalCategory');
    const dateInput = document.getElementById('modalDate');

    if (!nameInput.value || !dateInput.value) { 
        alert("Lütfen tüm alanları doldurun!"); 
        return; 
    }

    const newTask = {
        id: Date.now(),
        name: nameInput.value,
        category: categoryInput.value,
        date: dateInput.value,
        completed: false
    };

    let tasks = JSON.parse(localStorage.getItem('allTasks')) || [];
    tasks.push(newTask);
    localStorage.setItem('allTasks', JSON.stringify(tasks));

    // Eğer takvim sayfasındaysak takvim noktası için de kaydet
    let dayTasks = JSON.parse(localStorage.getItem(dateInput.value)) || [];
    dayTasks.push(nameInput.value);
    localStorage.setItem(dateInput.value, JSON.stringify(dayTasks));

    nameInput.value = "";
    document.getElementById('taskModal').style.display = "none";
    
    loadAllTasks();
    if (document.getElementById("calendarDays")) renderCalendar();
}

function loadAllTasks() {
    const tableBody = document.getElementById('taskTableBody');
    const homeList = document.getElementById('home-tasks-list');
    let tasks = JSON.parse(localStorage.getItem('allTasks')) || [];

    // GÖREVLERİM SAYFASI (TABLO)
    if (tableBody) {
        tableBody.innerHTML = ""; 
        tasks.forEach(task => {
            const row = document.createElement('tr');
            if (task.completed) row.style.opacity = "0.5";
            row.innerHTML = `
                <td><input type="checkbox" onchange="toggleTask(${task.id})" ${task.completed ? 'checked' : ''}></td>
                <td><strong style="${task.completed ? 'text-decoration:line-through;' : ''}">${task.name}</strong></td>
                <td><span style="background:#e8f0fe; color:#0052D4; padding:5px 15px; border-radius:20px; font-size:12px;">${task.category}</span></td>
                <td>${task.date}</td>
                <td><button onclick="deleteTask(${task.id}, '${task.date}', '${task.name}')" style="background:none; border:none; color:red; cursor:pointer;"><i class="fas fa-trash"></i></button></td>
            `;
            tableBody.appendChild(row);
        });
    }

    // ANASAYFA (LİSTE)
    if (homeList) {
        homeList.innerHTML = "";
        tasks.forEach(task => {
            homeList.innerHTML += `
                <div style="display:flex; align-items:center; gap:10px; background:white; padding:12px; border-radius:12px; margin-bottom:8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <input type="checkbox" onchange="toggleTask(${task.id})" ${task.completed ? 'checked' : ''}>
                    <div>
                        <h4 style="margin:0; font-size:14px; ${task.completed ? 'text-decoration:line-through; color:#999;' : ''}">${task.name}</h4>
                        <small style="color:#666;">${task.date}</small>
                    </div>
                </div>`;
        });
    }
}

/* --- 2. SİLME VE GÜNCELLEME (SENKRONİZE) --- */

function deleteTask(id, taskDate, taskName) {
    let tasks = JSON.parse(localStorage.getItem('allTasks')) || [];
    tasks = tasks.filter(t => t.id !== id);
    localStorage.setItem('allTasks', JSON.stringify(tasks));

    if (taskDate) {
        let dayTasks = JSON.parse(localStorage.getItem(taskDate)) || [];
        dayTasks = dayTasks.filter(name => name !== taskName);
        if (dayTasks.length === 0) localStorage.removeItem(taskDate);
        else localStorage.setItem(taskDate, JSON.stringify(dayTasks));
    }

    loadAllTasks();
    if (document.getElementById("calendarDays")) renderCalendar();
}

function toggleTask(id) {
    let tasks = JSON.parse(localStorage.getItem('allTasks')) || [];
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        localStorage.setItem('allTasks', JSON.stringify(tasks));
        loadAllTasks();
    }
}

/* --- 3. TAKVİM VE TAKVİM İÇİ SİLME --- */

let currentMonth = new Date().getMonth();
let currentYear = 2026;
const ayIsimleri = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

function renderCalendar() {
    const daysContainer = document.getElementById("calendarDays");
    const monthDisplay = document.getElementById("monthDisplay");
    if (!daysContainer) return;

    daysContainer.innerHTML = "";
    monthDisplay.innerText = `${ayIsimleri[currentMonth]} ${currentYear}`;

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    let shift = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    for (let x = 0; x < shift; x++) daysContainer.innerHTML += `<div class="empty-day"></div>`;

    for (let i = 1; i <= daysInMonth; i++) {
        const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const dayDiv = document.createElement("div");
        dayDiv.className = "day";
        dayDiv.innerHTML = `<span>${i}</span>`;

        const dayTasks = JSON.parse(localStorage.getItem(dateKey)) || [];
        if (dayTasks.length > 0) {
            dayDiv.innerHTML += `<div style="width:6px; height:6px; background:#0052D4; border-radius:50%; margin:2px auto;"></div>`;
        }

        dayDiv.onclick = () => openDayModal(i, dateKey);
        daysContainer.appendChild(dayDiv);
    }
}

window.oncekiAy = () => { currentMonth--; if(currentMonth < 0){ currentMonth=11; currentYear--; } renderCalendar(); };
window.sonrakiAy = () => { currentMonth++; if(currentMonth > 11){ currentMonth=0; currentYear++; } renderCalendar(); };

function openDayModal(gun, key) {
    window.currentDateKey = key;
    const modalText = document.getElementById("selected-date-text");
    if(modalText) modalText.innerText = `${gun} ${ayIsimleri[currentMonth]} ${currentYear}`;
    updateDayTaskList();
    document.getElementById("dayModal").style.display = "block";
}

window.gorevEkleTakvim = function() {
    const input = document.getElementById("newTaskInput");
    if (!input || !input.value.trim()) return;

    let dayTasks = JSON.parse(localStorage.getItem(window.currentDateKey)) || [];
    dayTasks.push(input.value);
    localStorage.setItem(window.currentDateKey, JSON.stringify(dayTasks));

    let allTasks = JSON.parse(localStorage.getItem('allTasks')) || [];
    allTasks.push({ id: Date.now(), name: input.value, category: "Takvimden", date: window.currentDateKey, completed: false });
    localStorage.setItem('allTasks', JSON.stringify(allTasks));

    input.value = "";
    updateDayTaskList();
    renderCalendar();
    loadAllTasks();
};

window.deleteFromCalendar = function(taskName) {
    let dayTasks = JSON.parse(localStorage.getItem(window.currentDateKey)) || [];
    dayTasks = dayTasks.filter(name => name !== taskName);
    if (dayTasks.length === 0) localStorage.removeItem(window.currentDateKey);
    else localStorage.setItem(window.currentDateKey, JSON.stringify(dayTasks));

    let allTasks = JSON.parse(localStorage.getItem('allTasks')) || [];
    allTasks = allTasks.filter(t => !(t.name === taskName && t.date === window.currentDateKey));
    localStorage.setItem('allTasks', JSON.stringify(allTasks));

    updateDayTaskList();
    renderCalendar();
    loadAllTasks();
};

function updateDayTaskList() {
    const list = document.getElementById("day-tasks-list");
    if(!list) return;
    let tasks = JSON.parse(localStorage.getItem(window.currentDateKey)) || [];
    list.innerHTML = tasks.map(t => `
        <li style="display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid #eee;">
            <span>${t}</span>
            <button onclick="deleteFromCalendar('${t}')" style="background:none; border:none; color:red; cursor:pointer;"><i class="fas fa-times"></i></button>
        </li>`).join("");
}

function updateYksCounter() {
    const counterEl = document.getElementById('days-left');
    if (!counterEl) return;
    const yksTarihi = new Date("June 20, 2026").getTime();
    const fark = Math.floor((yksTarihi - new Date().getTime()) / (1000 * 60 * 60 * 24));
    counterEl.innerText = fark > 0 ? fark : 0;
}