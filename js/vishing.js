'use strict'
// --------------- VARIABLER: Hent elementer fra HTML ---------------

// Intro side - Elementer for intro side og startknap
const introPage = document.querySelector('.intro-page');
const startButton = document.querySelector('.start-button');

// Første opkaldsside (Telefonen ringer) - Elementer til håndtering af opkald
const callPageStart = document.getElementById('call-page-start');
const callSound = document.getElementById('call-sound');
const acceptButton = document.querySelector('.call-buttons .accept');
const declineButton = callPageStart.querySelector('.call-buttons .decline');
const declineMessage = document.querySelector('.decline-message');

// Telefonsamtale interface - Elementer til samtalegrænsefladen
const phoneInterface = document.querySelector('.phone');
const videoElement = document.querySelector('.content-container video');
const activeBtn = document.querySelector('.btn-row.bottom .active');
const declineBtn = document.querySelector('.btn-row.bottom .decline');
const sometimesActiveBtn = document.querySelector('.btn-row.bottom .sometimes-active');

// --------------- INPUTFELT I SCENE 6 ---------------

const userInputContainer = document.getElementById('userInputContainer');
const userInput = document.getElementById('userInput');

// Afslutninger - Side til afslutning af scenariet
const endingPage = document.querySelector('.ending');

// --------------- STATE-VARIABLER ---------------
// State-variabler holder styr på brugerens interaktion i opkaldet
let hasDeclinedOnce = false; // Holder styr på om brugeren allerede har afvist én gang
let currentScene = 1; // Den aktuelle scene, som brugeren er på i samtalen

// --------------- SCENE DATA ---------------
// Data, der beskriver hver scene, herunder video, kanpper og næste scene

const sceneData = {
  1: {
    video: 'videos/lyd_1.mp4',
    active: {
      icon: 'icons/question.svg',
      label: 'Overhovedet ikke.',
      nextScene: 2
    },
    sometimesActive: {
      icon: null,
      label: null,
      nextScene: 2,
      active: false
    },
    declineEnding: 2
  },
  2: {
    video: 'videos/lyd_2.mp4',
    active: {
      icon: 'icons/checkmark.svg',
      label: 'Hjælp mig med at sikre min opsparing!',
      nextScene: 3
    },
    sometimesActive: {
      icon: 'icons/question.svg',
      label: 'Hvad skal det betyde?',
      nextScene: '2.1',
      active: true
    },
    declineEnding: 2
  },
  '2.1': {
    video: 'videos/lyd_2.1.mp4',
    active: {
      icon: 'icons/continue.svg',
      label: 'Forsæt samtalen',
      nextScene: 3
    },
    sometimesActive: {
      icon: null,
      label: null,
      nextScene: 3,
      active: false
    },
    declineEnding: 3
  },
  3: {
    video: 'videos/lyd_3.mp4',
    active: {
      icon: 'icons/mobil.svg',
      label: 'Log på Nordea Mobile',
      nextScene: 4
    },
    sometimesActive: {
      icon: null,
      label: null,
      nextScene: 4,
      active: false
    },
    declineEnding: 3
  },
  4: {
    video: null,
    active: {
      icon: 'icons/checkmark.svg',
      label: 'Alt er som det skal være',
      nextScene: 5
    },
    sometimesActive: {
      icon: null,
      label: null,
      nextScene: 5,
      active: false
    },
    declineEnding: 3,
    showElements: ['netbank-info', 'nordeaMobile'] 
  },
  5: {
    video: 'videos/lyd_5.mp4',
    active: {
      icon: 'icons/kreditkort.svg',
      label: 'Overfør beløb til sikkerheds-depot',
      nextScene: 6
    },
    sometimesActive: {
      icon: 'icons/question.svg',
      label: 'Hvordan kan jeg vide, hvem jeg taler med lige nu?',
      nextScene: '5.1',
      active: true
    },
    declineEnding: 3
  },
  '5.1': {
    video: 'videos/lyd_5.1.mp4',
    active: {
      icon: 'icons/kreditkort.svg',
      label: 'Overfør beløb til sikkerheds-depot',
      nextScene: 6
    },
    sometimesActive: {
      icon: null,
      label: null,
      nextScene: 6,
      active: false
    },
    declineEnding: 3
  },
  6: {
    video: null,
    active: {
      icon: null,
      label: null,
      active: false
    },
    sometimesActive: {
      icon: null,
      label: null,
      nextScene: 7,
      active: false
    },
    declineEnding: 3,
    showElements: ['sms', 'nordeaSMS'] 
  }
}


// --------------- FUNKTIONER ---------------

// Skift visning til første opkaldsside og afspil ringetone
function startCallPage() {
  introPage.style.display = 'none'; // Skjul intro side
  callPageStart.style.display = 'block'; // Vis opkaldsside
  declineMessage.style.display = 'none'; // Skjul besked
  callSound.play(); // Afspil opkaldslyd
}

// Funktion til at håndtere brugerens afvisning af opkald
function declineCall() {
  if (!hasDeclinedOnce) {
    // Første afvisning - vis besked og stop ringelyd
    declineMessage.style.display = 'block'; // Vis besked
    callSound.pause(); // Stop ringelyd
    hasDeclinedOnce = true; // Opdater status til afvist én gang
  } else {
    // Anden afvisning - vis afslutning
    callPageStart.style.display = 'none';
    endingPage.style.display = 'block';
    loadEnding(2); // Indlæs afslutning 2 (se loadEnding funktion)
  }
}

// Funktion til at håndtere brugerens accept af opkald
function acceptCall() {
  callPageStart.style.display = 'none'; // Skjul opkaldsside
  phoneInterface.style.display = 'block'; // Vis telefoninterface
  callSound.pause(); // Stop ringelyd
  loadScene(currentScene); // Indlæs den aktuelle scene
}

// --------------- Telefon interface ---------------

// Håndterer afvisning fra telefoninterface og viser afslutning
function declineFromPhone() {
  phoneInterface.style.display = 'none';
  endingPage.style.display = 'block';
  const scene = sceneData[currentScene];
  loadEnding(scene?.declineEnding || 2); // Indlæs afslutning for den aktuelle scene
}

// Håndterer tryk på den aktive knap (skifter scene)
function handleActiveBtn() {
  const next = sceneData[currentScene]?.active?.nextScene;
  if (next) {
    currentScene = next; // Opdater scene
    loadScene(currentScene); // Indlæs næste scene
  }
}

// Håndterer tryk på den 'sometimes active' knap (skifter scene)
function handleSometimesActiveBtn() {
  const next = sceneData[currentScene]?.sometimesActive?.nextScene;
  if (next) {
    currentScene = next;
    loadScene(currentScene);
  }
}

// Funktion som indlæser en scene ud fra scenens nummer og opdaterer video og knapper på skærmen
function loadScene(sceneNumber) {
  const scene = sceneData[sceneNumber];
  if (!scene) return; // Stop funktionen hvis scenen ikke findes

  // Skjul alle relevante elementer først
  document.querySelectorAll('.content-container p, .content-container img').forEach(el => {
    el.style.display = 'none'; // Skjul alle p'er og billeder
  });

  // Vis de ønskede elementer for den aktuelle scene
  if (scene.showElements) {
    scene.showElements.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.style.display = 'block'; // Vis elementet
      }
    });
  }
  

  

  // Opdater videoelementet med den nye scenes video
  videoElement.src = scene.video;
  videoElement.play();

  // Hent billede og tekst-elementerne fra active-knappen
  const activeImg = activeBtn.querySelector('img');
  const activeLabel = activeBtn.querySelector('.button-label');
  
  if (scene.active) {
    activeBtn.style.display = 'flex'; // Vis knappen (hvis den er skjult)

    // Vis og opdater ikon, hvis det findes
    if (scene.active.icon) {
      activeImg.style.display = 'inline';
      activeImg.src = scene.active.icon;
    } else {
      activeImg.style.display = 'none';
    }

    // Vis og opdater tekst, hvis den findes
    if (scene.active.label) {
      activeLabel.textContent = scene.active.label;
    } else {
      activeLabel.textContent = '';
    }

    // Tjek om knappen skal være inaktiv
    if (scene.active.active === false) {
      activeBtn.classList.add('inactive');     // Gør knappen grå
      activeBtn.classList.remove('active');    // Fjern evt. aktiv styling
      activeBtn.disabled = true;               // Deaktiver klik
    } else {
      activeBtn.classList.remove('inactive');  // Gør knappen hvid
      activeBtn.disabled = false;              // Gør klik muligt
    }
  } else {
    activeBtn.style.display = 'none'; // Skjul knappen helt hvis den ikke bruges i scenen
  }

  // Hent billede og tekst-elementerne fra sometimes-active knappen
  const sometimesImg = sometimesActiveBtn.querySelector('img');
  const sometimesLabel = sometimesActiveBtn.querySelector('.button-label');

  if (scene.sometimesActive) {
    sometimesActiveBtn.style.display = 'flex';

    // Vis og opdater ikon, hvis det findes
    if (scene.sometimesActive.icon) {
      sometimesImg.style.display = 'inline';
      sometimesImg.src = scene.sometimesActive.icon;
    } else {
      sometimesImg.style.display = 'none';
    }

    // Vis og opdater tekst, hvis den findes
    if (scene.sometimesActive.label) {
      sometimesLabel.textContent = scene.sometimesActive.label;
    } else {
      sometimesLabel.textContent = '';
    }

    // Tjek om knappen skal være inaktiv
    if (scene.sometimesActive.active === false) {
      sometimesActiveBtn.classList.add('inactive');
      sometimesActiveBtn.disabled = true;
    } else {
      sometimesActiveBtn.classList.remove('inactive');
      sometimesActiveBtn.disabled = false;
    }
  } else {
    sometimesActiveBtn.style.display = 'none'; // Skjul knappen helt hvis den ikke bruges i scenen
  }
}

// --------------- EVENT LISTENERS ---------------

// Lytter efter klik på startknap for at starte spillet
startButton.addEventListener('click', startCallPage);

// Lytter efter klik på afvis knap på opkaldsside
declineButton.addEventListener('click', declineCall);

// Lytter efter klik på accept knap på opkaldsside
acceptButton.addEventListener('click', acceptCall);

// Lytter efter klik på afvis knap i telefoninterface
declineBtn.addEventListener('click', declineFromPhone);

// Lytter efter klik på aktiv knap i telefoninterface
activeBtn.addEventListener('click', handleActiveBtn);

// Lytter efter klik på sometimes-active knap i telefoninterface
sometimesActiveBtn.addEventListener('click', handleSometimesActiveBtn);

// --------------- AFSLUTNINGER ---------------

function loadEnding(endingNumber) {
  const alarmIcon = document.getElementById("alarmIcon");
  const mainText = document.getElementById("mainText");
  const playAgainLink = document.getElementById("playAgainLink");
  const learnMoreLink = document.getElementById("learnMoreLink");
  const smallHeadingTitle = document.getElementById("smallHeadingTitle");
  const smallHeadingList = document.getElementById("smallHeadingList");
  const overfold = document.querySelector(".overfold");

  if (endingNumber === 1) {
    overfold.innerHTML = `
      <div class="main-box">
        <p class="main-text">Der er gået 3 dage. Nu ringer telefonen igen... Det ser ud til, at nogen gerne vil have fat i dig.</p>
      </div>
    `;
    return;
  }

  if (endingNumber === 2) {
    alarmIcon.src = "icons/alarm-green.svg";
    mainText.textContent = "Tillykke – du har afsløret svindleren! Du gjorde det helt rigtige.";
    playAgainLink.textContent = "Spil igen og se hvordan dine valg kunne have påvirket udfaldet.";
    learnMoreLink.textContent = "Læs mere om social engineering og hvordan du beskytter dine pårørende";
    smallHeadingTitle.textContent = "Perfekt håndteret!";
    smallHeadingList.innerHTML = `
      <li>Du holdt hovedet koldt, stillede de rigtige spørgsmål og afslørede svindlen.</li><br>
      <li>Du reagerede, som man bør – og det er præcis sådan, du kan beskytte dig selv og andre i fremtiden. Del gerne din viden!</li>
    `;
  } else if (endingNumber === 3) {
    alarmIcon.src = "icons/alarm-yellow.svg";
    mainText.textContent = "Tillykke – du har afsløret svindleren! Men det var lige ved at gå galt.";
    playAgainLink.textContent = "Spil igen og se hvordan dine valg kunne have påvirket udfaldet.";
    learnMoreLink.textContent = "Læs mere om social engineering og hvordan du beskytter dine pårørende";
    smallHeadingTitle.textContent = "Godt gået – men vær stadig opmærksom!";
    smallHeadingList.innerHTML = `
      <li>Du forholdt dig kritisk og stillede spørgsmål</li><br>
      <li>Stop op og dobbelttjek, hvis noget føles forkert</li>
    `;
  } else if (endingNumber === 4) {
    alarmIcon.src = "icons/alarm-red.svg";
    mainText.textContent = "Dine penge er nu væk. Svindleren har tømt din konto. Dette kunne være sket i virkeligheden.";
    playAgainLink.textContent = "Spil igen og prøv at afsløre svindleren";
    learnMoreLink.textContent = "Læs mere om social engineering og hvordan du beskytter dine pårørende";
    smallHeadingTitle.textContent = "Samtalerne er opbygget efter samme skabelon:";
    smallHeadingList.innerHTML = `
      <li>Først skabes en frygt for formuen</li><br>
      <li>Derefter tilbydes en løsning, som kan redde opsparingen</li>
    `;
  }
}

// --------------- TILFØJ EN NY FUNKTION TIL BRUGERINPUT ---------------

// --------------- TILFØJ EN NY FUNKTION TIL BRUGERINPUT ---------------

// Denne funktion håndterer brugerens input (JA/NEJ)
function handleUserInput() {
  // Lyt efter tastetryk i inputfeltet
  userInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') { // Når Enter trykkes
      const input = userInput.value.trim().toUpperCase(); // Få input og konverter til store bogstaver

      if (input === 'JA') {
        phoneInterface.style.display = 'none'; // Skjul telefoninterface
        endingPage.style.display = 'block';    // Vis afslutningsside
        loadEnding(4); // Hvis bruger skriver JA, indlæses afslutning 4
      } else if (input === 'NEJ') {
        phoneInterface.style.display = 'none';
        endingPage.style.display = 'block';
        loadEnding(3); // Hvis bruger skriver NEJ, indlæses afslutning 3
      } else {
        alert("Skriv venligst JA eller NEJ."); // Hvis input er noget andet
      }
    }
  });
}


// Kald denne funktion når siden indlæses
handleUserInput();
