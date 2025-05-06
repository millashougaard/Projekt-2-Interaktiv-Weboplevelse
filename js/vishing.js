'use strict';

/* --------------- VARIABLER: Hent elementer fra HTML --------------- */

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

// Inputfelt til scene 6
const userInputContainer = document.getElementById('userInputContainer');
const userInput = document.getElementById('userInput');

// Afslutningsside
const endingPage = document.querySelector('.ending');


/* --------------- STATE-VARIABLER --------------- */

let hasDeclinedOnce = false;                 // Holder styr på om brugeren allerede har afvist én gang
let currentScene = 1;                        // Den aktuelle scene, som brugeren er på i samtalen

// Funktion til at gemme valg
function saveChoice(sceneNumber, choiceText) {
  const storedChoices = JSON.parse(localStorage.getItem('userChoices')) || [];
  storedChoices.push({ scene: sceneNumber, choice: choiceText });
  localStorage.setItem('userChoices', JSON.stringify(storedChoices));
}

/* --------------- SCENE-DATA --------------- */

// Data, der beskriver hver scene, herunder video, knapper og næste scene
const sceneData = { 
    1: {
      video: 'videos/scene_1.mov',           // Den video, der afspilles i nuværende scene
      active: {                              // 'active' knap
        icon: 'icons/question.svg',          // Det ikon knappen har, i nuværende scene
        label: 'Overhovedet ikke.',          // Det label knappen har, i nuværende scene
        nextScene: 2                         // Den scene der afspilles, hvis brugeren klikker på knappen
      },
      sometimesActive: {                     // 'sometimes-active' knap
        icon: null,                          // Indikerer, at knappen ikke har noget ikon
        label: null,                         // Indikerer, at knappen ikke har noget label
        nextScene: 2,
        active: false                        // Indikerer, at knappen er inaktiv
      },
      declineEnding: 2                       // Hvis brugeren klikker på 'decline' knap -> Load ending (2)
    },
    2: {
      video: 'videos/scene_2.mov',
      active: {
        icon: 'icons/checkmark.svg',
        label: 'Hjælp mig med at sikre min opsparing!',
        nextScene: 3
      },
      sometimesActive: {
        icon: 'icons/question.svg',
        label: 'Hvad skal det betyde?',
        nextScene: '2.1',                    // Hvis brugeren klikker på knappen -> Load under-scene 
        active: true                         // Indikerer, at knappen er aktiv i denne scene
      },
      declineEnding: 2
    },
    '2.1': {
      video: 'videos/scene_2.1.mov',
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
      video: 'videos/scene_3.mov',
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
      video: null, // Indikerer, at der ikke er nogen video i denne scene
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
      showElements: ['netbank-info', 'nordeaMobile'] // Henter elementer med id="netbank-info" og "nordeaMobile"
    },
    5: {
      video: 'videos/scene_5.mov',
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
      video: 'videos/scene_5.1.mov',
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
        active: false // Indikerer, at knappen er inaktiv i denne scene
      },
      sometimesActive: {
        icon: null,
        label: null,
        nextScene: 7,
        active: false
      },
      declineEnding: 3,
      showElements: ['sms', 'nordeaSMS'] // Henter elementer med id="sms" og "nordeaSMS"
    }
  }


/* --------------- FUNKTIONER: Opkaldsside --------------- */

// Skift visning til første opkaldsside og afspil ringetone
function startCallPage() {
  introPage.style.display = 'none';                // Skjul intro side
  callPageStart.style.display = 'block';           // Vis opkaldsside
  declineMessage.style.display = 'none';           // Skjul besked (loades kun hvis brugeren trykker 'decline')
  callSound.play();                                // Afspil ringelyd
}

// Håndter afvisning af opkald
function declineCall() {
  if (!hasDeclinedOnce) {                          
    declineMessage.style.display = 'block';        // Hvis 'decline' på første opkaldsside -> Vis besked (afslutning 1)
    callSound.pause();                             // Stop ringelyd
    hasDeclinedOnce = true;                        // Opdater status til afvist én gang
  } else {
    callPageStart.style.display = 'none';          
    endingPage.style.display = 'block';            // Anden afvisning -> Vis afslutning
    loadEnding(2);                                 // Indlæs afslutning (afslutning 2) -> Se loadEnding funktion (linje #)
  }
}

// Håndter accept af opkald
function acceptCall() {
  callPageStart.style.display = 'none';            // Skjul opkaldsside
  phoneInterface.style.display = 'block';          // Vis telefoninterface
  callSound.pause();                               // Stop ringelyd
  loadScene(currentScene);                         // Indlæs den aktuelle scene
}


/* --------------- FUNKTIONER: Telefonsamtale --------------- */

// Håndter afslut samtale fra telefoninterface og vis afslutning
function declineFromPhone() {
  phoneInterface.style.display = 'none';
  endingPage.style.display = 'block';
  const scene = sceneData[currentScene];
  loadEnding(scene?.declineEnding || 2);           // Indlæs afslutning for den aktuelle scene
}

// Håndter tryk på 'Active' knap 
function handleActiveBtn() {
  const scene = sceneData[currentScene];
  const next = scene?.active?.nextScene;
  if (next) {
    saveChoice(currentScene, scene.active.label);
    currentScene = next;                           // Opdater scene
    loadScene(currentScene);                       // Indlæs næste scene
  }
}

// Håndter tryk på 'Sometimes active' knap 
function handleSometimesActiveBtn() {
  const scene = sceneData[currentScene];
  const next = scene?.sometimesActive?.nextScene;
  if (next) {
    saveChoice(currentScene, scene.sometimesActive.label); // GEM VALGET
    currentScene = next;
    loadScene(currentScene);
  }
}


/* --------------- FUNKTIONER: Indlæs scener --------------- */

function loadScene(sceneNumber) {
  const scene = sceneData[sceneNumber];
  if (!scene) return; // Stop hvis scenen ikke findes

  // Skjul alle relevante elementer først
  const elementsToHide = ['netbank-info', 'sms', 'nordeaMobile'];
  elementsToHide.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.style.display = 'none';
  });

  // Vis kun de elementer, som skal vises i denne scene
  if (scene.showElements) {
    scene.showElements.forEach(id => {
      const element = document.getElementById(id);
      if (element) element.style.display = 'block';
    });
  }

  // Vis inputfelt kun i scene 6
  if (sceneNumber === 6) {
    userInputContainer.style.display = 'block';     // Vis inputfeltet
  } else {
    userInputContainer.style.display = 'none';      // Skjul inputfeltet i alle andre scener
  }

  // Opdater video
  videoElement.src = scene.video;
  videoElement.play();

  // 'Active' knap - Hent billede og tekst-elementerne
  const activeImg = activeBtn.querySelector('img');
  const activeLabel = activeBtn.querySelector('.button-label');

  if (scene.active) {
    activeBtn.style.display = 'flex';                                    // Vis knappen (hvis den er skjult)
    activeImg.style.display = scene.active.icon ? 'inline' : 'none';
    if (scene.active.icon) activeImg.src = scene.active.icon;            // Vis og opdater ikon og tekst, hvis det findes
    activeLabel.textContent = scene.active.label || ''; 
    if (scene.active.active === false) {                                 
      activeBtn.classList.add('inactive');                               // Tilføj class="inactive" hvis active=false (knappen bliver grå)
      activeBtn.classList.remove('active');                              // Fjern active styling
      activeBtn.disabled = true;                                         // Deaktiver klik
    } else {
      activeBtn.classList.remove('inactive');                            // Fjern class="inactive" (knappen bliver hvid)
      activeBtn.disabled = false;                                        // Gør klik muligt
    }
  } else {
    activeBtn.style.display = 'none';                                    // Skjul knappen helt hvis, findes ikke
  }

  // Sometimes-active knap
  const sometimesImg = sometimesActiveBtn.querySelector('img');
  const sometimesLabel = sometimesActiveBtn.querySelector('.button-label');

  if (scene.sometimesActive) {
    sometimesActiveBtn.style.display = 'flex';
    sometimesImg.style.display = scene.sometimesActive.icon ? 'inline' : 'none';
    if (scene.sometimesActive.icon) sometimesImg.src = scene.sometimesActive.icon;
    sometimesLabel.textContent = scene.sometimesActive.label || '';
    if (scene.sometimesActive.active === false) {
      sometimesActiveBtn.classList.add('inactive');
      sometimesActiveBtn.disabled = true;
    } else {
      sometimesActiveBtn.classList.remove('inactive');
      sometimesActiveBtn.disabled = false;
    }
  } else {
    sometimesActiveBtn.style.display = 'none';
  }
}


/* --------------- FUNKTIONER: Afslutninger --------------- */

/**
 * Indlæs afslutning baseret på afslutningsnummer
 * Hent elementer fra HTML (.ending)
 */
function loadEnding(endingNumber) {                               
  const alarmIcon = document.getElementById("alarmIcon");
  const mainText = document.getElementById("mainText");
  const playAgainLink = document.getElementById("playAgainLink");
  const learnMoreLink = document.getElementById("learnMoreLink");
  const smallHeadingTitle = document.getElementById("smallHeadingTitle");
  const smallHeadingList = document.getElementById("smallHeadingList");

  const choiceList = document.getElementById('userChoiceList');
  if (choiceList) {
    const storedChoices = JSON.parse(localStorage.getItem('userChoices')) || [];
    // Vis kun valgene, hvis afslutningen ikke er 2
    if (endingNumber !== 2) {
      choiceList.innerHTML = '<h3>Dine valg:</h3><ul>' +
        storedChoices.map(choice => `<li>Scene ${choice.scene}: ${choice.choice}</li>`).join('') +
      '</ul>';
    } else {
      choiceList.style.display = 'none'; // Skjul choiceList i afslutning 2
    }
  }
  
  // Afslutning 1 - Se HTML id="decline-message" (linje #)

  // Afslutning 2 - Tillykke, du afslørede svindleren!
  if (endingNumber === 2) {
    // Alarm ikon med farve der indikerer brugerens præstation i spillet
    alarmIcon.src = "icons/alarm-green.svg";
    mainText.textContent = "Tillykke – du har afsløret svindleren! Du gjorde det helt rigtige.";
    // Link til at starte forfra eller læse mere om social engineering og vishing
    playAgainLink.textContent = "Spil igen og se hvordan dine valg kunne have påvirket udfaldet.";
    learnMoreLink.textContent = "Læs mere om social engineering og hvordan du beskytter dine pårørende";
    // Bruger-feedback
    smallHeadingTitle.textContent = "Perfekt håndteret!";                                                                               
    smallHeadingList.innerHTML = `
      <li>Du holdt hovedet koldt, stillede de rigtige spørgsmål og afslørede svindlen.</li><br>
      <li>Du reagerede, som man bør – og det er præcis sådan, du kan beskytte dig selv og andre i fremtiden. Del gerne din viden!</li>
    `;
  } 

  // Afslutning 3 - Tillykke - du har afsløret svindleren! Men det var lige ved at gå galt.
  else if (endingNumber === 3) {
    alarmIcon.src = "icons/alarm-yellow.svg";
    mainText.textContent = "Tillykke – du har afsløret svindleren! Men det var lige ved at gå galt.";
    playAgainLink.textContent = "Spil igen og se hvordan dine valg kunne have påvirket udfaldet.";
    learnMoreLink.textContent = "Læs mere om social engineering og hvordan du beskytter dine pårørende";
    smallHeadingTitle.textContent = "Godt gået – men vær stadig opmærksom!";
    smallHeadingList.innerHTML = `
      <li>Du forholdt dig kritisk og stillede spørgsmål</li><br>
      <li>Stop op og dobbelttjek, hvis noget føles forkert</li>
    `;
  } 
  
  // Afslutning 4 - Dine penge er nu væk. Svindleren har tømt din konto. 
  else if (endingNumber === 4) {
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


/* --------------- FUNKTIONER: Inputfelt i scene 6 --------------- */
/**
 * Håndterer brugerens input i scene 6.
 * Hvis brugeren indtaster 'JA', vises afslutning 4.
 * Hvis brugeren indtaster 'NEJ', vises afslutning 3.
 * Ved andet input vises en advarselsbesked.
 */
function handleUserInput() {
  userInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      const input = userInput.value.trim().toUpperCase();
      if (input === 'JA') {
        // Brugeren bekræfter overførsel - vis afslutning 4
        phoneInterface.style.display = 'none';
        endingPage.style.display = 'block';
        loadEnding(4);
      } else if (input === 'NEJ') {
        // Brugeren afviser overførsel - vis afslutning 3
        phoneInterface.style.display = 'none';
        endingPage.style.display = 'block';
        loadEnding(3);
      } else {
        // Ugyldigt input - vis advarselsbesked
        alert("Skriv venligst JA eller NEJ.");
      }
    }
  });
}


/* --------------- EVENT LISTENERS --------------- */

startButton.addEventListener('click', startCallPage);                      // Lytter efter klik på startknap for at starte spillet
declineButton.addEventListener('click', declineCall);                      // Lytter efter klik på 'decline' knap på opkaldsside
acceptButton.addEventListener('click', acceptCall);                        // Lytter efter klik på 'accept' knap på opkaldsside
declineBtn.addEventListener('click', declineFromPhone);                    // Lytter efter klik på 'decline' knap i telefoninterface
activeBtn.addEventListener('click', handleActiveBtn);                      // Lytter efter klik på 'active' knap i telefoninterface
sometimesActiveBtn.addEventListener('click', handleSometimesActiveBtn);    // Lytter efter klik på 'sometimes-active' knap i telefoninterface


// Start input-funktionen
handleUserInput();

// Gør det muligt at starte forfra fra enhver afslutning
document.getElementById("playAgainLink").addEventListener("click", function () {
    // Nulstil state
    currentScene = 1;
    hasDeclinedOnce = false;
  
    // Skjul afslutningsside og vis intro igen
    endingPage.style.display = "none";
    introPage.style.display = "block";
  
    // Skjul eventuelle ekstra elementer fra tidligere scener
    document.querySelectorAll('.content-container p, .content-container img').forEach(el => {
      el.style.display = 'none';
    });
  
    // Ryd inputfeltet hvis det blev brugt
    userInput.value = '';

    localStorage.removeItem('userChoices'); // Ryd valgene
  });

  
