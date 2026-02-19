const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/* ======================
   ASSETS & SOUNDS
====================== */
const bgImg = new Image();
bgImg.src = "assets/background.png";
const pipeImg = new Image();
pipeImg.src = "assets/pipe2-.png";

// Daftar Karakter Burung
const birdSkins = [
  "assets/Flappy-Bird.png",
  "assets/Flappy-Bird2.png",
  "assets/Flappy-Bird3.png",
  "assets/Flappy-Bird4.png",
  "assets/g4-.png",
  "assets/g5.png",
  "assets/g6.png",
  "assets/g7.png",
  "assets/g8.png",
];
let currentSkinIndex = 0;
let birdImg = new Image();
birdImg.src = birdSkins[currentSkinIndex];

// Sound Elements
const bgm = document.getElementById("backgroundMusic");
const soundFly = document.getElementById("soundFly");
const soundScore = document.getElementById("soundScore");
const soundDie = document.getElementById("soundDie");
const soundMenu = document.getElementById("soundMenu");

bgm.volume = 0.3;

// Fungsi untuk suara interaksi menu
function playMenuSound() {
  if (soundMenu) {
    soundMenu.currentTime = 0;
    soundMenu.play();
  }
}

/* ======================
   GAME STATE
====================== */
let gameActive = false;
let gameOver = false;
let score = 0;
let frame = 0;

let bird = {
  x: 80,
  y: 250,
  width: 40,
  height: 30,
  gravity: 0.5,
  jump: -8,
  speed: 0,
};
let pipes = [];
const pipeWidth = 60;
const pipeGap = 160;
const pipeSpeed = 2;

/* ======================
   NAVIGATION LOGIC
====================== */
function showScreen(screenId) {
  playMenuSound();
  document
    .querySelectorAll(".overlay")
    .forEach((el) => el.classList.add("hidden"));
  document.getElementById(screenId).classList.remove("hidden");
}

function selectBird(index) {
  playMenuSound();
  currentSkinIndex = index;
  birdImg.src = birdSkins[index];

  document.querySelectorAll(".char-opt").forEach((img, i) => {
    img.classList.toggle("selected", i === index);
  });
}

function startGame() {
  playMenuSound();
  document.getElementById("mainMenu").classList.add("hidden");
  gameActive = true;
  gameOver = false;
  bgm.play().catch(() => console.log("Musik butuh interaksi user"));
  resetGameStats();
}

function backToMenu() {
  playMenuSound();
  gameActive = false;
  gameOver = false;
  document.getElementById("gameOverPopup").classList.add("hidden");
  showScreen("mainMenu");
}

/* ======================
   GAME CONTROLS
====================== */
function control() {
  if (!gameActive || gameOver) return;
  bird.speed = bird.jump;

  soundFly.currentTime = 0;
  soundFly.play();
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") control();
});
canvas.addEventListener("click", control);
document.getElementById("jumpBtnMobile").addEventListener("touchstart", (e) => {
  e.preventDefault();
  control();
});

/* ======================
   CORE GAMEPLAY
====================== */
function createPipe() {
  let minH = 50;
  let maxH = canvas.height - pipeGap - minH;
  let topH = Math.floor(Math.random() * (maxH - minH + 1)) + minH;
  pipes.push({
    x: canvas.width,
    top: topH,
    bottom: canvas.height - topH - pipeGap,
    passed: false,
  });
}

function update() {
  if (!gameActive || gameOver) return;

  bird.speed += bird.gravity;
  bird.y += bird.speed;

  if (bird.y < 0 || bird.y + bird.height > canvas.height) endGame();

  if (frame % 100 === 0) createPipe();

  pipes.forEach((pipe) => {
    pipe.x -= pipeSpeed;
    if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
      score++;
      pipe.passed = true;
      soundScore.play();
    }
    if (
      bird.x < pipe.x + pipeWidth &&
      bird.x + bird.width > pipe.x &&
      (bird.y < pipe.top || bird.y + bird.height > canvas.height - pipe.bottom)
    ) {
      endGame();
    }
  });

  pipes = pipes.filter((p) => p.x + pipeWidth > 0);
  frame++;
}

function draw() {
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  pipes.forEach((pipe) => {
    ctx.save();
    ctx.translate(pipe.x + pipeWidth / 2, pipe.top / 2);
    ctx.scale(1, -1);
    ctx.drawImage(pipeImg, -pipeWidth / 2, -pipe.top / 2, pipeWidth, pipe.top);
    ctx.restore();
    ctx.drawImage(
      pipeImg,
      pipe.x,
      canvas.height - pipe.bottom,
      pipeWidth,
      pipe.bottom,
    );
  });

  ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

  if (gameActive) {
    ctx.save();
    ctx.fillStyle = "#e3c505";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 6;
    ctx.lineJoin = "round";
    ctx.font = "20px 'Press Start 2P', cursive";
    ctx.strokeText("Score: " + score, 30, 60);
    ctx.fillText("Score: " + score, 30, 60);
    ctx.restore();
  }
}

function endGame() {
  gameOver = true;
  bgm.pause();
  soundDie.play();
  document.getElementById("finalScore").innerText = score;
  document.getElementById("gameOverPopup").classList.remove("hidden");
}

function resetGameStats() {
  bird.y = 250;
  bird.speed = 0;
  pipes = [];
  score = 0;
  frame = 0;
}

document.getElementById("retryBtn").addEventListener("click", () => {
  playMenuSound();
  document.getElementById("gameOverPopup").classList.add("hidden");
  startGame();
});

// Inisialisasi awal skin terpilih
selectBird(0);

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}
gameLoop();
