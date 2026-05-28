/* ═══════════════════════════════════════════════════
   widget.js  —  Megathon Widget Logic
   Depends on: se-simulate.js (SE_API stub + jQuery stub)
   All HTML lives in index.html; all CSS in style.css.
   ═══════════════════════════════════════════════════ */

'use strict';

// ─── Inject widget HTML into #main ──────────────────────────────────────────
(function buildHTML() {
  const main = document.getElementById('main');
  if (!main) return;

  main.innerHTML = `
<div id="container">
  <div id="message"></div>
  <p id="eventTitleText">Megathon</p>
  <div id="timerContainer">
    <p id="timerText">00:00:00</p>
  </div>
  <div id="trackersContainer">
    <p id="cappedText">CAPPED!</p>
  </div>
  <div id="goalContainer">
    <div id="goalImageContainer">
      <div id="lockPadImage"></div>
      <div id="lockShackleImage"></div>
    </div>
    <p id="goalText">Goal - Reward</p>
  </div>
  <div id="summaryContainer">
    <div id="summaryTitleContainer">
      <p id="summaryTitleText">Megathon Summary</p>
    </div>
    <div id="summaryEarningsContainer">
      <p id="summaryEarningsText">$0 TOTAL!</p>
    </div>
    <div id="summaryStatsContainer">
      <div class="summaryStat"><div class="summaryStatText">START</div><div class="summaryStatValue">01-01-23</div></div>
      <div class="summaryStat"><div class="summaryStatText">SUPPORTERS</div><div class="summaryStatValue">0</div></div>
      <div class="summaryStat"><div class="summaryStatText">CHATTERS</div><div class="summaryStatValue">0</div></div>
      <div class="summaryStat"><div class="summaryStatText">END</div><div class="summaryStatValue">01-01-23</div></div>
      <div class="summaryStat"><div class="summaryStatText">SUBS</div><div class="summaryStatValue">0</div></div>
      <div class="summaryStat"><div class="summaryStatText">MESSAGES</div><div class="summaryStatValue">0</div></div>
      <div class="summaryStat"><div class="summaryStatText">HOURS</div><div class="summaryStatValue">0</div></div>
      <div class="summaryStat"><div class="summaryStatText">BITS</div><div class="summaryStatValue">0</div></div>
      <div class="summaryStat"><div class="summaryStatText">FOLLOWS</div><div class="summaryStatValue">0</div></div>
      <div class="summaryStat"><div class="summaryStatText">DAYS</div><div class="summaryStatValue">0</div></div>
      <div class="summaryStat"><div class="summaryStatText">DONOS</div><div class="summaryStatValue">0</div></div>
      <div class="summaryStat"><div class="summaryStatText">RAIDS</div><div class="summaryStatValue">0</div></div>
    </div>
    <div id="summaryStarsContainer">
      <div class="summaryStar"><div class="starTitle">SUB STAR</div><div class="starName">USER 1</div><div class="starValue">0 subs</div><div class="star"></div></div>
      <div class="summaryStar"><div class="starTitle">BIT STAR</div><div class="starName">USER 2</div><div class="starValue">0 bits</div><div class="star"></div></div>
      <div class="summaryStar"><div class="starTitle">DONO STAR</div><div class="starName">USER 3</div><div class="starValue">$0</div><div class="star"></div></div>
    </div>
  </div>
</div>`;
})();

// ─── Element references ──────────────────────────────────────────────────────
const eventTitleText   = document.getElementById('eventTitleText');
const timerText        = document.getElementById('timerText');
const trackersContainer = document.getElementById('trackersContainer');
const cappedText       = document.getElementById('cappedText');

const goalContainer      = document.getElementById('goalContainer');
const goalImageContainer = document.getElementById('goalImageContainer');
const lockPadImage       = document.getElementById('lockPadImage');
const lockShackleImage   = document.getElementById('lockShackleImage');
const goalText           = document.getElementById('goalText');

const summaryTitleText      = document.getElementById('summaryTitleText');
const summaryEarningsText   = document.getElementById('summaryEarningsText');
const summaryContainer      = document.getElementById('summaryContainer');
const summaryStatValues     = document.getElementsByClassName('summaryStatValue');
const summaryStars          = document.getElementsByClassName('summaryStar');
const starTitles            = document.getElementsByClassName('starTitle');
const starNames             = document.getElementsByClassName('starName');
const starValues            = document.getElementsByClassName('starValue');

// ─── State ───────────────────────────────────────────────────────────────────
let eventCompleted   = false;
let isEditorMode     = false;
let editSummary      = false;
let summaryEnabled   = true;
let modHelp          = true;
let ownerName        = '';
let fieldData        = {};

let timerValueRatio    = 60;
let advancedSubs       = 150;
let advancedBits       = 60;
let advancedDonos      = 60;
let useAdvancedOptions = false;
let subSplit           = 50;
let currencyCode       = 'USD';

let streamlabsDonos  = true;
let eventTitleDisplay = true;
let trackersDisplay  = true;
let trackSubs        = true;
let trackBits        = true;
let trackDonos       = true;
let capHours         = 0;
let goalType         = 'valueCount';
let goalDisplay      = true;
let startHours       = 2;

let goals              = [];
let updateGoalAnimating = false;
let currentGoalIndex   = -1;
let currentGoal        = 0;
let currentReward      = 'nothing';

let subTracker, bitTracker, donoTracker;

const savePath          = 'MegathonData';
const saveDataFrequency = 10;

let countdownInterval;
let saveDataInterval;

let eventData = {
  title:         'MEGATHON',
  startDate:     new Date(),
  endDate:       '',
  valueCount:    0,
  subCount:      0,
  bitCount:      0,
  donoCount:     0,
  raidCount:     0,
  followCount:   0,
  chatCount:     0,
  timeRemaining: 2 * 3600,
  timeCompleted: 0,
  supporters:    []
};

// Expose ownerName for the demo's fireCommand helper
Object.defineProperty(window, '_ownerName', { get: () => ownerName });

// ─── Utility ─────────────────────────────────────────────────────────────────
function pad(value) { return value.toString().padStart(2, '0'); }

function formatDate(date) {
  date = new Date(date);
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  const y = date.getFullYear().toString().slice(-2);
  return `${m}-${d}-${y}`;
}

function getDays(startDate, endDate) {
  const diff = new Date(endDate).getTime() - new Date(startDate).getTime();
  return Math.floor(diff / (1000 * 3600 * 24));
}

function formatCurrency(decimal) {
  return decimal.toLocaleString('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

// ─── CSS / Font loader ────────────────────────────────────────────────────────
function updateCSS() {
  const fontNames = [
    fieldData.eventTitleFontFace, fieldData.timerFontFace,
    fieldData.summaryFontFace,    fieldData.trackerFontFace,
    fieldData.goalFontFace
  ];

  fontNames.forEach(fontName => {
    if (!fontName) return;
    const formatted = fontName.split(' ').join('+');
    const link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${formatted}:wght@400;500;600&display=swap`;
    document.head.appendChild(link);
  });

  summaryContainer.style.fontFamily              = fieldData.summaryFontFace;
  summaryContainer.style.color                   = fieldData.summaryColor;
  summaryContainer.style.webkitTextStrokeWidth   = fieldData.summaryStrokeWidth + 'px';
  summaryContainer.style.webkitTextStrokeColor   = fieldData.summaryStrokeColor;
  summaryContainer.style.backgroundImage         = `linear-gradient(to bottom, ${fieldData.summaryBackgroundColor1}, ${fieldData.summaryBackgroundColor2})`;

  document.querySelectorAll('.star').forEach(el => {
    el.style.opacity = fieldData.summaryStarOpacity / 10;
  });

  eventTitleText.style.fontFamily            = fieldData.eventTitleFontFace;
  eventTitleText.style.color                 = fieldData.eventTitleColor;
  eventTitleText.style.webkitTextStrokeWidth = fieldData.eventTitleStrokeWidth + 'px';
  eventTitleText.style.webkitTextStrokeColor = fieldData.eventTitleStrokeColor;

  timerText.style.fontFamily            = fieldData.timerFontFace;
  timerText.style.color                 = fieldData.timerColor;
  timerText.style.webkitTextStrokeWidth = fieldData.timerStrokeWidth + 'px';
  timerText.style.webkitTextStrokeColor = fieldData.timerStrokeColor;

  document.querySelectorAll('.tracker').forEach(el => {
    el.style.fontFamily       = fieldData.trackerFontFace;
    el.style.color            = fieldData.trackerColor;
    el.style.webkitTextStroke = `${fieldData.trackerStrokeWidth}px ${fieldData.trackerStrokeColor}`;
  });

  cappedText.style.fontFamily       = fieldData.trackerFontFace;
  cappedText.style.color            = fieldData.trackerColor;
  cappedText.style.backgroundColor  = fieldData.trackerStrokeColor;

  lockShackleImage.style.backgroundColor = fieldData.goalLockColor;
  lockPadImage.style.backgroundColor     = fieldData.goalLockColor;

  goalText.style.fontFamily            = fieldData.goalFontFace;
  goalText.style.color                 = fieldData.goalColor;
  goalText.style.webkitTextStrokeWidth = fieldData.goalStrokeWidth + 'px';
  goalText.style.webkitTextStrokeColor = fieldData.goalStrokeColor;
}

// ─── Initialization ───────────────────────────────────────────────────────────
function initialize() {
  if (fieldData.currencyCode)    currencyCode       = fieldData.currencyCode;
  editSummary      = fieldData.editSummary;
  summaryEnabled   = fieldData.summaryEnabled;
  modHelp          = fieldData.modHelp;
  eventTitleDisplay = fieldData.eventTitleDisplay;
  startHours       = fieldData.startHours;
  timerValueRatio  = fieldData.timerValueRatio;
  advancedSubs     = fieldData.advancedSubs;
  advancedBits     = fieldData.advancedBits;
  advancedDonos    = fieldData.advancedDonos;
  useAdvancedOptions = fieldData.useAdvancedOptions;
  subSplit         = fieldData.subSplit;
  streamlabsDonos  = fieldData.streamlabsDonos;
  trackersDisplay  = fieldData.trackersDisplay;
  trackSubs        = fieldData.trackSubs;
  trackBits        = fieldData.trackBits;
  trackDonos       = fieldData.trackDonos;
  capHours         = fieldData.capHours;
  goalType         = `${fieldData.goalType}`;
  goalDisplay      = fieldData.goalDisplay;

  createTrackers();
  updateCSS();
  setupGoals();

  if (editSummary && isEditorMode) {
    summaryContainer.style.display = 'flex';
  } else {
    summaryContainer.style.display = 'none';
  }

  eventTitleText.style.visibility = eventTitleDisplay ? 'visible' : 'hidden';

  loadEventData();
  saveDataInterval = setInterval(saveEventData, saveDataFrequency * 1000);
  updateTimerDisplay();
}

// ─── New Event ────────────────────────────────────────────────────────────────
function newEvent() {
  eventData = {
    title:         `${fieldData.eventTitleText}`,
    startDate:     new Date(),
    endDate:       '',
    valueCount:    0,
    subCount:      0,
    bitCount:      0,
    donoCount:     0,
    raidCount:     0,
    followCount:   0,
    chatCount:     0,
    timeRemaining: startHours * 3600,
    timeCompleted: 0,
    supporters:    []
  };

  eventTitleText.textContent = eventData.title;
  eventCompleted = false;
  summaryContainer.style.display = 'none';

  checkCap();
  saveEventData();
  updateTimerDisplay();
  updateTrackerDisplays();
  setupGoals();
}

// ─── Save / Load ──────────────────────────────────────────────────────────────
function saveEventData() {
  console.log('[widget] saving event data', eventData);
  SE_API.store.set(savePath, eventData);
}

async function loadEventData() {
  try {
    console.log('[widget] loading event data');
    const loaded = await SE_API.store.get(savePath);

    if (!loaded) {
      newEvent();
    } else {
      eventData      = loaded;
      eventCompleted = eventData.endDate !== '';

      if (eventCompleted) {
        summary();
        summaryContainer.style.display = 'flex';
      }
    }
  } catch (error) {
    displayMessage('Error loading event data..', 20000);
    console.error(error);
  }

  eventTitleText.textContent = eventData.title;
  summary();
  setupGoals();
  checkCap();
  updateTrackerDisplays();
  updateTimerDisplay();
}

// ─── Summary ──────────────────────────────────────────────────────────────────
function summary() {
  if (!summaryEnabled) return;

  summaryTitleText.textContent    = eventData.title + ' Summary';
  summaryEarningsText.textContent = formatCurrency(eventData.valueCount) + ' TOTAL!';

  let chatterCount = 0;
  for (let s of eventData.supporters) {
    if (s.chats > 0) chatterCount++;
  }

  summaryStatValues[0].textContent = formatDate(eventData.startDate);
  summaryStatValues[1].textContent = eventData.supporters.length;
  summaryStatValues[2].textContent = chatterCount;

  if (eventData.endDate !== '') {
    summaryStatValues[3].textContent = formatDate(eventData.endDate);
    summaryStatValues[9].textContent = getDays(eventData.startDate, eventData.endDate);
  } else {
    summaryStatValues[3].textContent = '???';
    summaryStatValues[9].textContent = '???';
  }

  summaryStatValues[4].textContent  = eventData.subCount;
  summaryStatValues[5].textContent  = eventData.chatCount;
  summaryStatValues[6].textContent  = (eventData.timeCompleted / 3600).toFixed(1);
  summaryStatValues[7].textContent  = eventData.bitCount;
  summaryStatValues[8].textContent  = eventData.followCount;
  summaryStatValues[10].textContent = eventData.donoCount;
  summaryStatValues[11].textContent = eventData.raidCount;

  let sorted;
  if (trackDonos) {
    sorted = eventData.supporters.slice().sort((a, b) => b.donos - a.donos);
    if (sorted.length > 0 && summaryStars[2]) {
      starNames[2].textContent  = sorted[0].name.toUpperCase();
      starValues[2].textContent = formatCurrency(sorted[0].donos);
      if (!sorted[0].name || sorted[0].donos === 0) summaryStars[2].remove();
    }
  } else if (summaryStars[2]) summaryStars[2].remove();

  if (trackBits) {
    sorted = eventData.supporters.slice().sort((a, b) => b.bits - a.bits);
    if (sorted.length > 0 && summaryStars[1]) {
      starNames[1].textContent  = sorted[0].name.toUpperCase();
      starValues[1].textContent = sorted[0].bits + ' bits';
      if (!sorted[0].name || sorted[0].bits === 0) summaryStars[1].remove();
    }
  } else if (summaryStars[1]) summaryStars[1].remove();

  if (trackSubs) {
    sorted = eventData.supporters.slice().sort((a, b) => b.subs - a.subs);
    if (sorted.length > 0 && summaryStars[0]) {
      starNames[0].textContent  = sorted[0].name.toUpperCase();
      starValues[0].textContent = sorted[0].subs + ' subs';
      if (!sorted[0].name || sorted[0].subs === 0) summaryStars[0].remove();
    }
  } else if (summaryStars[0]) summaryStars[0].remove();
}

// ─── Goals ────────────────────────────────────────────────────────────────────
function setupGoals() {
  goalImageContainer.style.display   = 'flex';
  goalImageContainer.style.position  = 'static';
  currentGoalIndex  = -1;
  currentGoal       = 0;
  currentReward     = 'nothing';
  goals             = [];

  if (!goalDisplay) {
    lockShackleImage.style.visibility = 'hidden';
    lockPadImage.style.visibility     = 'hidden';
    goalText.style.visibility         = 'hidden';
    return;
  }

  for (let i = 1; i <= 20; i++) {
    goals.push({ goal: fieldData[`goal${i}`], reward: `${fieldData[`reward${i}`]}` });
  }

  goals = goals.filter(g => g.goal !== 0 && g.goal !== null && g.reward !== '');
  goals.sort((a, b) => a.goal - b.goal);

  nextGoal();
}

function nextGoal() {
  lockShackleImage.classList.remove('unlockAnimationClass');
  currentGoalIndex++;

  if (currentGoalIndex > goals.length - 1) {
    goalImageContainer.style.display   = 'none';
    goalImageContainer.style.position  = 'absolute';
    goalText.textContent = 'ALL GOALS COMPLETE!';
    goalContainer.classList.remove('newGoalAnimationClass');
    void goalContainer.offsetWidth;
    goalContainer.classList.add('newGoalAnimationClass');
    return;
  }

  currentGoal   = goals[currentGoalIndex].goal;
  currentReward = goals[currentGoalIndex].reward;
  currentGoal   = Math.max(0, parseFloat(goals[currentGoalIndex].goal - eventData[goalType]));

  goalText.textContent =
    ((goalType === 'valueCount' || goalType === 'donoCount') ? formatCurrency(currentGoal) : currentGoal) +
    (goalType === 'subCount' ? ' subs' : '') +
    (goalType === 'bitCount' ? ' bits' : '') +
    ' - ' + currentReward;

  goalContainer.classList.remove('newGoalAnimationClass');
  void goalContainer.offsetWidth;
  goalContainer.classList.add('newGoalAnimationClass');

  setTimeout(updateGoals, 2000);
}

function updateGoals() {
  if (currentGoalIndex > goals.length - 1) return;

  currentGoal = Math.max(0, parseFloat(goals[currentGoalIndex].goal - eventData[goalType]));
  goalText.textContent =
    ((goalType === 'valueCount' || goalType === 'donoCount') ? formatCurrency(currentGoal) : currentGoal) +
    (goalType === 'subCount' ? ' subs' : '') +
    (goalType === 'bitCount' ? ' bits' : '') +
    ' - ' + currentReward;

  if (currentGoal === 0 && !updateGoalAnimating) {
    updateGoalAnimating = true;

    goalImageContainer.classList.remove('rattleAnimationClass');
    void goalImageContainer.offsetWidth;
    goalImageContainer.classList.add('rattleAnimationClass');

    lockShackleImage.classList.remove('unlockAnimationClass');
    void lockShackleImage.offsetWidth;
    lockShackleImage.classList.add('unlockAnimationClass');

    goalContainer.classList.remove('newGoalAnimationClass', 'goalAnimationClass');
    void goalContainer.offsetWidth;
    goalContainer.classList.add('goalAnimationClass');

    setTimeout(() => {
      nextGoal();
      updateGoalAnimating = false;
    }, 3500);
  }
}

// ─── Cap ──────────────────────────────────────────────────────────────────────
function checkCap() {
  if (capHours > 0 && capHours * 3600 - eventData.timeCompleted - eventData.timeRemaining <= 0) {
    cappedText.style.visibility = 'visible';
  } else {
    cappedText.style.visibility = 'hidden';
  }
}

// ─── Trackers ─────────────────────────────────────────────────────────────────
function createTrackers() {
  if (!trackersDisplay) {
    trackersContainer.remove();
    return;
  }

  if (trackSubs) {
    subTracker = document.createElement('div');
    subTracker.classList.add('tracker');
    subTracker.textContent = '0 subs';
    trackersContainer.appendChild(subTracker);
  }
  if (trackBits) {
    bitTracker = document.createElement('div');
    bitTracker.classList.add('tracker');
    bitTracker.textContent = '0 bits';
    trackersContainer.appendChild(bitTracker);
  }
  if (trackDonos) {
    donoTracker = document.createElement('div');
    donoTracker.classList.add('tracker');
    donoTracker.textContent = '$0';
    trackersContainer.appendChild(donoTracker);
  }
}

function updateTrackerDisplays() {
  updateSubsDisplay();
  updateBitsDisplay();
  updateDonosDisplay();
}

function updateSubsDisplay() {
  if (!trackersDisplay || !trackSubs || !subTracker) return;
  subTracker.textContent = `${eventData.subCount} subs`;
  subTracker.classList.remove('increaseAnimationClass');
  void subTracker.offsetWidth;
  subTracker.classList.add('increaseAnimationClass');
}

function updateBitsDisplay() {
  if (!trackersDisplay || !trackBits || !bitTracker) return;
  bitTracker.textContent = `${eventData.bitCount} bits`;
  bitTracker.classList.remove('increaseAnimationClass');
  void bitTracker.offsetWidth;
  bitTracker.classList.add('increaseAnimationClass');
}

function updateDonosDisplay() {
  if (!trackersDisplay || !trackDonos || !donoTracker) return;
  donoTracker.textContent = formatCurrency(eventData.donoCount);
  donoTracker.classList.remove('increaseAnimationClass');
  void donoTracker.offsetWidth;
  donoTracker.classList.add('increaseAnimationClass');
}

// ─── Add / Sub / Set values ───────────────────────────────────────────────────
function addSubs(amount, user = 'Anonymous') {
  if (eventCompleted || !trackSubs) return;
  amount = parseInt(amount);
  let value = parseFloat(amount * 5 * subSplit / 100);
  if (isNaN(value)) return;

  eventData.subCount   += amount;
  eventData.valueCount += value;
  addTime(useAdvancedOptions ? amount * advancedSubs : value * timerValueRatio);

  user = user.toLowerCase();
  let s = eventData.supporters.find(o => o.name === user);
  if (s) { s.value += value; s.subs += amount; }
  else eventData.supporters.push({ name: user, value, subs: amount, bits: 0, donos: 0, chats: 0 });

  saveEventData();
  updateSubsDisplay();
  updateGoals();
}

function subSubs(amount) {
  if (eventCompleted || !trackSubs) return;
  amount = parseInt(amount);
  let value = parseFloat(amount * 5 * subSplit / 100);
  if (isNaN(value)) return;

  eventData.subCount   -= amount;
  eventData.valueCount -= value;
  subTime(useAdvancedOptions ? amount * advancedSubs : value * timerValueRatio);

  saveEventData();
  updateSubsDisplay();
  updateGoals();
}

function addBits(amount, user = 'Anonymous') {
  if (eventCompleted || !trackBits) return;
  amount = parseInt(amount);
  let value = parseFloat(amount / 100);
  if (isNaN(value)) return;

  eventData.bitCount   += amount;
  eventData.valueCount += value;
  addTime(useAdvancedOptions ? value * advancedBits : value * timerValueRatio);

  user = user.toLowerCase();
  let s = eventData.supporters.find(o => o.name === user);
  if (s) { s.value += value; s.bits += amount; }
  else eventData.supporters.push({ name: user, value, subs: 0, bits: amount, donos: 0, chats: 0 });

  saveEventData();
  updateBitsDisplay();
  updateGoals();
}

function addDonos(amount, user = 'Anonymous') {
  if (eventCompleted || !trackDonos) return;
  amount = parseFloat(amount);
  if (isNaN(amount)) return;

  eventData.donoCount  += amount;
  eventData.valueCount += amount;
  addTime(useAdvancedOptions ? amount * advancedDonos : amount * timerValueRatio);

  user = user.toLowerCase();
  let s = eventData.supporters.find(o => o.name === user);
  if (s) { s.value += amount; s.donos += amount; }
  else eventData.supporters.push({ name: user, value: amount, subs: 0, bits: 0, donos: amount, chats: 0 });

  saveEventData();
  updateDonosDisplay();
  updateGoals();
}

function setDonos(amount) {
  if (eventCompleted || !trackDonos) return;
  amount = parseFloat(amount);
  if (isNaN(amount)) return;

  eventData.valueCount  -= eventData.donoCount - amount;
  eventData.donoCount    = amount;

  saveEventData();
  updateDonosDisplay();
  updateGoals();
}

function setUserSubs(user, amount) {
  const s = eventData.supporters.find(s => s.name === user);
  if (s) s.subs = parseInt(amount);
  saveEventData();
}

// ─── Timer ────────────────────────────────────────────────────────────────────
function tick() {
  eventData.timeRemaining--;
  eventData.timeCompleted++;

  if (eventData.timeRemaining <= 0) {
    clearInterval(countdownInterval);
    eventData.timeRemaining = 0;
    updateTimerDisplay();
    eventCompleted    = true;
    eventData.endDate = new Date();
    saveEventData();
    summary();
  } else {
    updateTimerDisplay();
  }
}

function updateTimerDisplay() {
  const h = Math.floor(eventData.timeRemaining / 3600);
  const m = Math.floor((eventData.timeRemaining % 3600) / 60);
  const s = eventData.timeRemaining % 60;
  timerText.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function addTime(seconds) {
  if (eventCompleted) return;
  seconds = parseInt(seconds);

  if (capHours > 0) {
    const possible = capHours * 3600 - eventData.timeCompleted - eventData.timeRemaining;
    eventData.timeRemaining = parseInt(eventData.timeRemaining) + Math.min(possible, seconds);
    checkCap();
  } else {
    eventData.timeRemaining = parseInt(eventData.timeRemaining) + seconds;
  }

  if (eventData.timeRemaining < 0) eventData.timeRemaining = 0;

  timerText.classList.remove('popAnimationClass');
  void timerText.offsetWidth;
  timerText.classList.add('popAnimationClass');

  updateTimerDisplay();
}

function subTime(seconds) {
  seconds = Math.abs(parseInt(seconds));
  eventData.timeRemaining = parseInt(eventData.timeRemaining) - seconds;
  if (eventData.timeRemaining < 0) eventData.timeRemaining = 0;

  timerText.classList.remove('popAnimationClass');
  void timerText.offsetWidth;
  timerText.classList.add('popAnimationClass');

  updateTimerDisplay();
}

function setTime(timeString) {
  if (!timeString || typeof timeString !== 'string') return;
  let total = 0;
  const parts = timeString.toLowerCase().replace(/[\s-]+/g, '').match(/[0-9]+[hms]?/g) || [];
  parts.forEach(p => {
    const n = parseInt(p);
    if      (p.includes('h')) total += n * 3600;
    else if (p.includes('m')) total += n * 60;
    else                       total += n;
  });
  eventData.timeRemaining = Math.max(0, total);
  updateTimerDisplay();
}

function setHours(h) {
  const m = Math.floor(eventData.timeRemaining / 60) % 60;
  const s = eventData.timeRemaining % 60;
  eventData.timeRemaining = Math.max(0, parseInt(h) * 3600 + m * 60 + s);
  updateTimerDisplay();
}

function setMinutes(m) {
  const h = Math.floor(eventData.timeRemaining / 3600);
  const s = eventData.timeRemaining % 60;
  eventData.timeRemaining = Math.max(0, h * 3600 + parseInt(m) * 60 + s);
  updateTimerDisplay();
}

function setSeconds(s) {
  const h = Math.floor(eventData.timeRemaining / 3600);
  const m = Math.floor(eventData.timeRemaining / 60) % 60;
  eventData.timeRemaining = Math.max(0, h * 3600 + m * 60 + parseInt(s));
  updateTimerDisplay();
}

function stopTimer() {
  if (typeof countdownInterval !== 'undefined') clearInterval(countdownInterval);
}

// startTimer is intentionally NOT gated on isVerified in the demo
function startTimer() {
  if (typeof countdownInterval !== 'undefined') clearInterval(countdownInterval);
  countdownInterval = setInterval(tick, 1000);
}

// ─── Message overlay ──────────────────────────────────────────────────────────
function displayMessage(msg, time) {
  const el = document.createElement('div');
  el.textContent = msg;
  Object.assign(el.style, {
    fontSize: '24px', textAlign: 'center', position: 'fixed',
    top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    padding: '10px', backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', zIndex: '1000'
  });
  document.body.appendChild(el);
  setTimeout(() => el.remove(), time);
}

// ─── onWidgetLoad ─────────────────────────────────────────────────────────────
window.addEventListener('onWidgetLoad', (obj) => {
  ownerName    = obj.detail.channel.username;
  fieldData    = obj.detail.fieldData;
  isEditorMode = obj.detail.overlay.isEditorMode;
  console.log('[widget] onWidgetLoad', fieldData);
  initialize();
});

// ─── onEventReceived ──────────────────────────────────────────────────────────
window.addEventListener('onEventReceived', function(obj) {
  const listener = obj.detail.listener;
  const data     = obj.detail.event;
  const msg      = obj.detail.event.data;
  const user     = obj.detail.event.name;

  // Widget button
  if (data.listener === 'widget-button' && data.field === 'newEventButton') {
    newEvent();
    return;
  }

  // Subscriber
  if (listener === 'subscriber-latest') {
    let subValue = 1;
    if (data.tier === '2000') subValue = 2;
    else if (data.tier === '3000') subValue = 5;

    if (data.gifted || data.bulkGifted) {
      if (data.bulkGifted && !data.isCommunityGift && data.amount >= 1) {
        addSubs(data.amount * subValue, data.sender);
      } else if (data.gifted && !data.isCommunityGift) {
        addSubs(subValue, data.sender);
      }
    } else {
      addSubs(subValue, user);
    }
  }

  if (listener === 'cheer-latest')    addBits(data.amount, user);
  if (listener === 'tip-latest')      addDonos(data.amount, user);
  if (listener === 'raid-latest')     { eventData.raidCount++;   saveEventData(); }
  if (listener === 'follower-latest') { eventData.followCount++; saveEventData(); }

  // Chat messages
  if (listener === 'message') {
    eventData.chatCount++;

    const nick = msg.nick.toLowerCase();
    let s = eventData.supporters.find(o => o.name === nick);
    if (s) s.chats++;
    else eventData.supporters.push({ name: nick, value: 0, subs: 0, bits: 0, donos: 0, chats: 1 });

    // Streamlabs dono detection
    if (streamlabsDonos && msg.nick === 'streamlabs' && msg.text.includes('tipped')) {
      const words = msg.text.split(' ');
      const name  = words[0].length > 1 ? words[0] : words[1];
      const value = words[words.length - 1].slice(1, -1).replace(/[^\d.]/g, '');
      addDonos(name, value);
    }

    // Mod commands
    if (msg.nick === ownerName || (msg.tags.mod == 1 && modHelp)) {
      const command = msg.text.match(/^[^\s]+/)[0].toLowerCase();
      const value   = msg.text.substring(command.length + 1).toLowerCase();
      let   supp    = '';

      switch (command) {
        case '!addsub':
        case '!addsubs':
          if (/^(\S+\s){1}\S+$/.test(value)) { supp = value.split(' ')[1]; }
          if (/^[0-9]+$/.test(value.split(' ')[0])) addSubs(value.split(' ')[0], supp || 'Anonymous');
          break;
        case '!addbit':
        case '!addbits':
          if (/^(\S+\s){1}\S+$/.test(value)) { supp = value.split(' ')[1]; }
          if (/^[0-9]+$/.test(value.split(' ')[0])) addBits(value.split(' ')[0], supp || 'Anonymous');
          break;
        case '!adddono':
        case '!adddonos':
          if (/^(\S+\s){1}\S+$/.test(value)) { supp = value.split(' ')[1]; }
          if (/^(\d+(\.\d+)?|\.\d+)$/.test(value.split(' ')[0])) addDonos(value.split(' ')[0], supp || 'Anonymous');
          break;
        case '!settime':    setTime(value);                                      break;
        case '!addtime':    if (/^[0-9]+$/.test(value)) addTime(value);          break;
        case '!subtime':    if (/^[0-9]+$/.test(value)) subTime(value);          break;
        case '!unpause':
        case '!start':      startTimer();                                         break;
        case '!pause':
        case '!stop':       stopTimer();                                          break;
        case '!sethour':
        case '!sethours':   if (/^[0-9]+$/.test(value)) setHours(value);         break;
        case '!setminute':
        case '!setminutes': if (/^[0-9]+$/.test(value)) setMinutes(value);       break;
        case '!setsecond':
        case '!setseconds': if (/^[0-9]+$/.test(value)) setSeconds(value);       break;
        case '!subsubs':    if (/^[0-9]+$/.test(value)) subSubs(parseInt(value)); break;
        case '!setdonos':   if (/^[0-9]+$/.test(value)) setDonos(parseFloat(value)); break;
        case '!subathonstart':
        case '!subathonunpause':
        case '!startmegathon': startTimer(); break;
        case '!subathonpause':
        case '!subathonstop':
        case '!stopmegathon':  stopTimer();  break;
      }
    }
  }
});
