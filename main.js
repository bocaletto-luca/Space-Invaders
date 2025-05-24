// main.js - Versione definitiva del gioco Space Invaders

(function () {
  // --- UTILITIES ---
  function getQueryParam(param) {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
  }
  
  // --- PARAMETRI DALLE QUERY STRING ---
  const playerName = getQueryParam("player") || "Player";
  const shipColor = getQueryParam("ship") || "#00ff00";
  const bulletColor = getQueryParam("bullet") || "#ffffff";
  
  // --- DISPLAY (Aggiorna il nome del giocatore) ---
  document.getElementById("playerDisplay").innerText = "Giocatore: " + playerName;
  
  // --- CANVAS ---
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const WIDTH = canvas.width, HEIGHT = canvas.height;
  
  // --- VARIABILI DI LIVELLO, PUNTEGGIO E VITE ---
  let level = 1;
  let score = 0;
  const totalLevels = 10;
  let gameOver = false;
  let lives = 3;
  
  // Aggiorna le info di gioco: mostra anche il livello
  function updateGameInfo() {
    // Puoi modificare questa funzione per formattare come preferisci le informazioni
    document.getElementById("playerDisplay").innerText = "Giocatore: " + playerName;
    document.getElementById("levelDisplay").innerText = "Livello: " + level;
    document.getElementById("scoreDisplay").innerText = "Punteggio: " + score;
    document.getElementById("livesDisplay").innerText = "Vite: " + lives;
  }
  updateGameInfo();
  
  // --- OGGETTI DI GIOCO ---
  // Nave del giocatore
  let spaceship = {
    width: 50,
    height: 20,
    x: WIDTH / 2 - 25,
    y: HEIGHT - 40,
    speed: 7,
    color: shipColor
  };
  
  // Proiettile del giocatore
  function PlayerBullet(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 3;
    this.dy = -8;
    this.color = bulletColor;
  }
  PlayerBullet.prototype.update = function () {
    this.y += this.dy;
  };
  PlayerBullet.prototype.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  };
  
  // Alien (nemico)
  function Alien(x, y) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 30;
    this.color = "#ff0000";
  }
  Alien.prototype.draw = function () {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  };
  
  // Proiettile degli alieni
  function AlienBullet(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 3;
    this.dy = 5;
    this.color = "#ffff00";
  }
  AlienBullet.prototype.update = function () {
    this.y += this.dy;
  };
  AlienBullet.prototype.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  };
  
  // --- ARRAYS PER OGGETTI DI GIOCO ---
  let playerBullets = [];
  let alienBullets = [];
  let aliens = [];
  
  // --- INIZIALIZZAZIONE ALIENI ---
  function initAliens() {
    let currentStage = stageConfig[level - 1];
    let rows = currentStage.alienRowCount;
    let cols = currentStage.alienColumnCount;
    aliens = [];
    let horizontalPadding = 40;
    let verticalPadding = 30;
    let startX = horizontalPadding;
    let startY = 50;
    let spacingX = (WIDTH - 2 * horizontalPadding - cols * 40) / (cols - 1);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let x = startX + c * (40 + spacingX);
        let y = startY + r * (30 + verticalPadding);
        aliens.push(new Alien(x, y));
      }
    }
  }
  initAliens();
  
  // --- MOVIMENTO DEGLI ALIENI ---
  let alienDirection = 1; // 1 = destra, -1 = sinistra;
  let alienSpeed = 1.0;
  let lastAlienShootTime = Date.now();
  let alienDropDistance = stageConfig[level - 1].alienDropDistance;
  let alienShootInterval = stageConfig[level - 1].alienShootInterval;
  
  // --- COLLISIONI ---
  function rectCollision(r1, r2) {
    return (
      r1.x < r2.x + r2.width &&
      r1.x + r1.width > r2.x &&
      r1.y < r2.y + r2.height &&
      r1.y + r1.height > r2.y
    );
  }
  
  function circleRectCollision(circle, rect) {
    let distX = Math.abs(circle.x - rect.x - rect.width / 2);
    let distY = Math.abs(circle.y - rect.y - rect.height / 2);
    if (distX > rect.width / 2 + circle.radius) return false;
    if (distY > rect.height / 2 + circle.radius) return false;
    if (distX <= rect.width / 2) return true;
    if (distY <= rect.height / 2) return true;
    let dx = distX - rect.width / 2;
    let dy = distY - rect.height / 2;
    return dx * dx + dy * dy <= circle.radius * circle.radius;
  }
  
  function resolveCollision(circle, rect) {
    let nearestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    let nearestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
    let diffX = circle.x - nearestX;
    let diffY = circle.y - nearestY;
    let dist = Math.sqrt(diffX * diffX + diffY * diffY) || 0.1;
    let overlap = circle.radius - dist;
    if (overlap > 0) {
      circle.x += (diffX / dist) * overlap;
      circle.y += (diffY / dist) * overlap;
    }
  }
  
  // --- POWER‑UP CAPSULES ---
  // Dichiarazione unica per evitare errori di "not defined"
  let powerUps = [];
  let activePower = null;
  let powerEndTime = 0;
  
  function Capsule(x, y, type) {
    this.x = x;
    this.y = y;
    this.radius = 8;
    this.dy = 3;
    this.type = type;
  }
  Capsule.prototype.update = function () {
    this.y += this.dy;
  };
  Capsule.prototype.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle =
      this.type === "shoot" ? "red" : this.type === "paddleBoost" ? "blue" : "yellow";
    ctx.fill();
  };
  
  // --- SPECIAL BULLET (attivata con power-up "shoot") ---
  function Bullet(x, y, angle) {
    this.x = x;
    this.y = y;
    this.velocity = { x: Math.cos(angle) * 8, y: Math.sin(angle) * 8 };
    this.radius = 3;
    this.life = 60;
    this.color = bulletColor;
  }
  Bullet.prototype.update = function () {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.life--;
  };
  Bullet.prototype.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  };
  let bullets = [];
  
  // --- INPUT ---
  let keys = {};
  document.addEventListener("keydown", function (e) {
    keys[e.code] = true;
    if (e.code === "Space") {
      let bullet = new PlayerBullet(
        spaceship.x + spaceship.width / 2,
        spaceship.y
      );
      playerBullets.push(bullet);
    }
  });
  document.addEventListener("keyup", function (e) {
    keys[e.code] = false;
  });
  
  // --- MOVIMENTO DELLA NAVE (mouse & touch) ---
  canvas.addEventListener("mousemove", function (e) {
    let rect = canvas.getBoundingClientRect();
    let relativeX = e.clientX - rect.left;
    spaceship.x = relativeX - spaceship.width / 2;
  });
  canvas.addEventListener("touchmove", function (e) {
    e.preventDefault();
    let rect = canvas.getBoundingClientRect();
    let touch = e.touches[0];
    let relativeX = touch.clientX - rect.left;
    spaceship.x = relativeX - spaceship.width / 2;
  }, { passive: false });
  
  // --- UPDATE DEGLI OGGETTI ---
  function updatePlayerBullets() {
    for (let i = playerBullets.length - 1; i >= 0; i--) {
      playerBullets[i].update();
      if (playerBullets[i].y < 0) {
        playerBullets.splice(i, 1);
      }
    }
  }
  
  function updateAlienBullets() {
    for (let i = alienBullets.length - 1; i >= 0; i--) {
      alienBullets[i].update();
      if (alienBullets[i].y > HEIGHT) {
        alienBullets.splice(i, 1);
      }
    }
  }
  
  function updateAliens() {
    let hitEdge = false;
    for (let i = 0; i < aliens.length; i++) {
      if (aliens[i].x + aliens[i].width >= WIDTH - 5 && alienDirection === 1)
        hitEdge = true;
      if (aliens[i].x <= 5 && alienDirection === -1)
        hitEdge = true;
    }
    if (hitEdge) {
      for (let i = 0; i < aliens.length; i++) {
        aliens[i].y += stageConfig[level - 1].alienDropDistance;
      }
      alienDirection *= -1;
    } else {
      for (let i = 0; i < aliens.length; i++) {
        aliens[i].x +=
          alienSpeed * stageConfig[level - 1].alienSpeedFactor * alienDirection;
      }
    }
    if (Date.now() - lastAlienShootTime > stageConfig[level - 1].alienShootInterval) {
      if (aliens.length > 0) {
        let shooter = aliens[Math.floor(Math.random() * aliens.length)];
        let aBullet = new AlienBullet(shooter.x + shooter.width / 2, shooter.y + shooter.height);
        alienBullets.push(aBullet);
        lastAlienShootTime = Date.now();
      }
    }
  }
  
  function checkPlayerBulletCollisions() {
    for (let i = playerBullets.length - 1; i >= 0; i--) {
      let bullet = playerBullets[i];
      for (let j = aliens.length - 1; j >= 0; j--) {
        let alien = aliens[j];
        let alienRect = { x: alien.x, y: alien.y, width: alien.width, height: alien.height };
        if (circleRectCollision(bullet, alienRect)) {
          aliens.splice(j, 1);
          playerBullets.splice(i, 1);
          score += 10;
          updateGameInfo();
          break;
        }
      }
    }
  }
  
  function checkAlienBulletCollisions() {
    let shipRect = { x: spaceship.x, y: spaceship.y, width: spaceship.width, height: spaceship.height };
    for (let i = alienBullets.length - 1; i >= 0; i--) {
      if (circleRectCollision(alienBullets[i], shipRect)) {
        alienBullets.splice(i, 1);
        lives--;
        updateGameInfo();
        if (lives <= 0) {
          gameOver = true;
          let finalMsg = "Hai perso! Gli alieni ti hanno colpito!\nGiocatore: " + playerName +
                         "\nLivello: " + level + "\nPunteggio: " + score;
          showFinalOverlay(finalMsg);
          saveScore();
        }
      }
    }
  }
  
  function updatePowerUps() {
    for (let i = powerUps.length - 1; i >= 0; i--) {
      powerUps[i].update();
      let shipRect = { x: spaceship.x, y: spaceship.y, width: spaceship.width, height: spaceship.height };
      if (circleRectCollision(powerUps[i], shipRect)) {
        activePower = powerUps[i].type;
        powerEndTime = Date.now() + 5000;
        if (activePower === "paddleBoost") {
          spaceship.width += 30;
        }
        powerUps.splice(i, 1);
      } else if (powerUps[i].y - powerUps[i].radius > HEIGHT) {
        powerUps.splice(i, 1);
      }
    }
    if (activePower && Date.now() > powerEndTime) {
      if (activePower === "paddleBoost") {
        spaceship.width -= 30;
      }
      activePower = null;
    }
  }
  
  function updateBullets() {
    updatePlayerBullets();
    checkPlayerBulletCollisions();
    updateAlienBullets();
    checkAlienBulletCollisions();
  }
  
  function update() {
    if (keys["ArrowLeft"] && spaceship.x > 0) {
      spaceship.x -= spaceship.speed;
    }
    if (keys["ArrowRight"] && spaceship.x < WIDTH - spaceship.width) {
      spaceship.x += spaceship.speed;
    }
    updatePlayerBullets();
    updateAlienBullets();
    updateAliens();
    updatePowerUps();
    checkPlayerBulletCollisions();
    checkAlienBulletCollisions();
    if (aliens.length === 0) {
      if (level < totalLevels) {
        level++;
        alienSpeed = 1.0;
        initAliens();
        updateGameInfo();
      } else {
        gameOver = true;
        let finalMsg =
          "Complimenti! Hai completato il gioco!\nGrazie per aver giocato, " +
          playerName +
          "!\nLivello: " + level + "\nPunteggio: " + score;
        showFinalOverlay(finalMsg);
        saveScore();
        return;
      }
    }
  }
  
  function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    aliens.forEach((alien) => alien.draw());
    ctx.fillStyle = spaceship.color;
    ctx.fillRect(spaceship.x, spaceship.y, spaceship.width, spaceship.height);
    playerBullets.forEach((bullet) => bullet.draw());
    alienBullets.forEach((bullet) => bullet.draw());
    powerUps.forEach((capsule) => capsule.draw());
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText("Punteggio: " + score, 8, 20);
    ctx.fillText("Vite: " + lives, 8, 40);
    ctx.fillText("Livello: " + level, 8, 60);
  }
  
  function showFinalOverlay(msg) {
    const overlay = document.getElementById("finalOverlay");
    document.getElementById("finalMessage").innerText = msg;
    overlay.style.display = "flex";
  }
  
  function gameLoop() {
    if (!gameOver) {
      update();
      draw();
      requestAnimationFrame(gameLoop);
    }
  }
  requestAnimationFrame(gameLoop);
  
  function saveScore() {
    let formData = new FormData();
    formData.append("player", playerName);
    formData.append("score", score);
    formData.append("level", level);
    fetch("saveScore.php", { method: "POST", body: formData })
      .then((res) => res.json())
      .then((data) => console.log("Score salvato:", data))
      .catch((err) => console.error("Errore nel salvataggio del punteggio:", err));
  }
  
  document.getElementById("exitButton").addEventListener("click", () => {
    window.location.href = "index.html";
  });
  document.getElementById("finalExitButton").addEventListener("click", () => {
    window.location.href = "index.html";
  });
})();
