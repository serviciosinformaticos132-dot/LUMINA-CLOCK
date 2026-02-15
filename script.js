const menuClockNameInput = document.getElementById('menuClockName');
const menuHourInput = document.getElementById('menuHour');
const menuMinuteInput = document.getElementById('menuMinute');
const menuAmpmSelect = document.getElementById('menuAmpm');
const menuSetNameInput = document.getElementById('menuSetName');

const addClockBtn = document.getElementById('addClockBtn');
const saveSetBtn = document.getElementById('saveSetBtn');
const toggleViewBtn = document.getElementById('toggleViewBtn');

const clocksContainer = document.getElementById('clocks-container');
const historyContainer = document.getElementById('history-container');
const historyList = document.getElementById('history-list');
const mainHeaderTitle = document.getElementById('mainHeaderTitle');

let activeClocksData = [];
let activeIntervals = [];
let clockIdCounter = 0;
let savedClockSets = JSON.parse(localStorage.getItem('neuClockSets')) || [];

// Obtener hora del dispositivo
function setMenuToCurrentTime() {
    const now = new Date();
    let h = now.getHours();
    let m = now.getMinutes();
    let isPm = h >= 12;
    
    h = h % 12;
    if (h === 0) h = 12; 

    menuHourInput.value = h;
    menuMinuteInput.value = m < 10 ? '0' + m : m; 
    menuAmpmSelect.value = isPm ? 'PM' : 'AM';
}

setMenuToCurrentTime();

addClockBtn.addEventListener('click', () => {
    let clockName = menuClockNameInput.value.trim();
    let startHour = parseInt(menuHourInput.value);
    let startMinute = parseInt(menuMinuteInput.value);
    let isPm = (menuAmpmSelect.value === 'PM');

    if (isNaN(startHour) || startHour < 1 || startHour > 12) { alert("Hora inválida"); return; }
    if (isNaN(startMinute) || startMinute < 0 || startMinute > 59) { alert("Minutos inválidos"); return; }
    if (clockName === "") { clockName = "Reloj " + (activeClocksData.length + 1); }

    createClockDOM(clockName, startHour, startMinute, isPm);
    
    menuClockNameInput.value = "";
    setMenuToCurrentTime(); 
});

function createClockDOM(name, startHour, startMinute, isPm) {
    const currentId = clockIdCounter++;
    activeClocksData.push({ id: currentId, name, h: startHour, m: startMinute, isPm });

    const clockCard = document.createElement('div');
    clockCard.className = 'clock-card neu-flat';
    clockCard.dataset.id = currentId;
    
    clockCard.innerHTML = `
        <button class="delete-clock-btn neu-btn" title="Eliminar reloj">×</button>
        <h3 class="clock-title">${name}</h3>
        
        <div class="analog-clock neu-inset">
            <div class="number" style="--n:1"><span>1</span></div>
            <div class="number" style="--n:2"><span>2</span></div>
            <div class="number" style="--n:3"><span>3</span></div>
            <div class="number" style="--n:4"><span>4</span></div>
            <div class="number" style="--n:5"><span>5</span></div>
            <div class="number" style="--n:6"><span>6</span></div>
            <div class="number" style="--n:7"><span>7</span></div>
            <div class="number" style="--n:8"><span>8</span></div>
            <div class="number" style="--n:9"><span>9</span></div>
            <div class="number" style="--n:10"><span>10</span></div>
            <div class="number" style="--n:11"><span>11</span></div>
            <div class="number" style="--n:12"><span>12</span></div>
            
            <div class="hand hour"></div>
            <div class="hand minute"></div>
            <div class="hand second"></div>
        </div>
        
        <div class="digital-clock neu-inset">
            <span class="dig-time">12:00:00</span><span class="digital-ampm">AM</span>
        </div>

        <div class="clock-adjust-panel">
            <input type="number" class="adj-input adj-h neu-inset" min="1" max="12" value="${startHour}"> :
            <input type="number" class="adj-input adj-m neu-inset" min="0" max="59" value="${startMinute < 10 ? '0'+startMinute : startMinute}">
            <select class="adj-select adj-ampm neu-inset">
                <option value="AM" ${!isPm ? 'selected' : ''}>AM</option>
                <option value="PM" ${isPm ? 'selected' : ''}>PM</option>
            </select>
            <button class="neu-btn btn-update" title="Aplicar nueva hora">Ajustar</button>
        </div>
    `;

    clocksContainer.appendChild(clockCard);

    const hourHand = clockCard.querySelector('.hand.hour');
    const minuteHand = clockCard.querySelector('.hand.minute');
    const secondHand = clockCard.querySelector('.hand.second');
    const digitalTimeDisplay = clockCard.querySelector('.dig-time');
    const digitalAmpmDisplay = clockCard.querySelector('.digital-ampm');
    const deleteBtn = clockCard.querySelector('.delete-clock-btn');
    
    const adjustHour = clockCard.querySelector('.adj-h');
    const adjustMinute = clockCard.querySelector('.adj-m');
    const adjustAmpm = clockCard.querySelector('.adj-ampm');
    const updateBtn = clockCard.querySelector('.btn-update');

    let currentHours = startHour;
    let currentMinutes = startMinute;
    let currentSeconds = 0; 
    let currentIsPm = isPm;

    function padZero(num) { return num < 10 ? '0' + num : num; }

    function updateClockDisplays() {
        digitalTimeDisplay.textContent = `${padZero(currentHours)}:${padZero(currentMinutes)}:${padZero(currentSeconds)}`;
        digitalAmpmDisplay.textContent = currentIsPm ? 'PM' : 'AM';

        const secondsRatio = currentSeconds / 60;
        const minutesRatio = (currentMinutes + secondsRatio) / 60;
        let hours12 = currentHours % 12;
        if (hours12 === 0) hours12 = 12;
        const hoursRatio = (hours12 + minutesRatio) / 12;

        hourHand.style.transform = `rotate(${hoursRatio * 360}deg)`;
        minuteHand.style.transform = `rotate(${minutesRatio * 360}deg)`;
        secondHand.style.transform = `rotate(${secondsRatio * 360}deg)`;
    }

    function tick() {
        currentSeconds++;
        if (currentSeconds >= 60) {
            currentSeconds = 0;
            currentMinutes++;
            if (currentMinutes >= 60) {
                currentMinutes = 0;
                currentHours++;
                if (currentHours === 12) {
                    currentIsPm = !currentIsPm; 
                } else if (currentHours > 12) {
                    currentHours = 1; 
                }
            }
        }
        updateClockDisplays();
    }

    updateClockDisplays(); 
    const intervalId = setInterval(tick, 1000);
    activeIntervals.push({ id: currentId, interval: intervalId });

    updateBtn.addEventListener('click', () => {
        let newH = parseInt(adjustHour.value);
        let newM = parseInt(adjustMinute.value);
        let newPm = (adjustAmpm.value === 'PM');

        if (isNaN(newH) || newH < 1 || newH > 12) { alert("Hora inválida"); return; }
        if (isNaN(newM) || newM < 0 || newM > 59) { alert("Minutos inválidos"); return; }

        currentHours = newH;
        currentMinutes = newM;
        currentSeconds = 0; 
        currentIsPm = newPm;

        let clockData = activeClocksData.find(c => c.id === currentId);
        if(clockData) {
            clockData.h = newH;
            clockData.m = newM;
            clockData.isPm = newPm;
        }

        updateClockDisplays();
        
        updateBtn.textContent = "✔";
        updateBtn.style.color = "var(--accent-blue)";
        setTimeout(() => {
            updateBtn.textContent = "Ajustar";
            updateBtn.style.color = "var(--accent-green)";
        }, 1000);
    });

    deleteBtn.addEventListener('click', () => {
        clearInterval(intervalId);
        clockCard.remove();
        activeClocksData = activeClocksData.filter(c => c.id !== currentId);
        activeIntervals = activeIntervals.filter(i => i.id !== currentId);
    });
}

saveSetBtn.addEventListener('click', () => {
    if (activeClocksData.length === 0) { alert("Agrega al menos un reloj a la pantalla antes de guardar el conjunto."); return; }

    let setName = menuSetNameInput.value.trim() || "Grupo " + (savedClockSets.length + 1);
    let currentDate = new Date();
    let dateString = currentDate.toLocaleDateString() + " a las " + currentDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    let newSavedSet = {
        setId: Date.now(), 
        name: setName,
        date: dateString,
        clocks: JSON.parse(JSON.stringify(activeClocksData)) 
    };

    savedClockSets.push(newSavedSet);
    localStorage.setItem('neuClockSets', JSON.stringify(savedClockSets));
    
    menuSetNameInput.value = "";
    alert(`¡Grupo "${setName}" guardado exitosamente!`);
    
    if (historyContainer.style.display === 'block') { renderHistoryList(); }
});

toggleViewBtn.addEventListener('click', () => {
    if (clocksContainer.style.display === 'none') {
        clocksContainer.style.display = 'flex';
        historyContainer.style.display = 'none';
        toggleViewBtn.textContent = 'Ver Mis Grupos Guardados';
        mainHeaderTitle.textContent = 'Panel de Relojes';
    } else {
        clocksContainer.style.display = 'none';
        historyContainer.style.display = 'block';
        toggleViewBtn.textContent = '← Volver a Relojes Activos';
        mainHeaderTitle.textContent = 'Historial Guardado';
        renderHistoryList();
    }
});

function renderHistoryList() {
    historyList.innerHTML = ''; 
    if (savedClockSets.length === 0) {
        historyList.innerHTML = '<p style="text-align:center; opacity:0.6; font-size:1.2em; margin-top: 50px;">Aún no tienes grupos guardados.</p>';
        return;
    }

    let reversedSets = [...savedClockSets].reverse();
    reversedSets.forEach(set => {
        const item = document.createElement('div');
        item.className = 'history-item neu-flat';
        item.innerHTML = `
            <div class="history-info">
                <h3>${set.name}</h3>
                <p>🗓️ ${set.date}</p>
                <p>⏱️ ${set.clocks.length} reloj(es)</p>
            </div>
            <div class="history-actions">
                <button class="neu-btn btn-load" onclick="loadSet(${set.setId})">Cargar a Pantalla</button>
                <button class="neu-btn btn-delete" onclick="deleteSet(${set.setId})">Eliminar</button>
            </div>
        `;
        historyList.appendChild(item);
    });
}

window.loadSet = function(setIdToLoad) {
    const setToLoad = savedClockSets.find(s => s.setId === setIdToLoad);
    if (!setToLoad) return;

    if (confirm(`¿Reemplazar los relojes actuales por el grupo "${setToLoad.name}"?`)) {
        activeIntervals.forEach(item => clearInterval(item.interval));
        clocksContainer.innerHTML = '';
        activeClocksData = [];
        activeIntervals = [];

        setToLoad.clocks.forEach(clock => {
            createClockDOM(clock.name, clock.h, clock.m, clock.isPm);
        });

        toggleViewBtn.click();
    }
};

window.deleteSet = function(setIdToDelete) {
    if (confirm("¿Seguro que deseas borrar este grupo?")) {
        savedClockSets = savedClockSets.filter(s => s.setId !== setIdToDelete);
        localStorage.setItem('neuClockSets', JSON.stringify(savedClockSets));
        renderHistoryList(); 
    }
};
