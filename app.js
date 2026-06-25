/* ==========================================================================
   OriginAnecdote Controller - Frontend Business Logic & Interactions
   ========================================================================== */

// --- Mock Database / Application State ---
const state = {
  teacherTimezone: 'Asia/Tokyo', // JST (GMT+9)
  simulatedTimezone: 'Asia/Tokyo', // Currently active view timezone
  activeTab: 'dashboard',
  weeklyEarnings: 3420,
  teachingHours: 124,

  // Student CRM Database
  students: [
    {
      id: 101,
      name: 'Yuki Tanaka',
      flag: '🇯🇵',
      city: 'Tokyo',
      country: 'Japan',
      timezone: 'Asia/Tokyo', // GMT+9
      level: 'B2',
      topic: 'Business Presentation Prep',
      lessonsCompleted: 24,
      nextLessonTime: '2026-06-25T11:30:00+09:00', // Today at 11:30 AM
      avatarBg: 'red-bg',
      notes: 'Focus on pronunciation of financial vocabulary and transitions in speech. Yuki has a presentation to European stakeholders next Tuesday.'
    },
    {
      id: 102,
      name: 'Mateo Silva',
      flag: '🇧🇷',
      city: 'São Paulo',
      country: 'Brazil',
      timezone: 'America/Sao_Paulo', // GMT-3 (12 hours behind JST)
      level: 'A2',
      topic: 'Everyday Conversational English',
      lessonsCompleted: 8,
      nextLessonTime: '2026-06-25T14:00:00+09:00', // Today at 2 PM JST (2 AM Sao Paulo)
      avatarBg: 'blue-bg',
      notes: 'Mateo needs patience with verbs conjugation. Prefers visual aids. Focus on simple past tense during this session.'
    },
    {
      id: 103,
      name: 'Chloe Dubois',
      flag: '🇫🇷',
      city: 'Paris',
      country: 'France',
      timezone: 'Europe/Paris', // GMT+2 (7 hours behind JST)
      level: 'C1',
      topic: 'C1 Cambridge Exam Training',
      lessonsCompleted: 15,
      nextLessonTime: '2026-06-25T18:30:00+09:00', // Today at 6:30 PM JST (11:30 AM Paris)
      avatarBg: 'purple-bg',
      notes: 'Review essay writing techniques. Highly articulate but struggles with advanced phrasal verbs.'
    },
    {
      id: 104,
      name: 'Li Wei',
      flag: '🇨🇳',
      city: 'Beijing',
      country: 'China',
      timezone: 'Asia/Shanghai', // GMT+8 (1 hour behind JST)
      level: 'B1',
      topic: 'Vocabulary & Idiomatic Expressions',
      lessonsCompleted: 32,
      nextLessonTime: '2026-06-25T21:00:00+09:00', // Today at 9 PM JST (8 PM Beijing)
      avatarBg: 'teal-bg',
      notes: 'Wants to learn colloquial expressions. Needs encouragement to speak faster. Good understanding of basic grammar.'
    },
    {
      id: 105,
      name: 'Hans Koch',
      flag: '🇩🇪',
      city: 'Berlin',
      country: 'Germany',
      timezone: 'Europe/Berlin', // GMT+2 (7 hours behind JST)
      level: 'B2',
      topic: 'Business Conversation',
      lessonsCompleted: 10,
      nextLessonTime: null,
      avatarBg: 'pink-bg',
      notes: 'Focus on technical engineering vocabulary. Enjoys debates on technology topics.'
    },
    {
      id: 106,
      name: 'Amara Awolowo',
      flag: '🇳🇬',
      city: 'Lagos',
      country: 'Nigeria',
      timezone: 'Africa/Lagos', // GMT+1 (8 hours behind JST)
      level: 'C1',
      topic: 'IELTS Speaking Prep',
      lessonsCompleted: 4,
      nextLessonTime: null,
      avatarBg: 'orange-bg',
      notes: 'Prepare for IELTS Part 2 cue card descriptions. High grammatical accuracy, needs minor adjustments on coherence.'
    }
  ],

  // Booking Requests
  bookingRequests: [
    {
      id: 1,
      studentId: 106,
      studentName: 'Amara Awolowo',
      flag: '🇳🇬',
      city: 'Lagos',
      country: 'Nigeria',
      timezone: 'Africa/Lagos', // GMT+1
      level: 'C1',
      topic: 'IELTS Prep',
      dayOfWeek: 5, // Friday
      hour: 15,    // 15:00 JST (07:00 Lagos time)
      avatarBg: 'orange-bg',
      message: "Hi Sarah! I really need to practice for the IELTS speaking test this Friday. Please let me know if this slot works."
    },
    {
      id: 2,
      studentId: 105,
      studentName: 'Hans Koch',
      flag: '🇩🇪',
      city: 'Berlin',
      country: 'Germany',
      timezone: 'Europe/Berlin', // GMT+2
      level: 'B2',
      topic: 'Business Conversation',
      dayOfWeek: 6, // Saturday
      hour: 17,    // 17:00 JST (10:00 Berlin time)
      avatarBg: 'pink-bg',
      message: "Hello, let's discuss European market logistics this Saturday."
    }
  ],

  // Weekly Calendar Availability state
  // 7 days (0: Mon - 6: Sun). Store slot status: 'empty', 'available', 'booked', 'pending'
  // Initial database filled with slots
  availability: {}
};

// --- Timezone Offsets Database (Mock translation for offline simplicity) ---
// Relative to JST (GMT+9)
const TZ_OFFSETS = {
  'Asia/Tokyo': 0,
  'Asia/Shanghai': -1,
  'Africa/Lagos': -8,
  'Europe/Paris': -7,
  'Europe/Berlin': -7,
  'Europe/London': -8,
  'America/New_York': -13,
  'America/Sao_Paulo': -12
};

// --- Initialize Availability Data ---
function initAvailability() {
  state.availability = {};
  for (let day = 0; day < 7; day++) {
    state.availability[day] = {};
    for (let hour = 8; hour <= 21; hour++) {
      // Default state is empty
      state.availability[day][hour] = {
        status: 'empty',
        studentId: null,
        studentName: '',
        topic: ''
      };
    }
  }

  // Pre-fill some standard available blocks
  for (let day = 0; day < 5; day++) { // Mon - Fri
    state.availability[day][9] = { status: 'available' };
    state.availability[day][10] = { status: 'available' };
    state.availability[day][14] = { status: 'available' };
    state.availability[day][15] = { status: 'available' };
    state.availability[day][18] = { status: 'available' };
    state.availability[day][19] = { status: 'available' };
    state.availability[day][20] = { status: 'available' };
  }

  // Pre-fill Booked lessons from students list
  state.students.forEach(student => {
    if (student.nextLessonTime) {
      const date = new Date(student.nextLessonTime);
      // Mock day extraction for our current week (June 22 - June 28, 2026)
      // June 22, 2026 is Monday
      const day = date.getDay() === 0 ? 6 : date.getDay() - 1; // Translate getDay (0 Sun - 6 Sat) to (0 Mon - 6 Sun)
      const hour = date.getHours();

      if (state.availability[day] && state.availability[day][hour]) {
        state.availability[day][hour] = {
          status: 'booked',
          studentId: student.id,
          studentName: student.name + ' ' + student.flag,
          topic: student.topic
        };
      }
    }
  });

  // Pre-fill Pending requests
  state.bookingRequests.forEach(req => {
    if (state.availability[req.dayOfWeek] && state.availability[req.dayOfWeek][req.hour]) {
      state.availability[req.dayOfWeek][req.hour] = {
        status: 'pending',
        requestId: req.id,
        studentName: req.studentName + ' ' + req.flag,
        topic: req.topic
      };
    }
  });
}

// --- Dynamic Timezone Conversion helpers ---
// Simulates target time from base teacher time (JST)
function translateTime(hour, sourceTz, targetTz) {
  const sourceOffset = TZ_OFFSETS[sourceTz] || 0;
  const targetOffset = TZ_OFFSETS[targetTz] || 0;
  const diff = targetOffset - sourceOffset;
  
  let translatedHour = hour + diff;
  let dayOffset = 0;

  if (translatedHour >= 24) {
    translatedHour -= 24;
    dayOffset = 1;
  } else if (translatedHour < 0) {
    translatedHour += 24;
    dayOffset = -1;
  }

  return {
    hour: translatedHour,
    dayOffset: dayOffset
  };
}

function getFormattedTime(hour, minute = 0) {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const displayMin = minute.toString().padStart(2, '0');
  return `${displayHour}:${displayMin} ${ampm}`;
}

// Returns real time string in target timezone based on local device date
function getLiveTimeInTimezone(timezoneName) {
  const offset = TZ_OFFSETS[timezoneName];
  if (offset === undefined) return new Date().toLocaleTimeString();
  
  // Calculate relative JST time first (our base is current system clock assuming it runs local)
  // To keep it simple, we use native Intl api which handles timezone conversion on any modern system:
  try {
    const options = {
      timeZone: timezoneName,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    return new Intl.DateTimeFormat('en-US', options).format(new Date());
  } catch (e) {
    // Fallback if timezone not supported
    return new Date().toLocaleTimeString();
  }
}

// --- Application Core Initializers & Views ---

document.addEventListener('DOMContentLoaded', () => {
  initAvailability();
  setupNavigation();
  initLiveClocks();
  updateCountdown();
  renderBookingRequests();
  renderSchedule();
  renderStudentsList();
  renderSidebarTzReference();
  initNotificationBell();
  setupSchedulePresets();

  // Setup click triggers on booking request actions
  document.addEventListener('click', handleGlobalClickEvents);
});

// --- Tab Navigation Setup ---
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const panels = document.querySelectorAll('.view-panel');
  const pageTitle = document.getElementById('page-title');
  const pageSubtitle = document.getElementById('page-subtitle');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = item.getAttribute('data-tab');
      state.activeTab = tab;

      // Toggle active states on buttons
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');

      // Toggle active views
      panels.forEach(panel => panel.classList.remove('active'));
      const activePanel = document.getElementById(`view-${tab}`);
      if (activePanel) {
        activePanel.classList.add('active');
      }

      // Update titles dynamically
      switch(tab) {
        case 'dashboard':
          pageTitle.innerText = "Welcome back, Sarah!";
          pageSubtitle.innerText = "Here is what's happening with your international classes today.";
          break;
        case 'schedule':
          pageTitle.innerText = "Schedule & Availability Editor";
          pageSubtitle.innerText = "Manage your slot availability. Toggle perspectives to preview student timeframes.";
          renderSchedule(); // Render grid on load
          break;
        case 'students':
          pageTitle.innerText = "Student Directory & CRM";
          pageSubtitle.innerText = "Track individual language levels, local student times, and notes.";
          renderStudentsList();
          break;
        case 'insights':
          pageTitle.innerText = "Earnings & Region Insights";
          pageSubtitle.innerText = "Analyze your revenue metrics and identify peak student booking windows.";
          break;
        case 'settings':
          pageTitle.innerText = "Account & Preferences";
          pageSubtitle.innerText = "Configure timezone preferences, default lesson lengths, and integrations.";
          break;
      }
    });
  });
}

// --- Clocks and Timers ---
function initLiveClocks() {
  // Update Teacher clock in Header
  const teacherClock = document.getElementById('teacher-live-clock');
  
  setInterval(() => {
    if (teacherClock) {
      teacherClock.innerText = getLiveTimeInTimezone('Asia/Tokyo');
    }

    // Update active student clocks in student card sections
    const studentClocks = document.querySelectorAll('.student-live-clock');
    studentClocks.forEach(clock => {
      const tz = clock.getAttribute('data-tz');
      if (tz) {
        const timeStr = getLiveTimeInTimezone(tz);
        clock.innerText = timeStr;
      }
    });

    // Update CRM card local times
    const crmTimes = document.querySelectorAll('.crm-live-time');
    crmTimes.forEach(timeSpan => {
      const tz = timeSpan.getAttribute('data-tz');
      if (tz) {
        const timeStr = getLiveTimeInTimezone(tz);
        timeSpan.innerText = timeStr;

        // Extract hour to determine daytime/nighttime status
        // A simple check: if time string has 'PM' or 'AM', extract hour
        // E.g., "10:04:12 PM"
        const hourMatch = timeStr.match(/^(\d+):/);
        const isPM = timeStr.includes('PM');
        if (hourMatch) {
          let hour = parseInt(hourMatch[1]);
          if (isPM && hour !== 12) hour += 12;
          if (!isPM && hour === 12) hour = 0;

          const container = timeSpan.closest('.crm-live-clock-banner');
          const moonIcon = container.querySelector('.fa-moon');
          const sunIcon = container.querySelector('.fa-sun');

          if (hour >= 22 || hour < 6) { // Sleeping hours
            timeSpan.className = 'crm-live-time sleeping';
            if (moonIcon) moonIcon.classList.remove('hidden');
            if (sunIcon) sunIcon.classList.add('hidden');
          } else {
            timeSpan.className = 'crm-live-time active-day';
            if (moonIcon) moonIcon.classList.add('hidden');
            if (sunIcon) sunIcon.classList.remove('hidden');
          }
        }
      }
    });

    // Update sidebar timezone list clocks
    const sidebarClocks = document.querySelectorAll('.sidebar-live-time');
    sidebarClocks.forEach(span => {
      const tz = span.getAttribute('data-tz');
      if (tz) {
        const timeStr = getLiveTimeInTimezone(tz);
        span.innerText = timeStr.substring(0, 5) + ' ' + timeStr.substring(timeStr.length - 2); // Show compact e.g. "10:04 AM"
      }
    });
  }, 1000);
}

// Countdown timer to the next scheduled lesson
function updateCountdown() {
  const timerElement = document.getElementById('countdown-timer');
  const detailsElement = document.getElementById('countdown-student-details');
  if (!timerElement) return;

  // Find next booked class
  let nextLesson = null;
  const now = new Date();

  state.students.forEach(student => {
    if (student.nextLessonTime) {
      const lessonDate = new Date(student.nextLessonTime);
      if (lessonDate > now) {
        if (!nextLesson || lessonDate < new Date(nextLesson.nextLessonTime)) {
          nextLesson = student;
        }
      }
    }
  });

  if (nextLesson) {
    const lessonDate = new Date(nextLesson.nextLessonTime);
    
    const updateTime = () => {
      const diffMs = lessonDate - new Date();
      if (diffMs <= 0) {
        timerElement.innerText = "Class Starting!";
        detailsElement.innerText = `with ${nextLesson.name} ${nextLesson.flag}`;
        return;
      }

      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      const hrsStr = diffHrs.toString().padStart(2, '0');
      const minsStr = diffMins.toString().padStart(2, '0');

      timerElement.innerText = `${hrsStr}h ${minsStr}m`;
      detailsElement.innerText = `with ${nextLesson.name} ${nextLesson.flag}`;
    };

    updateTime();
    // Run periodically
    setInterval(updateTime, 60000);
  } else {
    timerElement.innerText = "No Classes";
    detailsElement.innerText = "No upcoming lessons scheduled";
  }
}

// --- Notification Bell Toggle ---
function initNotificationBell() {
  const bell = document.getElementById('notification-bell');
  const dropdown = document.getElementById('notification-dropdown');
  const markRead = document.querySelector('.mark-all-read');

  if (bell && dropdown) {
    bell.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
      dropdown.classList.add('hidden');
    });

    dropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  if (markRead) {
    markRead.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.notification-item').forEach(item => {
        item.classList.remove('unread');
      });
      const badge = document.querySelector('.notification-badge');
      if (badge) badge.remove();
      showToast('All notifications marked as read', 'info');
    });
  }
}

// --- Booking Requests Renderer ---
function renderBookingRequests() {
  const reqListContainer = document.getElementById('booking-requests-list');
  const countBadge = document.getElementById('pending-requests-count');
  if (!reqListContainer) return;

  reqListContainer.innerHTML = '';
  countBadge.innerText = state.bookingRequests.length;

  if (state.bookingRequests.length === 0) {
    reqListContainer.innerHTML = `
      <div class="empty-state-card text-center p-6">
        <i class="fa-solid fa-calendar-check text-muted" style="font-size: 2.5rem; margin-bottom: 1rem;"></i>
        <p class="text-muted">No pending class requests.</p>
      </div>
    `;
    return;
  }

  state.bookingRequests.forEach(req => {
    // Determine student time matching suitability (Alert level)
    const studentTime = translateTime(req.hour, state.teacherTimezone, req.timezone);
    const studentHour = studentTime.hour;
    
    let alertClass = 'warning-msg';
    let alertIcon = 'fa-circle-info';
    let alertText = '';

    if (studentHour >= 22 || studentHour < 6) { // Nighttime
      alertText = `Time is very early/late (${getFormattedTime(studentHour)}) for student (Night).`;
    } else if (studentHour >= 9 && studentHour <= 18) { // Business / prime school hour
      alertClass = 'success-msg';
      alertIcon = 'fa-circle-check';
      alertText = `Great overlap! Matches ${req.studentName}'s daytime study preferences (${getFormattedTime(studentHour)}).`;
    } else {
      alertText = `Time translates to ${getFormattedTime(studentHour)} for student.`;
    }

    const card = document.createElement('div');
    card.className = 'booking-request-card';
    card.id = `request-${req.id}`;
    card.innerHTML = `
      <div class="req-header">
        <div class="student-avatar text-avatar ${req.avatarBg}">${req.studentName.split(' ').map(n=>n[0]).join('')}</div>
        <div class="req-student-info">
          <h4>${req.studentName} <span class="flag-icon">${req.flag}</span></h4>
          <span class="req-subtitle">${req.city}, ${req.country} (${req.timezone.split('/')[1].replace('_', ' ')}) • ${req.topic}</span>
        </div>
      </div>
      <div class="req-time-comparison">
        <div class="time-comp-box">
          <span class="comp-label">Your Time (JST)</span>
          <span class="comp-val">Fri, June 26 @ ${getFormattedTime(req.hour)}</span>
        </div>
        <div class="time-comp-divider"><i class="fa-solid fa-arrow-right-arrow-left"></i></div>
        <div class="time-comp-box">
          <span class="comp-label">Student Time</span>
          <span class="comp-val">Fri, June 26 @ ${getFormattedTime(studentHour)} ${studentTime.dayOffset !== 0 ? (studentTime.dayOffset > 0 ? '+1d' : '-1d') : ''}</span>
        </div>
      </div>
      <div class="req-tz-alert ${alertClass}">
        <i class="fa-solid ${alertIcon}"></i> ${alertText}
      </div>
      <div class="req-actions">
        <button class="btn btn-sm btn-danger btn-decline-req" data-id="${req.id}">Decline</button>
        <button class="btn btn-sm btn-outline-secondary btn-resched-req" data-id="${req.id}">Suggest Time</button>
        <button class="btn btn-sm btn-success btn-accept-req" data-id="${req.id}">Approve Class</button>
      </div>
    `;
    reqListContainer.appendChild(card);
  });
}

// --- Interactive Schedule Calendar Grid Renderer ---
function renderSchedule() {
  const gridContainer = document.getElementById('calendar-grid');
  const weekLabel = document.getElementById('current-week-label');
  const perspectiveIndicator = document.getElementById('perspective-indicator-msg');
  const perspectiveTzName = document.getElementById('perspective-tz-name');
  const perspectiveTzOffset = document.getElementById('perspective-tz-offset');

  if (!gridContainer) return;

  // Set week indicator (Static for demonstration)
  weekLabel.innerText = "Week of June 22 - June 28, 2026";

  const isSimulated = state.simulatedTimezone !== state.teacherTimezone;

  // Manage simulator banner warning
  if (isSimulated) {
    perspectiveIndicator.classList.remove('hidden');
    perspectiveTzName.innerText = state.simulatedTimezone;
    const offsetDiff = TZ_OFFSETS[state.simulatedTimezone] - TZ_OFFSETS[state.teacherTimezone];
    perspectiveTzOffset.innerText = `${offsetDiff >= 0 ? '+' : ''}${offsetDiff} hours`;
  } else {
    perspectiveIndicator.classList.add('hidden');
  }

  // Clear previous grid HTML
  gridContainer.innerHTML = '';

  // Render headers (Column titles)
  // First column header is empty (for time labels column)
  const emptyHeader = document.createElement('div');
  emptyHeader.className = 'grid-header-cell';
  gridContainer.appendChild(emptyHeader);

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const DATES = [22, 23, 24, 25, 26, 27, 28]; // Monday June 22, etc.

  DAYS.forEach((day, index) => {
    const headerCell = document.createElement('div');
    headerCell.className = 'grid-header-cell';
    // Highlight today (Assuming today is Thursday, June 25, 2026)
    if (day === 'Thu') {
      headerCell.classList.add('today');
    }
    headerCell.innerHTML = `
      <span class="day-name">${day}</span>
      <span class="day-date">${DATES[index]}</span>
    `;
    gridContainer.appendChild(headerCell);
  });

  // Render Time blocks (Rows from 08:00 to 21:00)
  for (let hour = 8; hour <= 21; hour++) {
    // 1. Time Label Cell (Left column)
    const labelCell = document.createElement('div');
    labelCell.className = 'time-label-column';
    
    // In simulated mode, display time shifted for target perspective
    let displayHour = hour;
    if (isSimulated) {
      const translated = translateTime(hour, state.teacherTimezone, state.simulatedTimezone);
      displayHour = translated.hour;
    }
    labelCell.innerText = getFormattedTime(displayHour);
    gridContainer.appendChild(labelCell);

    // 2. Day columns for this hour block (7 cells)
    for (let day = 0; day < 7; day++) {
      const slotCell = document.createElement('div');
      slotCell.className = 'calendar-slot-cell';
      if (day === 3) slotCell.classList.add('today-col'); // Thursday highlight
      
      const slotData = state.availability[day][hour];
      let cellHtml = '';

      if (slotData) {
        if (slotData.status === 'empty') {
          cellHtml = `<div class="slot-block empty" data-day="${day}" data-hour="${hour}">+ Open Slot</div>`;
        } else if (slotData.status === 'available') {
          cellHtml = `<div class="slot-block available" data-day="${day}" data-hour="${hour}"><i class="fa-solid fa-check"></i> Available</div>`;
        } else if (slotData.status === 'booked') {
          cellHtml = `
            <div class="slot-block booked" title="${slotData.topic}">
              <span class="slot-student-name">${slotData.studentName}</span>
              <span class="slot-lesson-time">${getFormattedTime(hour)}</span>
            </div>
          `;
        } else if (slotData.status === 'pending') {
          cellHtml = `
            <div class="slot-block pending" title="Pending approval for ${slotData.studentName}">
              <span class="slot-student-name">${slotData.studentName}</span>
              <span class="slot-lesson-time">Pending Approval</span>
            </div>
          `;
        }
      }

      slotCell.innerHTML = cellHtml;
      gridContainer.appendChild(slotCell);
    }
  }

  // Setup selector event handler if not already done
  const select = document.getElementById('timezone-selector');
  if (select) {
    select.value = state.simulatedTimezone;
    select.onchange = (e) => {
      state.simulatedTimezone = e.target.value;
      renderSchedule();
      showToast(`Calendar perspective shifted to ${e.target.options[e.target.selectedIndex].text}`, 'info');
    };
  }
}

// --- Presets buttons logic for schedule ---
function setupSchedulePresets() {
  const morningBtn = document.getElementById('preset-morning-btn');
  const eveningBtn = document.getElementById('preset-evening-btn');
  const fullBtn = document.getElementById('preset-full-btn');
  const clearBtn = document.getElementById('clear-all-slots-btn');

  if (morningBtn) {
    morningBtn.addEventListener('click', () => {
      if (state.simulatedTimezone !== state.teacherTimezone) {
        showToast('Please shift perspective back to Teacher Timezone to edit availability.', 'error');
        return;
      }
      for (let day = 0; day < 5; day++) { // Mon - Fri
        for (let hour = 8; hour <= 12; hour++) {
          if (state.availability[day][hour].status === 'empty') {
            state.availability[day][hour].status = 'available';
          }
        }
      }
      renderSchedule();
      showToast('Opened morning slots (08:00 - 12:00) for Weekdays', 'success');
    });
  }

  if (eveningBtn) {
    eveningBtn.addEventListener('click', () => {
      if (state.simulatedTimezone !== state.teacherTimezone) {
        showToast('Please shift perspective back to Teacher Timezone to edit availability.', 'error');
        return;
      }
      for (let day = 0; day < 5; day++) { // Mon - Fri
        for (let hour = 18; hour <= 21; hour++) {
          if (state.availability[day][hour].status === 'empty') {
            state.availability[day][hour].status = 'available';
          }
        }
      }
      renderSchedule();
      showToast('Opened evening slots (18:00 - 22:00) for Weekdays', 'success');
    });
  }

  if (fullBtn) {
    fullBtn.addEventListener('click', () => {
      if (state.simulatedTimezone !== state.teacherTimezone) {
        showToast('Please shift perspective back to Teacher Timezone to edit availability.', 'error');
        return;
      }
      for (let day = 0; day < 5; day++) { // Mon - Fri
        for (let hour = 9; hour <= 17; hour++) {
          if (state.availability[day][hour].status === 'empty') {
            state.availability[day][hour].status = 'available';
          }
        }
      }
      renderSchedule();
      showToast('Opened full business day slots (09:00 - 17:00) for Weekdays', 'success');
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (state.simulatedTimezone !== state.teacherTimezone) {
        showToast('Please shift perspective back to Teacher Timezone to edit availability.', 'error');
        return;
      }
      for (let day = 0; day < 7; day++) {
        for (let hour = 8; hour <= 21; hour++) {
          if (state.availability[day][hour].status === 'available') {
            state.availability[day][hour].status = 'empty';
          }
        }
      }
      renderSchedule();
      showToast('Cleared all custom availability slots', 'info');
    });
  }
}

// --- Students CRM List Renderer ---
function renderStudentsList() {
  const container = document.getElementById('students-grid');
  const searchInput = document.getElementById('student-search-input');
  const levelFilter = document.getElementById('student-level-filter');
  const countryFilter = document.getElementById('student-country-filter');

  if (!container) return;

  // Read search & filter parameters
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const selectedLevel = levelFilter ? levelFilter.value : 'all';
  const selectedCountry = countryFilter ? countryFilter.value : 'all';

  container.innerHTML = '';

  const filtered = state.students.filter(student => {
    // 1. Search filter
    const matchesSearch = student.name.toLowerCase().includes(query) ||
                          student.topic.toLowerCase().includes(query) ||
                          student.city.toLowerCase().includes(query) ||
                          student.country.toLowerCase().includes(query);
    
    // 2. Level filter
    const matchesLevel = selectedLevel === 'all' || student.level.startsWith(selectedLevel);

    // 3. Country filter
    const matchesCountry = selectedCountry === 'all' || student.country === selectedCountry;

    return matchesSearch && matchesLevel && matchesCountry;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="glass-panel text-center p-6 w-full" style="grid-column: span 3;">
        <i class="fa-solid fa-graduation-cap text-muted" style="font-size: 3.5rem; margin-bottom: 1rem;"></i>
        <h3>No students found</h3>
        <p class="text-muted">Adjust your searches or filters to view records.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(student => {
    const card = document.createElement('div');
    card.className = 'student-crm-card glass-panel';
    card.id = `student-card-${student.id}`;
    
    // Check if next lesson is defined
    let lessonInfoText = 'No lesson booked';
    if (student.nextLessonTime) {
      const date = new Date(student.nextLessonTime);
      lessonInfoText = `${date.toLocaleDateString()} @ ${getFormattedTime(date.getHours())}`;
    }

    card.innerHTML = `
      <div class="crm-header">
        <div class="crm-avatar-group">
          <div class="student-avatar text-avatar ${student.avatarBg}">${student.name.split(' ').map(n=>n[0]).join('')}</div>
          <span class="crm-flag-badge" title="${student.country}">${student.flag}</span>
        </div>
        <div class="crm-student-meta">
          <h3>${student.name}</h3>
          <span class="crm-student-loc">${student.city}, ${student.country}</span>
        </div>
        <span class="level-pill ${student.level.startsWith('A') ? 'a2-level' : student.level.startsWith('B') ? 'b2-level' : 'c1-level'}" style="margin-left: auto;">
          ${student.level}
        </span>
      </div>
      
      <!-- Student's Local Clock (Wow detail) -->
      <div class="crm-live-clock-banner">
        <span><i class="fa-solid fa-clock text-primary"></i> Local Student Time:</span>
        <div>
          <span class="crm-live-time" data-tz="${student.timezone}">10:04 AM</span>
          <i class="fa-solid fa-sun text-warning hidden"></i>
          <i class="fa-solid fa-moon text-muted hidden"></i>
        </div>
      </div>

      <div class="crm-stats-row">
        <div class="crm-stat-box">
          <span class="crm-stat-lbl">Completed</span>
          <span class="crm-stat-val">${student.lessonsCompleted} lessons</span>
        </div>
        <div class="crm-stat-box">
          <span class="crm-stat-lbl">Next Class</span>
          <span class="crm-stat-val" style="font-size: 0.72rem;">${lessonInfoText}</span>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Lesson Focus Notes</label>
        <textarea class="input-style text-area-style" rows="2" style="font-size: 0.75rem;" id="crm-note-text-${student.id}">${student.notes}</textarea>
      </div>

      <div class="crm-actions">
        <button class="btn btn-sm btn-outline-secondary btn-save-crm-note" data-id="${student.id}"><i class="fa-solid fa-floppy-disk"></i> Save Notes</button>
        <button class="btn btn-sm btn-primary" onclick="showToast('Classroom connection generated for ${student.name}', 'success')"><i class="fa-solid fa-video"></i> Start Lesson</button>
      </div>
    `;
    container.appendChild(card);
  });

  // Bind key up filters
  if (searchInput && !searchInput.dataset.bound) {
    searchInput.dataset.bound = true;
    searchInput.addEventListener('input', renderStudentsList);
    if (levelFilter) levelFilter.addEventListener('change', renderStudentsList);
    if (countryFilter) countryFilter.addEventListener('change', renderStudentsList);
  }
}

// --- Dynamic Sidebar Timezone Reference ---
function renderSidebarTzReference() {
  const container = document.getElementById('sidebar-tz-ref-list');
  if (!container) return;

  container.innerHTML = '';
  
  // List of active timezones matching our student body
  const TZ_KEYS = [
    { name: 'Tokyo 🇯🇵', tz: 'Asia/Tokyo' },
    { name: 'São Paulo 🇧🇷', tz: 'America/Sao_Paulo' },
    { name: 'Paris/Berlin 🇪🇺', tz: 'Europe/Paris' },
    { name: 'London 🇬🇧', tz: 'Europe/London' },
    { name: 'New York 🇺🇸', tz: 'America/New_York' },
    { name: 'Beijing 🇨🇳', tz: 'Asia/Shanghai' }
  ];

  TZ_KEYS.forEach(item => {
    const row = document.createElement('div');
    row.className = 'tz-ref-item';
    row.innerHTML = `
      <span class="tz-ref-student-info">${item.name}</span>
      <span class="sidebar-live-time tz-ref-time" data-tz="${item.tz}">10:04 AM</span>
    `;
    container.appendChild(row);
  });
}

// --- Global Click Event Manager (Event Delegation) ---
function handleGlobalClickEvents(e) {
  const target = e.target;

  // 1. Approve Booking request
  if (target.classList.contains('btn-accept-req')) {
    const id = parseInt(target.getAttribute('data-id'));
    approveBookingRequest(id);
  }

  // 2. Decline Booking request
  if (target.classList.contains('btn-decline-req')) {
    const id = parseInt(target.getAttribute('data-id'));
    declineBookingRequest(id);
  }

  // 3. Suggest Reschedule modal open
  if (target.classList.contains('btn-resched-req')) {
    const id = parseInt(target.getAttribute('data-id'));
    openRescheduleModal(id);
  }

  // 4. Save CRM notes text
  if (target.classList.contains('btn-save-crm-note')) {
    const id = parseInt(target.getAttribute('data-id'));
    saveStudentCrmNotes(id);
  }

  // 5. Open/Toggle Availability Grid slot
  if (target.classList.contains('slot-block') && (target.classList.contains('empty') || target.classList.contains('available'))) {
    const day = parseInt(target.getAttribute('data-day'));
    const hour = parseInt(target.getAttribute('data-hour'));
    toggleSlotAvailability(day, hour);
  }

  // 6. Close reschedule modal
  if (target.id === 'close-modal' || target.id === 'cancel-modal-btn') {
    closeRescheduleModal();
  }
}

// --- Interactive Database Operations (Mutations) ---

// Approve booking request
function approveBookingRequest(id) {
  const reqIndex = state.bookingRequests.findIndex(r => r.id === id);
  if (reqIndex === -1) return;

  const req = state.bookingRequests[reqIndex];
  
  // 1. Mutate availability slot state
  if (state.availability[req.dayOfWeek] && state.availability[req.dayOfWeek][req.hour]) {
    state.availability[req.dayOfWeek][req.hour] = {
      status: 'booked',
      studentId: req.studentId,
      studentName: req.studentName + ' ' + req.flag,
      topic: req.topic
    };
  }

  // 2. Set next lesson time on student record
  const student = state.students.find(s => s.id === req.studentId);
  if (student) {
    // Generate ISO time for Friday (June 26) or Saturday (June 27) based on dayOfWeek
    const dateStr = req.dayOfWeek === 5 ? '2026-06-26' : '2026-06-27';
    student.nextLessonTime = `${dateStr}T${req.hour.toString().padStart(2, '0')}:00:00+09:00`;
  }

  // 3. Increment counters
  state.teachingHours += 1;
  state.weeklyEarnings += 30;

  // 4. Update UI numbers
  document.querySelector('.stat-card:nth-child(1) .stat-val').innerText = `${state.teachingHours} hrs`;
  document.querySelector('.stat-card:nth-child(4) .stat-val').innerText = `$${state.weeklyEarnings}`;

  // 5. Remove from pending list
  state.bookingRequests.splice(reqIndex, 1);

  // 6. Refresh Panels
  renderBookingRequests();
  renderSchedule();
  updateCountdown();
  
  showToast(`Booking approved for ${req.studentName}. Class added to schedule!`, 'success');
}

// Decline booking request
function declineBookingRequest(id) {
  const reqIndex = state.bookingRequests.findIndex(r => r.id === id);
  if (reqIndex === -1) return;

  const req = state.bookingRequests[reqIndex];

  // 1. Reset slot availability state back to empty (or available depending on default preference)
  if (state.availability[req.dayOfWeek] && state.availability[req.dayOfWeek][req.hour]) {
    state.availability[req.dayOfWeek][req.hour] = { status: 'empty' };
  }

  // 2. Remove request
  state.bookingRequests.splice(reqIndex, 1);

  // 3. Refresh panels
  renderBookingRequests();
  renderSchedule();

  showToast(`Decline notification sent to ${req.studentName}.`, 'info');
}

// Suggest Reschedule logic
let currentReschedReqId = null;

function openRescheduleModal(id) {
  const req = state.bookingRequests.find(r => r.id === id);
  if (!req) return;

  currentReschedReqId = id;
  const modal = document.getElementById('reschedule-modal');
  modal.classList.remove('hidden');

  // Fill modal selection hours
  const select = document.getElementById('resched-time');
  select.innerHTML = '';
  for (let h = 8; h <= 21; h++) {
    const option = document.createElement('option');
    option.value = h;
    option.innerText = getFormattedTime(h) + ' JST';
    if (h === 11) option.selected = true; // Default suggestion
    select.appendChild(option);
  }

  // Bind change translation
  updateModalPerspective(req);
  select.onchange = () => updateModalPerspective(req);
}

function updateModalPerspective(req) {
  const select = document.getElementById('resched-time');
  const preview = document.getElementById('student-perspective-preview');
  const dateInput = document.getElementById('resched-date');

  const selectedHour = parseInt(select.value);
  const targetTime = translateTime(selectedHour, state.teacherTimezone, req.timezone);
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const proposedDate = new Date(dateInput.value);
  let dayName = days[proposedDate.getDay()];
  if (targetTime.dayOffset > 0) {
    dayName = days[(proposedDate.getDay() + 1) % 7];
  } else if (targetTime.dayOffset < 0) {
    dayName = days[(proposedDate.getDay() - 1 + 7) % 7];
  }

  preview.innerHTML = `${req.studentName} (${req.timezone.split('/')[1].replace('_', ' ')}) will receive this as:<br><strong>${dayName} @ ${getFormattedTime(targetTime.hour)}</strong>`;
}

function closeRescheduleModal() {
  const modal = document.getElementById('reschedule-modal');
  modal.classList.add('hidden');
  currentReschedReqId = null;
}

// Handle suggest reschedule form submit
const submitReschedBtn = document.getElementById('submit-resched-btn');
if (submitReschedBtn) {
  submitReschedBtn.addEventListener('click', () => {
    if (!currentReschedReqId) return;
    
    const req = state.bookingRequests.find(r => r.id === currentReschedReqId);
    const select = document.getElementById('resched-time');
    const dateInput = document.getElementById('resched-date');

    const selectedHour = parseInt(select.value);
    const dateStr = dateInput.value;

    // Simulate sending proposal
    showToast(`Rescheduling proposal sent to ${req.studentName} for ${dateStr} @ ${getFormattedTime(selectedHour)} JST.`, 'success');
    
    // Clear booking request cards from pending list as they are now waiting student action
    const reqIndex = state.bookingRequests.findIndex(r => r.id === currentReschedReqId);
    state.bookingRequests.splice(reqIndex, 1);

    renderBookingRequests();
    closeRescheduleModal();
  });
}

// Toggle slot click in calendar grid (Teacher perspective only)
function toggleSlotAvailability(day, hour) {
  if (state.simulatedTimezone !== state.teacherTimezone) {
    showToast('Viewing from student perspective. Grid toggles are disabled.', 'error');
    return;
  }

  const currentSlot = state.availability[day][hour];
  if (currentSlot.status === 'empty') {
    state.availability[day][hour] = { status: 'available' };
    showToast(`Slot opened: Day ${day + 1} @ ${getFormattedTime(hour)}`, 'success');
  } else if (currentSlot.status === 'available') {
    state.availability[day][hour] = { status: 'empty' };
    showToast(`Slot blocked: Day ${day + 1} @ ${getFormattedTime(hour)}`, 'info');
  }

  renderSchedule();
}

// Save Student Notes in CRM
function saveStudentCrmNotes(id) {
  const student = state.students.find(s => s.id === id);
  const noteArea = document.getElementById(`crm-note-text-${id}`);
  
  if (student && noteArea) {
    student.notes = noteArea.value;
    showToast(`Lesson focus notes updated for ${student.name}.`, 'success');
  }
}

// --- Custom Toast Manager ---
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = 'fa-circle-info';
  if (type === 'success') icon = 'fa-circle-check';
  if (type === 'error') icon = 'fa-triangle-exclamation';

  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Fade out and remove
  setTimeout(() => {
    toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 2500);
}
