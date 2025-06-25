const firebaseConfig = {
    apiKey: "AIzaSyA50Z9hgBS5zJI8ei1uuO1AbxzashnEqYk",
    authDomain: "awsome-3a2d0.firebaseapp.com",
    projectId: "awsome-3a2d0",
    storageBucket: "awsome-3a2d0.firebasestorage.app",
    messagingSenderId: "228402602415",
    appId: "1:228402602415:web:cbdb37765881da5e1d0f5a"
};

// Initialize Firebase
let db;
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    showStatus('Firebase connected successfully', 'success');
} catch (error) {
    console.error('Firebase initialization error:', error);
    showStatus('Firebase connection failed - using offline mode', 'error');
}

const TIME_CONSTRAINTS = {
    wakeTime: 7,
    sleepTime: 24,
    schoolStart: 12,
    schoolEnd: 19
};

const USAGE_CONSTRAINTS = {
    maxStudySessions: 2,
    maxStudyLength: 2
};

const HOLIDAY_EXTRA_TIME = {
    gaming: 1,
    art: 1,
    anime: 1
};

const ART_GOALS = [
  "Draw a simple apple with a leaf",
  "Draw a coffee mug with light shading",
  "Draw a single flower (e.g. daisy)",
  "Draw a wooden pencil with simple shadow",
  "Draw a chair with basic shapes",
  "Draw a simple house with windows and a door",
  "Draw a single tree with a few branches",
  "Draw a starry night sky",
  "Draw a pair of sunglasses",
  "Draw a pizza slice with toppings",
  "Draw a soccer ball with light shading",
  "Draw a closed book with a visible spine",
  "Draw a simple fish",
  "Draw a handheld gaming console",
  "Draw a candle with a glowing flame",
  "Draw a glass of water with light reflections",
  "Draw a cat sleeping in a curled position",
  "Draw a pair of sneakers with laces",
  "Draw a smartphone with a glowing screen",
  "Draw a lantern casting light",
  "Draw a potted plant with multiple leaves",
  "Draw a simple landscape (hills, sky)",
  "Draw a character face with expressions",
  "Draw a motorcycle using basic shapes first",
  "Draw a glass bottle with transparent shading",
  "Draw a street light at night",
  "Draw a 3D-looking box with proper perspective",
  "Draw an ice cream cone with details",
  "Draw a clock face with hands",
  "Draw a computer keyboard in top-down view",
  "Draw a realistic eye with lashes and reflections",
  "Draw a transparent water glass with ice cubes",
  "Draw a car with accurate reflections and shading",
  "Draw a fabric draped over a chair",
  "Draw a realistic portrait of a person",
  "Draw a glass vase with flowers and water",
  "Draw a cityscape with multiple buildings",
  "Draw a pocket watch with visible gears",
  "Draw a fantasy sword with intricate engravings",
  "Draw a lantern with glowing light",
  "Draw a forest scene with dappled light",
  "Draw a dragon or mythical creature",
  "Draw a bicycle with visible chains and wheels",
  "Draw a plate of food with textures and toppings",
  "Draw a realistic 3D glass cube with metallic surfaces",
  "Draw a dynamic action scene (e.g. knight vs. dragon)",
  "Draw a bustling marketplace with people and architecture",
  "Draw a waterfall landscape with rocks and mist",
  "Draw a sci-fi environment with glowing panels",
  "Draw a character portrait with full detail and background"
]

let currentSchedule = null;
let todaysPlanExists = false;
let selectedDate = null;

function showStatus(message, type = 'info') {
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.innerHTML = `<div class="status ${type}">${message}</div>`;
    setTimeout(() => statusDiv.innerHTML = '', 5000);
}

function formatTime(hour) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return `${displayHour}:00 ${period}`;
}

function getRandomArtGoal() {
    return ART_GOALS[Math.floor(Math.random() * ART_GOALS.length)];
}

function getTodayString() {
    return new Date().toISOString().split('T')[0];
}

function isHoliday(date) {
    // Simple implementation - you can expand this with actual holiday dates
    const holidays = [
  // Sundays
  "2025-01-26",
  "2025-02-02","2025-02-09","2025-02-16","2025-02-23",
  "2025-03-02","2025-03-09","2025-03-16","2025-03-23","2025-03-30",
  "2025-04-06","2025-04-13","2025-04-20","2025-04-27",
  "2025-05-04","2025-05-11","2025-05-18","2025-05-25",
  "2025-06-01","2025-06-08","2025-06-15","2025-06-22","2025-06-29",
  "2025-07-06",  // note: after our July 1 window
  "2025-08-03","2025-08-10","2025-08-17","2025-08-24","2025-08-31",
  "2025-09-07","2025-09-14","2025-09-21","2025-09-28",
  "2025-10-05","2025-10-12","2025-10-19","2025-10-26",
  "2025-11-02","2025-11-09","2025-11-16","2025-11-23","2025-11-30",
  "2025-12-07","2025-12-14","2025-12-21","2025-12-28",

  // 2nd & 4th Saturdays (bank holidays)
  "2025-01-11","2025-01-25",
  "2025-02-08","2025-02-22",
  "2025-03-08","2025-03-22",
  "2025-04-12","2025-04-26",
  "2025-05-10","2025-05-24",
  "2025-06-14","2025-06-28",
  "2025-07-12","2025-07-26",
  "2025-08-09","2025-08-23",
  "2025-09-13","2025-09-27",
  "2025-10-11","2025-10-25",
  "2025-11-08","2025-11-22",
  "2025-12-13","2025-12-27",

  // Public Holidays in Delhi
  "2025-01-26", // Republic Day
  "2025-02-26", // Maha Shivaratri
  "2025-03-14", // Holi
  "2025-03-31", // Id‑ul‑Fitr
  "2025-04-10", // Mahavir Jayanti
  "2025-04-14", // Ambedkar Jayanti
  "2025-04-18", // Good Friday
  "2025-05-12", // Buddha Purnima
  "2025-06-07", // Bakrid (Eid al‑Adha)
  "2025-07-06", // Muharram
  "2025-08-15", // Independence Day
  "2025-08-16", // Janmashtami (Delhi observes)
  "2025-09-05", // Milad‑un‑Nabi
  "2025-10-02", // Gandhi Jayanti (and Dussehra same day)
  "2025-10-20", // Diwali
  "2025-11-05", // Guru Nanak Jayanti
  "2025-12-25", // Christmas

  // All days from today through July
  "2025-06-25","2025-06-26","2025-06-27","2025-06-28",
  "2025-06-29","2025-06-30","2025-07-01"
];

    const dateStr = date.toISOString().split('T')[0];
    return holidays.includes(dateStr) || date.getDay() === 0 || date.getDay() === 6;
}

async function checkTodaysSchedule() {
    const today = getTodayString();
    const localData = localStorage.getItem(`schedule_${today}`);
    if (localData) return true;
    
    if (!db) return false;
    
    try {
        const doc = await db.collection('schedules').doc(today).get();
        return doc.exists;
    } catch (error) {
        console.error('Error checking today\'s schedule:', error);
        return false;
    }
}

function generateTimeSlots(isHoliday = false) {
    const slots = [];
    
    for (let hour = TIME_CONSTRAINTS.wakeTime; hour < TIME_CONSTRAINTS.sleepTime; hour++) {
        if (!isHoliday && hour >= TIME_CONSTRAINTS.schoolStart && hour < TIME_CONSTRAINTS.schoolEnd) {
            slots.push({
                startTime: hour,
                endTime: hour + 1,
                type: 'school',
                activity: 'School Time',
                duration: 1
            });
        } else {
            slots.push({
                startTime: hour,
                endTime: hour + 1,
                type: 'free',
                activity: 'Free Time',
                duration: 1
            });
        }
    }
    
    return slots;
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

async function generateSchedule() {
    const hasSchedule = await checkTodaysSchedule();
    
    if (hasSchedule) {
        showStatus('Today\'s schedule already exists! Load it from previous plans or wait until tomorrow.', 'info');
        return;
    }

    const today = new Date();
    const holiday = isHoliday(today);
    let slots = generateTimeSlots(holiday);
    const freeSlots = slots.filter(slot => slot.type === 'free');
    const shuffledFreeSlots = shuffleArray(freeSlots);
    
    let studySessions = 0;
    let totalStudyTime = 0;
    let hasArtSession = false;
    let hasAnimeSession = false;
    let hasGamingSession = holiday; // Gaming only on holidays

    // Allocate study sessions
    for (let slot of shuffledFreeSlots) {
        if (studySessions < USAGE_CONSTRAINTS.maxStudySessions && 
            totalStudyTime < USAGE_CONSTRAINTS.maxStudySessions * USAGE_CONSTRAINTS.maxStudyLength) {
            
            const remainingStudyTime = (USAGE_CONSTRAINTS.maxStudySessions * USAGE_CONSTRAINTS.maxStudyLength) - totalStudyTime;
            const sessionLength = Math.min(USAGE_CONSTRAINTS.maxStudyLength, remainingStudyTime);
            
            const slotIndex = slots.findIndex(s => s === slot);
            let canAllocate = true;
            
            for (let i = 0; i < sessionLength; i++) {
                if (slotIndex + i >= slots.length || slots[slotIndex + i].type !== 'free') {
                    canAllocate = false;
                    break;
                }
            }
            
            if (canAllocate) {
                for (let i = 0; i < sessionLength; i++) {
                    slots[slotIndex + i].type = 'study';
                    slots[slotIndex + i].activity = `Study Session ${studySessions + 1}`;
                }
                studySessions++;
                totalStudyTime += sessionLength;
            }
        }
    }

    // Allocate art, anime, and gaming sessions
    const remainingFreeSlots = slots.filter(slot => slot.type === 'free');
    const shuffledRemainingSlots = shuffleArray(remainingFreeSlots);
    
    for (let slot of shuffledRemainingSlots) {
        const slotIndex = slots.findIndex(s => s === slot);
        const prevSlot = slotIndex > 0 ? slots[slotIndex - 1] : null;
        const canAllocateArt = !prevSlot || prevSlot.type !== 'study';
        
        if (!hasArtSession && canAllocateArt) {
            slot.type = 'art';
            slot.activity = 'Art Session';
            slot.details = getRandomArtGoal();
            hasArtSession = true;
        } else if (!hasAnimeSession) {
            slot.type = 'anime';
            slot.activity = 'Anime Time';
            hasAnimeSession = true;
        } else if (holiday && !hasGamingSession) {
            slot.type = 'gaming';
            slot.activity = 'Gaming Time';
            hasGamingSession = true;
        }
        
        if (hasArtSession && hasAnimeSession && (!holiday || hasGamingSession)) break;
    }

    // Add extra time for holidays
    if (holiday) {
        const extraSlots = slots.filter(slot => slot.type === 'free').slice(0, HOLIDAY_EXTRA_TIME.art + HOLIDAY_EXTRA_TIME.anime);
        let artAdded = 0, animeAdded = 0;
        
        for (let slot of extraSlots) {
            if (artAdded < HOLIDAY_EXTRA_TIME.art) {
                slot.type = 'art';
                slot.activity = 'Art Session (Extra)';
                artAdded++;
            } else if (animeAdded < HOLIDAY_EXTRA_TIME.anime) {
                slot.type = 'anime';
                slot.activity = 'Anime Time (Extra)';
                animeAdded++;
            }
        }
    }

    currentSchedule = {
        date: getTodayString(),
        slots: slots,
        stats: {
            studyTime: totalStudyTime,
            artTime: hasArtSession ? (holiday ? 1 + HOLIDAY_EXTRA_TIME.art : 1) : 0,
            animeTime: hasAnimeSession ? (holiday ? 1 + HOLIDAY_EXTRA_TIME.anime : 1) : 0,
            gamingTime: hasGamingSession ? HOLIDAY_EXTRA_TIME.gaming : 0,
            screenTime: (hasArtSession ? 1 : 0) + 
                       (hasAnimeSession ? 1 : 0) + 
                       (hasGamingSession ? HOLIDAY_EXTRA_TIME.gaming : 0) +
                       (holiday ? HOLIDAY_EXTRA_TIME.art + HOLIDAY_EXTRA_TIME.anime : 0)
        }
    };

    displaySchedule(currentSchedule);
    enableButtons();
    showStatus('Schedule generated successfully!', 'success');
}

function displaySchedule(scheduleData) {
    const scheduleContent = document.getElementById('scheduleContent');
    const scheduleDate = document.getElementById('scheduleDate');
    
    scheduleDate.textContent = new Date(scheduleData.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    let html = '';
    
    for (let slot of scheduleData.slots) {
        const timeRange = `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`;
        
        html += `
            <div class="time-slot ${slot.type}">
                <div class="time-info">
                    <div class="time-range">${timeRange}</div>
                    <div class="activity">${slot.activity}</div>
                    ${slot.details ? `<div class="activity-details">${slot.details}</div>` : ''}
                </div>
                <div class="duration">${slot.duration}h</div>
            </div>
        `;
    }
    
    scheduleContent.innerHTML = html;
    updateStats(scheduleData.stats);
}

function updateStats(stats) {
    document.getElementById('studyTime').textContent = `${stats.studyTime}h`;
    document.getElementById('artTime').textContent = `${stats.artTime}h`;
    document.getElementById('animeTime').textContent = `${stats.animeTime}h`;
    document.getElementById('gamingTime').textContent = `${stats.gamingTime}h`;
    document.getElementById('screenTime').textContent = `${stats.screenTime}h`;
    document.getElementById('stats').style.display = 'grid';
}

function enableButtons() {
    document.getElementById('saveBtn').disabled = false;
    document.getElementById('downloadBtn').disabled = false;
}

async function saveToFirebase() {
    if (!currentSchedule) {
        showStatus('Cannot save - no schedule generated', 'error');
        return;
    }

    const saveBtn = document.getElementById('saveBtn');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<span class="loading"></span>Saving...';
    saveBtn.disabled = true;

    try {
        // Save to localStorage
        localStorage.setItem(`schedule_${currentSchedule.date}`, JSON.stringify(currentSchedule));
        
        // Save to Firebase if connected
        if (db) {
            await db.collection('schedules').doc(currentSchedule.date).set(currentSchedule);
        }
        
        showStatus('Schedule saved successfully!', 'success');
        todaysPlanExists = true;
    } catch (error) {
        console.error('Error saving schedule:', error);
        showStatus('Failed to save schedule', 'error');
    }

    saveBtn.innerHTML = originalText;
    saveBtn.disabled = false;
}

function renderCalendar() {
    const calendarEl = document.getElementById('calendar');
    calendarEl.innerHTML = '';
    
    // Create calendar header
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(day => {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-header';
        dayEl.textContent = day;
        calendarEl.appendChild(dayEl);
    });
    
    // Get current date
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    // Get first day of month
    const firstDay = new Date(year, month, 1).getDay();
    
    // Get days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Create empty slots for days before first day
    for (let i = 0; i < firstDay; i++) {
        const emptyEl = document.createElement('div');
        emptyEl.className = 'calendar-day';
        calendarEl.appendChild(emptyEl);
    }
    
    // Create day slots
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.textContent = day;
        dayEl.dataset.date = dateStr;
        
        // Highlight today
        if (dateStr === getTodayString()) {
            dayEl.classList.add('selected');
            selectedDate = dateStr;
        }
        
        // Mark days with schedules
        if (localStorage.getItem(`schedule_${dateStr}`) || 
            (db && db.collection('schedules').doc(dateStr).get().then(doc => doc.exists))) {
            dayEl.classList.add('has-schedule');
        }
        
        dayEl.addEventListener('click', () => {
            document.querySelectorAll('.calendar-day').forEach(el => {
                el.classList.remove('selected');
            });
            dayEl.classList.add('selected');
            selectedDate = dateStr;
        });
        
        calendarEl.appendChild(dayEl);
    }
}

function showCalendarModal() {
    document.getElementById('calendarModal').style.display = 'block';
}

function closeCalendarModal() {
    document.getElementById('calendarModal').style.display = 'none';
}

async function loadSelectedSchedule() {
    if (!selectedDate) {
        showStatus('Please select a date first', 'error');
        return;
    }
    
    closeCalendarModal();
    
    const loadBtn = document.getElementById('loadBtn');
    const originalText = loadBtn.innerHTML;
    loadBtn.innerHTML = '<span class="loading"></span>Loading...';
    
    try {
        // Try loading from localStorage first
        const localData = localStorage.getItem(`schedule_${selectedDate}`);
        if (localData) {
            currentSchedule = JSON.parse(localData);
            displaySchedule(currentSchedule);
            enableButtons();
            showStatus(`Loaded schedule from ${new Date(selectedDate).toLocaleDateString()}`, 'success');
            loadBtn.innerHTML = originalText;
            return;
        }
        
        // If not in localStorage, try Firebase
        if (db) {
            const doc = await db.collection('schedules').doc(selectedDate).get();
            if (doc.exists) {
                currentSchedule = doc.data();
                displaySchedule(currentSchedule);
                enableButtons();
                showStatus(`Loaded schedule from ${new Date(selectedDate).toLocaleDateString()}`, 'success');
            } else {
                showStatus('No schedule found for selected date', 'info');
            }
        } else {
            showStatus('No schedule found for selected date', 'info');
        }
    } catch (error) {
        console.error('Error loading schedule:', error);
        showStatus('Failed to load schedule', 'error');
    }
    
    loadBtn.innerHTML = originalText;
}

async function downloadSchedule() {
    if (!currentSchedule) {
        showStatus('No schedule to download', 'error');
        return;
    }

    const downloadBtn = document.getElementById('downloadBtn');
    const originalText = downloadBtn.innerHTML;
    downloadBtn.innerHTML = '<span class="loading"></span>Generating...';

    try {
        const scheduleContainer = document.getElementById('scheduleContainer');
        const canvas = await html2canvas(scheduleContainer, {
            backgroundColor: '#ffffff',
            scale: 2
        });

        const link = document.createElement('a');
        link.download = `schedule-${currentSchedule.date}.png`;
        link.href = canvas.toDataURL();
        link.click();

        showStatus('Schedule downloaded successfully!', 'success');
    } catch (error) {
        console.error('Error downloading schedule:', error);
        showStatus('Failed to download schedule', 'error');
    }

    downloadBtn.innerHTML = originalText;
}

// Initialize app
window.onload = async () => {
    document.getElementById('scheduleDate').textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Check if today's schedule exists
    const hasSchedule = await checkTodaysSchedule();
    if (hasSchedule) {
        document.getElementById('generateBtn').disabled = true;
        document.getElementById('generateBtn').textContent = 'Schedule Locked Until Tomorrow';
        showStatus('Today\'s schedule is already saved. Use the calendar to view it.', 'info');
    }
};