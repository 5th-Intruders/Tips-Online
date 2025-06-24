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

        async function checkTodaysSchedule() {
            if (!db) return false;
            
            try {
                const today = getTodayString();
                const doc = await db.collection('schedules').doc(today).get();
                return doc.exists;
            } catch (error) {
                console.error('Error checking today\'s schedule:', error);
                return false;
            }
        }

        function generateTimeSlots() {
            const slots = [];
            
            for (let hour = TIME_CONSTRAINTS.wakeTime; hour < TIME_CONSTRAINTS.sleepTime; hour++) {
                if (hour >= TIME_CONSTRAINTS.schoolStart && hour < TIME_CONSTRAINTS.schoolEnd) {
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

            let slots = generateTimeSlots();
            const freeSlots = slots.filter(slot => slot.type === 'free');
            const shuffledFreeSlots = shuffleArray(freeSlots);
            
            let studySessions = 0;
            let totalStudyTime = 0;
            let hasArtSession = false;
            let hasAnimeSession = false;

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

            // Allocate art and anime sessions
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
                }
                
                if (hasArtSession && hasAnimeSession) break;
            }

            currentSchedule = {
                date: getTodayString(),
                slots: slots,
                stats: {
                    studyTime: totalStudyTime,
                    artTime: hasArtSession ? 1 : 0,
                    animeTime: hasAnimeSession ? 1 : 0,
                    screenTime: (hasArtSession ? 1 : 0) + (hasAnimeSession ? 1 : 0)
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
            document.getElementById('screenTime').textContent = `${stats.screenTime}h`;
            document.getElementById('stats').style.display = 'grid';
        }

        function enableButtons() {
            document.getElementById('saveBtn').disabled = false;
            document.getElementById('downloadBtn').disabled = false;
        }

        async function saveToFirebase() {
            if (!db || !currentSchedule) {
                showStatus('Cannot save - Firebase not connected or no schedule generated', 'error');
                return;
            }

            const saveBtn = document.getElementById('saveBtn');
            const originalText = saveBtn.innerHTML;
            saveBtn.innerHTML = '<span class="loading"></span>Saving...';
            saveBtn.disabled = true;

            try {
                await db.collection('schedules').doc(currentSchedule.date).set(currentSchedule);
                showStatus('Schedule saved successfully!', 'success');
                todaysPlanExists = true;
            } catch (error) {
                console.error('Error saving schedule:', error);
                showStatus('Failed to save schedule', 'error');
                saveBtn.disabled = false;
            }

            saveBtn.innerHTML = originalText;
        }

        async function loadPreviousPlans() {
            if (!db) {
                showStatus('Cannot load - Firebase not connected', 'error');
                return;
            }

            const loadBtn = document.getElementById('loadBtn');
            const originalText = loadBtn.innerHTML;
            loadBtn.innerHTML = '<span class="loading"></span>Loading...';

            try {
                const snapshot = await db.collection('schedules')
                    .orderBy('date', 'desc')
                    .limit(10)
                    .get();

                if (snapshot.empty) {
                    showStatus('No previous plans found', 'info');
                    loadBtn.innerHTML = originalText;
                    return;
                }

                // Create a simple selection interface
                const plans = [];
                snapshot.forEach(doc => {
                    plans.push({
                        id: doc.id,
                        date: doc.data().date,
                        data: doc.data()
                    });
                });

                const selectedDate = prompt(
                    'Select a date to load:\n' + 
                    plans.map((plan, index) => `${index + 1}. ${new Date(plan.date).toLocaleDateString()}`).join('\n') +
                    '\n\nEnter the number:'
                );

                if (selectedDate && selectedDate > 0 && selectedDate <= plans.length) {
                    const selectedPlan = plans[selectedDate - 1];
                    currentSchedule = selectedPlan.data;
                    displaySchedule(currentSchedule);
                    enableButtons();
                    showStatus(`Loaded schedule from ${new Date(selectedPlan.date).toLocaleDateString()}`, 'success');
                }

            } catch (error) {
                console.error('Error loading previous plans:', error);
                showStatus('Failed to load previous plans', 'error');
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
                showStatus('Today\'s schedule is already saved. Use "Load Previous Plans" to view it.', 'info');
            }
        };