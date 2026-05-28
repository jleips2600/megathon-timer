let eventTitleText = document.getElementById('eventTitleText');
let timerText = document.getElementById('timerText');
let trackersContainer = document.getElementById('trackersContainer');
let cappedText = document.getElementById('cappedText');

let goalContainer = document.getElementById('goalContainer');
let goalImageContainer = document.getElementById('goalImageContainer');
let lockPadImage = document.getElementById('lockPadImage');    
let lockShackleImage = document.getElementById('lockShackleImage');    
let goalText = document.getElementById('goalText'); 

let eventCompleted = false;

let summaryTitleText = document.getElementById('summaryTitleText'); 
let summaryEarningsText = document.getElementById('summaryEarningsText'); 
let summaryContainer = document.getElementById('summaryContainer'); 
let summaryStatValues = document.getElementsByClassName('summaryStatValue');
let summaryStars = document.getElementsByClassName('summaryStar');
let starTitles = document.getElementsByClassName('starTitle');
let starNames = document.getElementsByClassName('starName');
let starValues = document.getElementsByClassName('starValue');

const verifyUrl = 'https://www.ohmysez.com/megathon/megathonVerification.txt';
let isVerified = false;

let isEditorMode = false;

let editSummary = false;
let summaryEnabled = true;

let modHelp = true;

let ownerName = "";

let timerValueRatio = 60;
let advancedSubs = 150;
let advancedBits = 60;
let advancedDonos = 60;
let useAdvancedOptions = false;
let subSplit = 50;
//let eventTitle = `Megathon`;
let currencyCode = "USD";

//	WIDGET SETTINGS
const savePath = 'MegathonData';
const saveDataFrequency = 10;

let countdownInterval;
let saveDataInterval;

let streamlabsDonos = true;
let eventTitleDisplay = true;

//	TRACKERS
let trackersDisplay = true;
let trackSubs = true;
let trackBits = true;
let trackDonos = true;
let capHours = 0;
let goalType = `valueCount`;
let goalDisplay = true;
let goals = [];
let updateGoalAnimating = false;
let currentGoalIndex = -1;
let currentGoal = 0;
let currentReward = "nothing";
let startHours = 2;
let fieldData;

let eventData = {	  
    title: "MEGATHON",
    startDate: new Date(),
    endDate: "",
    valueCount: 0,
    subCount: 0, 
    bitCount: 0, 
    donoCount: 0, 
    raidCount: 0,
    followCount: 0,
    chatCount: 0,
    timeRemaining: startHours * 3600, 	
    timeCompleted: 0,
    supporters: []
  };

let supporter = {
    name: '',
    value: 0,
    subs: 0,
    bits: 0,
    donos: 0,
  	chats: 0
  };


function newEvent() {
  eventData = {  	  
    title: `${fieldData.eventTitleText}`,
    startDate: new Date(),
    endDate: '',
    valueCount: 0,
    subCount: 0,
    bitCount: 0,
    donoCount: 0,
    raidCount: 0,
    followCount: 0,
    chatCount: 0,
    timeRemaining: startHours * 3600,
    timeCompleted: 0,
    supporters: []
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

function formatDate(date) {
  date = new Date(date);
  var month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
  var day = date.getDate().toString().padStart(2, '0');
  var year = date.getFullYear().toString().slice(-2); // Get the last two digits of the year

  var formattedDate = `${month}-${day}-${year}`;
  return formattedDate;
}

function getDays(startDate, endDate) {
  startDate = new Date(startDate);
  endDate = new Date(endDate);
  // Calculate the time difference in milliseconds
  const timeDifference = endDate.getTime() - startDate.getTime();

  // Convert milliseconds to days
  const daysDifference = timeDifference / (1000 * 3600 * 24);

  return Math.floor(daysDifference); // Round down to whole days
}


//=========================
//		 VERIFICATION
//=========================

function verify() {
  fetch(verifyUrl, {cache: "no-cache"})
    .then(response => response.text())
    .then(text => {
      const verifiedUsers = text.replace(/\r/g, '').split('\n');
      if (verifiedUsers.includes(ownerName)) {
        isVerified = true;
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
}


function thief() {
    timerText.textContent = "Unverified User Please Purchase Widget Or Wait Up To 24 Hours After Purchase";
    timerText.style.zIndex = 100;
    const currentScript = document.currentScript;
    
    if (currentScript) {
        currentScript.parentNode.removeChild(currentScript);
    } 
}



//=========================
//		 INITIALIZE
//=========================

function updateCSS()
{
  const fontNames = [`${fieldData.eventTitleFontFace}`,
                     `${fieldData.timerFontFace}`,
                     `${fieldData.summaryFontFace}`,
                     `${fieldData.trackerFontFace}`,
                     `${fieldData.goalFontFace}`];
  
  fontNames.forEach(fontName => {
    const formattedFontName = fontName.split(" ").join("+");
    const fontStylesheet = document.createElement("link");
    fontStylesheet.rel = "stylesheet";
    fontStylesheet.href = `https://fonts.googleapis.com/css2?family=${formattedFontName}:wght@400;500;600&display=swap`;
    document.head.appendChild(fontStylesheet);
  });
  
  summaryContainer.style.fontFamily = fieldData.summaryFontFace;
  summaryContainer.style.color = fieldData.summaryColor;
  summaryContainer.style.webkitTextStrokeWidth = fieldData.summaryStrokeWidth + 'px';
  summaryContainer.style.webkitTextStrokeColor = fieldData.summaryStrokeColor;
  summaryContainer.style.backgroundImage = `linear-gradient(to bottom, ${fieldData.summaryBackgroundColor1}, ${fieldData.summaryBackgroundColor2})`;

  $('.star').css('opacity', fieldData.summaryStarOpacity / 10);
  
  eventTitleText.style.fontFamily = fieldData.eventTitleFontFace;
  eventTitleText.style.color = fieldData.eventTitleColor;
  eventTitleText.style.webkitTextStrokeWidth = fieldData.eventTitleStrokeWidth + 'px';
  eventTitleText.style.webkitTextStrokeColor = fieldData.eventTitleStrokeColor;
  
  timerText.style.fontFamily = fieldData.timerFontFace;
  timerText.style.color = fieldData.timerColor;
  timerText.style.webkitTextStrokeWidth = fieldData.timerStrokeWidth + 'px';
  timerText.style.webkitTextStrokeColor = fieldData.timerStrokeColor;
  
  $('.tracker').css('font-family', fieldData.trackerFontFace);
  $('.tracker').css('color', fieldData.trackerColor);
  $('.tracker').css('-webkit-text-stroke', `${fieldData.trackerStrokeWidth}px ${fieldData.trackerStrokeColor}`);
  
  cappedText.style.fontFamily = fieldData.trackerFontFace;
  cappedText.style.color = fieldData.trackerColor;
  cappedText.style.backgroundColor = fieldData.trackerStrokeColor;
   
  
  lockShackleImage.style.backgroundColor = fieldData.goalLockColor;
  lockPadImage.style.backgroundColor = fieldData.goalLockColor;
 
  goalText.style.fontFamily = fieldData.goalFontFace;
  goalText.style.color = fieldData.goalColor;
  goalText.style.webkitTextStrokeWidth = fieldData.goalStrokeWidth + 'px';
  goalText.style.webkitTextStrokeColor = fieldData.goalStrokeColor;

}

function initialize()
{

  if(fieldData.currencyCode)
  {
    currencyCode = fieldData.currencyCode;
  }

  setupGoals();
  editSummary = fieldData.editSummary;
  summaryEnabled = fieldData.summaryEnabled;

  modHelp = fieldData.modHelp;
  eventTitleDisplay = fieldData.eventTitleDisplay;
  startHours = fieldData.startHours;
  timerValueRatio = fieldData.timerValueRatio;
  advancedSubs = fieldData.advancedSubs;
  advancedBits = fieldData.advancedBits;
  advancedDonos = fieldData.advancedDonos;
  useAdvancedOptions = fieldData.useAdvancedOptions;
  subSplit = fieldData.subSplit;
  
  streamlabsDonos = fieldData.streamlabsDonos;
  trackersDisplay = fieldData.trackersDisplay;
  trackSubs = fieldData.trackSubs;
  trackBits = fieldData.trackBits;
  trackDonos = fieldData.trackDonos;
  capHours = fieldData.capHours;
  goalType = `${fieldData.goalType}`;
  goalDisplay = fieldData.goalDisplay;

  createTrackers();
  updateCSS();  
  
  if(editSummary && isEditorMode) {
	summaryContainer.style.display = 'flex';
  }
  else {
  	summaryContainer.style.display = 'none';
  }
  
  
  // display event title
  if(eventTitleDisplay)
  {
    eventTitleText.style.visibility = 'visible';
  }
  else
  {
    eventTitleText.style.visibility = 'hidden';
  }
    
  loadEventData();
  
  
  saveDataInterval = setInterval(saveEventData, saveDataFrequency * 1000);
  updateTimerDisplay();
  
  verify();
}


//=========================
//		 SUMMARY
//=========================

function summary()
{   
  	if(summaryEnabled)
    {
      summaryTitleText.textContent = eventData.title + " Summary";
      summaryEarningsText.textContent = formatCurrency(eventData.valueCount) + " TOTAL!" ;
      
      let chatterCount = 0;
      for(let i = 0; i < eventData.supporters.length; i++) {
        if(eventData.supporters[i].chats > 0) {
			chatterCount++;        
        }
      }
      
      summaryStatValues[0].textContent = formatDate(eventData.startDate);
      summaryStatValues[1].textContent = eventData.supporters.length;
      summaryStatValues[2].textContent = chatterCount;
      
      if (eventData.endDate != '') {
        summaryStatValues[3].textContent = formatDate(eventData.endDate);
        summaryStatValues[9].textContent = getDays(eventData.startDate, eventData.endDate);
      } else {
        summaryStatValues[3].textContent = "???";
        summaryStatValues[9].textContent = "???";
      }
      
      summaryStatValues[4].textContent = eventData.subCount;
      summaryStatValues[5].textContent = eventData.chatCount;
      summaryStatValues[6].textContent = (eventData.timeCompleted / 3600).toFixed(1);
      summaryStatValues[7].textContent = eventData.bitCount;
      summaryStatValues[8].textContent = eventData.followCount;
      
      summaryStatValues[10].textContent = eventData.donoCount;
      summaryStatValues[11].textContent = eventData.raidCount;
      
      
	  let sortedSupporters;
      
      if(trackDonos)
      {
        sortedSupporters = eventData.supporters.slice().sort((a, b) => b.donos - a.donos);
        if(sortedSupporters.length > 0)
        {
          let donoStar = sortedSupporters[0];

          starNames[2].textContent = donoStar.name.toUpperCase();
          starValues[2].textContent = formatCurrency(donoStar.donos);

          if(donoStar.name == "" || donoStar.donos == 0)
          {
            summaryStars[2].remove();
          }
        }
      }
      else
      {
      	summaryStars[2].remove();
      }
      
      if(trackBits)
      {
        sortedSupporters = eventData.supporters.slice().sort((a, b) => b.bits - a.bits);
        if(sortedSupporters.length > 0)
        {
          let bitStar = sortedSupporters[0];

          starNames[1].textContent = bitStar.name.toUpperCase();
          starValues[1].textContent = bitStar.bits + " bits";

          if(bitStar.name == "" || bitStar.bits == 0)
          {
            summaryStars[1].remove();
          }
        }
      }
      else
      {
      	summaryStars[1].remove();
      }
      
      if(trackSubs)
      {
        sortedSupporters = eventData.supporters.slice().sort((a, b) => b.subs - a.subs);
        if(sortedSupporters.length > 0)
        {
          let subStar = sortedSupporters[0];
          starNames[0].textContent = subStar.name.toUpperCase();
          starValues[0].textContent = subStar.subs + " subs";

          if(subStar.name == "" || subStar.subs == 0)
          {
            summaryStars[0].remove();
          }
        }
      }
      else
      {
      	summaryStars[0].remove();
      }

  	}
  
}

//=========================
//	 	   GOALS
//=========================

function setupGoals()
{
  goalImageContainer.style.display = "flex";
  goalImageContainer.style.position = "static";
  
  currentGoalIndex = -1;
  currentGoal = 0;
  currentReward = "nothing";
  goals = [];
  
  if(!goalDisplay)
  {
    lockShackleImage.style.visibility = "hidden";
    lockPadImage.style.visibility = "hidden";
    goalText.style.visibility = "hidden";
  }
  else
  {
    goals.push({goal: fieldData.goal1, reward: `${fieldData.reward1}`});
    goals.push({goal: fieldData.goal2, reward: `${fieldData.reward2}`});
    goals.push({goal: fieldData.goal3, reward: `${fieldData.reward3}`});
    goals.push({goal: fieldData.goal4, reward: `${fieldData.reward4}`});
    goals.push({goal: fieldData.goal5, reward: `${fieldData.reward5}`});
    goals.push({goal: fieldData.goal6, reward: `${fieldData.reward6}`});
    goals.push({goal: fieldData.goal7, reward: `${fieldData.reward7}`});
    goals.push({goal: fieldData.goal8, reward: `${fieldData.reward8}`});
    goals.push({goal: fieldData.goal9, reward: `${fieldData.reward9}`});
    goals.push({goal: fieldData.goal10, reward: `${fieldData.reward10}`});
    goals.push({goal: fieldData.goal11, reward: `${fieldData.reward11}`});
    goals.push({goal: fieldData.goal12, reward: `${fieldData.reward12}`});
    goals.push({goal: fieldData.goal13, reward: `${fieldData.reward13}`});
    goals.push({goal: fieldData.goal14, reward: `${fieldData.reward14}`});
    goals.push({goal: fieldData.goal15, reward: `${fieldData.reward15}`});
    goals.push({goal: fieldData.goal16, reward: `${fieldData.reward16}`});
    goals.push({goal: fieldData.goal17, reward: `${fieldData.reward17}`});
    goals.push({goal: fieldData.goal18, reward: `${fieldData.reward18}`});
    goals.push({goal: fieldData.goal19, reward: `${fieldData.reward19}`});
    goals.push({goal: fieldData.goal20, reward: `${fieldData.reward20}`});
    

    // Filter out goals with goal value equal to 0, null, or reward is empty
    goals = goals.filter((item) => item.goal !== 0 && item.goal !== null && item.reward !== '');

    // Sort the goals array by the 'goal' property in ascending order
    goals.sort((a, b) => a.goal - b.goal);
    
    nextGoal();
  }
}

function nextGoal()
{
    lockShackleImage.classList.remove("unlockAnimationClass");
	currentGoalIndex++;
  	if(currentGoalIndex > goals.length - 1)
    {
   		goalImageContainer.style.display = "none";
        goalImageContainer.style.position = "absoulute";
    	goalText.textContent = "ALL GOALS COMPLETE!";
      
        goalContainer.classList.remove("newGoalAnimationClass");
        void goalContainer.offsetWidth;
        goalContainer.classList.add("newGoalAnimationClass");
      
      	return;
    }
    else
    {
      currentGoal = goals[currentGoalIndex].goal;
      currentReward = goals[currentGoalIndex].reward;
      
      currentGoal = Math.max(0, parseFloat(goals[currentGoalIndex].goal - eventData[goalType]));
      goalText.textContent = ((goalType === "valueCount" || goalType === "donoCount") ? formatCurrency(currentGoal) : currentGoal) + (goalType === "subCount" ? " subs" : "") + (goalType === "bitCount" ? " bits" : "")  +  " - " + currentReward;
      
      goalContainer.classList.remove("newGoalAnimationClass");
      void goalContainer.offsetWidth;
      goalContainer.classList.add("newGoalAnimationClass");
      
      setTimeout(function() {
		updateGoals();
      }, 2000);
    }
}



function updateGoals()
{
  if(currentGoalIndex > goals.length - 1)
  {
    return;
  }
  currentGoal = Math.max(0, parseFloat(goals[currentGoalIndex].goal - eventData[goalType]));
  goalText.textContent = ((goalType === "valueCount" || goalType === "donoCount")  ? formatCurrency(currentGoal) : currentGoal) + 
    (goalType === "subCount" ? " subs" : "") + (goalType === "bitCount" ? " bits" : "")  +  " - " + currentReward;
  
  if(currentGoal == 0 && !updateGoalAnimating)
  {
	updateGoalAnimating = true;
    goalImageContainer.classList.remove("rattleAnimationClass");
    void goalImageContainer.offsetWidth;
    goalImageContainer.classList.add("rattleAnimationClass");
    
    lockShackleImage.classList.remove("unlockAnimationClass");
    void lockShackleImage.offsetWidth;
    lockShackleImage.classList.add("unlockAnimationClass");
    
    goalContainer.classList.remove("newGoalAnimationClass");
	goalContainer.classList.remove("goalAnimationClass");
    void goalContainer.offsetWidth;
    goalContainer.classList.add("goalAnimationClass"); 
    
    setTimeout(function() {
      nextGoal();
      updateGoalAnimating = false;
     }, 3500); //unlock animation time 
  }
}


function formatCurrency(decimal)
{
  return decimal.toLocaleString('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,  
    maximumFractionDigits: 0  
  });
}

//=========================
//	    DATA MANAGEMENT
//=========================

//		SAVE DATA
function saveEventData() {
  	console.log("saving event data");
    console.log(eventData);
	SE_API.store.set(savePath, eventData);
}


//		LOAD DATA
async function loadEventData() {
    try {
      console.log("loading event data");
      eventData = await SE_API.store.get(savePath);

      console.log(eventData);
      
      if (!eventData) {
        newEvent();
      }
      else
      {
      	eventCompleted = eventData.endDate != '';
        if(eventCompleted)
        {
          summary();
          summaryContainer.style.display = 'flex';
        }
      }
      
    } catch (error) {
      displayMessage("Error loading event data..", 20000);
      console.error(error);
    }
  
  	eventTitleText.textContent = eventData.title;
  
    summary();
  	setupGoals();
    checkCap();
    updateTrackerDisplays();
    updateTimerDisplay();
}

//=========================
//	 		CAP
//=========================

function checkCap()
{
    if (capHours > 0 && capHours * 3600 - eventData.timeCompleted - eventData.timeRemaining <= 0)
    {
      cappedText.style.visibility = 'visible';
    }
    else
    {
      cappedText.style.visibility = 'hidden';
    }
}

//=========================
//	 SUB SUBS/BITS/DONOS
//=========================

function subSubs(amount)
{
  if(eventCompleted)
  {
    return;
  }
  
  if(trackSubs) {
    amount = parseInt(amount);
    let value = amount * 5 * subSplit / 100;
    value = parseFloat(value);
    
    if(!isNaN(value)) {
      eventData.subCount = eventData.subCount - amount;
      eventData.valueCount -= value;

      subTime(useAdvancedOptions? amount * advancedSubs : value  * timerValueRatio);

      saveEventData();
      updateSubsDisplay();
      updateGoals();
    } 
  }
}

//=========================
//	 ADD SUBS/BITS/DONOS
//=========================

function addSubs(amount, user = "Anonymous")
{
  if(eventCompleted)
  {
    return;
  }
  
  if(trackSubs) {
    amount = parseInt(amount);
    let value = amount * 5 * subSplit / 100;
    value = parseFloat(value);
    
    if(!isNaN(value)) {
      eventData.subCount = eventData.subCount + amount;
      eventData.valueCount += value;

      addTime(useAdvancedOptions? amount * advancedSubs : value  * timerValueRatio);

      user = user.toLowerCase();

      supporter = eventData.supporters.find(obj => obj.name == user);
      if(supporter)
      {
        supporter.value += value;
        supporter.subs += amount;
      }
      else
      {
        eventData.supporters.push({
          name: user,
          value: value,
          subs: amount,
          bits: 0,
          donos: 0,
          chats: 0
        });
      }

      saveEventData();
      updateSubsDisplay();
      updateGoals();
    } 
  }
}

function addBits(amount, user = "Anonymous")
{
  if(eventCompleted)
  {
    return;
  }
  
  if(trackBits) {
    amount = parseInt(amount);
    let value = amount / 100;
    value = parseFloat(value);
    
    if(!isNaN(value)) {
      eventData.bitCount = eventData.bitCount + amount;
      eventData.valueCount += value;

      addTime(useAdvancedOptions? value * advancedBits : value  * timerValueRatio);

      user = user.toLowerCase();

      supporter = eventData.supporters.find(obj => obj.name == user);
      if(supporter)
      {
        supporter.value += value;
        supporter.bits += amount;
      }
      else
      {
        eventData.supporters.push({
          name: user,
          value: value,
          subs: 0,
          bits: amount,
          donos: 0,
          chats: 0
        });
      }

      saveEventData();
      updateBitsDisplay();
      updateGoals();
    } 
  }
}

function addDonos(amount, user = "Anonymous")
{
  if(eventCompleted)
  {
    return;
  }
  
  if(trackDonos) {
    
    amount = parseFloat(amount);
    let value = amount;
    value = parseFloat(value);

    
    if(!isNaN(value)) {
      eventData.donoCount = eventData.donoCount + amount;
      eventData.valueCount += value;
      addTime(useAdvancedOptions? amount * advancedDonos : value * timerValueRatio);

      user = user.toLowerCase();

      supporter = eventData.supporters.find(obj => obj.name == user);
      if(supporter)
      {
        supporter.value += value;
        supporter.donos += amount;
      }
      else
      {
        eventData.supporters.push({
          name: user,
          value: value,
          subs: 0,
          bits: 0,
          donos: amount,
          chats: 0
        });
      }

      saveEventData();
      updateDonosDisplay();
      updateGoals();
    }
  } 
}

//=========================
//   SET SUBS/BITS/DONOS
//=========================


function setDonos(amount) {
  if (eventCompleted) {
    return;
  }

  if (trackDonos) {
    amount = parseFloat(amount);
    let value = amount;

    if (!isNaN(value)) {
      const currentDonoCount = eventData.donoCount;
      eventData.donoCount = value;
      eventData.valueCount -= currentDonoCount - value;

      saveEventData();
      updateDonosDisplay();
      updateGoals();
    }
  }
}

//=========================
//	      TRACKERS
//=========================

function createTrackers()
{
  
   if(trackersDisplay)
  {
    if (trackSubs) {
      subTracker = document.createElement('div');
      subTracker.classList.add('tracker');
      trackersContainer.appendChild(subTracker);
      subTracker.textContent = 0;
    }

    if (trackBits) {
      bitTracker = document.createElement('div');
      bitTracker.classList.add('tracker');
      trackersContainer.appendChild(bitTracker);
      bitTracker.textContent = 0;
    }

    if (trackDonos) {
      donoTracker = document.createElement('div');
      donoTracker.classList.add('tracker');
      trackersContainer.appendChild(donoTracker);
      donoTracker.textContent = 0;
    }
  }
  else
  {
    trackersContainer.remove();
  }
  
}

function fixTrackerErrors()
{
    eventData.subCount = parseInt(eventData.subCount);
    eventData.bitCount = parseInt(eventData.bitCount);
    eventData.donoCount = parseFloat(eventData.donoCount.toFixed(2));
}


function updateTrackerDisplays() {
    //fixTrackerErrors();
	updateSubsDisplay();
  	updateBitsDisplay();
  	updateDonosDisplay();
}
function updateSubsDisplay() {
  	if(trackersDisplay && trackSubs) {
      subTracker.textContent = `${eventData.subCount} subs`;
      subTracker.classList.remove("increaseAnimationClass");
      void subTracker.offsetWidth;
      subTracker.classList.add("increaseAnimationClass");
    }
}

function updateBitsDisplay()
{
  	if(trackersDisplay && trackBits) {
      bitTracker.textContent = `${eventData.bitCount} bits`;
      bitTracker.classList.remove("increaseAnimationClass");
      void bitTracker.offsetWidth;
      bitTracker.classList.add("increaseAnimationClass");
    }
}

function updateDonosDisplay()
{
  if(trackersDisplay && trackDonos) {
    donoTracker.textContent = formatCurrency(eventData.donoCount);
    donoTracker.classList.remove("increaseAnimationClass");
    void donoTracker.offsetWidth;
    donoTracker.classList.add("increaseAnimationClass");
  }
}


//=========================
//		   TICK
//=========================

function tick() {

  eventData.timeRemaining--;
  eventData.timeCompleted++;
  
  if (eventData.timeRemaining <= 0) {
    clearInterval(countdownInterval);
    eventData.timeRemaining = 0;
    updateTimerDisplay();
    eventCompleted = true;
    eventData.endDate = new Date();
 	saveEventData();
    summary();
  } else {
    updateTimerDisplay();
  }
}

//=========================
//	    DISPLAY TIMER
//=========================

function updateTimerDisplay() {
  const hours = Math.floor(eventData.timeRemaining / 3600);
  const minutes = Math.floor((eventData.timeRemaining % 3600) / 60);
  const secs = eventData.timeRemaining % 60;
  const formattedTime = `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;

  timerText.textContent = formattedTime;
}

function pad(value) {
  return value.toString().padStart(2, '0');
}


//=========================
//	   ADJUST TIMER
//=========================

function setTime(timeString) {
  if (!timeString || typeof timeString !== 'string') return 0;

  let totalSeconds = 0;
  const parts = timeString.toLowerCase().replace(/[\s-]+/g, '').match(/[0-9]+[hms]?/g) || [];

  parts.forEach(part => {
    const num = parseInt(part);
    if (part.includes('h')) totalSeconds += num * 3600; // Hours to seconds
    else if (part.includes('m')) totalSeconds += num * 60; // Minutes to seconds
    else if (part.includes('s')) totalSeconds += num; // Seconds
    else totalSeconds += num; // Default to seconds
  });

  eventData.timeRemaining = Math.max(0, totalSeconds); // Ensure non-negative
  
  updateTimerDisplay();
}

function addTime(seconds)
{
  
  if(eventCompleted)
  {
    return;
  }
  
  if(capHours > 0)
  {
  	let possibleTimeLeft = capHours * 3600 - eventData.timeCompleted - eventData.timeRemaining;
    eventData.timeRemaining = parseInt(eventData.timeRemaining) + Math.min(possibleTimeLeft, parseInt(seconds));
    
    checkCap();
  }
  else
  {
  	eventData.timeRemaining = parseInt(eventData.timeRemaining) + parseInt(seconds);
  }
  
  timerText.classList.remove("popAnimationClass");
  void timerText.offsetWidth;
  timerText.classList.add("popAnimationClass");
  
  if (eventData.timeRemaining < 0) {
    eventData.timeRemaining = 0;
  }
  
  updateTimerDisplay();
}

function subTime(seconds)
{
  seconds = Math.abs(seconds);
  eventData.timeRemaining = parseInt(eventData.timeRemaining) - parseInt(seconds);
  
  timerText.classList.remove("popAnimationClass");
  void timerText.offsetWidth;
  timerText.classList.add("popAnimationClass");
  
  if (eventData.timeRemaining < 0) {
    eventData.timeRemaining = 0;
  }
  
  updateTimerDisplay();
}


function stopTimer()
{
  if (typeof countdownInterval !== 'undefined') {
    clearInterval(countdownInterval);
  }
}

function startTimer() {
  if(!isVerified) {
      thief();
      return;
  }
  if (typeof countdownInterval !== 'undefined') {
    clearInterval(countdownInterval);
  }
  
  countdownInterval = setInterval(tick, 1000);
}

function setHours(hours)
{
  const remainingMinutes = Math.floor(eventData.timeRemaining / 60) % 60;
  const remainingSeconds = eventData.timeRemaining % 60;

  eventData.timeRemaining = parseInt(hours) * 3600 + parseInt(remainingMinutes) * 60 + parseInt(remainingSeconds);
  
  if (eventData.timeRemaining < 0) {
    eventData.timeRemaining = 0;
  }
  
  updateTimerDisplay();
}

function setMinutes(minutes)
{
  const remainingHours = Math.floor(eventData.timeRemaining / 3600);
  const remainingSeconds = eventData.timeRemaining % 60;

  eventData.timeRemaining = parseInt(remainingHours) * 3600 + parseInt(minutes) * 60 + parseInt(remainingSeconds);
  
  if (eventData.timeRemaining < 0) {
    eventData.timeRemaining = 0;
  }
  
  
  updateTimerDisplay();
}

function setSeconds(seconds)
{
  const remainingHours = Math.floor(eventData.timeRemaining / 3600);
  const remainingMinutes = Math.floor(eventData.timeRemaining / 60) % 60;

  eventData.timeRemaining = parseInt(remainingHours) * 3600 + parseInt(remainingMinutes) * 60 + parseInt(seconds);
  
  if (eventData.timeRemaining < 0) {
    eventData.timeRemaining = 0;
  }
  
  
  updateTimerDisplay();
}



//=========================
//		ON WIDGET LOAD
//=========================

window.addEventListener('onWidgetLoad', async (obj) => {
      
  const providerId = obj.detail.channel.providerId;
  ownerName = obj.detail.channel.username;
  fieldData = obj.detail.fieldData;
  isEditorMode = obj.detail.overlay.isEditorMode;
  
  console.log(fieldData);
  
  initialize();
  
});

//=========================
//    ON EVENT RECEIVED
//=========================

window.addEventListener('onEventReceived', function (obj) {
  const listener = obj.detail.listener;
  const data = obj.detail.event;
  const msg = obj.detail.event.data;
  const user = obj.detail.event.name;

  if (data.listener === 'widget-button')
  {    
    if(data.field === "newEventButton")
    {
      newEvent();
    }
  }
  
  if(eventCompleted)
  {
    //return;
  }

 
  if(listener === 'subscriber-latest') {
    let subValue = 1;
    if (data.tier == '2000') subValue = 2;
    else if (data.tier == '3000') subValue = 5;

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

  
  /* if(listener === 'subscriber-latest') {
    if(!data.bulkGifted || data.gifted)
    {
      if(!data.tier || data.tier == '1000' || data.tier == 'prime')
      {
  		addSubs(1, data.sender? data.sender : user);
      }
      else if (data.tier == '2000')
      {
        addSubs(2, data.sender? data.sender : user);
      }
      else if (data.tier == '3000')
      {
        addSubs(5, data.sender? data.sender : user);
      }
    } 
  } */
  
  if(listener === 'cheer-latest') {
  	addBits(data.amount, user);
  }
  
  if(listener === 'tip-latest') {
    addDonos(data.amount, user);
  } 
  
  if(listener === 'raid-latest') {
    eventData.raidCount++;
    saveEventData();
  }
  
  if(listener === 'follower-latest') {
  	eventData.followCount++;
    saveEventData();
  }
  
  if(listener === 'message') {

    eventData.chatCount++;
    
    supporter = eventData.supporters.find(obj => obj.name == msg.nick.toLowerCase());
    if(supporter)
    {
      supporter.chats++;
    }
    else
    {
      eventData.supporters.push({
        name: msg.nick.toLowerCase(),
        value: 0,
        subs: 0,
        bits: 0,
        donos: 0,
        chats: 1
      });
    }
    
    //get streamlabs donos
    if(streamlabsDonos && msg.nick == "streamlabs" && msg.text.includes("tipped"))
    {
      const words = msg.text.split(' ');
      
      const name = words[0].length > 1? words[0] : words[1];
      const value = words[words.length - 1].slice(1, -1).replace(/[^\d.]/g, '');
      addDonos(name, value);
    }
    
    //commands
    if(msg.nick == ownerName || (msg.tags.mod == 1 && modHelp))
    {
      	let command = msg.text.match(/^[^\s]+/)[0].toLowerCase();
    	let value = msg.text.substring(command.length + 1).toLowerCase();
      	let supporter = '';
      
      	switch(command)
        {          
          case '!addsub':
          case '!addsubs':
            if(/^(\S+\s){1}\S+$/.test(value))	//check for 2 words (presumably "<value> <user>")
            {
              supporter = value.split(' ')[1];
              value = value.split(' ')[0];
            }
            if(/^[0-9]+$/.test(value))
            {
              	if(supporter != '')
                {
                  addSubs(value, supporter);
                }
              	else
                {
                  addSubs(value);
                }
            }
            break;
          case '!addbit':
          case '!addbits':
            if(/^(\S+\s){1}\S+$/.test(value))	//check for 2 words (presumably "<value> <user>")
            {
              supporter = value.split(' ')[1];
              value = value.split(' ')[0];
            }
            if(/^[0-9]+$/.test(value))
            {
              	if(supporter != '')
                {
                  addBits(value, supporter);
                }
              	else
                {
                  addBits(value);
                }
            }
            break;
          case '!adddono':
          case '!adddonos':
            if(/^(\S+\s){1}\S+$/.test(value))	//check for 2 words (presumably "<value> <user>")
            {
              supporter = value.split(' ')[1];
              value = value.split(' ')[0]
            }
            if (/^(\d+(\.\d+)?|\.\d+)$/.test(value))	//decimals okay here
            {
              	if(supporter != '')
                {
				addDonos(value, supporter);
                }
              	else
                {
                addDonos(value);
                }
            }
            break;
          case '!settime':
              setTime(value);
            break;
          case '!addtime':
            if(/^[0-9]+$/.test(value))
            {
              addTime(value);
            }
            break;         
          case '!subtime':
            if(/^[0-9]+$/.test(value))
            {
              subTime(value);
            }
            break;
          case '!unpause':  
          case '!start':
            startTimer();
            break;
          case '!pause':          
          case '!stop':
            stopTimer();
            break;
          case '!sethour':
          case '!sethours':
            if(/^[0-9]+$/.test(value))
            {
            	setHours(value);
            }
            break;                   
          case '!setminute':
          case '!setminutes':
            if(/^[0-9]+$/.test(value))
            {
            	setMinutes(value);
            }
            break;       
          case '!setsecond':
          case '!setseconds':
            if(/^[0-9]+$/.test(value))
            {
            	setSeconds(value);
            }
            break;
          case '!subsubs':
            if (/^[0-9]+$/.test(value)) { // Check for a single numeric value
                value = parseInt(value);
                subSubs(value); // Call subSubs with the negated value
            }
            break;
          case '!setdonos':
            if (/^[0-9]+$/.test(value)) { 
                value = parseFloat(value);
                setDonos(value);
            }
            break;
          case '?mostsubs':
            let sortedSubs = eventData.supporters.slice().sort((a, b) => b.subs - a.subs);
        	displayMessage(sortedSubs[0].name + " has the most subs with " + sortedSubs[0].subs + " subs.", 5000);
            break;
          case '!setusersubs':
            if(/^(\S+\s){1}\S+$/.test(value))	//check for 2 words (presumably "<value> <user>")
            {
              console.log("step 1");
              supporter = value.split(' ')[1];
              value = value.split(' ')[0];
              
              setUserSubs(supporter, value);
            }
            break;
          case '!subathonstart':
          case '!subathonunpause':
          case '!startmegathon':
              startTimer();
              break;
          case '!subathonpause':
          case '!subathonstop':
          case '!stopmegathon':
              stopTimer();
              break;
        }
    }
  }
});

  //=========================
  //     DISPLAY MESSAGE
  //=========================

function displayMessage(msg, time) {
  // Create the message element
  const message = document.createElement('div');
  message.textContent = msg;
  
  // Apply styles
  message.style.fontSize = '24px'; // Large font
  message.style.textAlign = 'center'; // Centered text
  message.style.position = 'fixed'; // Position it on the screen
  message.style.top = '50%'; // Vertical center
  message.style.left = '50%'; // Horizontal center
  message.style.transform = 'translate(-50%, -50%)'; // Adjust for center alignment
  message.style.padding = '10px'; // Optional padding
  message.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'; // Optional background for readability
  message.style.color = 'white'; // Optional text color
  message.style.zIndex = '1000'; // Ensure it’s on top

  // Add to document body
  document.body.appendChild(message);

  // Remove the element after timeout
  setTimeout(function () {
    message.remove();
  }, time);
}
  
  //=========================
  //     SET USER DATA
  //=========================
  
  function setUserSubs(user, amount) {
    const supporter = eventData.supporters.find(s => s.name === user);

    if (supporter) {
      supporter.subs = parseInt(amount); 
    }
    
    saveEventData();
  }
